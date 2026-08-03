"use client";

import { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";
import { PREDEFINED_CATEGORIES } from "@/utils/constants";
import { Plus, Edit3, Trash2, Star, Eye, Upload, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    price: 50,
    category: PREDEFINED_CATEGORIES[0],
    image: "",
    deliveryTime: 3,
    revisions: 2,
    features: "",
    isFeatured: false,
    isActive: true,
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchServices(1);
  }, []);

  const fetchServices = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/services?includeInactive=true&page=${pageNumber}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setServices(data.data.services);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "services");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Image upload failed");
      }

      setFormData((prev) => ({ ...prev, image: result.data.url }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      title: "",
      shortDescription: "",
      description: "",
      price: 50,
      category: PREDEFINED_CATEGORIES[0],
      image: "https://res.cloudinary.com/demo/image/upload/v1571218039/sample.jpg",
      deliveryTime: 3,
      revisions: 2,
      features: "Fast Delivery\nHigh Quality Results\n100% Satisfaction Guarantee",
      isFeatured: false,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || "",
      shortDescription: service.shortDescription || "",
      description: service.description || "",
      price: service.price || 0,
      category: service.category || PREDEFINED_CATEGORIES[0],
      image: service.image || "",
      deliveryTime: service.deliveryTime || 1,
      revisions: service.revisions || 0,
      features: (service.features || []).join("\n"),
      isFeatured: service.isFeatured || false,
      isActive: service.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      price: Number(formData.price),
      deliveryTime: Number(formData.deliveryTime),
      revisions: Number(formData.revisions),
      features: formData.features.split("\n").filter((f) => f.trim() !== ""),
    };

    try {
      const url = editingService ? `/api/services/${editingService._id}` : "/api/services";
      const method = editingService ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save service");
      }

      toast.success(editingService ? "Service updated!" : "Service created!");
      setModalOpen(false);
      fetchServices(pagination.page);
    } catch (error) {
      toast.error(error.message || "Failed to save service");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this service permanently?")) return;

    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete service");
      }

      toast.success("Service deleted");
      fetchServices(pagination.page);
    } catch (error) {
      toast.error(error.message || "Delete failed");
    }
  };

  const toggleStatus = async (service, field) => {
    try {
      const updated = { ...service, [field]: !service[field] };
      const res = await fetch(`/api/services/${service._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: updated[field] }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success(`Updated ${field}`);
      fetchServices(pagination.page);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-base-content">Manage Services</h1>
          <p className="text-sm text-base-content/60 mt-1">Add, update, or remove digital services from marketplace.</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary btn-sm font-bold gap-2 shadow">
          <Plus className="w-4 h-4" /> Add New Service
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-base-100 border border-base-200 rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-sm text-base-content/60">Loading services catalog...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 text-base-content/60">No services found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-xs">
              <thead>
                <tr className="text-base-content/60">
                  <th>Service</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Delivery</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                {services.map((srv) => (
                  <tr key={srv._id}>
                    <td className="flex items-center gap-3">
                      <img src={srv.image} alt={srv.title} className="w-10 h-10 rounded-lg object-cover bg-base-200" />
                      <div>
                        <p className="font-bold text-base-content line-clamp-1">{srv.title}</p>
                        <p className="text-[10px] text-base-content/50">slug: {srv.slug}</p>
                      </div>
                    </td>
                    <td>{srv.category}</td>
                    <td className="font-bold text-primary">${srv.price}</td>
                    <td>{srv.deliveryTime}d</td>
                    <td>
                      <button
                        onClick={() => toggleStatus(srv, "isFeatured")}
                        className={`btn btn-circle btn-ghost btn-xs ${srv.isFeatured ? "text-warning" : "text-base-content/30"}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleStatus(srv, "isActive")}
                        className={`badge badge-sm font-semibold cursor-pointer ${srv.isActive ? "badge-success text-white" : "badge-ghost"}`}
                      >
                        {srv.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="text-right space-x-2">
                      <button onClick={() => openEditModal(srv)} className="btn btn-ghost btn-xs text-info">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(srv._id)} className="btn btn-ghost btn-xs text-error">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={(p) => fetchServices(p)} />
      </div>

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-base-content mb-4">
              {editingService ? "Edit Service" : "Create New Service"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="label font-bold">Service Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input input-bordered input-sm w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label font-bold">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="select select-bordered select-sm w-full"
                  >
                    {PREDEFINED_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label font-bold">Price ($ USD) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input input-bordered input-sm w-full"
                  />
                </div>
              </div>

              <div>
                <label className="label font-bold">Short Description *</label>
                <input
                  type="text"
                  required
                  maxLength={300}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="input input-bordered input-sm w-full"
                />
              </div>

              <div>
                <label className="label font-bold">Full Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="textarea textarea-bordered w-full text-xs"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label font-bold">Delivery Time (Days) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.deliveryTime}
                    onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                    className="input input-bordered input-sm w-full"
                  />
                </div>

                <div>
                  <label className="label font-bold">Revisions Included *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.revisions}
                    onChange={(e) => setFormData({ ...formData, revisions: e.target.value })}
                    className="input input-bordered input-sm w-full"
                  />
                </div>
              </div>

              <div>
                <label className="label font-bold">Main Service Image URL *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="input input-bordered input-sm flex-1"
                  />
                  <label className="btn btn-outline btn-sm gap-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="label font-bold">Features Included (One per line)</label>
                <textarea
                  rows={3}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="textarea textarea-bordered w-full text-xs"
                ></textarea>
              </div>

              <div className="flex gap-6 pt-2">
                <label className="label cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="checkbox checkbox-sm checkbox-primary"
                  />
                  <span className="label-text text-xs font-bold">Mark as Featured</span>
                </label>

                <label className="label cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="checkbox checkbox-sm checkbox-success"
                  />
                  <span className="label-text text-xs font-bold">Active in Marketplace</span>
                </label>
              </div>

              <div className="modal-action">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm font-bold">Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
