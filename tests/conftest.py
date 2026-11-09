import os
from pathlib import Path

# Must be set before the app is imported. Tests use a throwaway SQLite file
# and never call PayPal or Gemini.
TEST_DB = Path(__file__).resolve().parent.parent / "test_smartcart.db"
if TEST_DB.exists():
    TEST_DB.unlink()
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB}"
for var in ("GEMINI_API_KEY", "OPENAI_API_KEY", "PAYPAL_CLIENT_ID",
            "PAYPAL_CLIENT_SECRET", "PAYPAL_WEBHOOK_ID"):
    os.environ.pop(var, None)
