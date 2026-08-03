"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ServiceCard from "@/components/ServiceCard";
import Pagination from "@/components/Pagination";
import { PREDEFINED_CATEGORIES } from "@/utils/constants";
import { Search, Filter, RefreshCw } from "lucide-react";

function ServicesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const isFeatured = searchParams.get("isFeatured") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [localSearch, setLocalSearch] = useState(search);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (sort) params.set("sort", sort);
      if (isFeatured) params.set("isFeatured", isFeatured);
      params.set("page", page.toString());
      params.set("limit", "9");

      const res = await fetch(`/api/services?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setServices(data.data.services);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, isFeatured, page]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/services?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters("search", localSearch.trim());
  };

  const resetFilters = () => {
    setLocalSearch("");
    router.push("/services");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-base-content">Digital Services Marketplace</h1>
        <p className="text-sm text-base-content/60 mt-1">
          Explore specialized services offered by top experts.
        </p>
      </div>

      <div className="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search services..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="input input-bordered input-sm w-full pl-10 pr-20"
            />
            <button type="submit" className="btn btn-primary btn-sm absolute right-1 top-1">
              Find
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <select
              value={category}
              onChange={(e) => updateFilters("category", e.target.value)}
              className="select select-bordered select-sm text-xs"
            >
              <option value="">All Categories</option>
              {PREDEFINED_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => updateFilters("sort", e.target.value)}
              className="select select-bordered select-sm text-xs"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            {(search || category || isFeatured || sort !== "newest") && (
              <button onClick={resetFilters} className="btn btn-ghost btn-sm text-xs text-error gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-base-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-base-100 border border-base-200 rounded-2xl space-y-4">
          <Filter className="w-12 h-12 text-base-content/30 mx-auto" />
          <h3 className="text-lg font-bold text-base-content">No services found</h3>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            Try adjusting your search criteria or clearing filters to view available services.
          </p>
          <button onClick={resetFilters} className="btn btn-primary btn-sm">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}

      <Pagination
        page={pagination.page}
        totalPages={pagination.pages}
        onPageChange={(newPage) => updateFilters("page", newPage.toString())}
      />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Loading services...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
