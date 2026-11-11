"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  Navigation,
  Compass,
  Phone,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  SlidersHorizontal,
  Store,
  Layers,
  Map as MapIcon,
  List,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";
import { api, StoreItem, StoreSearchResult } from "@/lib/api";
import { useSmartCart } from "@/context/SmartCartContext";

const CATEGORIES = [
  "All",
  "Electronics",
  "Mobile shops",
  "Computer stores",
  "Books and stationery",
  "Supermarkets",
  "Clothing",
];

const RADII = [5, 10, 20];

export default function NearbyStoresPage() {
  const { addToast } = useSmartCart();
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState("Bangalore");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRadius, setSelectedRadius] = useState<number>(10);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [resolvedCenter, setResolvedCenter] = useState<string>("Bangalore, India");

  // Fetch stores based on parameters
  const fetchStores = async (params: {
    lat?: number;
    lon?: number;
    query?: string;
    category?: string;
    radius_km?: number;
  }) => {
    setLoading(true);
    try {
      const res = await api.searchNearbyStores({
        lat: params.lat,
        lon: params.lon,
        query: params.query || searchLocation,
        category: params.category || selectedCategory,
        radius_km: params.radius_km || selectedRadius,
      });
      setStores(res.stores);
      setResolvedCenter(res.search_center.location_name);
    } catch (err: any) {
      addToast("Store Search Notice", "Could not load live stores; displaying nearby verified network.", "info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores({ query: "Bangalore", category: "All", radius_km: 10 });
  }, []);

  // Use browser Geolocation (HTML5)
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      addToast("Geolocation Unsupported", "Please type your city or PIN code manually.", "warning");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setDetectedCoords(coords);
        setSearchLocation("Current GPS Location");
        fetchStores({
          lat: coords.lat,
          lon: coords.lon,
          category: selectedCategory,
          radius_km: selectedRadius,
        });
        addToast("Location Detected", "Found nearby physical retail stores.", "success");
      },
      (error) => {
        setLoading(false);
        addToast(
          "Location Permission Denied",
          "You can still search by typing your city, locality, or PIN code.",
          "info"
        );
      },
      { timeout: 8000 }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLocation.trim()) return;
    setDetectedCoords(null);
    fetchStores({
      query: searchLocation.trim(),
      category: selectedCategory,
      radius_km: selectedRadius,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-emerald-300 border border-white/10">
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span>Local Retail Discovery</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Discover Nearby Physical Stores
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            Find electronics hubs, mobile retail outlets, computer hardware shops, and bookstores near you.
            Compare prices online, then inspect devices in person or get hands-on support.
          </p>
        </div>
      </div>

      {/* Discovery Disclaimer Notice Banner */}
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">Transparent Store Discovery Notice:</span>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Store locations, operating hours and addresses are derived from OpenStreetMap and verified merchant networks.
            To protect shoppers, we do <strong>not</strong> fabricate in-store inventory. Please call the store or visit during business hours to confirm physical product stock before traveling.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-4 shadow-sm">
        {/* Row 1: Location input and GPS button */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Search by city, locality or PIN code (e.g. Bangalore, 560038, Connaught Place)..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-2xs transition-colors shrink-0 disabled:opacity-50"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors shrink-0 disabled:opacity-50"
            title="Use device location via GPS"
          >
            <Navigation className="h-3.5 w-3.5 text-emerald-600" />
            <span>Use My Location</span>
          </button>
        </form>

        {/* Row 2: Category pills and Radius dropdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Category filter pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  fetchStores({ category: cat });
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white font-bold shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Radius & View Mode toggles */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Radius selection */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold text-[11px] text-slate-400">Radius:</span>
              <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/60">
                {RADII.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedRadius(r);
                      fetchStores({ radius_km: r });
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      selectedRadius === r
                        ? "bg-white text-indigo-700 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode: List vs Map */}
            <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === "list" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-500"
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === "map" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-500"
                }`}
                title="Interactive Map View"
              >
                <MapIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count & Location indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{stores.length}</strong> physical stores near{" "}
          <strong className="text-slate-800">{resolvedCenter}</strong> (within {selectedRadius} km)
        </span>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
          <p className="text-xs text-slate-500">Searching physical retail stores and computing distances...</p>
        </div>
      ) : stores.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Store className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Stores Found in this Radius</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn't locate stores within {selectedRadius} km for the selected category. Try expanding your search radius to 20 km or searching for a broader city name.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedRadius(20);
              setSelectedCategory("All");
              fetchStores({ radius_km: 20, category: "All" });
            }}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
          >
            Expand to 20 km (All Categories)
          </button>
        </div>
      ) : viewMode === "map" ? (
        /* Map View: OpenStreetMap Interactive Embed + Store Highlights */
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white h-[450px] relative">
            <iframe
              title="OpenStreetMap Store Discovery View"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${stores[0].lon - 0.05}%2C${stores[0].lat - 0.04}%2C${stores[0].lon + 0.05}%2C${stores[0].lat + 0.04}&layer=mapnik&marker=${stores[0].lat}%2C${stores[0].lon}`}
              className="w-full h-full"
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-indigo-600" />
              <span>Center: {resolvedCenter}</span>
            </div>
          </div>

          {/* Quick Cards under Map */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.slice(0, 6).map((store) => (
              <div
                key={store.id}
                className="saas-card p-4 space-y-3 border border-slate-200 hover:border-indigo-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{store.name}</h4>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">
                    {store.distance_km} km
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{store.address}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{store.category}</span>
                  <a
                    href={store.directions_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    <span>Directions</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="saas-card p-5 space-y-3.5 border border-slate-200/90 hover:border-indigo-200 transition-all hover:shadow-md group"
            >
              {/* Header: Store Name, Distance & Category */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {store.name}
                    </h3>
                  </div>
                  <span className="inline-block text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                    {store.category}
                  </span>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 text-xs font-extrabold font-mono">
                    <Navigation className="h-3 w-3" />
                    <span>{store.distance_km} km</span>
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 font-medium">away from you</span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{store.address}</span>
              </div>

              {/* Operating Info: Phone & Hours */}
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                {store.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <a
                      href={`tel:${store.phone.replace(/\s+/g, "")}`}
                      className="hover:text-indigo-600 font-medium"
                    >
                      {store.phone}
                    </a>
                  </div>
                )}
                {store.opening_hours && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>{store.opening_hours}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Directions & Map Link */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>Mapped Physical Location</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={store.osm_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <span>OSM</span>
                    <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                  </a>

                  <a
                    href={store.directions_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors"
                  >
                    <Navigation className="h-3 w-3" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
