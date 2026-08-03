"use client";

import { useState, useEffect } from "react";
import RequestStatusBadge from "@/components/RequestStatusBadge";
import RequestTimeline from "@/components/RequestTimeline";
import Pagination from "@/components/Pagination";
import { REQUEST_STATUSES, PAYMENT_STATUSES } from "@/utils/constants";
import { Eye, Edit, Save, FileText } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  const [updateForm, setUpdateForm] = useState({
    status: "",
    paymentStatus: "",
    adminNotes: "",
    note: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRequests(1);
  }, []);

  const fetchRequests = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/requests?page=${pageNumber}&limit=10`);
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

  const openUpdateModal = (request) => {
    setSelectedRequest(request);
    setUpdateForm({
      status: request.status,
      paymentStatus: request.paymentStatus,
      adminNotes: request.adminNotes || "",
      note: `Status updated to ${request.status}`,
    });
    setUpdateModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/requests/${selectedRequest._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update request");
      }

      toast.success("Request status updated");
      setUpdateModalOpen(false);
      fetchRequests(pagination.page);
    } catch (error) {
      toast.error(error.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-base-content">Manage Customer Requests</h1>
        <p className="text-sm text-base-content/60 mt-1">Review orders, update service status pipeline, and record timeline notes.</p>
      </div>

      {/* Requests Table */}
      <div className="bg-base-100 border border-base-200 rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-sm text-base-content/60">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-base-content/60">No request records found.</div>
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
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <p className="font-bold text-base-content">{req.user?.name || "Customer"}</p>
                      <p className="text-[10px] text-base-content/50">{req.user?.email}</p>
                    </td>
                    <td>
                      <p className="font-semibold">{req.service?.title || "Custom Service"}</p>
                      <p className="text-[10px] text-base-content/50">{req.service?.category}</p>
                    </td>
                    <td className="font-bold text-primary">${req.price}</td>
                    <td><RequestStatusBadge status={req.status} /></td>
                    <td><RequestStatusBadge status={req.paymentStatus} /></td>
                    <td className="text-base-content/50">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="text-right">
                      <button onClick={() => openUpdateModal(req)} className="btn btn-ghost btn-xs text-primary font-bold gap-1">
                        <Edit className="w-3.5 h-3.5" /> Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={(p) => fetchRequests(p)} />
      </div>

      {/* Status Update & Timeline Modal */}
      {updateModalOpen && selectedRequest && (
        <div className="modal modal-open">
          <div className="modal-box rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-base-content mb-1">
              Manage Request: {selectedRequest.service?.title}
            </h3>
            <p className="text-xs text-base-content/50 mb-6">Customer: {selectedRequest.user?.name} ({selectedRequest.user?.email})</p>

            <form onSubmit={handleUpdate} className="space-y-6 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label font-bold">Request Status</label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value, note: `Status updated to ${e.target.value}` })}
                    className="select select-bordered select-sm w-full"
                  >
                    {REQUEST_STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label font-bold">Payment Status</label>
                  <select
                    value={updateForm.paymentStatus}
                    onChange={(e) => setUpdateForm({ ...updateForm, paymentStatus: e.target.value })}
                    className="select select-bordered select-sm w-full"
                  >
                    {PAYMENT_STATUSES.map((ps) => (
                      <option key={ps} value={ps}>{ps}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label font-bold">Timeline Note (Visible to Customer)</label>
                <input
                  type="text"
                  placeholder="e.g. Initial draft completed, awaiting feedback..."
                  value={updateForm.note}
                  onChange={(e) => setUpdateForm({ ...updateForm, note: e.target.value })}
                  className="input input-bordered input-sm w-full"
                />
              </div>

              <div>
                <label className="label font-bold">Admin Internal Notes (Private)</label>
                <textarea
                  rows={2}
                  placeholder="Private internal notes..."
                  value={updateForm.adminNotes}
                  onChange={(e) => setUpdateForm({ ...updateForm, adminNotes: e.target.value })}
                  className="textarea textarea-bordered w-full text-xs"
                ></textarea>
              </div>

              {/* Timeline History */}
              <div className="space-y-2 border-t border-base-200 pt-4">
                <h4 className="font-bold text-base-content flex items-center gap-1">
                  <FileText className="w-4 h-4 text-primary" /> Request Timeline
                </h4>
                <div className="border border-base-200 p-4 rounded-xl max-h-48 overflow-y-auto">
                  <RequestTimeline history={selectedRequest.statusHistory} />
                </div>
              </div>

              <div className="modal-action">
                <button type="button" onClick={() => setUpdateModalOpen(false)} className="btn btn-ghost btn-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary btn-sm font-bold gap-1">
                  <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save Updates"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
