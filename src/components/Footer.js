import Link from "next/link";
import { PREDEFINED_CATEGORIES } from "@/utils/constants";
import { Wrench } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-base-200 border-t border-base-300 text-base-content mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-content flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <span>My<span className="text-secondary">Services</span></span>
            </Link>
            <p className="text-sm text-base-content/70 leading-relaxed">
              Your premiere marketplace for high-quality digital services, academic support, software engineering, design, and consulting.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-base mb-4">Quick Navigation</h4>
            <ul className="space-y-2 text-sm text-base-content/70">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">All Services</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Register Account</Link></li>
            </ul>
          </div>

          {/* Top Categories */}
          <div>
            <h4 className="font-semibold text-base mb-4">Popular Categories</h4>
            <ul className="space-y-2 text-sm text-base-content/70">
              {PREDEFINED_CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <Link href={`/services?category=${encodeURIComponent(cat)}`} className="hover:text-primary transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div>
            <h4 className="font-semibold text-base mb-4">Quality Guarantee</h4>
            <p className="text-sm text-base-content/70 leading-relaxed mb-4">
              All transactions are secured with Stripe end-to-end encryption. Guaranteed delivery by verified professionals.
            </p>
            <div className="badge badge-outline badge-primary text-xs py-2 px-3">
              100% Secure Checkout
            </div>
          </div>
        </div>

        <div className="border-t border-base-300 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-base-content/60 gap-4">
          <p>© {new Date().getFullYear()} My Services Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/services" className="hover:underline">Terms of Service</Link>
            <Link href="/services" className="hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
