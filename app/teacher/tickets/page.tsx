// src/app/teacher/tickets/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";
import { MessageSquare, Plus, X, Send, Clock, CheckCircle2, Loader2, User } from "lucide-react";

// Suspense Boundary එකක් තුළ Ticket Component එක ලිවීම Next.js (useSearchParams) සඳහා වඩාත් සුදුසුය
function TicketContent() {
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
    fetchTickets();
  }, []);

  // Notification එකෙන් URL එකට ආවම අදාළ Ticket එක Open කිරීම
  useEffect(() => {
    if (ticketIdParam && tickets.length > 0) {
      const foundTicket = tickets.find(t => t._id === ticketIdParam);
      if (foundTicket) {
        setSelectedTicket(foundTicket);
      }
    }
  }, [ticketIdParam, tickets]);

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
    <div className={`min-h-screen p-6 sm:p-8 transition-colors duration-300 font-sans ${darkMode ? "bg-slate-950" : "bg-slate-50/80"}`}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section (Modernized) */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${darkMode ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-white text-indigo-600 border border-indigo-100"}`}>
              <MessageSquare size={26} strokeWidth={2} />
            </div>
            <div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                Support Tickets
              </h2>
              <p className={`mt-1 text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Report issues or communicate directly with the administration.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} /> Open New Ticket
          </button>
        </div>

        {/* Tickets Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <Loader2 className="animate-spin text-indigo-500" size={36} />
            <span className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Loading your tickets...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className={`py-16 flex flex-col items-center justify-center text-center rounded-3xl border transition-colors ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <div className={`flex h-20 w-20 items-center justify-center rounded-full mb-4 ${darkMode ? "bg-slate-800 text-slate-600" : "bg-slate-50 text-slate-300"}`}>
              <MessageSquare size={36} />
            </div>
            <h3 className={`text-lg font-bold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>No Support Tickets</h3>
            <p className={`text-sm max-w-sm ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
              You haven't opened any support tickets yet. Click "Open New Ticket" to create one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {tickets.map(ticket => (
              <div 
                key={ticket._id} 
                className={`group flex flex-col rounded-3xl border overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${
                  darkMode ? "bg-slate-900/80 border-slate-800 shadow-black/10" : "bg-white border-slate-200 shadow-sm hover:border-indigo-200"
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
                  
                  {/* Replies Indicator */}
                  <div className={`mt-auto pt-4 flex items-center justify-between border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                    <span className={`text-xs font-bold ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                      Conversation
                    </span>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      ticket.replies.length > 0 
                        ? (darkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-600") 
                        : (darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500")
                    }`}>
                      <MessageSquare size={12} /> {ticket.replies.length} {ticket.replies.length === 1 ? 'Reply' : 'Replies'}
                    </div>
                  </div>
                </div>
                
                {/* Actions Bar */}
                <div className={`p-3 border-t flex items-center gap-2 ${darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50/50"}`}>
                  <button 
                    onClick={() => setSelectedTicket(ticket)} 
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      darkMode ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                    }`}
                  >
                    <MessageSquare size={14} /> View Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            
            <div className={`p-5 sm:p-6 border-b flex justify-between items-center ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
              <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Open New Ticket</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className={`p-2 rounded-xl transition-colors ${darkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800"}`}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTicket} className="p-5 sm:p-6 space-y-5">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Subject / Title</label>
                <input 
                  required 
                  type="text" 
                  value={newTicket.title} 
                  onChange={e => setNewTicket({...newTicket, title: e.target.value})} 
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 outline-none transition-all ${darkMode ? "bg-slate-950 border-slate-800 text-white focus:ring-indigo-500/50" : "bg-slate-50 border-slate-200 focus:ring-indigo-500/40"}`} 
                  placeholder="What do you need help with?" 
                />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Description</label>
                <textarea 
                  required 
                  rows={5} 
                  value={newTicket.description} 
                  onChange={e => setNewTicket({...newTicket, description: e.target.value})} 
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 outline-none transition-all resize-none ${darkMode ? "bg-slate-950 border-slate-800 text-white focus:ring-indigo-500/50" : "bg-slate-50 border-slate-200 focus:ring-indigo-500/40"}`} 
                  placeholder="Provide details about your issue..."
                ></textarea>
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5">
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Chat / Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl h-[85vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            
            {/* Modal Header */}
            <div className={`p-5 border-b flex justify-between items-center ${darkMode ? "border-slate-800 bg-slate-900/80 backdrop-blur-md" : "border-slate-100 bg-white/80 backdrop-blur-md"}`}>
              <div>
                <h3 className={`text-base font-bold flex items-center gap-2 mb-0.5 ${darkMode ? "text-white" : "text-slate-900"}`}>
                  {selectedTicket.title}
                  <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider border ${selectedTicket.status === 'open' ? (darkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200") : (darkMode ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-500 border-slate-200")}`}>
                    {selectedTicket.status}
                  </span>
                </h3>
                <p className={`text-xs font-semibold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Opened on {new Date(selectedTicket.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className={`p-2 rounded-xl transition-colors ${darkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800"}`}>
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-5 ${darkMode ? "bg-slate-950/40" : "bg-slate-50/50"}`}>
              
              {/* Original Issue (Teacher Side = Right aligned) */}
              <div className="flex flex-col items-end w-full">
                <span className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 mr-2 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>You • Original Request</span>
                <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl rounded-tr-sm shadow-sm ${darkMode ? "bg-indigo-600 text-white shadow-indigo-500/20" : "bg-indigo-600 text-white shadow-indigo-500/20"}`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
                </div>
                <span className={`text-[10px] font-semibold mt-1.5 mr-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Replies */}
              {selectedTicket.replies?.map((reply: any, idx: number) => {
                const isTeacher = reply.senderRole === 'teacher';
                return (
                  <div key={idx} className={`flex flex-col w-full ${isTeacher ? 'items-end' : 'items-start'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isTeacher ? 'mr-2 text-indigo-400' : 'ml-2 text-slate-400'}`}>
                      {isTeacher ? 'You' : 'Admin Support'}
                    </span>
                    <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl shadow-sm ${
                      isTeacher 
                        ? (darkMode ? "bg-indigo-600 rounded-tr-sm text-white" : "bg-indigo-600 rounded-tr-sm text-white shadow-indigo-500/20") 
                        : (darkMode ? "bg-slate-800 rounded-tl-sm text-slate-200 border border-slate-700" : "bg-white border border-slate-200 text-slate-800")
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                    </div>
                    <span className={`text-[10px] font-semibold mt-1.5 ${isTeacher ? 'mr-2' : 'ml-2'} ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
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
                  placeholder="Type your message..." 
                  className={`flex-1 px-5 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${
                    darkMode ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 placeholder-slate-400"
                  }`} 
                />
                <button 
                  type="submit" 
                  disabled={!replyMessage.trim()}
                  className="flex items-center justify-center px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-500/20 transition-all"
                >
                  <Send size={20} className={replyMessage.trim() ? "translate-x-0.5" : ""} />
                </button>
              </form>
            ) : (
              <div className={`p-5 text-center text-sm font-bold border-t ${darkMode ? "border-slate-800 bg-slate-900/50 text-slate-500" : "border-slate-100 bg-slate-50/50 text-slate-400"}`}>
                <CheckCircle2 size={18} className="inline mr-1.5 mb-0.5" /> This ticket has been closed by the Admin.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyTicketsPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>}>
      <TicketContent />
    </Suspense>
  );
}