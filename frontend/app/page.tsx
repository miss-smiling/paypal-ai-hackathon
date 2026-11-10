"use client";

import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import ValuePropositionBar from "@/components/ValuePropositionBar";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProductsGrid from "@/components/FeaturedProductsGrid";
import NovatekCareBanner from "@/components/NovatekCareBanner";
import BottomPillarsGrid from "@/components/BottomPillarsGrid";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section matching screenshot: Upgrade Your World + floating headphones on blue neon pedestal */}
      <HeroSection />

      {/* 2. Value Proposition 4-column card bar: Free Shipping, Secure Checkout, Easy Returns, Expert Support */}
      <ValuePropositionBar />

      {/* 3. Shop By Category: 6 interactive categories matching screenshot */}
      <CategoryGrid
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 4. Featured Products: NovaPhone 15 Pro, NovaBuds Pro, NovaBook Air M2, NovaWatch X */}
      <FeaturedProductsGrid
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 5. NOVATEK CARE+ Complete Protection Banner */}
      <NovatekCareBanner />

      {/* 6. Bottom Feature Pillars: Trade-In & Save, Flexible Payments, Gift Cards, Student Discounts */}
      <BottomPillarsGrid />
    </div>
  );
}
