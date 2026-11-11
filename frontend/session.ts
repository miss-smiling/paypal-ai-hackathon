const SESSION_KEY = "smartcart_session_id";

// One id per browser. The orders page reads the same key, so orders created in a
// session show up for the assistant and on /orders.
export function getSessionId(): string {
  if (typeof window === "undefined") return "demo-session";
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `sc-${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}
