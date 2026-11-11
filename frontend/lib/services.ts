import {
  MOCK_PRODUCTS,
  MOCK_WATCHLIST,
  MOCK_PRICE_ALERTS,
  MOCK_BUDGET,
  MOCK_HISTORY,
  MOCK_USER,
  MOCK_SAVED_CONVERSATIONS,
} from "./mockData";
import {
  Product,
  WatchlistItem,
  PriceAlert,
  BudgetPlan,
  BudgetExpense,
  ShoppingHistoryEvent,
  UserProfile,
  SavedConversation,
  ChatMessage,
  Retailer,
  ProductCategory,
} from "./types";

const isBrowser = typeof window !== "undefined";

const getStorageItem = <T>(key: string, fallback: T): T => {
  if (!isBrowser) return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage error:", e);
  }
};

// Storage Keys
const KEYS = {
  WATCHLIST: "smartcart_watchlist_v3",
  ALERTS: "smartcart_alerts_v3",
  BUDGET: "smartcart_budget_v3",
  HISTORY: "smartcart_history_v3",
  USER: "smartcart_user_v3",
  CONVERSATIONS: "smartcart_conversations_v3",
};

export const productService = {
  getAll: (filters?: { category?: ProductCategory; retailer?: Retailer; search?: string }): Product[] => {
    let list = [...MOCK_PRODUCTS];
    if (filters?.category) {
      list = list.filter((p) => p.category === filters.category);
    }
    if (filters?.retailer) {
      list = list.filter((p) => p.retailer === filters.retailer);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getById: (id: string): Product | undefined => {
    return MOCK_PRODUCTS.find((p) => p.id === id);
  },

  getAlternatives: (id: string): Product[] => {
    const current = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!current) return [];
    return MOCK_PRODUCTS.filter(
      (p) => p.category === current.category && p.id !== current.id
    );
  },
};

export const watchlistService = {
  get: (): WatchlistItem[] => {
    return getStorageItem<WatchlistItem[]>(KEYS.WATCHLIST, MOCK_WATCHLIST);
  },

  add: (product: Product, targetPrice?: number): WatchlistItem => {
    const list = watchlistService.get();
    const existing = list.find((item) => item.productId === product.id);
    if (existing) return existing;

    const newItem: WatchlistItem = {
      id: "wl-" + Date.now(),
      productId: product.id,
      product,
      targetPrice: targetPrice || Math.round(product.price * 0.95),
      priceAlertEnabled: true,
      addedAt: "Just now",
      initialPrice: product.price,
      priceMovement: "stable",
      priceDiff: 0,
    };
    const updated = [newItem, ...list];
    setStorageItem(KEYS.WATCHLIST, updated);

    // Also record in history
    historyService.add({
      type: "watchlist",
      title: `Added ${product.name} to Watchlist`,
      description: `Target set to ₹${newItem.targetPrice.toLocaleString("en-IN")}`,
      link: `/product/${product.id}`,
      badge: "Saved",
    });

    return newItem;
  },

  remove: (id: string): void => {
    const list = watchlistService.get();
    const updated = list.filter((item) => item.id !== id);
    setStorageItem(KEYS.WATCHLIST, updated);
  },

  toggleAlert: (id: string): boolean => {
    const list = watchlistService.get();
    let newState = false;
    const updated = list.map((item) => {
      if (item.id === id) {
        newState = !item.priceAlertEnabled;
        return { ...item, priceAlertEnabled: newState };
      }
      return item;
    });
    setStorageItem(KEYS.WATCHLIST, updated);
    return newState;
  },

  updateTargetPrice: (id: string, newTarget: number): void => {
    const list = watchlistService.get();
    const updated = list.map((item) =>
      item.id === id ? { ...item, targetPrice: newTarget } : item
    );
    setStorageItem(KEYS.WATCHLIST, updated);
  },
};

export const alertService = {
  get: (): PriceAlert[] => {
    return getStorageItem<PriceAlert[]>(KEYS.ALERTS, MOCK_PRICE_ALERTS);
  },

  create: (productId: string, targetPrice: number, retailer?: Retailer): PriceAlert | null => {
    const product = productService.getById(productId);
    if (!product) return null;

    const alerts = alertService.get();
    const newAlert: PriceAlert = {
      id: "pa-" + Date.now(),
      productId,
      product,
      targetPrice,
      initialPrice: product.price,
      currentPrice: product.price,
      retailer: retailer || product.retailer,
      status: "active",
      createdAt: "Today",
    };

    const updated = [newAlert, ...alerts];
    setStorageItem(KEYS.ALERTS, updated);

    historyService.add({
      type: "alert",
      title: `Created Price Alert for ${product.name}`,
      description: `Monitoring for drops under ₹${targetPrice.toLocaleString("en-IN")}`,
      link: "/alerts",
      badge: "Alert Set",
    });

    return newAlert;
  },

  togglePause: (id: string): "active" | "paused" => {
    const alerts = alertService.get();
    let newStatus: "active" | "paused" = "active";
    const updated = alerts.map((a) => {
      if (a.id === id) {
        newStatus = a.status === "active" ? "paused" : "active";
        return { ...a, status: newStatus };
      }
      return a;
    });
    setStorageItem(KEYS.ALERTS, updated);
    return newStatus;
  },

  delete: (id: string): void => {
    const alerts = alertService.get();
    const updated = alerts.filter((a) => a.id !== id);
    setStorageItem(KEYS.ALERTS, updated);
  },

  updateTarget: (id: string, newTarget: number): void => {
    const alerts = alertService.get();
    const updated = alerts.map((a) =>
      a.id === id ? { ...a, targetPrice: newTarget } : a
    );
    setStorageItem(KEYS.ALERTS, updated);
  },
};

export const budgetService = {
  get: (): BudgetPlan => {
    return getStorageItem<BudgetPlan>(KEYS.BUDGET, MOCK_BUDGET);
  },

  updateTotal: (newTotal: number, name?: string): BudgetPlan => {
    const plan = budgetService.get();
    const updated: BudgetPlan = {
      ...plan,
      totalBudget: newTotal,
      name: name || plan.name,
    };
    setStorageItem(KEYS.BUDGET, updated);

    historyService.add({
      type: "budget",
      title: `Updated Shopping Budget to ₹${newTotal.toLocaleString("en-IN")}`,
      description: `Plan updated: ${updated.name}`,
      link: "/budget",
      badge: "Budget",
    });

    return updated;
  },

  addExpense: (expense: Omit<BudgetExpense, "id">): BudgetPlan => {
    const plan = budgetService.get();
    const newExp: BudgetExpense = {
      ...expense,
      id: "exp-" + Date.now(),
    };

    const expenses = [newExp, ...plan.expenses];
    const amountSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Update category spent
    const categories = plan.categories.map((c) => {
      if (c.category === expense.category) {
        return { ...c, spent: c.spent + expense.amount };
      }
      return c;
    });

    const updated: BudgetPlan = {
      ...plan,
      expenses,
      amountSpent,
      categories,
    };
    setStorageItem(KEYS.BUDGET, updated);

    historyService.add({
      type: "purchase",
      title: `Added Expense: ${expense.productName}`,
      description: `₹${expense.amount.toLocaleString("en-IN")} (${expense.category}) via ${expense.retailer}`,
      link: "/budget",
      badge: "Expense",
    });

    return updated;
  },

  updateCategoryAllocation: (category: ProductCategory, allocated: number): BudgetPlan => {
    const plan = budgetService.get();
    const categories = plan.categories.map((c) =>
      c.category === category ? { ...c, allocated } : c
    );
    const updated = { ...plan, categories };
    setStorageItem(KEYS.BUDGET, updated);
    return updated;
  },
};

export const historyService = {
  get: (): ShoppingHistoryEvent[] => {
    return getStorageItem<ShoppingHistoryEvent[]>(KEYS.HISTORY, MOCK_HISTORY);
  },

  add: (event: Omit<ShoppingHistoryEvent, "id" | "timestamp">): void => {
    const list = historyService.get();
    const newEvent: ShoppingHistoryEvent = {
      ...event,
      id: "hist-" + Date.now(),
      timestamp: "Just now",
    };
    const updated = [newEvent, ...list.slice(0, 40)]; // keep last 40
    setStorageItem(KEYS.HISTORY, updated);
  },
};

export const userService = {
  get: (): UserProfile => {
    return getStorageItem<UserProfile>(KEYS.USER, MOCK_USER);
  },

  update: (updates: Partial<UserProfile>): UserProfile => {
    const user = userService.get();
    const updated = { ...user, ...updates };
    setStorageItem(KEYS.USER, updated);
    return updated;
  },
};

export const chatService = {
  getConversations: (): SavedConversation[] => {
    return getStorageItem<SavedConversation[]>(KEYS.CONVERSATIONS, MOCK_SAVED_CONVERSATIONS);
  },

  saveConversation: (conversation: SavedConversation): void => {
    const list = chatService.getConversations();
    const filtered = list.filter((c) => c.id !== conversation.id);
    setStorageItem(KEYS.CONVERSATIONS, [conversation, ...filtered]);
  },

  generateAiResponse: async (query: string): Promise<ChatMessage> => {
    // Realistic AI shopping assistant parsing & synthesis
    await new Promise((r) => setTimeout(r, 900));

    const q = query.toLowerCase();

    if (q.includes("laptop") || q.includes("programming") || q.includes("code") || q.includes("macbook")) {
      return {
        id: "msg-" + Date.now(),
        sender: "cart",
        text: "I analyzed 14 laptops across Amazon and Flipkart against your requirements. For programming, having 16GB RAM and a comfortable keyboard is non-negotiable for long compilation sessions.\n\nHere are the top picks sorted by value-for-money:",
        timestamp: "Just now",
        products: [
          {
            id: "lenovo-ideapad-slim-3",
            name: "Lenovo IdeaPad Slim 3 (15.6\" FHD, 12th Gen i5)",
            price: 54990,
            rating: 4.3,
            retailer: "Amazon",
            badge: "Best Budget",
            aiNote: "Excellent 16GB RAM value under ₹55k. Silent thermal management during code compilation.",
            image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
          },
          {
            id: "hp-pavilion-14",
            name: "HP Pavilion 14 (14\" FHD IPS, 13th Gen i5)",
            price: 62990,
            rating: 4.4,
            retailer: "Flipkart",
            badge: "Best Overall",
            aiNote: "Rigid metal chassis, Bang & Olufsen sound, ultra-portable 1.41kg footprint.",
            image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
          },
          {
            id: "asus-vivobook-15",
            name: "ASUS Vivobook 15 (15.6\" OLED, Ryzen 7)",
            price: 58490,
            rating: 4.2,
            retailer: "Amazon",
            badge: "Best Screen",
            aiNote: "Incredible 600-nit true-black OLED screen. 8-core CPU handles intense Docker stacks.",
            image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
          },
        ],
        aiVerdict:
          "If your budget is flexible up to ₹65,000, choose the **HP Pavilion 14** for its aluminum durability and 13th Gen processing power. If you want maximum savings while preserving 16GB RAM, the **Lenovo IdeaPad Slim 3** at ₹54,990 is hard to beat.",
        followUps: [
          "Compare Lenovo vs HP Pavilion side by side",
          "What about battery life for long lecture days?",
          "Show me laptop bag and mouse combos under ₹2,500",
        ],
      };
    }

    if (q.includes("phone") || q.includes("mobile") || q.includes("iphone") || q.includes("samsung") || q.includes("camera")) {
      return {
        id: "msg-" + Date.now(),
        sender: "cart",
        text: "I cross-referenced smartphone benchmarks, real buyer review sentiment, and current festival deals on Amazon and Flipkart. Here are the top flagship smartphones worth buying right now:",
        timestamp: "Just now",
        products: [
          {
            id: "apple-iphone-15",
            name: "Apple iPhone 15 (128GB, Black)",
            price: 64999,
            rating: 4.7,
            retailer: "Flipkart",
            badge: "Top Camera",
            aiNote: "48MP camera is a giant leap. USB-C charging convenience and highest resale value in 2-3 years.",
            image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
          },
          {
            id: "samsung-galaxy-s24",
            name: "Samsung Galaxy S24 5G (256GB)",
            price: 74999,
            rating: 4.6,
            retailer: "Amazon",
            badge: "Best Android",
            aiNote: "7 full years of Android updates, Galaxy AI suite, and a blinding 2600-nit 120Hz display.",
            image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
          },
        ],
        aiVerdict:
          "The **iPhone 15** at ₹64,999 offers superior video recording, consistent color science, and long resale durability. Choose the **Galaxy S24** (₹74,999) if you want 120Hz refresh rate, 3x optical zoom telephoto lens, and extensive AI multitasking.",
        followUps: [
          "How does the iPhone 15 battery compare to the S24?",
          "Are there any bank discount cards applicable on Flipkart?",
          "Add iPhone 15 to my price alert tracking list",
        ],
      };
    }

    if (q.includes("headphone") || q.includes("earbud") || q.includes("audio") || q.includes("sony")) {
      return {
        id: "msg-" + Date.now(),
        sender: "cart",
        text: "Here is our acoustic intelligence breakdown for premium noise-cancelling audio devices in India:",
        timestamp: "Just now",
        products: [
          {
            id: "sony-wh-1000xm5",
            name: "Sony WH-1000XM5 Wireless ANC",
            price: 27990,
            rating: 4.6,
            retailer: "Amazon",
            badge: "Best ANC",
            aiNote: "Dual processor noise cancellation completely isolates keyboard clicks and airplane hum.",
            image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
          },
          {
            id: "apple-airpods-pro-2",
            name: "Apple AirPods Pro (2nd Gen)",
            price: 20990,
            rating: 4.8,
            retailer: "Amazon",
            badge: "Best Earbuds",
            aiNote: "Unbeatable Transparency mode, pocketable case with Find My speaker, USB-C MagSafe.",
            image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
          },
        ],
        aiVerdict:
          "For over-ear comfort and maximum noise blockage during deep focus coding, **Sony WH-1000XM5** is the benchmark. For daily pocket convenience and calls on iPhone, **AirPods Pro 2** is unmatched.",
        followUps: [
          "Can the Sony XM5 connect to laptop and phone at once?",
          "Track price drop for Sony XM5 below ₹25,000",
        ],
      };
    }

    // Default intelligent response
    return {
      id: "msg-" + Date.now(),
      sender: "cart",
      text: `I've analyzed our shopping database for "${query}". SmartCart continuously monitors product specs, price movements across Amazon and Flipkart, and genuine verified review sentiment so you don't get tricked by sponsored listings. Plus, you can save 10% on your entire order when paying with PayPal!`,
      timestamp: "Just now",
      aiVerdict:
        "Would you like me to find the best value recommendations for your budget, compare specific models side-by-side, or help you allocate your shopping budget?",
      followUps: [
        "Find best laptops under ₹70,000",
        "Compare iPhone 15 and Galaxy S24",
        "Help me plan a ₹1,00,000 tech budget",
        "Check current price drops on Sony headphones",
      ],
    };
  },
};
