"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "@/lib/types";
import { userService, watchlistService, alertService } from "@/lib/services";

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

interface SmartCartContextType {
  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Search Modal
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;

  // User
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;

  // Dynamic counts for badges
  watchlistCount: number;
  alertCount: number;
  refreshCounts: () => void;

  // Quick Compare state
  compareIds: string[];
  addToCompare: (productId: string) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isComparing: (productId: string) => boolean;

  // Toasts
  toasts: Toast[];
  addToast: (
    title: string,
    message: string,
    type?: "success" | "info" | "warning" | "error"
  ) => void;
  removeToast: (id: string) => void;
}

const SmartCartContext = createContext<SmartCartContextType | undefined>(undefined);

const COMPARE_STORAGE_KEY = "smartcart_compare_ids_v3";
const SIDEBAR_STORAGE_KEY = "smartcart_sidebar_collapsed_v3";

export function SmartCartProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>(userService.get());
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [compareIds, setCompareIds] = useState<string[]>([
    "lenovo-ideapad-slim-3",
    "hp-pavilion-14",
  ]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
      const savedCollapsed = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (savedCollapsed !== null) {
        setSidebarCollapsedState(savedCollapsed === "true");
      }

      const savedCompare = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (savedCompare) {
        setCompareIds(JSON.parse(savedCompare));
      }

      setWatchlistCount(watchlistService.get().length);
      setAlertCount(alertService.get().filter((a) => a.status === "active").length);
    } catch {
      // fallback
    }
  }, []);

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    } catch {}
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const refreshCounts = () => {
    setWatchlistCount(watchlistService.get().length);
    setAlertCount(alertService.get().filter((a) => a.status === "active").length);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    const updated = userService.update(updates);
    setUser(updated);
    addToast("Profile Updated", "Your shopping preferences were saved.", "success");
  };

  const addToast = (
    title: string,
    message: string,
    type: "success" | "info" | "warning" | "error" = "success"
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCompare = (productId: string): boolean => {
    if (compareIds.length >= 4) {
      addToast(
        "Compare Limit Reached",
        "You can compare up to 4 devices simultaneously.",
        "warning"
      );
      return false;
    }
    if (!compareIds.includes(productId)) {
      const updated = [...compareIds, productId];
      setCompareIds(updated);
      try {
        localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      addToast("Added to Comparison", "Device added to side-by-side matrix.", "info");
      return true;
    }
    return false;
  };

  const removeFromCompare = (productId: string) => {
    const updated = compareIds.filter((id) => id !== productId);
    setCompareIds(updated);
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearCompare = () => {
    setCompareIds([]);
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify([]));
    } catch {}
    addToast("Comparison Cleared", "All products removed from matrix.", "info");
  };

  const isComparing = (productId: string) => compareIds.includes(productId);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <SmartCartContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        mobileMenuOpen,
        setMobileMenuOpen,
        searchModalOpen,
        setSearchModalOpen,
        user,
        updateUser,
        watchlistCount,
        alertCount,
        refreshCounts,
        compareIds,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isComparing,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </SmartCartContext.Provider>
  );
}

export function useSmartCart() {
  const context = useContext(SmartCartContext);
  if (!context) {
    throw new Error("useSmartCart must be used within a SmartCartProvider");
  }
  return context;
}
