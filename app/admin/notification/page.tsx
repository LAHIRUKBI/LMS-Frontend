"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // Excel Export සඳහා පැකේජය
import { 
  Trash2, 
  Calendar, 
  Settings, 
  Loader2, 
  Search, 
  CheckSquare, 
  Square, 
  AlertCircle,
  Save,
  User,
  UserX,
  Download // Download අයිකනය
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

interface NotificationData {
  _id: string;
  title: string;
  message: string;
  recipientRole: string;
  isRead: boolean;
  createdAt: string;
  userId?: {
    _id: string;
    name?: string;
  } | string | null;
}

export default function AdminNotificationManager() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [autoDeleteDays, setAutoDeleteDays] = useState<number>(30);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState("");

  const { darkMode } = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [startDate, endDate, searchQuery, notifications]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const notifRes = await axios.get("http://localhost:5000/api/notifications/system/all", { headers });
      setNotifications(notifRes.data);

      const settingsRes = await axios.get("http://localhost:5000/api/notifications/system/settings", { headers });
      if (settingsRes.data && settingsRes.data.autoDeleteDays) {
        setAutoDeleteDays(settingsRes.data.autoDeleteDays);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...notifications];

    if (startDate) {
      filtered = filtered.filter(n => new Date(n.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(n => new Date(n.createdAt) <= end);
    }

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered.filter(n => {
        const titleMatch = n.title.toLowerCase().includes(lowerQ);
        const msgMatch = n.message.toLowerCase().includes(lowerQ);
        const roleMatch = n.recipientRole.toLowerCase().includes(lowerQ);
        
        let nameMatch = false;
        if (n.userId && typeof n.userId === 'object' && n.userId.name) {
          nameMatch = n.userId.name.toLowerCase().includes(lowerQ);
        }

        return titleMatch || msgMatch || roleMatch || nameMatch;
      });
    }

    setFilteredNotifications(filtered);
    setSelectedIds(prev => prev.filter(id => filtered.some(f => f._id === id)));
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n._id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} notifications?`)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/notifications/system/bulk-delete", 
        { ids: selectedIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showMessage(`Successfully deleted ${selectedIds.length} notifications.`);
      setSelectedIds([]);
      fetchData(); 
    } catch (error) {
      console.error("Error bulk deleting:", error);
      showMessage("Error deleting notifications.", true);
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/notifications/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage("Notification deleted.");
      fetchData();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/notifications/system/settings", 
        { autoDeleteDays },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage(`Auto-delete set to ${autoDeleteDays} days.`);
    } catch (error) {
      console.error("Error saving settings:", error);
      showMessage("Error saving settings.", true);
    } finally {
      setSavingSettings(false);
    }
  };

  const showMessage = (msg: string, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const getUserName = (userId: any) => {
    if (!userId) return null;
    
    if (typeof userId === 'object' && userId.name) {
      return (
        <span className={`flex items-center gap-1.5 text-xs font-semibold mt-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          <User size={12} className="text-slate-400" /> {userId.name}
        </span>
      );
    }
    
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 mt-1.5 bg-rose-50 dark:bg-rose-500/10 w-fit px-2 py-0.5 rounded-md">
        <UserX size={12} className="text-rose-500" /> User Deleted
      </span>
    );
  };

  // Excel Export Function
  const handleExportExcel = () => {
    if (filteredNotifications.length === 0) {
      showMessage("No data to export.", true);
      return;
    }

    const excelData = filteredNotifications.map(notif => {
      let userName = "User Deleted";
      if (notif.userId && typeof notif.userId === 'object' && notif.userId.name) {
        userName = notif.userId.name;
      }

      return {
        "Date": new Date(notif.createdAt).toLocaleDateString(),
        "Time": new Date(notif.createdAt).toLocaleTimeString(),
        "Recipient Role": notif.recipientRole.toUpperCase(),
        "User Name": userName,
        "Status": notif.isRead ? "Read" : "Unread",
        "Title": notif.title,
        "Message": notif.message
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Notifications");

    const fileName = `System_Notifications_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className={`min-h-screen p-6 font-sans transition-colors duration-200 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-800'}`}>System Notifications Manager</h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>View, filter, export, and manage all notifications across the platform.</p>
        </div>

        {message && (
          <div className="p-4 bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 rounded-xl font-medium shadow-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Settings & Filters Panel */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Auto Delete Settings */}
            <div className={`p-6 rounded-2xl shadow-sm border transition-colors duration-200 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-4 text-orange-500">
                <Settings size={20} />
                <h2 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-slate-800'}`}>Auto-Delete Settings</h2>
              </div>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                Automatically remove notifications older than a specific number of days to save database storage.
              </p>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  min="1"
                  value={autoDeleteDays}
                  onChange={(e) => setAutoDeleteDays(Number(e.target.value))}
                  className={`w-24 border rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Days</span>
                <button 
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="ml-auto bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingSettings ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Save
                </button>
              </div>
            </div>

            {/* Calendar & Date Filter */}
            <div className={`p-6 rounded-2xl shadow-sm border transition-colors duration-200 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-4 text-blue-500">
                <Calendar size={20} />
                <h2 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-slate-800'}`}>Filter by Date</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${darkMode ? 'text-gray-400' : 'text-slate-400'}`}>Start Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${darkMode ? 'text-gray-400' : 'text-slate-400'}`}>End Date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => { setStartDate(""); setEndDate(""); }}
                    className="text-xs text-rose-500 hover:underline font-medium cursor-pointer"
                  >
                    Clear Dates
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Main Table Panel */}
          <div className={`lg:col-span-2 rounded-2xl shadow-sm border overflow-hidden flex flex-col h-[750px] transition-colors duration-200 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
            
            {/* Table Toolbar */}
            <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 transition-colors duration-200 ${darkMode ? 'border-gray-800 bg-gray-800/20' : 'border-slate-200 bg-slate-50/50'}`}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search notifications or user..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-teal-500 w-64 transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
                />
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium hidden sm:block ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  {selectedIds.length} selected
                </span>
                
                {/* Excel Export Button */}
                <button
                  onClick={handleExportExcel}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download size={16} /> Export
                </button>

                {/* Bulk Delete Button */}
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0}
                  className="bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Trash2 size={16} /> Delete Selected
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className={`flex flex-col items-center justify-center h-full ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                  <Loader2 className="animate-spin mb-2" size={32} />
                  <p>Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className={`flex flex-col items-center justify-center h-full p-8 text-center ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                  <AlertCircle size={48} className="mb-4 opacity-50" />
                  <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>No notifications found.</p>
                  <p className="text-sm">Try adjusting your date filters or search query.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className={`sticky top-0 z-10 shadow-sm transition-colors duration-200 ${darkMode ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-slate-100'}`}>
                    <tr>
                      <th className="p-4 w-12 text-center">
                        <button onClick={handleSelectAll} className="text-slate-400 hover:text-teal-500 transition-colors cursor-pointer">
                          {selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0 ? (
                            <CheckSquare size={18} className="text-teal-500" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </th>
                      <th className={`p-4 text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Date & Time</th>
                      <th className={`p-4 text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Recipient / User</th>
                      <th className={`p-4 text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Status</th>
                      <th className={`p-4 text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Title & Message</th>
                      <th className={`p-4 text-xs font-bold uppercase tracking-wider text-right ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-slate-100'}`}>
                    {filteredNotifications.map((notif) => (
                      <tr 
                        key={notif._id} 
                        className={`transition-colors ${darkMode ? 'hover:bg-gray-800/40' : 'hover:bg-slate-50'} ${selectedIds.includes(notif._id) ? (darkMode ? 'bg-teal-500/10' : 'bg-teal-50/50') : ''}`}
                      >
                        <td className="p-4 text-center align-top">
                          <button onClick={() => handleSelectOne(notif._id)} className="text-slate-400 hover:text-teal-500 transition-colors mt-1 cursor-pointer">
                            {selectedIds.includes(notif._id) ? (
                              <CheckSquare size={18} className="text-teal-500" />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        </td>
                        <td className={`p-4 text-sm whitespace-nowrap align-top pt-5 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                          {new Date(notif.createdAt).toLocaleDateString()}<br/>
                          <span className="text-xs text-slate-400">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                        </td>
                        <td className="p-4 align-top pt-5">
                          <div className="flex flex-col">
                            <span className={`w-fit px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              notif.recipientRole === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                              notif.recipientRole === 'teacher' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                              'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                            }`}>
                              {notif.recipientRole}
                            </span>
                            {getUserName(notif.userId)}
                          </div>
                        </td>
                        <td className="p-4 align-top pt-5">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                            notif.isRead 
                              ? (darkMode ? 'bg-gray-800 text-gray-400' : 'bg-slate-100 text-slate-500') 
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                          }`}>
                            {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>}
                            {notif.isRead ? 'Read' : 'Unread'}
                          </span>
                        </td>
                        <td className="p-4 align-top pt-4">
                          <p className={`font-bold text-sm mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{notif.title}</p>
                          <p className={`text-xs leading-relaxed max-w-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{notif.message}</p>
                        </td>
                        <td className="p-4 text-right align-top pt-4">
                          <button 
                            onClick={() => handleDeleteOne(notif._id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors inline-block mt-0.5 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className={`p-4 border-t text-xs text-center transition-colors duration-200 ${darkMode ? 'border-gray-800 bg-gray-800/20 text-gray-400' : 'border-slate-200 bg-slate-50/50 text-slate-500'}`}>
              Showing {filteredNotifications.length} of {notifications.length} total notifications
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}