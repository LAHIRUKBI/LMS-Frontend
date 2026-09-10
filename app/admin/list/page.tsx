"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react"; // අලුතින් Delete අයිකනය import කරගත්තා

interface AdminUser {
  _id: string;
  adminId: string;
  name: string;
  email: string;
  isDefault: boolean;
}

export default function AdminListPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  // Admin කෙනෙක්ව Delete කිරීමේ Function එක
  const handleDelete = async (id: string, name: string) => {
    // මකා දැමීමට පෙර තහවුරු කරගැනීම (Confirmation)
    const isConfirmed = window.confirm(`ඔබට විශ්වාසද "${name}" ගේ Admin ගිණුම ඉවත් කළ යුතුයි කියා?`);
    if (!isConfirmed) return;

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`http://localhost:5000/api/admin/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(res.data.message || "ගිණුම සාර්ථකව ඉවත් කරන ලදී.");
      
      // ඉවත් කළ පසු Table එක රීලෝඩ් නොකර අදාළ Admin ව පමණක් State එකෙන් අයින් කිරීම
      setAdmins(admins.filter((admin) => admin._id !== id));

      // තත්පර 3කින් success මැසේජ් එක මකා දැමීම
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "ඉවත් කිරීමේදී දෝෂයක් මතු විය.");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          ලියාපදිංචි Admin ලැයිස්තුව
        </h2>

        {/* Error සහ Success පණිවිඩ */}
        {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
        {success && <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-md">{success}</div>}

        {loading ? (
          <p className="text-gray-500 dark:text-slate-400">Loading...</p>
        ) : admins.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400">පද්ධතියේ Admin වරුන් නොමැත.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300 border-collapse">
              <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 uppercase font-medium">
                <tr>
                  <th className="px-4 py-3 border-b dark:border-slate-700">Admin ID</th>
                  <th className="px-4 py-3 border-b dark:border-slate-700">Name</th>
                  <th className="px-4 py-3 border-b dark:border-slate-700">Email</th>
                  <th className="px-4 py-3 border-b dark:border-slate-700">Role Type</th>
                  <th className="px-4 py-3 border-b dark:border-slate-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{admin.adminId}</td>
                    <td className="px-4 py-3">{admin.name}</td>
                    <td className="px-4 py-3">{admin.email}</td>
                    <td className="px-4 py-3">
                      {admin.isDefault ? (
                        <span className="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 px-2 py-1 rounded text-xs font-semibold">
                          Super Admin
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-1 rounded text-xs font-semibold">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {/* Default Admin නෙවෙයි නම් විතරක් Delete Button එක පෙන්වනවා */}
                      {!admin.isDefault ? (
                        <button
                          onClick={() => handleDelete(admin._id, admin.name)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10"
                          title="Delete Admin"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Protected</span>
                      )}
                    </td>
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