"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Camera, Save, User, Mail, Phone, Globe } from "lucide-react";
import { toast } from "react-hot-toast";

export default function UserProfilePage() {
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    country: "",
    avatar: "",
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        country: user.country || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size cannot exceed 5MB");
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "avatars");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Avatar upload failed");
      }

      setFormData((prev) => ({ ...prev, avatar: result.data.url }));
      toast.success("Avatar uploaded successfully");
    } catch (error) {
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      refreshUser();
    } catch (error) {
      toast.error(error.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-base-content">Profile Settings</h1>
        <p className="text-sm text-base-content/60 mt-1">Manage your account information and personal avatar.</p>
      </div>

      <div className="bg-base-100 border border-base-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-base-200">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-base-200 border-2 border-primary/20 shrink-0">
              <img
                src={formData.avatar || "https://res.cloudinary.com/demo/image/upload/v1571218039/sample.jpg"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-base-900/60 flex items-center justify-center text-white text-xs font-semibold">
                  Uploading...
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <label className="btn btn-outline btn-sm gap-2 cursor-pointer font-semibold">
                <Camera className="w-4 h-4" /> Change Avatar
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-base-content/50">Allowed formats: JPG, PNG, WEBP. Max size: 5MB.</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="label text-xs font-bold">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input input-bordered input-sm w-full pl-10 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="label text-xs font-bold">Email Address (Read-only)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="input input-bordered input-sm w-full pl-10 text-xs bg-base-200 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="label text-xs font-bold">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input input-bordered input-sm w-full pl-10 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="label text-xs font-bold">Country</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. United States, Saudi Arabia"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="input input-bordered input-sm w-full pl-10 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-sm font-bold gap-2 px-6"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
