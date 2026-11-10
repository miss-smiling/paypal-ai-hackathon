"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, ShieldCheck, BatteryCharging, Globe, Cpu } from "lucide-react";
import { useNovatek } from "@/context/NovatekContext";

export default function HeroSection() {
  const { addToCart, setQuickViewProduct, products } = useNovatek();
  const heroProduct = products.find((p) => p.id === "iphone-16-pro") || products[0];

  const slides = [
    {
      badgeEn: "NEW ARRIVAL",
      productName: "iPhone 16 Pro",
      titleEn: "More Power. More Possibilities.",
      descEn:
        "Discover the latest iPhone with advanced 48MP pro camera, longer battery life and a stunning aerospace titanium design.",
      
      badgeHi: "नया आगमन",
      titleHi: "अधिक शक्ति। असीम संभावनाएं।",
      descHi:
        "उन्नत 48MP प्रो कैमरा, लंबी बैटरी लाइफ और शानदार एयरोस्पेस टाइटेनियम डिजाइन के साथ नवीनतम आईफोन खोजें।",
      
      badgeKn: "ಹೊಸ ಆಗಮನ",
      titleKn: "ಹೆಚ್ಚು ಶಕ್ತಿ. ಹೆಚ್ಚಿನ ಸಾಧ್ಯತೆಗಳು.",
      descKn:
        "ಸುಧಾರಿತ 48MP ಪ್ರೊ ಕ್ಯಾಮೆರಾ, ದೀರ್ಘ ಬ್ಯಾಟರಿ ಬಾಳಿಕೆ ಮತ್ತು ಅದ್ಭುತ ಏರೋಸ್ಪೇಸ್ ಟೈಟಾನಿಯಂ ವಿನ್ಯಾಸದೊಂದಿಗೆ ಇತ್ತೀಚಿನ ಐಫೋನ್ ಅನ್ವೇಷಿಸಿ.",

      badgeBn: "নতুন আগমন",
      titleBn: "আরও শক্তি। আরও সম্ভাবনা।",
      descBn:
        "উন্নত 48MP প্রো ক্যামেরা, দীর্ঘ ব্যাটারি লাইফ এবং অত্যাশ্চর্য অ্যারোস্পেস টাইটানিয়াম ডিজাইন সহ সর্বশেষ আইফোন আবিষ্কার করুন।",

      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=85",
      price: "$1,199.00",
      specChip1: "A18 Pro 3nm Chip",
      specChip2: "33h Battery",
    },
    {
      badgeEn: "GALAXY AI IS HERE",
      productName: "Samsung Galaxy S24",
      titleEn: "Epic, Just Like That.",
      descEn:
        "Unleash new levels of creativity and productivity with Galaxy AI, Titanium Shield frame, and Snapdragon 8 Gen 3.",

      badgeHi: "गैलेक्सी एआई यहां है",
      titleHi: "महाकाव्य, बिल्कुल ऐसे ही।",
      descHi:
        "गैलेक्सी एआई, टाइटेनियम शील्ड फ्रेम और स्नैपड्रैगन 8 जेन 3 के साथ रचनात्मकता और उत्पादकता के नए स्तरों को अनलॉक करें।",

      badgeKn: "ಗ್ಯಾಲಕ್ಸಿ ಎಐ ಇಲ್ಲಿದೆ",
      titleKn: "ಅದ್ಭುತ, ಸುಲಭವಾಗಿ.",
      descKn:
        "ಗ್ಯಾಲಕ್ಸಿ ಎಐ, ಟೈಟಾನಿಯಂ ಶೀಲ್ಡ್ ಫ್ರೇಮ್ ಮತ್ತು ಸ್ನಾಪ್‌ಡ್ರಾಗನ್ 8 ಜನ್ 3 ನೊಂದಿಗೆ ಸೃಜನಶೀಲತೆಯ ಹೊಸ ಹಂತಗಳನ್ನು ಅನ್ಲಾಕ್ ಮಾಡಿ.",

      badgeBn: "গ্যালাক্সি এআই এখানে",
      titleBn: "মহাকাব্যিক, ঠিক এভাবেই।",
      descBn:
        "গ্যালাক্সি এআই, টাইটানিয়াম শিল্ড ফ্রেম এবং স্ন্যাপড্রাগন 8 জেন 3 দিয়ে সৃজনশীলতার নতুন মাত্রা আবিষ্কার করুন।",

      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1000&q=85",
      price: "$999.00",
      specChip1: "Snapdragon 8 Gen 3",
      specChip2: "Galaxy AI",
    },
  ];

  const languages = [
    { code: "ENG", label: "English" },
    { code: "HIN", label: "हिन्दी" },
    { code: "KAN", label: "ಕನ್ನಡ" },
    { code: "BEN", label: "বাংলা" },
  ];

  const [activeLang, setActiveLang] = useState<"ENG" | "HIN" | "KAN" | "BEN">("ENG");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const currentSlide = slides[currentSlideIndex];

  const getBadge = () => {
    if (activeLang === "HIN") return currentSlide.badgeHi;
    if (activeLang === "KAN") return currentSlide.badgeKn;
    if (activeLang === "BEN") return currentSlide.badgeBn;
    return currentSlide.badgeEn;
  };

  const getTitle = () => {
    if (activeLang === "HIN") return currentSlide.titleHi;
    if (activeLang === "KAN") return currentSlide.titleKn;
    if (activeLang === "BEN") return currentSlide.titleBn;
    return currentSlide.titleEn;
  };

  const getDesc = () => {
    if (activeLang === "HIN") return currentSlide.descHi;
    if (activeLang === "KAN") return currentSlide.descKn;
    if (activeLang === "BEN") return currentSlide.descBn;
    return currentSlide.descEn;
  };

  const getButtonText = () => {
    if (activeLang === "HIN") return "अभी खरीदें";
    if (activeLang === "KAN") return "ಈಗಲೇ ಖರೀದಿಸಿ";
    if (activeLang === "BEN") return "এখন কিনুন";
    return "Shop Now";
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#090d1a] via-[#0b1226] to-[#070a14] pt-6 pb-16 lg:pt-10 lg:pb-24">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-10 left-1/4 -z-10 h-[450px] w-[450px] rounded-full bg-blue-600/20 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-10 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-cyan-500/15 blur-[140px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Language Switcher Bar with Bengali */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-[#0c1224]/80 p-2.5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Globe className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-white">SmartCart Multilingual Experience:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setActiveLang(lang.code as any)}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                  activeLang === lang.code
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30"
                    : "border border-slate-800 bg-[#080b14] text-slate-400 hover:text-white"
                }`}
              >
                {lang.label} ({lang.code})
              </button>
            ))}
          </div>
        </div>

        {/* Hero Banner Container matching sample image */}
        <div className="relative rounded-3xl border border-slate-800/80 bg-[#0b1021]/80 p-8 sm:p-12 lg:p-16 shadow-2xl backdrop-blur-2xl">
          
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-6 z-10 space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold tracking-wider text-cyan-400 uppercase">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                <span>{getBadge()}</span>
              </div>

              {/* Product Headline */}
              <div>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white block">
                  {currentSlide.productName}
                </span>
                <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-300">
                  {getTitle()}
                </h1>
              </div>

              {/* Description */}
              <p className="max-w-md text-sm text-slate-300 sm:text-base leading-relaxed">
                {getDesc()}
              </p>

              {/* CTA Button */}
              <div className="flex items-center gap-4 pt-2">
                <a
                  href="#popular-smartphones"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/35 transition-all duration-300 hover:bg-blue-500 hover:shadow-cyan-500/40 hover:scale-105"
                >
                  <span>{getButtonText()}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>

                <div className="text-sm font-bold text-cyan-300">
                  From {currentSlide.price}
                </div>
              </div>

              {/* Micro Trust Specs */}
              <div className="flex items-center gap-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-cyan-400" />
                  <span>{currentSlide.specChip1}</span>
                </div>
                <div className="h-3 w-px bg-slate-800" />
                <div className="flex items-center gap-2">
                  <BatteryCharging className="h-4 w-4 text-cyan-400" />
                  <span>{currentSlide.specChip2}</span>
                </div>
              </div>

            </div>

            {/* Right Column: Angled Smartphone Renders Showcase matching sample */}
            <div className="relative lg:col-span-6 flex justify-center items-center">
              <div className="relative flex items-center justify-center w-full max-w-[460px] aspect-square">
                
                {/* Ambient Radial Rim Glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/30 via-cyan-500/20 to-transparent blur-[70px] -z-10" />

                {/* Smartphone Showcase Image with 3D drop shadow */}
                <div
                  onClick={() => setQuickViewProduct(heroProduct)}
                  className="group relative cursor-pointer w-[85%] transition-transform duration-500 hover:scale-105"
                >
                  <img
                    src={currentSlide.image}
                    alt={currentSlide.productName}
                    className="w-full h-auto object-contain rounded-2xl drop-shadow-[0_25px_35px_rgba(0,0,0,0.9)] filter contrast-110"
                  />

                  {/* Hover Quick Add Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl backdrop-blur-[2px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(heroProduct);
                      }}
                      className="rounded-full bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/50 hover:bg-blue-500 transition-all transform translate-y-2 group-hover:translate-y-0"
                    >
                      Quick Add to Cart · {currentSlide.price}
                    </button>
                  </div>
                </div>

                {/* Slider Navigation Arrows (Matching bottom-right of hero in screenshot) */}
                <div className="absolute bottom-2 right-2 flex items-center gap-2 z-20">
                  <button
                    onClick={() =>
                      setCurrentSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-white hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentSlideIndex((prev) => (prev + 1) % slides.length)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-white hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Carousel Pagination Dots */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        currentSlideIndex === idx ? "w-6 bg-cyan-400" : "w-2 bg-slate-700"
                      }`}
                    />
                  ))}
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
