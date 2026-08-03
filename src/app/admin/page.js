"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Wrench, ShoppingBag, DollarSign, ArrowRight } from "lucide-react";
import RequestStatusBadge from "@/components/RequestStatusBadge";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServices: 0,
    totalRequests: 0,
    totalRevenue: 0,
    recentRequests: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [usersRes, servicesRes, requestsRes, paymentsRes] = await Promise.all([
        fetch("/api/users?limit=1"),
        fetch("/api/services?limit=1&includeInactive=true"),
        fetch("/api/requests?limit=5"),
        fetch("/api/payments?limit=1"),
      ]);

      const usersData = await usersRes.json();
      const servicesData = await servicesRes.json();
      const requestsData = await requestsRes.json();
      const paymentsData = await paymentsRes.json();

      setStats({
        totalUsers: usersData.data?.pagination?.total || 0,
        totalServices: servicesData.data?.pagination?.total || 0,
        totalRequests: requestsData.data?.pagination?.total || 0,
        totalRevenue: paymentsData.data?.totalRevenue || 0,
        recentRequests: requestsData.data?.requests || [],
      });
    } catch (error) {
      console.error("Failed to load admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-base-content">Platform Analytics & Metrics</h1>
        <p className="text-sm text-base-content/60 mt-1">Real-time overview of users, active services, requests, and revenue.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat bg-base-100 border border-base-200 rounded-2xl shadow-xs">
          <div className="stat-figure text-primary"><Users className="w-8 h-8" /></div>
          <div className="stat-title text-xs font-semibold">Total Users</div>
          <div className="stat-value text-primary text-2xl font-bold">{stats.totalUsers}</div>
        </div>

        <div className="stat bg-base-100 border border-base-200 rounded-2xl shadow-xs">
          <div className="stat-figure text-secondary"><Wrench className="w-8 h-8" /></div>
          <div className="stat-title text-xs font-semibold">Active Services</div>
          <div className="stat-value text-secondary text-2xl font-bold">{stats.totalServices}</div>
        </div>

        <div className="stat bg-base-100 border border-base-200 rounded-2xl shadow-xs">
          <div className="stat-figure text-accent"><ShoppingBag className="w-8 h-8" /></div>
          <div className="stat-title text-xs font-semibold">Service Requests</div>
          <div className="stat-value text-accent text-2xl font-bold">{stats.totalRequests}</div>
        </div>

        <div className="stat bg-base-100 border border-base-200 rounded-2xl shadow-xs">
          <div className="stat-figure text-success"><DollarSign className="w-8 h-8" /></div>
          <div className="stat-title text-xs font-semibold">Gross Revenue</div>
          <div className="stat-value text-success text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-base-100 border border-base-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-base-content">Latest Customer Orders</h2>
          <Link href="/admin/requests" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
            Manage All Requests <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-base-content/60">Loading recent activity...</div>
        ) : stats.recentRequests.length === 0 ? (
          <p className="text-sm text-base-content/60 text-center py-6">No recent request activity found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-xs">
              <thead>
                <tr className="text-base-content/60">
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                {stats.recentRequests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <p className="font-bold text-base-content">{req.user?.name || "Customer"}</p>
                      <p className="text-[10px] text-base-content/50">{req.user?.email}</p>
                    </td>
                    <td className="font-semibold">{req.service?.title || "Custom Service"}</td>
                    <td className="font-bold text-primary">${req.price}</td>
                    <td><RequestStatusBadge status={req.status} /></td>
                    <td><RequestStatusBadge status={req.paymentStatus} /></td>
                    <td className="text-base-content/50">{new Date(req.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
