"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SMARTCART_PRODUCTS, SmartCartProduct, PROMO_CODES } from "@/lib/smartcartData";

export interface CartItem {
  product: SmartCartProduct;
  quantity: number;
}

interface ToastMessage {
  id: string;
  type: "success" | "info" | "error";
  title: string;
  message: string;
}

interface SmartCartContextType {
  products: SmartCartProduct[];
  cart: CartItem[];
  addToCart: (product: SmartCartProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  appliedPromo: string | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  
  // Compare state
  compareList: SmartCartProduct[];
  addToCompare: (product: SmartCartProduct) => boolean;
  removeFromCompare: (productId: string) => void;
  toggleCompare: (product: SmartCartProduct) => void;
  clearCompare: () => void;
  isComparing: (productId: string) => boolean;

  // Modals & Drawers
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCareModalOpen: boolean;
  setIsCareModalOpen: (open: boolean) => void;
  quickViewProduct: SmartCartProduct | null;
  setQuickViewProduct: (product: SmartCartProduct | null) => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: "success" | "info" | "error") => void;
  removeToast: (id: string) => void;
}

const SmartCartContext = createContext<SmartCartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "smartcart_cart_v2";
const COMPARE_STORAGE_KEY = "smartcart_compare_v2";

export function NovatekProvider({ children }: { children: React.ReactNode }) {
  const [products] = useState<SmartCartProduct[]>(SMARTCART_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscountPct, setPromoDiscountPct] = useState<number>(0);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCareModalOpen, setIsCareModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<SmartCartProduct | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load from localStorage or initialize with sample cart items from screenshot
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        // Preload sample items matching the right-hand panel in the uploaded design:
        // 1. iPhone 16 Pro ($1199)
        // 2. Samsung Galaxy S24 ($999)
        // 3. AirPods Pro 2 ($249)
        const p1 = SMARTCART_PRODUCTS.find((p) => p.id === "iphone-16-pro") || SMARTCART_PRODUCTS[0];
        const p2 = SMARTCART_PRODUCTS.find((p) => p.id === "samsung-galaxy-s24") || SMARTCART_PRODUCTS[1];
        const p3 = SMARTCART_PRODUCTS.find((p) => p.id === "airpods-pro-2") || SMARTCART_PRODUCTS[SMARTCART_PRODUCTS.length - 1];

        setCart([
          { product: p1, quantity: 1 },
          { product: p2, quantity: 1 },
          { product: p3, quantity: 1 },
        ]);
      }
      
      const savedCompare = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (savedCompare) {
        setCompareIds(JSON.parse(savedCompare));
      } else {
        // Preload 2 comparison items: iPhone 16 Pro vs Samsung Galaxy S24
        setCompareIds(["iphone-16-pro", "samsung-galaxy-s24"]);
      }
    } catch {
      // LocalStorage fallback
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareIds));
    } catch {
      // ignore
    }
  }, [compareIds]);

  const addToast = (title: string, message: string, type: "success" | "info" | "error" = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product: SmartCartProduct, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    addToast("Added to Cart", `${product.name} is now in your SmartCart bag.`, "success");
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast("Item Removed", "Removed item from cart.", "info");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyPromoCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const promo = PROMO_CODES[cleanCode];
    if (promo) {
      setAppliedPromo(cleanCode);
      setPromoDiscountPct(promo.discountPercent);
      addToast("Promo Applied!", `${promo.description} (${promo.discountPercent}% OFF)`, "success");
      return { success: true, message: promo.description };
    }
    addToast("Invalid Code", "Please check your promo code (e.g. SMART10 or HACKATHON20).", "error");
    return { success: false, message: "Invalid promo code" };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoDiscountPct(0);
  };

  const addToCompare = (product: SmartCartProduct): boolean => {
    if (compareIds.length >= 4) {
      addToast("Compare Limit Reached", "You can compare up to 4 devices at once.", "error");
      return false;
    }
    if (!compareIds.includes(product.id)) {
      setCompareIds((prev) => [...prev, product.id]);
      addToast("Added to Compare", `${product.name} added to comparison matrix.`, "info");
      return true;
    }
    return false;
  };

  const removeFromCompare = (productId: string) => {
    setCompareIds((prev) => prev.filter((id) => id !== productId));
  };

  const toggleCompare = (product: SmartCartProduct) => {
    if (compareIds.includes(product.id)) {
      removeFromCompare(product.id);
      addToast("Removed from Compare", `${product.name} removed from comparison.`, "info");
    } else {
      addToCompare(product);
    }
  };

  const clearCompare = () => {
    setCompareIds([]);
  };

  const isComparing = (productId: string) => compareIds.includes(productId);

  const compareList = compareIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is SmartCartProduct => Boolean(p));

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = Math.round((subtotal * promoDiscountPct) / 100);
  // Free shipping on orders over $50
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 15;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <SmartCartContext.Provider
      value={{
        products,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        discount,
        shipping,
        total,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        compareList,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        isComparing,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isCareModalOpen,
        setIsCareModalOpen,
        quickViewProduct,
        setQuickViewProduct,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </SmartCartContext.Provider>
  );
}

export function useNovatek() {
  const context = useContext(SmartCartContext);
  if (!context) {
    throw new Error("useNovatek must be used within a NovatekProvider");
  }
  return context;
}
