"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, CheckCircle2 } from "lucide-react";
import { PREDEFINED_CATEGORIES } from "@/utils/constants";

export default function Hero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/services?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/services");
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-base-100 to-base-100 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        {/* Highlight Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Professional Digital Services On Demand</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-base-content max-w-4xl mx-auto leading-tight mb-6">
          Scale Your Business with Expert Digital <span className="text-primary underline decoration-secondary decoration-4">Services</span>
        </h1>

        <p className="text-lg sm:text-xl text-base-content/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          Find top-tier academic formatting, web engineering, graphic design, and tech consulting tailored to your exact project requirements.
        </p>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="join w-full shadow-lg border border-base-300 rounded-2xl bg-base-100 p-1">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-base-content/40 absolute left-4" />
              <input
                type="text"
                placeholder="What service are you looking for today?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input input-ghost w-full pl-12 focus:outline-none focus:bg-transparent text-sm sm:text-base"
              />
            </div>
            <button type="submit" className="btn btn-primary join-item rounded-xl px-6 font-semibold">
              Search
            </button>
          </div>
        </form>

        {/* Category Chips */}
        <div className="flex flex-wrap justify-center items-center gap-2 max-w-3xl mx-auto">
          <span className="text-xs font-medium text-base-content/60 mr-2">Popular:</span>
          {PREDEFINED_CATEGORIES.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => router.push(`/services?category=${encodeURIComponent(cat)}`)}
              className="btn btn-outline btn-xs rounded-full font-normal hover:btn-primary"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Trust Points */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-base-content/80">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>Verified Professionals</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>24/7 Delivery Guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}
