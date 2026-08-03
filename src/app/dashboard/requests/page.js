"use client";

import { useState, useEffect } from "react";
import RequestStatusBadge from "@/components/RequestStatusBadge";
import RequestTimeline from "@/components/RequestTimeline";
import Pagination from "@/components/Pagination";
import { CreditCard, XCircle, Eye, FileText, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";

export default function UserRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests(1);
  }, [activeTab]);

  const fetchRequests = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pageNumber.toString());
      if (activeTab !== "All") params.set("status", activeTab);

      const res = await fetch(`/api/requests?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.data.requests);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (requestId) => {
    try {
      toast.loading("Redirecting to Stripe checkout...", { id: "stripe" });
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create checkout session");
      }

      toast.dismiss("stripe");
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch (error) {
      toast.error(error.message || "Payment checkout failed", { id: "stripe" });
    }
  };

  const handleCancel = async (requestId) => {
    if (!confirm("Are you sure you want to cancel this pending request?")) return;

    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled", note: "Cancelled by user" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel request");
      }

      toast.success("Request cancelled successfully");
      fetchRequests(pagination.page);
      if (selectedRequest && selectedRequest._id === requestId) {
        setSelectedRequest(data.data.request);
      }
    } catch (error) {
      toast.error(error.message || "Cancellation failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-base-content">My Orders & Service Requests</h1>
        <p className="text-sm text-base-content/60 mt-1">Track request progress, complete payments, and review timelines.</p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-200 p-1 rounded-xl w-fit text-xs font-semibold">
        {["All", "Pending", "In Progress", "Completed", "Cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab rounded-lg transition-all ${activeTab === tab ? "tab-active bg-base-100 shadow-xs text-primary" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-base-100 border border-base-200 rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-sm text-base-content/60">Loading your service requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-base-content/60 space-y-2">
            <p className="font-medium">No service requests found in this status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="text-xs text-base-content/60">
                  <th>Service</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium">
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <p className="font-semibold text-base-content">{req.service?.title || "Custom Service"}</p>
                      <p className="text-[10px] text-base-content/50">{req.service?.category}</p>
                    </td>
                    <td className="font-bold text-primary">${req.price}</td>
                    <td><RequestStatusBadge status={req.status} /></td>
                    <td><RequestStatusBadge status={req.paymentStatus} /></td>
                    <td className="text-base-content/50">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="btn btn-ghost btn-xs text-info gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>

                      {req.paymentStatus === "Pending" && req.status !== "Cancelled" && (
                        <button
                          onClick={() => handlePay(req._id)}
                          className="btn btn-primary btn-xs font-bold text-white gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Pay Now
                        </button>
                      )}

                      {req.status === "Pending" && (
                        <button
                          onClick={() => handleCancel(req._id)}
                          className="btn btn-ghost btn-xs text-error gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={pagination.page}
          totalPages={pagination.pages}
          onPageChange={(p) => fetchRequests(p)}
        />
      </div>

      {/* Details & Timeline Modal */}
      {selectedRequest && (
        <div className="modal modal-open">
          <div className="modal-box rounded-2xl max-w-2xl">
            <h3 className="font-bold text-lg text-base-content mb-1">
              Order Details: {selectedRequest.service?.title}
            </h3>
            <p className="text-xs text-base-content/60 mb-6">
              Request ID: {selectedRequest._id}
            </p>

            <div className="space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-base-200/60 rounded-xl text-xs">
                <div>
                  <span className="text-base-content/60 block">Price</span>
                  <span className="font-bold text-primary text-sm">${selectedRequest.price}</span>
                </div>
                <div>
                  <span className="text-base-content/60 block">Status</span>
                  <RequestStatusBadge status={selectedRequest.status} />
                </div>
                <div>
                  <span className="text-base-content/60 block">Payment</span>
                  <RequestStatusBadge status={selectedRequest.paymentStatus} />
                </div>
                <div>
                  <span className="text-base-content/60 block">Ordered On</span>
                  <span className="font-semibold">{new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {selectedRequest.customerMessage && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-base-content">Your Instructions / Notes</h4>
                  <p className="text-xs text-base-content/80 bg-base-100 border border-base-200 p-3 rounded-xl leading-relaxed">
                    {selectedRequest.customerMessage}
                  </p>
                </div>
              )}

              {/* Status Timeline */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-base-content flex items-center gap-1">
                  <FileText className="w-4 h-4 text-primary" /> Order History & Timeline
                </h4>
                <div className="border border-base-200 p-4 rounded-2xl max-h-60 overflow-y-auto">
                  <RequestTimeline history={selectedRequest.statusHistory} />
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button onClick={() => setSelectedRequest(null)} className="btn btn-sm btn-ghost">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
