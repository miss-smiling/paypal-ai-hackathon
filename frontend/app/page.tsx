"use client";

import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import ValuePropositionBar from "@/components/ValuePropositionBar";
import FeaturedProductsGrid from "@/components/FeaturedProductsGrid";
import NovatekCareBanner from "@/components/NovatekCareBanner";
import CategoryGrid from "@/components/CategoryGrid";
import BottomPillarsGrid from "@/components/BottomPillarsGrid";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section matching sample image: iPhone 16 Pro + Multilingual (ENG, HIN, KAN, BEN) */}
      <HeroSection />

      {/* 2. Value Proposition bar: Free Shipping, Secure Payment, 24/7 Support, Easy Returns */}
      <ValuePropositionBar />

      {/* 3. Popular Smartphones: iPhone 16 Pro, Samsung Galaxy S24, Google Pixel 9, OnePlus 12 */}
      <FeaturedProductsGrid
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 4. Limited Time Offer Banner: Up to 30% Off On Selected Smartphones + Better Faster Smarter ♡ */}
      <NovatekCareBanner />

      {/* 5. Shop by Brand: Apple, Samsung, Google, OnePlus, Xiaomi, Realme */}
      <CategoryGrid
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 6. Best Deals (iPhone 15, S23, Pixel 8, Nord 3) & Stay Connected Newsletter Banner */}
      <BottomPillarsGrid />
    </div>
  );
}
