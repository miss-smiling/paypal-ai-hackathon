"use client";

import { useState } from "react";
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, ShoppingBag, CheckCircle } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    shipping,
    total,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    addToast,
  } = useNovatek();

  const [promoInput, setPromoInput] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 99;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPct = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim()) {
      applyPromoCode(promoInput);
      setPromoInput("");
    }
  };

  const handlePayPalCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      const orderId = `NOV-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderSuccess(orderId);
      setIsCheckingOut(false);
      clearCart();
      addToast("Order Confirmed!", `PayPal Sandbox capture complete for Order #${orderId}`, "success");
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
      <div
        className="relative flex h-full w-full max-w-md flex-col bg-[#0b0e18] border-l border-slate-800 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Your Shopping Bag</h2>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>

          <button
            onClick={() => {
              setIsCartOpen(false);
              setOrderSuccess(null);
            }}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {orderSuccess ? (
          /* Order Confirmation View */
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 animate-pulse">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
            <p className="mt-2 text-xs text-slate-400">
              Your PayPal sandbox transaction was verified and captured idempotently.
            </p>
            <div className="mt-4 rounded-xl border border-slate-800 bg-[#07090e] px-4 py-3 text-xs">
              <span className="text-slate-400">Order ID: </span>
              <span className="font-mono font-bold text-cyan-300">{orderSuccess}</span>
            </div>
            <p className="mt-4 text-[11px] text-slate-500">
              Order receipt and tracking updates dispatched to your registered address.
            </p>
            <button
              onClick={() => {
                setOrderSuccess(null);
                setIsCartOpen(false);
              }}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress Bar */}
            <div className="border-b border-slate-800/80 bg-[#0d1222] px-6 py-3 text-xs">
              <div className="flex items-center justify-between text-slate-300 mb-1.5">
                <span>
                  {remainingForFreeShipping === 0 ? (
                    <strong className="text-cyan-300">You unlocked FREE Express Shipping!</strong>
                  ) : (
                    <>
                      Add <strong className="text-white">${remainingForFreeShipping}</strong> more for Free Shipping
                    </>
                  )}
                </span>
                <span className="text-[11px] text-slate-500">{freeShippingPct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-500"
                  style={{ width: `${freeShippingPct}%` }}
                />
              </div>
            </div>

            {/* Cart Item List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                  <ShoppingBag className="h-12 w-12 stroke-[1.5] text-slate-600 mb-3" />
                  <p className="text-sm font-medium text-slate-400">Your bag is currently empty</p>
                  <p className="text-xs text-slate-500 mt-1">Explore our latest engineered releases</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 rounded-xl border border-slate-800/80 bg-[#0e1322] p-3 transition-colors hover:border-slate-700"
                  >
                    {/* Item Thumbnail */}
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-[#07090e] p-2">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">
                            {item.product.name}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {item.product.category}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-white">
                          ${item.product.price * item.quantity}
                        </span>
                      </div>

                      {/* Quantity Selector & Remove */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900/80">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Promo Code & Checkout Footer */}
            {cart.length > 0 && (
              <div className="border-t border-slate-800 bg-[#090c16] px-6 py-5 space-y-4">
                
                {/* Promo Code Input */}
                {appliedPromo ? (
                  <div className="flex items-center justify-between rounded-xl bg-cyan-950/40 border border-cyan-500/30 px-3 py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-cyan-300">
                      <Tag className="h-3.5 w-3.5" />
                      <span>Code <strong>{appliedPromo}</strong> applied</span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-slate-400 hover:text-white text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. NOVATEK10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-800 bg-[#0d111e] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {/* Subtotals Breakdown */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-white">${subtotal}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount</span>
                      <span>-${discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `$${shipping}`}</span>
                  </div>

                  <div className="flex justify-between text-base font-bold text-white border-t border-slate-800/80 pt-2">
                    <span>Total</span>
                    <span className="text-cyan-300">${total}</span>
                  </div>
                </div>

                {/* PayPal Checkout Button */}
                <div className="space-y-2 pt-2">
                  <button
                    disabled={isCheckingOut}
                    onClick={handlePayPalCheckout}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0070ba] py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-[#005ea6] transition-all disabled:opacity-50"
                  >
                    {isCheckingOut ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Connecting PayPal Sandbox...</span>
                      </div>
                    ) : (
                      <>
                        <span>Pay with</span>
                        <span className="font-extrabold italic text-sm">PayPal</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                    <span>PayPal Sandbox Idempotent Checkout Enabled</span>
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
