"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Wrench, ArrowRight } from "lucide-react";

function LoginFormContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login({ email, password });
      router.push(callbackUrl);
    } catch (error) {
      console.error("Login page error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-base-100 border border-base-200 rounded-2xl p-8 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-content flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <span>My<span className="text-secondary">Services</span></span>
          </Link>
          <h2 className="text-xl font-extrabold text-base-content pt-2">Welcome Back</h2>
          <p className="text-xs text-base-content/60">Sign in to manage your digital service orders</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label text-xs font-bold">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered input-sm w-full pl-10 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="label text-xs font-bold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered input-sm w-full pl-10 text-xs focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-sm w-full font-bold shadow mt-2"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-xs text-base-content/60 pt-2 border-t border-base-200">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Loading login...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
