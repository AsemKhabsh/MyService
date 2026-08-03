"use client";

import { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";
import { CreditCard, ExternalLink, DollarSign, CheckCircle2 } from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments(1);
  }, []);

  const fetchPayments = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payments?page=${pageNumber}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.data.payments);
        setTotalRevenue(data.data.totalRevenue);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-base-content">Payments Audit & Financial Log</h1>
        <p className="text-sm text-base-content/60 mt-1">Review Stripe payment transactions, revenue totals, and receipt links.</p>
      </div>

      {/* Revenue Card */}
      <div className="stat bg-gradient-to-r from-success/10 via-base-100 to-base-100 border border-success/20 rounded-2xl p-6 shadow-xs max-w-md">
        <div className="stat-figure text-success"><DollarSign className="w-10 h-10" /></div>
        <div className="stat-title text-xs font-semibold text-base-content/70">Total Revenue Collected</div>
        <div className="stat-value text-success text-3xl font-extrabold">${totalRevenue.toFixed(2)}</div>
        <div className="stat-desc text-xs text-base-content/50 mt-1">Verified via Stripe Webhooks</div>
      </div>

      {/* Payments Table */}
      <div className="bg-base-100 border border-base-200 rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-sm text-base-content/60">Loading payment records...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-base-content/60">No payment transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-xs">
              <thead>
                <tr className="text-base-content/60">
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Stripe Intent ID</th>
                  <th>Date</th>
                  <th className="text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <p className="font-bold text-base-content">{p.user?.name || "Customer"}</p>
                      <p className="text-[10px] text-base-content/50">{p.user?.email}</p>
                    </td>
                    <td className="font-semibold">{p.request?.service?.title || "Digital Service"}</td>
                    <td className="font-bold text-success">${p.amount.toFixed(2)}</td>
                    <td>
                      <span className="badge badge-success text-white badge-sm font-semibold">
                        {p.status}
                      </span>
                    </td>
                    <td className="font-mono text-[10px] text-base-content/60">{p.stripePaymentIntent}</td>
                    <td className="text-base-content/50">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="text-right">
                      {p.receiptUrl ? (
                        <a
                          href={p.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost btn-xs text-primary font-bold gap-1"
                        >
                          Receipt <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-base-content/30 italic">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={(p) => fetchPayments(p)} />
      </div>
    </div>
  );
}
