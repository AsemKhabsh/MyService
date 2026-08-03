"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import RequestStatusBadge from "@/components/RequestStatusBadge";
import { ShoppingBag, Clock, CheckCircle2, DollarSign, ArrowRight, User } from "lucide-react";

export default function UserDashboardOverview() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests?limit=5");
      const data = await res.json();
      if (data.success) {
        setRequests(data.data.requests);
      }
    } catch (error) {
      console.error("Failed to fetch user requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === "Pending").length;
  const completedRequests = requests.filter((r) => r.status === "Completed").length;
  const totalSpent = requests
    .filter((r) => r.paymentStatus === "Paid")
    .reduce((acc, r) => acc + (r.price || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-focus text-primary-content rounded-2xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {user?.name || "Customer"}!</h1>
          <p className="text-sm opacity-90">Manage your active service orders, view timelines, and track project status.</p>
        </div>
        <Link href="/services" className="btn btn-secondary font-bold text-sm shrink-0 shadow">
          Explore Services
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat bg-base-100 border border-base-200 rounded-2xl shadow-xs">
          <div className="stat-figure text-primary">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="stat-title text-xs font-semibold">Total Orders</div>
          <div className="stat-value text-primary text-2xl font-bold">{totalRequests}</div>
        </div>

        <div className="stat bg-base-100 border border-base-200 rounded-2xl shadow-xs">
          <div className="stat-figure text-warning">
            <Clock className="w-8 h-8" />
          </div>
          <div className="stat-title text-xs font-semibold">Pending Approval</div>
          <div className="stat-value text-warning text-2xl font-bold">{pendingRequests}</div>
        </div>

        <div className="stat bg-base-100 border border-base-200 rounded-2xl shadow-xs">
          <div className="stat-figure text-success">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="stat-title text-xs font-semibold">Completed Orders</div>
          <div className="stat-value text-success text-2xl font-bold">{completedRequests}</div>
        </div>

        <div className="stat bg-base-100 border border-base-200 rounded-2xl shadow-xs">
          <div className="stat-figure text-secondary">
            <DollarSign className="w-8 h-8" />
          </div>
          <div className="stat-title text-xs font-semibold">Total Invested</div>
          <div className="stat-value text-secondary text-2xl font-bold">${totalSpent.toFixed(2)}</div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-base-100 border border-base-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-base-content">Recent Service Requests</h2>
          <Link href="/dashboard/requests" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
            View All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-base-content/60">Loading orders...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-base-200/50 rounded-xl space-y-3">
            <p className="text-sm font-medium text-base-content/60">You haven't requested any services yet.</p>
            <Link href="/services" className="btn btn-primary btn-sm">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="text-xs text-base-content/60">
                  <th>Service</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium">
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td className="font-semibold text-base-content">{req.service?.title || "Custom Service"}</td>
                    <td>{req.service?.category || "N/A"}</td>
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
