import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import Link from "next/link";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import { PREDEFINED_CATEGORIES } from "@/utils/constants";
import { ArrowRight, ShieldCheck, Zap, Award, Headphones } from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

async function getHomePageData() {
  try {
    await dbConnect();
    const [featuredServices, recentServices] = await Promise.all([
      Service.find({ isActive: true, isFeatured: true }).limit(6).lean(),
      Service.find({ isActive: true }).sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    return {
      featuredServices: JSON.parse(JSON.stringify(featuredServices)),
      recentServices: JSON.parse(JSON.stringify(recentServices)),
    };
  } catch (error) {
    console.error("Failed to load homepage data:", error);
    return { featuredServices: [], recentServices: [] };
  }
}

export default async function HomePage() {
  const { featuredServices, recentServices } = await getHomePageData();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <Hero />

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content">
                Featured Services
              </h2>
              <p className="text-sm text-base-content/60 mt-1">
                Hand-picked high-demand digital services guaranteed for quality.
              </p>
            </div>
            <Link
              href="/services?isFeatured=true"
              className="btn btn-outline btn-sm gap-2 font-semibold"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </section>
      )}

      {/* Explore Categories */}
      <section className="bg-base-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content">
              Browse by Category
            </h2>
            <p className="text-sm text-base-content/60 mt-2">
              Explore specialized services across technical, creative, and consulting domains.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {PREDEFINED_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/services?category=${encodeURIComponent(cat)}`}
                className="card bg-base-100 border border-base-300 p-4 hover:border-primary hover:shadow-md transition-all text-center group"
              >
                <span className="font-semibold text-sm text-base-content group-hover:text-primary transition-colors">
                  {cat}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content">
              Recently Added Services
            </h2>
            <p className="text-sm text-base-content/60 mt-1">
              Check out the latest offerings added to our marketplace.
            </p>
          </div>
          <Link href="/services" className="btn btn-outline btn-sm gap-2 font-semibold">
            Explore All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentServices.length === 0 ? (
          <div className="text-center py-12 bg-base-200 rounded-2xl">
            <p className="text-base-content/60 font-medium">No services currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </section>

      {/* Value Proposition */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 bg-base-100 border border-base-200 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base">Secure Payments</h3>
            <p className="text-xs text-base-content/60">Stripe encrypted payment processing with buyer protection.</p>
          </div>

          <div className="p-6 bg-base-100 border border-base-200 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary mx-auto flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base">Fast Turnaround</h3>
            <p className="text-xs text-base-content/60">Clear delivery timelines backed by strict SLAs.</p>
          </div>

          <div className="p-6 bg-base-100 border border-base-200 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent mx-auto flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base">Top Quality</h3>
            <p className="text-xs text-base-content/60">Rigorous quality standards across all service categories.</p>
          </div>

          <div className="p-6 bg-base-100 border border-base-200 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-info/10 text-info mx-auto flex items-center justify-center">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base">Dedicated Support</h3>
            <p className="text-xs text-base-content/60">Direct communication and support for every order.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
