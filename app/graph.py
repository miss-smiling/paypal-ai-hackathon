"""LangGraph pipeline: the multi-agent shopping workflow.

    parse_intent -> discover -> ┬-> review_agent -┬-> optimize -> END
                                └-> budget_agent --┘

review_agent and budget_agent run in parallel after discovery and join at optimize.
Every node appends to `trace`, which is saved to the agent_runs table for audit.
"""

from __future__ import annotations

import asyncio
import operator
import os
from typing import Annotated, TypedDict

from langgraph.graph import END, StateGraph

from app.agents import analyze_reviews, budget_status, cheaper_alternatives, discover
from app.cart import build_ledger, rank
from app.config import settings
from app.intent import parse_intent


class PipelineState(TypedDict, total=False):
    query: str
    coupon_code: str | None
    session_budget: float | None
    spent_so_far: float
    intent: dict
    candidates: list[dict]
    reviews: dict[str, dict]
    budget: dict
    matrix: list[dict]
    top_pick: str | None
    cart: dict | None
    alternatives: list[dict]
    message: str
    trace: Annotated[list[str], operator.add]


async def parse_intent_node(state: PipelineState) -> dict:
    intent = await parse_intent(state["query"])
    return {"intent": intent,
            "trace": [f"Intent agent parsed request via {intent['source']}: "
                      f"category={intent['category'] or 'any'}, "
                      f"max_price={intent['max_price'] or 'none'}"]}


async def discover_node(state: PipelineState) -> dict:
    intent = state["intent"]
    raw_query = state.get("query", "")
    candidates: list[dict] = []

    # 1. Search Google Shopping India live if SerpApi is configured (skip during unit tests)
    if settings.serpapi_api_key and not os.getenv("PYTEST_CURRENT_TEST"):
        try:
            from app.serp import search_indian_market
            live_prods = await search_indian_market(
                query=raw_query,
                category=intent.get("category"),
                max_price=intent.get("max_price"),
            )
            for p in live_prods:
                candidates.append({
                    "product": p,
                    "match_score": 1.0,
                    "matched": ["live_store_listing"],
                    "missed": [],
                })
        except Exception:
            candidates = []

    # 2. Fall back to local catalog if no live candidates or SerpApi not set
    if not candidates:
        candidates = discover(intent)
        source_note = "local catalog"
    else:
        source_note = f"Google Shopping India ({len(candidates)} live store listings)"

    return {
        "candidates": candidates,
        "trace": [f"Discovery agent found {len(candidates)} candidate(s) via {source_note}"],
    }


async def review_node(state: PipelineState) -> dict:
    candidates = state.get("candidates", [])
    results = await asyncio.gather(
        *(asyncio.to_thread(analyze_reviews, c["product"]["id"]) for c in candidates)
    )
    reviews = {c["product"]["id"]: r for c, r in zip(candidates, results)}
    return {"reviews": reviews,
            "trace": ["Review agent scored trust and removed suspicious reviews"]}


def budget_node(state: PipelineState) -> dict:
    status = budget_status(state.get("session_budget"), state.get("spent_so_far", 0.0))
    if status["budget"] is None:
        note = "Budget agent: no budget set for this session"
    elif status["exceeded"]:
        note = f"Budget agent: session budget already exceeded by {-status['remaining']:.2f}"
    else:
        note = f"Budget agent: {status['remaining']:.2f} remaining in session budget"
    return {"budget": status, "trace": [note]}


def optimize_node(state: PipelineState) -> dict:
    candidates = state.get("candidates", [])
    if not candidates:
        return {"matrix": [], "top_pick": None, "cart": None, "alternatives": [],
                "message": "No products match those constraints. Try a higher budget.",
                "trace": ["Optimizer: nothing to rank"]}

    reviews = state.get("reviews", {})
    trust_by_id = {pid: r["trust_score"] for pid, r in reviews.items()}
    ranked = rank(candidates, trust_by_id)

    matrix = []
    for row in ranked:
        pid = row["product"]["id"]
        review = reviews.get(pid, {})
        matrix.append({
            "product": row["product"],
            "match_score": row["match_score"],
            "matched": row["matched"],
            "missed": row["missed"],
            "trust_score": row["trust_score"],
            "avg_rating": review.get("avg_rating"),
            "flagged_reviews": review.get("flagged", 0),
            "value_score": row["value_score"],
            "final_score": row["final_score"],
        })

    top = ranked[0]
    cart = build_ledger([top["product"]], state.get("coupon_code"))
    trace = [f"Optimizer ranked {len(matrix)} product(s) (50% spec, 30% trust, 20% value)"]

    budget = state.get("budget", {})
    alternatives: list[dict] = []
    remaining = budget.get("remaining")
    if remaining is not None and cart["total"] > remaining:
        alternatives = cheaper_alternatives(matrix, top["product"]["price"], remaining)
        trace.append(f"Budget agent: top pick is over the remaining budget, "
                     f"{len(alternatives)} cheaper alternative(s) suggested")

    trace.append(f"Price agent: {'coupon ' + cart['coupon']['code'] if cart['coupon'] else 'no coupon applies'}")
    return {"matrix": matrix, "top_pick": top["product"]["id"], "cart": cart,
            "alternatives": alternatives, "message": "", "trace": trace}


def _build_graph():
    graph = StateGraph(PipelineState)
    graph.add_node("parse_intent", parse_intent_node)
    graph.add_node("discover", discover_node)
    graph.add_node("review_agent", review_node)
    graph.add_node("budget_agent", budget_node)
    graph.add_node("optimize", optimize_node)

    graph.set_entry_point("parse_intent")
    graph.add_edge("parse_intent", "discover")
    graph.add_edge("discover", "review_agent")
    graph.add_edge("discover", "budget_agent")
    graph.add_edge("review_agent", "optimize")
    graph.add_edge("budget_agent", "optimize")
    graph.add_edge("optimize", END)
    return graph.compile()


_pipeline = _build_graph()


async def run_pipeline(query: str, *, coupon_code: str | None = None,
                       session_budget: float | None = None, spent_so_far: float = 0.0) -> dict:
    """Run the agent graph and return the decision matrix, cart and agent trace."""
    result = await _pipeline.ainvoke({
        "query": query,
        "coupon_code": coupon_code,
        "session_budget": session_budget,
        "spent_so_far": spent_so_far,
        "trace": [],
    })
    return {
        "intent": result["intent"],
        "budget": result.get("budget"),
        "matrix": result.get("matrix", []),
        "top_pick": result.get("top_pick"),
        "cart": result.get("cart"),
        "alternatives": [
            {"product": a["product"], "final_score": a["final_score"]}
            for a in result.get("alternatives", [])
        ],
        "message": result.get("message", ""),
        "trace": result["trace"],
    }
