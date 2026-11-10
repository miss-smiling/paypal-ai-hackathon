"use client";

import { useState } from "react";
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, ShoppingBag, CheckCircle, CheckCircle2 } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";
import Link from "next/link";

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
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "shipping" | "payment" | "success">("cart");
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "card" | "applepay">("paypal");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 50;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPct = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim()) {
      applyPromoCode(promoInput);
      setPromoInput("");
    }
  };

  const handleConfirmOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const orderId = `SC-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedOrderId(orderId);
      setIsProcessing(false);
      setCheckoutStep("success");
      clearCart();
      addToast("Order Placed Successfully!", `SmartCart Order #${orderId} verified & captured via PayPal.`, "success");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-opacity">
      <div
        className="relative flex h-full w-full max-w-md flex-col bg-[#090d1c] border-l border-slate-800 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-[#0c1226]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Your Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</h2>
          </div>

          <button
            onClick={() => {
              setIsCartOpen(false);
              setCheckoutStep("cart");
            }}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Multi-step Flow matching sample right panel */}
        {checkoutStep === "success" ? (
          /* Order Confirmation View */
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/40 text-cyan-400 animate-pulse">
              <CheckCircle className="h-10 w-10 text-cyan-300" />
            </div>
            
            <h3 className="text-xl font-black text-white">Order Placed Successfully!</h3>
            <p className="text-xs text-slate-400">
              Thank you for your order. Your verified order tracking number is:
            </p>
            
            <div className="rounded-xl border border-cyan-500/30 bg-[#060912] px-5 py-2 font-mono text-sm font-bold text-cyan-300">
              #{confirmedOrderId}
            </div>

            {/* Stepper matching sample */}
            <div className="w-full rounded-2xl border border-slate-800 bg-[#060912] p-4 text-left space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Order Placed & Verified</span>
              </div>
              <div className="flex items-center gap-2.5 text-cyan-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Processing in SmartCart Warehouse</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-500">
                <div className="h-4 w-4 rounded-full border border-slate-700" />
                <span>Shipped with Express Tracking</span>
              </div>
            </div>

            <button
              onClick={() => {
                setCheckoutStep("cart");
                setIsCartOpen(false);
              }}
              className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500"
            >
              Continue Shopping
            </button>
          </div>
        ) : checkoutStep === "payment" ? (
          /* Payment Method Step matching sample */
          <div className="flex flex-1 flex-col justify-between p-6 space-y-6 overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                <span>Step 2 of 2 · Payment Method</span>
              </div>
              <h3 className="text-lg font-black text-white">Choose How to Pay</h3>

              <div className="mt-4 space-y-3">
                {/* PayPal Option */}
                <div
                  onClick={() => setPaymentMethod("paypal")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                    paymentMethod === "paypal"
                      ? "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400"
                      : "border-slate-800 bg-[#0c1224]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💳</span>
                    <div>
                      <div className="text-xs font-bold text-white">PayPal Sandbox</div>
                      <div className="text-[10px] text-slate-400">Zero fraud risk · Orders v2 REST</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#0070ba]">PayPal</span>
                </div>

                {/* Credit / Debit Card Option */}
                <div
                  onClick={() => setPaymentMethod("card")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                    paymentMethod === "card"
                      ? "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400"
                      : "border-slate-800 bg-[#0c1224]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💳</span>
                    <div>
                      <div className="text-xs font-bold text-white">Credit / Debit Card</div>
                      <div className="text-[10px] text-slate-400">VISA · MasterCard · Amex</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Card</span>
                </div>

                {/* Apple Pay */}
                <div
                  onClick={() => setPaymentMethod("applepay")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                    paymentMethod === "applepay"
                      ? "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400"
                      : "border-slate-800 bg-[#0c1224]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl"></span>
                    <div>
                      <div className="text-xs font-bold text-white">Apple Pay</div>
                      <div className="text-[10px] text-slate-400">Biometric Touch ID / Face ID</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white">Pay</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex justify-between text-base font-bold text-white">
                <span>Total Due</span>
                <span className="text-cyan-300">${total}.00</span>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleConfirmOrder}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <span>Confirm & Pay with {paymentMethod.toUpperCase()}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                onClick={() => setCheckoutStep("cart")}
                className="w-full text-center text-xs text-slate-400 hover:text-white"
              >
                &larr; Back to Cart
              </button>
            </div>
          </div>
        ) : (
          /* Standard Cart List View */
          <>
            {/* Free Shipping Progress Bar ($50 threshold) */}
            <div className="border-b border-slate-800/80 bg-[#0b1022] px-6 py-3 text-xs">
              <div className="flex items-center justify-between text-slate-300 mb-1.5">
                <span>
                  {remainingForFreeShipping === 0 ? (
                    <strong className="text-cyan-300">You unlocked FREE Express Delivery!</strong>
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

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                  <ShoppingBag className="h-12 w-12 stroke-[1.5] text-slate-600 mb-3" />
                  <p className="text-sm font-medium text-slate-400">Your SmartCart is currently empty</p>
                  <p className="text-xs text-slate-500 mt-1">Explore our latest smartphone deals</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 rounded-xl border border-slate-800/80 bg-[#0d1326] p-3 transition-colors hover:border-slate-700"
                  >
                    {/* Item Thumbnail */}
                    <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-lg bg-[#060810] p-2">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">
                            {item.product.name}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {item.product.storageOption || "256GB"} · {item.product.colorName || item.product.brand}
                          </span>
                        </div>
                        <span className="text-xs font-black text-white">
                          ${item.product.price * item.quantity}.00
                        </span>
                      </div>

                      {/* Quantity Selector */}
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

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-slate-800 bg-[#070a16] px-6 py-5 space-y-4">
                
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
                      placeholder="Promo code (e.g. SMART10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-800 bg-[#0d1226] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {/* Subtotal */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-white">${subtotal}.00</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount</span>
                      <span>-${discount}.00</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>Shipping</span>
                    <span className="text-emerald-400">{shipping === 0 ? "FREE" : `$${shipping}.00`}</span>
                  </div>

                  <div className="flex justify-between text-base font-bold text-white border-t border-slate-800/80 pt-2">
                    <span>Total</span>
                    <span className="text-cyan-300">${total}.00</span>
                  </div>
                </div>

                {/* Checkout Button matching sample right panel */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setCheckoutStep("payment")}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                    <span>256-Bit SSL Encrypted PayPal Checkout</span>
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
