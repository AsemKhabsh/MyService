"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { Wrench, User as UserIcon, LogOut, LayoutDashboard, Shield, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-base-100/90 backdrop-blur-md border-b border-base-200">
      <div className="navbar max-w-7xl mx-auto px-4 sm:px-6">
        {/* Brand */}
        <div className="navbar-start">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center shadow-md">
              <Wrench className="w-5 h-5" />
            </div>
            <span>My<span className="text-secondary">Services</span></span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="navbar-center hidden md:flex">
          <ul className="menu menu-horizontal px-1 font-medium gap-1">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/services">Browse Services</Link></li>
          </ul>
        </div>

        {/* Actions & Profile */}
        <div className="navbar-end gap-2">
          <ThemeToggle />

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-base-300 animate-pulse"></div>
          ) : user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar border border-primary/20">
                <div className="w-10 rounded-full">
                  <img src={user.avatar || "https://res.cloudinary.com/demo/image/upload/v1571218039/sample.jpg"} alt={user.name} />
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-56 border border-base-200">
                <li className="menu-title px-4 py-2 border-b border-base-200">
                  <p className="font-semibold text-base-content">{user.name}</p>
                  <p className="text-xs text-base-content/60 font-normal truncate">{user.email}</p>
                </li>
                {user.role === "admin" && (
                  <li>
                    <Link href="/admin" className="text-primary font-medium">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/dashboard">
                    <LayoutDashboard className="w-4 h-4" /> User Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/profile">
                    <UserIcon className="w-4 h-4" /> My Profile
                  </Link>
                </li>
                <div className="divider my-1"></div>
                <li>
                  <button onClick={logout} className="text-error">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn btn-ghost btn-sm font-semibold">
                Log In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm font-semibold shadow-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
