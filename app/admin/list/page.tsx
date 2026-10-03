"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, User, Phone } from "lucide-react";
import DeleteConfirmationModal from "@/app/components/AdminDeleteConfirmationModal";
import { useTheme } from "@/app/context/ThemeContext";

interface AdminUser {
  _id: string;
  adminId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  profilePhoto?: string;
  isDefault: boolean;
}

export default function AdminListPage() {
  const { darkMode } = useTheme();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<{ id: string; name: string } | null>(null);

  // To check if the logged-in user is a Super Admin
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role === "admin" && parsedUser.isDefault) {
          setIsSuperAdmin(true);
        }
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }
  }, []);

  const formatImageUrl = (path: string) => {
    if (!path) return "";
    const cleanPath = path.replace(/\\/g, '/');
    return `http://localhost:5000/${cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath}`;
  };

  const fetchAdmins = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/admin/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data);
    } catch (err) {
      console.error("Admins fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const openDeleteModal = (id: string, name: string) => {
    if (!isSuperAdmin) {
      setError("Only the Super Admin has the authority to remove admins!");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setSelectedAdmin({ id, name });
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAdmin) return;

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`http://localhost:5000/api/admin/admins/${selectedAdmin.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(res.data.message || "Account successfully removed.");
      setAdmins(admins.filter((admin) => admin._id !== selectedAdmin.id));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred while removing.");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      <div className={`p-8 rounded-2xl shadow-sm border transition-colors duration-300 ${
        darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}>
          Registered Admin List
        </h2>

        {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-500/10 dark:text-red-300 rounded-md">{error}</div>}
        {success && <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 dark:bg-green-500/10 dark:text-green-300 rounded-md">{success}</div>}

        {loading ? (
          <p className={darkMode ? "text-slate-400" : "text-slate-500"}>Loading...</p>
        ) : admins.length === 0 ? (
          <p className={darkMode ? "text-slate-400" : "text-slate-500"}>No admins found in the system.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-left text-sm border-collapse ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
              <thead className={`uppercase font-medium ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}>
                <tr>
                  <th className={`px-4 py-3 border-b ${darkMode ? "border-slate-700" : "border-slate-200"}`}>Profile</th>
                  <th className={`px-4 py-3 border-b ${darkMode ? "border-slate-700" : "border-slate-200"}`}>Admin ID</th>
                  <th className={`px-4 py-3 border-b ${darkMode ? "border-slate-700" : "border-slate-200"}`}>Name</th>
                  <th className={`px-4 py-3 border-b ${darkMode ? "border-slate-700" : "border-slate-200"}`}>Email</th>
                  <th className={`px-4 py-3 border-b ${darkMode ? "border-slate-700" : "border-slate-200"}`}>Phone Number</th>
                  <th className={`px-4 py-3 border-b ${darkMode ? "border-slate-700" : "border-slate-200"}`}>Role Type</th>
                  <th className={`px-4 py-3 border-b text-center ${darkMode ? "border-slate-700" : "border-slate-200"}`}>Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? "divide-slate-700" : "divide-slate-200"}`}>
                {admins.map((admin) => (
                  <tr key={admin._id} className={`transition-colors ${darkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}`}>
                    <td className="px-4 py-3">
                      <div className={`h-10 w-10 rounded-full overflow-hidden flex items-center justify-center border ${
                        darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-300"
                      }`}>
                        {admin.profilePhoto ? (
                          <img
                            src={formatImageUrl(admin.profilePhoto)}
                            alt={admin.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User size={20} className={darkMode ? "text-slate-500" : "text-slate-400"} />
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>{admin.adminId}</td>
                    <td className={`px-4 py-3 font-medium ${darkMode ? "text-white" : "text-slate-800"}`}>{admin.name}</td>
                    <td className="px-4 py-3">{admin.email}</td>
                    <td className="px-4 py-3">
                      {admin.phoneNumber ? (
                        <span className="flex items-center gap-1.5">
                          <Phone size={14} className={darkMode ? "text-slate-400" : "text-slate-400"} />
                          {admin.phoneNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Not provided</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {admin.isDefault ? (
                        <span className="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                          Super Admin
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!admin.isDefault ? (
                        <button
                          onClick={() => openDeleteModal(admin._id, admin.name)}
                          className={`transition-colors p-2 rounded-md ${
                            isSuperAdmin 
                              ? "text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10" 
                              : "text-slate-400 cursor-not-allowed opacity-50"
                          }`}
                          title={isSuperAdmin ? "Delete Admin" : "Only Super Admin can delete"}
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Admin Account"
        message={`Are you sure you want to remove "${selectedAdmin?.name}"'s Admin account? This action cannot be undone.`}
      />
    </div>
  );
}