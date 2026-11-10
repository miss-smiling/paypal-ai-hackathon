import Link from "next/link";

export default function Navigation() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link href="/assistant">AI Shopping Assistant</Link>
        </li>
        <li>
          <Link href="/compare">Compare Products</Link>
        </li>
        <li>
          <Link href="/product/1">Product Details</Link>
        </li>
        <li>
          <Link href="/watchlist">Watchlist &amp; Price Alerts</Link>
        </li>
        <li>
          <Link href="/budget">Budget Planner</Link>
        </li>
        <li>
          <Link href="/settings">Profile &amp; Settings</Link>
        </li>
        <li>
          <Link href="/login">Login</Link>
        </li>
        <li>
          <Link href="/signup">Signup</Link>
        </li>
        <li>
          <Link href="/checkout">Checkout</Link>
        </li>
        <li>
          <Link href="/orders">Orders</Link>
        </li>
      </ul>
    </nav>
  );
}
