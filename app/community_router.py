"""Public Community Chat Router for SmartCart AI.
Implements:
- Single unified public shopping community
- Only authenticated & registered users can participate
- Text messages up to 2,000 characters
- Message replies / threading
- Safe link sharing with metadata previews (max 5 links)
- Safe image sharing (JPG, JPEG, PNG, WebP up to 5 MB, max 3 images)
- Automatic @Cart invocation with conversational context
- Community moderation (user reporting & admin deletion)
"""
from __future__ import annotations

import base64
import os
import re
import secrets
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app import assistant
from app.auth_router import get_current_user, get_db, get_optional_user
from app.db import CommunityMessage, CommunityReport, User

router = APIRouter(prefix="/api/community", tags=["Community"])

# Ensure uploads directory exists
UPLOAD_DIR = Path("uploads") / "community"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

URL_REGEX = re.compile(
    r"https?://(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?(?:/[^\s]*)?",
    re.IGNORECASE,
)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB


# ------------------ Schemas ------------------

class LinkMetadata(BaseModel):
    url: str
    title: str | None = None
    description: str | None = None
    image: str | None = None
    site_name: str | None = None


class ImageMetadata(BaseModel):
    url: str
    filename: str
    size: int


class CreateMessageRequest(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
    parent_id: str | None = None
    links: list[LinkMetadata] = Field(default_factory=list, max_length=5)
    images: list[ImageMetadata] = Field(default_factory=list, max_length=3)


class ImageUploadRequest(BaseModel):
    filename: str
    mime_type: str
    data_base64: str


class LinkPreviewRequest(BaseModel):
    url: str


class ReportMessageRequest(BaseModel):
    reason: str = Field(min_length=3, max_length=255)


# ------------------ Link Preview Helper ------------------

async def fetch_link_preview(raw_url: str) -> dict:
    url = raw_url.strip()
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("Invalid URL scheme. Only HTTP and HTTPS are permitted.")

    # Disallow internal or loopback IP ranges
    host = parsed.netloc.split(":")[0].lower()
    if host in ("localhost", "127.0.0.1", "0.0.0.0", "::1") or host.endswith(".local"):
        raise ValueError("Localhost URLs are not allowed.")

    meta = {
        "url": url,
        "title": host,
        "description": f"Link to {parsed.netloc}",
        "image": None,
        "site_name": parsed.netloc,
    }

    try:
        headers = {
            "User-Agent": "SmartCartBot/1.0 (+https://smartcart.ai)",
            "Accept": "text/html,application/xhtml+xml",
        }
        async with httpx.AsyncClient(timeout=4.0, follow_redirects=True, max_redirects=3) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                html = resp.text[:100000]  # Only inspect first 100KB

                # Extract title
                title_match = re.search(r'<meta\s+property=["\']og:title["\']\s+content=["\'](.*?)["\']', html, re.I)
                if not title_match:
                    title_match = re.search(r"<title>(.*?)</title>", html, re.I)
                if title_match:
                    meta["title"] = title_match.group(1).strip()[:100]

                # Extract description
                desc_match = re.search(r'<meta\s+property=["\']og:description["\']\s+content=["\'](.*?)["\']', html, re.I)
                if not desc_match:
                    desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', html, re.I)
                if desc_match:
                    meta["description"] = desc_match.group(1).strip()[:200]

                # Extract image
                img_match = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\'](.*?)["\']', html, re.I)
                if img_match:
                    meta["image"] = img_match.group(1).strip()
    except Exception:
        pass  # Fallback to default domain metadata

    return meta


# ------------------ Endpoints ------------------

@router.get("/messages")
def get_messages(
    limit: int = Query(default=50, ge=1, le=100),
    before_id: str | None = None,
    db: Session = Depends(get_db),
) -> list[dict]:
    """Retrieve public community messages with pagination support."""
    query = db.query(CommunityMessage).filter(CommunityMessage.deleted == False)

    if before_id:
        target = db.get(CommunityMessage, before_id)
        if target:
            query = query.filter(CommunityMessage.created_at < target.created_at)

    messages = (
        query.order_by(desc(CommunityMessage.created_at))
        .limit(limit)
        .all()
    )

    # Return in chronological order
    messages = list(reversed(messages))

    # Pre-fetch parent messages for replies preview
    parent_ids = {m.parent_id for m in messages if m.parent_id}
    parent_map = {}
    if parent_ids:
        parents = db.query(CommunityMessage).filter(CommunityMessage.id.in_(parent_ids)).all()
        parent_map = {
            p.id: {
                "id": p.id,
                "user_name": p.user_name,
                "content": p.content[:80] + ("..." if len(p.content) > 80 else ""),
                "is_bot": p.is_bot,
            }
            for p in parents
        }

    return [
        {
            "id": m.id,
            "user_id": m.user_id,
            "user_name": m.user_name,
            "user_avatar": m.user_avatar,
            "is_bot": m.is_bot,
            "content": m.content,
            "parent_id": m.parent_id,
            "parent_preview": parent_map.get(m.parent_id),
            "links": m.links or [],
            "images": m.images or [],
            "reported": m.reported,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]


@router.post("/messages")
async def create_message(
    body: CreateMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Post a new community message.
    Only authenticated & registered users can participate.
    Detects and responds to @Cart mentions automatically.
    """
    content = body.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")

    # 1. Validate links count and URLs
    found_urls = URL_REGEX.findall(content)
    if len(found_urls) + len(body.links) > 5:
        raise HTTPException(
            status_code=400,
            detail="A maximum of 5 links per message is allowed.",
        )

    # 2. Validate images count
    if len(body.images) > 3:
        raise HTTPException(
            status_code=400,
            detail="A maximum of 3 images per message is allowed.",
        )

    # 3. Spam Prevention: Check for identical message posted in last 10 seconds
    now = datetime.now(timezone.utc)
    recent_duplicate = (
        db.query(CommunityMessage)
        .filter(
            CommunityMessage.user_id == current_user.id,
            CommunityMessage.content == content,
        )
        .order_by(desc(CommunityMessage.created_at))
        .first()
    )
    if recent_duplicate:
        rec_time = recent_duplicate.created_at if recent_duplicate.created_at.tzinfo else recent_duplicate.created_at.replace(tzinfo=timezone.utc)
        if (now - rec_time).total_seconds() < 10:
            raise HTTPException(
                status_code=429,
                detail="Duplicate message detected. Please wait a few seconds before posting again.",
            )

    # 4. Save user message
    user_msg = CommunityMessage(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_avatar=current_user.avatar_url,
        is_bot=False,
        parent_id=body.parent_id,
        content=content,
        links=[link.model_dump() for link in body.links],
        images=[img.model_dump() for img in body.images],
        created_at=now,
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # 5. Check for @Cart invocation (mentions or direct reply to bot)
    bot_reply_dict = None
    should_reply = bool(re.search(r"@cart(\b|[:!?,]|$)|@cartai\b|@smartcart\b|\bcart ai\b", content, flags=re.IGNORECASE))
    if not should_reply and body.parent_id:
        parent_msg = db.get(CommunityMessage, body.parent_id)
        if parent_msg and parent_msg.is_bot:
            should_reply = True

    if should_reply:
        # Fetch surrounding recent context (up to 6 prior messages)
        recent_msgs = (
            db.query(CommunityMessage)
            .filter(CommunityMessage.deleted == False, CommunityMessage.id != user_msg.id)
            .order_by(desc(CommunityMessage.created_at))
            .limit(6)
            .all()
        )
        context_lines = [f"{m.user_name}: {m.content}" for m in reversed(recent_msgs)]

        reply_content = await assistant.community_reply(content, context_lines)

        bot_msg = CommunityMessage(
            id=str(uuid.uuid4()),
            user_id="bot-cart",
            user_name="Cart AI Assistant",
            user_avatar="/logo.png",
            is_bot=True,
            parent_id=user_msg.id,
            content=reply_content,
            links=[],
            images=[],
            created_at=datetime.now(timezone.utc),
        )
        db.add(bot_msg)
        db.commit()
        db.refresh(bot_msg)

        bot_reply_dict = {
            "id": bot_msg.id,
            "user_id": bot_msg.user_id,
            "user_name": bot_msg.user_name,
            "user_avatar": bot_msg.user_avatar,
            "is_bot": True,
            "content": bot_msg.content,
            "parent_id": bot_msg.parent_id,
            "parent_preview": {
                "id": user_msg.id,
                "user_name": user_msg.user_name,
                "content": user_msg.content[:80],
                "is_bot": False,
            },
            "links": [],
            "images": [],
            "created_at": bot_msg.created_at.isoformat(),
        }

    return {
        "status": "success",
        "message": {
            "id": user_msg.id,
            "user_id": user_msg.user_id,
            "user_name": user_msg.user_name,
            "user_avatar": user_msg.user_avatar,
            "is_bot": False,
            "content": user_msg.content,
            "parent_id": user_msg.parent_id,
            "links": user_msg.links,
            "images": user_msg.images,
            "created_at": user_msg.created_at.isoformat(),
        },
        "bot_reply": bot_reply_dict,
    }


@router.post("/upload-image")
def upload_community_image(
    body: ImageUploadRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    """Upload product images or screenshots to share in community chat.
    Validates MIME type (JPG, PNG, WebP) and size (<= 5 MB).
    """
    mime = body.mime_type.lower().strip()
    if mime not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Please upload JPG, PNG, or WebP files.",
        )

    ext = ALLOWED_IMAGE_TYPES[mime]
    try:
        raw_bytes = base64.b64decode(body.data_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data payload.")

    if len(raw_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Image size exceeds the 5 MB maximum limit.",
        )

    # Secure random filename
    filename = f"img_{secrets.token_hex(12)}{ext}"
    dest_path = UPLOAD_DIR / filename

    with open(dest_path, "wb") as f:
        f.write(raw_bytes)

    web_url = f"/uploads/community/{filename}"
    return {
        "url": web_url,
        "filename": body.filename or filename,
        "size": len(raw_bytes),
    }


@router.post("/link-preview")
async def preview_link(body: LinkPreviewRequest) -> dict:
    """Fetch OpenGraph title, description, and thumbnail for a link."""
    try:
        preview = await fetch_link_preview(body.url)
        return preview
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/messages/{message_id}/report")
def report_message(
    message_id: str,
    body: ReportMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Report an inappropriate community message for moderation."""
    msg = db.get(CommunityMessage, message_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")

    report = CommunityReport(
        message_id=msg.id,
        reporter_id=current_user.id,
        reason=body.reason.strip(),
        created_at=datetime.now(timezone.utc),
    )
    db.add(report)
    msg.report_count += 1
    if msg.report_count >= 3:
        msg.reported = True
    db.commit()

    return {
        "status": "reported",
        "message": "Thank you for helping keep the SmartCart community safe. Our moderators will review this message.",
    }


@router.delete("/messages/{message_id}")
def delete_message(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Delete a community message (authors can delete their own; admins can moderate any)."""
    msg = db.get(CommunityMessage, message_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")

    if msg.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to delete this message.")

    msg.deleted = True
    db.commit()

    return {"status": "deleted", "id": message_id}
