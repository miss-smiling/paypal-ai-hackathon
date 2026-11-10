import Link from "next/link";
import { TOP_DEALS } from "../../page";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

function money(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  // Find product by id or fallback to first deal
  const product =
    TOP_DEALS.find((d) => d.id === id) ||
    TOP_DEALS[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-cyan-400">Home</Link>
        <span>/</span>
        <Link href="/compare" className="hover:text-cyan-400">Products</Link>
        <span>/</span>
        <span className="text-white font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Showcase */}
      <div className="grid gap-8 lg:grid-cols-12 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Left: Product Image */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative h-72 sm:h-80 w-full rounded-2xl bg-slate-950 p-6 flex items-center justify-center border border-slate-800">
            <img
              src={product.image_url}
              alt={product.name}
              className="max-h-full max-w-full object-contain filter drop-shadow-xl"
            />
            <span className="absolute top-4 left-4 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-slate-300 border border-slate-700">
              {product.store}
            </span>
            <span className="absolute top-4 right-4 rounded-full bg-emerald-950 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-400">
              {product.badge}
            </span>
          </div>
        </div>

        {/* Right: Info & Actions */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-0.5 text-xs font-bold text-cyan-400">
                Verified Spec Match
              </span>
              <span className="rounded-full bg-emerald-950/60 border border-emerald-500/40 px-3 py-0.5 text-xs font-bold text-emerald-400">
                Trust Score: {product.trust_score}/100
              </span>
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-black text-white leading-tight">
              {product.name}
            </h1>

            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              {product.highlight}
            </p>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-cyan-300">{money(product.price)}</span>
              <span className="text-sm text-slate-500 line-through">{money(product.original_price)}</span>
              <span className="text-xs font-bold text-emerald-400">Save {product.discount_pct}%</span>
            </div>

            <div className="mt-4 rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Verified Buyer Reviews:</span>
                <span className="text-white font-bold">{product.reviews_count} Reviews (★ {product.rating})</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Sentiment Guard:</span>
                <span className="text-emerald-400 font-semibold">9 unverified 5-star reviews pruned</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery:</span>
                <span className="text-slate-200">Free 2-day delivery across India</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 text-center rounded-2xl bg-[#ffc439] hover:bg-[#f4bb34] px-6 py-3.5 font-black text-[#003087] shadow-lg transition-all"
            >
              Buy with PayPal Sandbox &rarr;
            </Link>
            <Link
              href="/compare"
              className="rounded-2xl border border-slate-700 bg-slate-950 px-6 py-3.5 text-center font-bold text-xs text-slate-300 hover:text-white"
            >
              Compare with Alternatives
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
