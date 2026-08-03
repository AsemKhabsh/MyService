"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Lock, Phone, Globe, Wrench } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(formData);
      router.push("/dashboard");
    } catch (error) {
      console.error("Register page error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-base-100 border border-base-200 rounded-2xl p-8 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-content flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <span>My<span className="text-secondary">Services</span></span>
          </Link>
          <h2 className="text-xl font-extrabold text-base-content pt-2">Create Your Account</h2>
          <p className="text-xs text-base-content/60">Join thousands of customers ordering professional digital services</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label text-xs font-bold">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input input-bordered input-sm w-full pl-10 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="label text-xs font-bold">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input input-bordered input-sm w-full pl-10 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="label text-xs font-bold">Password * (Min 6 characters)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input input-bordered input-sm w-full pl-10 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-xs font-bold">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input input-bordered input-sm w-full pl-10 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="label text-xs font-bold">Country (Optional)</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. United States"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="input input-bordered input-sm w-full pl-10 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-sm w-full font-bold shadow mt-2"
          >
            {submitting ? "Creating Account..." : "Register Account"}
          </button>
        </form>

        <div className="text-center text-xs text-base-content/60 pt-2 border-t border-base-200">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
