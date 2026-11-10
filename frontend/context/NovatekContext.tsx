"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { NOVATEK_PRODUCTS, NovatekProduct, PROMO_CODES } from "@/lib/novatekData";

export interface CartItem {
  product: NovatekProduct;
  quantity: number;
}

interface ToastMessage {
  id: string;
  type: "success" | "info" | "error";
  title: string;
  message: string;
}

interface NovatekContextType {
  products: NovatekProduct[];
  cart: CartItem[];
  addToCart: (product: NovatekProduct, quantity?: number) => void;
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
  compareList: NovatekProduct[];
  addToCompare: (product: NovatekProduct) => boolean;
  removeFromCompare: (productId: string) => void;
  toggleCompare: (product: NovatekProduct) => void;
  clearCompare: () => void;
  isComparing: (productId: string) => boolean;

  // Modals & Drawers
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCareModalOpen: boolean;
  setIsCareModalOpen: (open: boolean) => void;
  quickViewProduct: NovatekProduct | null;
  setQuickViewProduct: (product: NovatekProduct | null) => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: "success" | "info" | "error") => void;
  removeToast: (id: string) => void;
}

const NovatekContext = createContext<NovatekContextType | undefined>(undefined);

const CART_STORAGE_KEY = "novatek_cart_v1";
const COMPARE_STORAGE_KEY = "novatek_compare_v1";

export function NovatekProvider({ children }: { children: React.ReactNode }) {
  const [products] = useState<NovatekProduct[]>(NOVATEK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscountPct, setPromoDiscountPct] = useState<number>(0);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCareModalOpen, setIsCareModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<NovatekProduct | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        // Preload default hero headphones so cart has a realistic item ready
        const defaultProduct = NOVATEK_PRODUCTS.find((p) => p.id === "novasound-max") || NOVATEK_PRODUCTS[1];
        setCart([{ product: defaultProduct, quantity: 1 }]);
      }
      
      const savedCompare = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (savedCompare) {
        setCompareIds(JSON.parse(savedCompare));
      } else {
        // Preload 2 comparison items by default: NovaPhone 15 Pro & NovaBook Air M2
        setCompareIds(["novaphone-15-pro", "novawatch-x"]);
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

  const addToCart = (product: NovatekProduct, quantity = 1) => {
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
    addToast("Added to Bag", `${product.name} is now in your shopping bag.`, "success");
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast("Item Removed", "Removed item from bag.", "info");
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
    addToast("Invalid Code", "Please check your promo code and try again.", "error");
    return { success: false, message: "Invalid promo code" };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoDiscountPct(0);
  };

  const addToCompare = (product: NovatekProduct): boolean => {
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

  const toggleCompare = (product: NovatekProduct) => {
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
    .filter((p): p is NovatekProduct => Boolean(p));

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = Math.round((subtotal * promoDiscountPct) / 100);
  // Free shipping on orders over $99
  const shipping = subtotal > 99 || subtotal === 0 ? 0 : 15;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <NovatekContext.Provider
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
    </NovatekContext.Provider>
  );
}

export function useNovatek() {
  const context = useContext(NovatekContext);
  if (!context) {
    throw new Error("useNovatek must be used within a NovatekProvider");
  }
  return context;
}
