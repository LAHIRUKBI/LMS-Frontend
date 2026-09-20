// src/app/admin/tickets/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "@/app/context/ThemeContext";
import { MessageSquare, CheckCircle, Trash2, X, Send, Search, Loader2, User, Clock, CheckCircle2 } from "lucide-react";

export default function AdminTicketsPage() {
  const { darkMode } = useTheme();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/tickets/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`http://localhost:5000/api/tickets/${selectedTicket._id}/reply`, { message: replyMessage }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedTicket(res.data.ticket);
      setReplyMessage("");
      fetchTickets(); // update list
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseTicket = async (id: string) => {
    if(!confirm("Are you sure you want to close this ticket?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/tickets/admin/${id}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTickets();
      if(selectedTicket?._id === id) setSelectedTicket({...selectedTicket, status: 'closed'});
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if(!confirm("Are you sure you want to permanently delete this ticket?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/tickets/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(tickets.filter(t => t._id !== id));
      if(selectedTicket?._id === id) setSelectedTicket(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.teacherId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`min-h-screen p-6 sm:p-8 transition-colors duration-300 font-sans ${darkMode ? "bg-slate-950" : "bg-slate-50/80"}`}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section (Modernized) */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${darkMode ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-white text-blue-600 border border-blue-100"}`}>
              <MessageSquare size={26} strokeWidth={2} />
            </div>
            <div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                Support Helpdesk
              </h2>
              <p className={`mt-1 text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Manage and respond to teacher inquiries and technical issues.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row w-full md:w-auto items-center gap-3">
            <div className="relative flex-1 md:w-72">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
              <input 
                type="text" 
                placeholder="Search tickets by title or teacher..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  darkMode ? "bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500" : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm focus:bg-slate-50"
                }`} 
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)} 
                className={`w-full pl-4 pr-8 py-2.5 rounded-xl border font-semibold text-sm outline-none transition-all appearance-none cursor-pointer ${
                  darkMode ? "bg-slate-900 border-slate-800 text-slate-200 focus:ring-2 focus:ring-blue-500/50" : "bg-white border-slate-200 text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500/50"
                }`}
              >
                <option value="all">All Status</option>
                <option value="open">Open Tickets</option>
                <option value="closed">Closed Tickets</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <Loader2 className="animate-spin text-blue-500" size={36} />
            <span className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Loading tickets...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className={`py-16 flex flex-col items-center justify-center text-center rounded-3xl border transition-colors ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <div className={`flex h-20 w-20 items-center justify-center rounded-full mb-4 ${darkMode ? "bg-slate-800 text-slate-600" : "bg-slate-50 text-slate-300"}`}>
              <MessageSquare size={36} />
            </div>
            <h3 className={`text-lg font-bold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>No Tickets Found</h3>
            <p className={`text-sm max-w-sm ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
              {searchTerm ? "No tickets match your search or filter criteria." : "There are no support tickets in the system right now."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTickets.map(ticket => (
              <div 
                key={ticket._id} 
                className={`group flex flex-col rounded-3xl border overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${
                  darkMode ? "bg-slate-900/80 border-slate-800 shadow-black/10" : "bg-white border-slate-200 shadow-sm hover:border-blue-200"
                }`}
              >
                <div className="p-5 flex-1 flex flex-col">
                  
                  {/* Status & Date */}
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      ticket.status === 'open' 
                        ? (darkMode ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border border-emerald-200") 
                        : (darkMode ? "bg-slate-800 text-slate-400 border border-slate-700" : "bg-gray-100 text-gray-500 border border-gray-200")
                    }`}>
                      {ticket.status}
                    </span>
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                      <Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Ticket Details */}
                  <h3 className={`font-extrabold text-base leading-tight mb-2 line-clamp-2 ${darkMode ? "text-slate-100" : "text-slate-800"}`} title={ticket.title}>
                    {ticket.title}
                  </h3>
                  <p className={`text-xs mb-4 line-clamp-2 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {ticket.description}
                  </p>
                  
                  {/* Teacher Info */}
                  <div className={`mt-auto pt-4 flex items-center gap-3 border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                    <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-100"}`}>
                      {ticket.teacherId?.profilePhoto ? (
                        <img src={`http://localhost:5000/profile_photos/${ticket.teacherId.profilePhoto}`} className="w-full h-full object-cover" alt="" />
                      ) : <User size={16} className={darkMode ? "text-slate-500" : "text-slate-400"} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                        {ticket.teacherId?.name || "Unknown Teacher"}
                      </p>
                      <p className={`text-[10px] font-medium truncate mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
                        {ticket.teacherId?.email || "No email available"}
                      </p>
                    </div>
                    {/* Replies count indicator */}
                    <div className={`flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold ${darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`} title={`${ticket.replies?.length || 0} Replies`}>
                      {ticket.replies?.length || 0}
                    </div>
                  </div>
                </div>
                
                {/* Actions Bar */}
                <div className={`p-3 border-t flex items-center gap-2 ${darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50/50"}`}>
                  <button 
                    onClick={() => setSelectedTicket(ticket)} 
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      darkMode ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                    }`}
                  >
                    <MessageSquare size={14} /> View Chat
                  </button>
                  
                  {ticket.status === 'open' && (
                    <button 
                      onClick={() => handleCloseTicket(ticket._id)} 
                      className={`p-2 rounded-xl transition-colors ${darkMode ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 shadow-sm"}`} 
                      title="Close Ticket"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleDeleteTicket(ticket._id)} 
                    className={`p-2 rounded-xl transition-colors ${darkMode ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-transparent" : "bg-white text-red-500 hover:bg-red-50 border border-slate-200 shadow-sm"}`} 
                    title="Delete Ticket"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Chat Modal (Modernized) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl h-[85vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            
            {/* Modal Header */}
            <div className={`p-5 border-b flex justify-between items-center ${darkMode ? "border-slate-800 bg-slate-900/80 backdrop-blur-md" : "border-slate-100 bg-white/80 backdrop-blur-md"}`}>
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center border shadow-sm ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-100"}`}>
                  {selectedTicket.teacherId?.profilePhoto ? (
                    <img src={`http://localhost:5000/profile_photos/${selectedTicket.teacherId.profilePhoto}`} className="w-full h-full object-cover" alt="" />
                  ) : <User size={20} className={darkMode ? "text-slate-500" : "text-slate-400"} />}
                </div>
                <div>
                  <h3 className={`text-base font-bold flex items-center gap-2 mb-0.5 ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {selectedTicket.teacherId?.name || "Teacher"}
                    <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider border ${selectedTicket.status === 'open' ? (darkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200") : (darkMode ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-500 border-slate-200")}`}>
                      {selectedTicket.status}
                    </span>
                  </h3>
                  <p className={`text-xs font-semibold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{selectedTicket.title}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className={`p-2 rounded-xl transition-colors ${darkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800"}`}>
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-5 ${darkMode ? "bg-slate-950/40" : "bg-slate-50/50"}`}>
              
              {/* Original Issue */}
              <div className="flex flex-col items-start w-full">
                <span className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Teacher • Original Request</span>
                <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl rounded-tl-sm shadow-sm ${darkMode ? "bg-slate-800 text-slate-200 border border-slate-700" : "bg-white border border-slate-200 text-slate-800"}`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
                </div>
                <span className={`text-[10px] font-semibold mt-1.5 ml-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Replies */}
              {selectedTicket.replies?.map((reply: any, idx: number) => {
                const isAdmin = reply.senderRole === 'admin';
                return (
                  <div key={idx} className={`flex flex-col w-full ${isAdmin ? 'items-end' : 'items-start'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isAdmin ? 'mr-2 text-blue-500' : 'ml-2 text-slate-400'}`}>
                      {isAdmin ? 'You (Admin)' : 'Teacher'}
                    </span>
                    <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl shadow-sm ${
                      isAdmin 
                        ? (darkMode ? "bg-blue-600 rounded-tr-sm text-white" : "bg-blue-600 rounded-tr-sm text-white shadow-blue-500/20") 
                        : (darkMode ? "bg-slate-800 rounded-tl-sm text-slate-200 border border-slate-700" : "bg-white border border-slate-200 text-slate-800")
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                    </div>
                    <span className={`text-[10px] font-semibold mt-1.5 ${isAdmin ? 'mr-2' : 'ml-2'} ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                      {new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            {selectedTicket.status === 'open' ? (
              <form onSubmit={handleReply} className={`p-4 sm:p-5 border-t flex gap-3 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"}`}>
                <input 
                  required 
                  type="text" 
                  value={replyMessage} 
                  onChange={e => setReplyMessage(e.target.value)} 
                  placeholder="Type your reply to the teacher..." 
                  className={`flex-1 px-5 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500/50 ${
                    darkMode ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 placeholder-slate-400"
                  }`} 
                />
                <button 
                  type="submit" 
                  disabled={!replyMessage.trim()}
                  className="flex items-center justify-center px-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20 transition-all"
                >
                  <Send size={20} className={replyMessage.trim() ? "translate-x-0.5" : ""} />
                </button>
              </form>
            ) : (
              <div className={`p-5 text-center text-sm font-bold border-t ${darkMode ? "border-slate-800 bg-slate-900/50 text-slate-500" : "border-slate-100 bg-slate-50/50 text-slate-400"}`}>
                <CheckCircle2 size={18} className="inline mr-1.5 mb-0.5" /> This ticket is closed. No further replies can be added.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}