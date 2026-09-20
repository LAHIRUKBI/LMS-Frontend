// src/app/teacher/tickets/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";
import { MessageSquare, Plus, X, Send, Clock, CheckCircle2, Loader2 } from "lucide-react";

export default function MyTicketsPage() {
  const { darkMode } = useTheme();
  const searchParams = useSearchParams();
  const ticketIdParam = searchParams.get("ticketId");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: "", description: "" });
  
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/tickets/my-tickets", {
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
    if (ticketIdParam && tickets.length > 0) {
      const foundTicket = tickets.find(t => t._id === ticketIdParam);
      if (foundTicket) {
        setSelectedTicket(foundTicket); // <--- Modal එක Open වෙනවා
      }
    }
  }, [ticketIdParam, tickets]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/tickets", newTicket, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTicket({ title: "", description: "" });
      setIsCreateModalOpen(false);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

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
      fetchTickets(); // Refresh list silently
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`min-h-screen p-6 sm:p-8 transition-colors duration-300 ${darkMode ? "bg-slate-950" : "bg-slate-50/80"}`}>
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl shadow-sm ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
              <MessageSquare size={28} />
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>Support Tickets</h1>
              <p className={`mt-1 text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Report issues or communicate with the administration.</p>
            </div>
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-md transition-all">
            <Plus size={18} /> New Ticket
          </button>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
        ) : tickets.length === 0 ? (
          <div className={`p-16 text-center rounded-3xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <MessageSquare size={40} className={`mx-auto mb-4 ${darkMode ? "text-slate-600" : "text-slate-300"}`} />
            <h3 className={`text-lg font-bold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>No Support Tickets</h3>
            <p className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-400"}`}>You haven't opened any support tickets yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map(ticket => (
              <div key={ticket._id} onClick={() => setSelectedTicket(ticket)} className={`cursor-pointer p-5 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg ${darkMode ? "bg-slate-900/80 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-indigo-200"}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`font-bold truncate pr-4 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{ticket.title}</h3>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${ticket.status === 'open' ? (darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700") : (darkMode ? "bg-slate-800 text-slate-400" : "bg-gray-100 text-gray-600")}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className={`text-sm line-clamp-2 mb-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{ticket.description}</p>
                <div className={`flex items-center gap-2 text-xs font-semibold ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  <Clock size={14} /> {new Date(ticket.createdAt).toLocaleDateString()}
                  <span className="ml-auto flex items-center gap-1"><MessageSquare size={14} /> {ticket.replies.length} Replies</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="flex justify-between items-center mb-5">
              <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Open New Ticket</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className={`p-2 rounded-xl transition-colors ${darkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Subject / Title</label>
                <input required type="text" value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 outline-none ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="What do you need help with?" />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Description</label>
                <textarea required rows={4} value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 outline-none ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Provide details about your issue..."></textarea>
              </div>
              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all">Submit Ticket</button>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Chat / Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl h-[80vh] flex flex-col rounded-3xl border shadow-2xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            
            <div className={`p-5 border-b flex justify-between items-center ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>{selectedTicket.title}</h3>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${selectedTicket.status === 'open' ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"}`}>{selectedTicket.status}</span>
                </div>
                <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Opened on {new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className={`p-2 rounded-xl transition-colors ${darkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}><X size={18} /></button>
            </div>

            <div className={`flex-1 overflow-y-auto p-5 space-y-4 ${darkMode ? "bg-slate-950/50" : "bg-slate-50/50"}`}>
              {/* Original Issue */}
              <div className="flex flex-col items-end">
                <div className={`max-w-[85%] p-4 rounded-2xl rounded-tr-sm ${darkMode ? "bg-indigo-600 text-white" : "bg-indigo-600 text-white"}`}>
                  <p className="text-sm">{selectedTicket.description}</p>
                </div>
                <span className={`text-[10px] mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>You • Original Request</span>
              </div>

              {/* Replies */}
              {selectedTicket.replies.map((reply: any, idx: number) => (
                <div key={idx} className={`flex flex-col ${reply.senderRole === 'teacher' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${reply.senderRole === 'teacher' ? (darkMode ? "bg-indigo-600 rounded-tr-sm text-white" : "bg-indigo-600 rounded-tr-sm text-white") : (darkMode ? "bg-slate-800 rounded-tl-sm text-slate-200" : "bg-white border border-slate-200 shadow-sm rounded-tl-sm text-slate-800")}`}>
                    <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                  </div>
                  <span className={`text-[10px] mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    {reply.senderRole === 'teacher' ? 'You' : 'Admin'} • {new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))}
            </div>

            {selectedTicket.status === 'open' ? (
              <form onSubmit={handleReply} className={`p-4 border-t flex gap-2 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"}`}>
                <input required type="text" value={replyMessage} onChange={e => setReplyMessage(e.target.value)} placeholder="Type your reply..." className={`flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} />
                <button type="submit" className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all">
                  <Send size={18} />
                </button>
              </form>
            ) : (
              <div className={`p-4 text-center text-sm font-semibold border-t ${darkMode ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"}`}>
                <CheckCircle2 size={16} className="inline mr-1" /> This ticket is closed.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}