"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wrench, Users, ShoppingBag, CreditCard, ShieldCheck } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/services", label: "Manage Services", icon: Wrench },
    { href: "/admin/requests", label: "Manage Requests", icon: ShoppingBag },
    { href: "/admin/users", label: "Manage Users", icon: Users },
    { href: "/admin/payments", label: "Payments Audit", icon: CreditCard },
  ];

  return (
    <aside className="w-full md:w-64 bg-base-100 border-r border-base-200 p-4 space-y-6">
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-xl text-primary font-bold text-sm">
        <ShieldCheck className="w-5 h-5" />
        <span>Admin Dashboard</span>
      </div>

      <ul className="menu menu-sm w-full p-0 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-content font-semibold"
                    : "hover:bg-base-200 text-base-content/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
