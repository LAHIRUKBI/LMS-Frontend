// src/app/admin/tickets/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "@/app/context/ThemeContext";
import { MessageSquare, CheckCircle, Trash2, X, Send, Search, Loader2, User } from "lucide-react";

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
    <div className={`min-h-screen p-6 sm:p-8 transition-colors duration-300 ${darkMode ? "bg-slate-950" : "bg-slate-50/80"}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl shadow-sm ${darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
              <MessageSquare size={28} />
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>Support Helpdesk</h1>
              <p className={`mt-1 text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Manage and respond to teacher inquiries.</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
              <input type="text" placeholder="Search tickets..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800 shadow-sm"}`} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={`py-2.5 px-4 rounded-xl border text-sm font-semibold outline-none appearance-none cursor-pointer ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-700 shadow-sm"}`}>
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Tickets Grid */}
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
        ) : filteredTickets.length === 0 ? (
          <div className={`p-20 text-center rounded-3xl border ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <MessageSquare size={48} className={`mx-auto mb-4 ${darkMode ? "text-slate-700" : "text-slate-300"}`} />
            <h3 className={`text-lg font-bold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>No Tickets Found</h3>
            <p className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-400"}`}>There are no support tickets matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredTickets.map(ticket => (
              <div key={ticket._id} className={`flex flex-col rounded-3xl border overflow-hidden transition-all hover:shadow-lg ${darkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${ticket.status === 'open' ? (darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700") : (darkMode ? "bg-slate-800 text-slate-400" : "bg-gray-100 text-gray-500")}`}>
                      {ticket.status}
                    </span>
                    <span className={`text-[10px] font-bold ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className={`font-bold text-lg leading-tight mb-2 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{ticket.title}</h3>
                  
                  {/* Teacher Info */}
                  <div className={`flex items-center gap-2 mt-4 pt-4 border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                    <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                      {ticket.teacherId?.profilePhoto ? (
                        <img src={`http://localhost:5000/profile_photos/${ticket.teacherId.profilePhoto}`} className="w-full h-full object-cover" alt="" />
                      ) : <User size={14} className={darkMode ? "text-slate-500" : "text-slate-400"} />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{ticket.teacherId?.name || "Unknown Teacher"}</p>
                      <p className={`text-[10px] ${darkMode ? "text-slate-500" : "text-slate-500"}`}>{ticket.teacherId?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`flex items-center p-3 border-t gap-2 ${darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50/50"}`}>
                  <button onClick={() => setSelectedTicket(ticket)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${darkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
                    View & Reply
                  </button>
                  {ticket.status === 'open' && (
                    <button onClick={() => handleCloseTicket(ticket._id)} className={`p-2 rounded-xl transition-colors ${darkMode ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`} title="Close Ticket">
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button onClick={() => handleDeleteTicket(ticket._id)} className={`p-2 rounded-xl transition-colors ${darkMode ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100"}`} title="Delete Ticket">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Chat Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl h-[80vh] flex flex-col rounded-3xl border shadow-2xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            
            <div className={`p-5 border-b flex justify-between items-center ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-100"}`}>
                  {selectedTicket.teacherId?.profilePhoto ? (
                    <img src={`http://localhost:5000/profile_photos/${selectedTicket.teacherId.profilePhoto}`} className="w-full h-full object-cover" alt="" />
                  ) : <User size={18} className={darkMode ? "text-slate-500" : "text-slate-400"} />}
                </div>
                <div>
                  <h3 className={`text-base font-bold flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {selectedTicket.teacherId?.name || "Teacher"}
                    <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase ${selectedTicket.status === 'open' ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"}`}>{selectedTicket.status}</span>
                  </h3>
                  <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{selectedTicket.title}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className={`p-2 rounded-xl transition-colors ${darkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}><X size={18} /></button>
            </div>

            <div className={`flex-1 overflow-y-auto p-5 space-y-4 ${darkMode ? "bg-slate-950/50" : "bg-slate-50/50"}`}>
              {/* Original Issue */}
              <div className="flex flex-col items-start">
                <div className={`max-w-[85%] p-4 rounded-2xl rounded-tl-sm ${darkMode ? "bg-slate-800 text-slate-200" : "bg-white border border-slate-200 shadow-sm text-slate-800"}`}>
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
                <span className={`text-[10px] mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Teacher • Original Request</span>
              </div>

              {/* Replies */}
              {selectedTicket.replies.map((reply: any, idx: number) => (
                <div key={idx} className={`flex flex-col ${reply.senderRole === 'admin' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${reply.senderRole === 'admin' ? (darkMode ? "bg-blue-600 rounded-tr-sm text-white" : "bg-blue-600 rounded-tr-sm text-white") : (darkMode ? "bg-slate-800 rounded-tl-sm text-slate-200" : "bg-white border border-slate-200 shadow-sm rounded-tl-sm text-slate-800")}`}>
                    <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                  </div>
                  <span className={`text-[10px] mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    {reply.senderRole === 'admin' ? 'You (Admin)' : 'Teacher'} • {new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))}
            </div>

            {selectedTicket.status === 'open' ? (
              <form onSubmit={handleReply} className={`p-4 border-t flex gap-2 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"}`}>
                <input required type="text" value={replyMessage} onChange={e => setReplyMessage(e.target.value)} placeholder="Type your reply to teacher..." className={`flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/50 ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} />
                <button type="submit" className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition-all">
                  <Send size={18} />
                </button>
              </form>
            ) : (
              <div className={`p-4 text-center text-sm font-semibold border-t ${darkMode ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"}`}>
                <CheckCircle size={16} className="inline mr-1" /> Ticket closed.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}