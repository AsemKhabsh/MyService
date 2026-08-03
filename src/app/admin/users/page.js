"use client";

import { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";
import { UserCheck, UserX, Shield, Search } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers(1);
  }, [search]);

  const fetchUsers = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pageNumber.toString());
      if (search) params.set("search", search);

      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserActive = async (user) => {
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success(`User ${!user.isActive ? "activated" : "deactivated"}`);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(error.message || "Failed to update user status");
    }
  };

  const toggleUserRole = async (user) => {
    const nextRole = user.role === "admin" ? "user" : "admin";
    if (!confirm(`Change ${user.name}'s role to ${nextRole}?`)) return;

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success(`Role updated to ${nextRole}`);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(error.message || "Failed to change role");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-base-content">Manage Registered Users</h1>
          <p className="text-sm text-base-content/60 mt-1">Audit accounts, manage roles, and control active status.</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered input-sm w-full pl-10 text-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-base-100 border border-base-200 rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-sm text-base-content/60">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-base-content/60">No user accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-xs">
              <thead>
                <tr className="text-base-content/60">
                  <th>User</th>
                  <th>Phone / Country</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-base-200 shrink-0">
                        <img src={u.avatar || "https://res.cloudinary.com/demo/image/upload/v1571218039/sample.jpg"} alt={u.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-base-content">{u.name}</p>
                        <p className="text-[10px] text-base-content/50">{u.email}</p>
                      </div>
                    </td>
                    <td>
                      <p>{u.phone || "N/A"}</p>
                      <p className="text-[10px] text-base-content/50">{u.country || "N/A"}</p>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleUserRole(u)}
                        className={`badge badge-sm font-semibold cursor-pointer gap-1 ${u.role === "admin" ? "badge-primary" : "badge-outline"}`}
                      >
                        {u.role === "admin" && <Shield className="w-3 h-3" />}
                        {u.role}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleUserActive(u)}
                        className={`badge badge-sm font-semibold cursor-pointer ${u.isActive !== false ? "badge-success text-white" : "badge-error text-white"}`}
                      >
                        {u.isActive !== false ? "Active" : "Deactivated"}
                      </button>
                    </td>
                    <td className="text-base-content/50">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => toggleUserActive(u)}
                        className={`btn btn-ghost btn-xs ${u.isActive !== false ? "text-error" : "text-success"}`}
                      >
                        {u.isActive !== false ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={(p) => fetchUsers(p)} />
      </div>
    </div>
  );
}
