"use client";

import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";
import { MessageSquare, Plus, X, Send, Clock, CheckCircle2, Loader2, User, Paperclip, FileText, ExternalLink, Image as ImageIcon } from "lucide-react";

function TicketContent() {
  const { darkMode } = useTheme();
  const searchParams = useSearchParams();
  const ticketIdParam = searchParams.get("ticketId");

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: "", description: "" });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyFile, setReplyFile] = useState<File | null>(null);

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
      const formData = new FormData();
      formData.append("title", newTicket.title);
      formData.append("description", newTicket.description);
      if (attachmentFile) {
        formData.append("attachment", attachmentFile);
      }

      await axios.post("http://localhost:5000/api/tickets", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setNewTicket({ title: "", description: "" });
      setAttachmentFile(null);
      setIsCreateModalOpen(false);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() && !replyFile) return;
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("message", replyMessage);
      if (replyFile) {
        formData.append("attachment", replyFile);
      }

      const res = await axios.post(`http://localhost:5000/api/tickets/${selectedTicket._id}/reply`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setSelectedTicket(res.data.ticket);
      setReplyMessage("");
      setReplyFile(null);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 font-sans ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50/80 text-slate-900"}`}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl shadow-sm ${darkMode ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-white text-indigo-600 border border-indigo-100 shadow-indigo-100"}`}>
              <MessageSquare size={24} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className={`text-xl sm:text-3xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                Support Tickets
              </h2>
              <p className={`mt-0.5 text-xs sm:text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Report issues or communicate directly with the administration.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={18} strokeWidth={2.5} /> Open New Ticket
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <Loader2 className="animate-spin text-indigo-500" size={38} />
            <span className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Loading your tickets...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className={`py-16 px-4 flex flex-col items-center justify-center text-center rounded-3xl border transition-colors ${darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200/80 shadow-sm"}`}>
            <div className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl mb-4 ${darkMode ? "bg-slate-800/80 text-slate-500" : "bg-indigo-50 text-indigo-400"}`}>
              <MessageSquare size={32} />
            </div>
            <h3 className={`text-base sm:text-lg font-bold mb-1 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>No Support Tickets Yet</h3>
            <p className={`text-xs sm:text-sm max-w-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              You haven't opened any support tickets. Click "Open New Ticket" above to get assistance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {tickets.map(ticket => (
              <div 
                key={ticket._id} 
                className={`group flex flex-col rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  darkMode ? "bg-slate-900/70 border-slate-800/80 hover:border-indigo-500/30" : "bg-white border-slate-200/80 shadow-sm hover:border-indigo-200"
                }`}
              >
                <div className="p-5 flex-1 flex flex-col">
                  
                  <div className="flex justify-between items-center mb-3.5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ticket.status === 'open' 
                        ? (darkMode ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border border-emerald-200") 
                        : (darkMode ? "bg-slate-800 text-slate-400 border border-slate-700" : "bg-slate-100 text-slate-500 border border-slate-200")
                    }`}>
                      {ticket.status}
                    </span>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
                      <Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className={`font-extrabold text-base leading-snug mb-2 line-clamp-2 ${darkMode ? "text-slate-100" : "text-slate-800"}`} title={ticket.title}>
                    {ticket.title}
                  </h3>
                  <p className={`text-xs mb-4 line-clamp-2 font-medium leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {ticket.description}
                  </p>
                  
                  {ticket.attachmentUrl && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 uppercase tracking-wide">
                        <Paperclip size={11} /> Attachment Included
                      </span>
                    </div>
                  )}

                  <div className={`mt-auto pt-3.5 flex items-center justify-between border-t ${darkMode ? "border-slate-800/80" : "border-slate-100"}`}>
                    <span className={`text-xs font-semibold ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
                      Conversation
                    </span>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      ticket.replies.length > 0 
                        ? (darkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-600") 
                        : (darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500")
                    }`}>
                      <MessageSquare size={12} /> {ticket.replies.length} {ticket.replies.length === 1 ? 'Reply' : 'Replies'}
                    </div>
                  </div>
                </div>
                
                <div className={`p-3.5 border-t flex items-center gap-2 ${darkMode ? "border-slate-800/80 bg-slate-900/40" : "border-slate-100 bg-slate-50/50"}`}>
                  <button 
                    onClick={() => setSelectedTicket(ticket)} 
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            
            <div className={`p-5 sm:p-6 border-b flex justify-between items-center ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
              <div>
                <h3 className={`text-lg sm:text-xl font-extrabold ${darkMode ? "text-white" : "text-slate-900"}`}>Open New Ticket</h3>
                <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Describe your issue to administration</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className={`p-2 rounded-xl transition-colors ${darkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800"}`}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTicket} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Subject / Title</label>
                <input 
                  required 
                  type="text" 
                  value={newTicket.title} 
                  onChange={e => setNewTicket({...newTicket, title: e.target.value})} 
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:ring-2 outline-none transition-all ${darkMode ? "bg-slate-950 border-slate-800 text-white focus:ring-indigo-500/50" : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/30 focus:border-indigo-500"}`} 
                  placeholder="What do you need help with?" 
                />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Description</label>
                <textarea 
                  required 
                  rows={4} 
                  value={newTicket.description} 
                  onChange={e => setNewTicket({...newTicket, description: e.target.value})} 
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:ring-2 outline-none transition-all resize-none ${darkMode ? "bg-slate-950 border-slate-800 text-white focus:ring-indigo-500/50" : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/30 focus:border-indigo-500"}`} 
                  placeholder="Provide details about your issue..."
                ></textarea>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Attach Image or Document (Optional)</label>
                <div className={`p-3 rounded-2xl border flex items-center gap-3 ${darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                  <Paperclip size={18} className="text-indigo-500 shrink-0" />
                  <input 
                    type="file" 
                    onChange={e => setAttachmentFile(e.target.files ? e.target.files[0] : null)} 
                    className={`w-full text-xs font-medium file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold ${darkMode ? "file:bg-slate-800 file:text-indigo-400 text-slate-400" : "file:bg-indigo-50 file:text-indigo-600 text-slate-500"}`} 
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5">
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Chat Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl h-[92vh] sm:h-[88vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            
            <div className={`p-4 sm:p-5 border-b flex justify-between items-center ${darkMode ? "border-slate-800 bg-slate-900/90 backdrop-blur-md" : "border-slate-100 bg-white/90 backdrop-blur-md"}`}>
              <div>
                <h3 className={`text-sm sm:text-base font-extrabold flex flex-wrap items-center gap-2 mb-0.5 ${darkMode ? "text-white" : "text-slate-900"}`}>
                  <span className="truncate max-w-[200px] sm:max-w-xs">{selectedTicket.title}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider border ${selectedTicket.status === 'open' ? (darkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200") : (darkMode ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-500 border-slate-200")}`}>
                    {selectedTicket.status}
                  </span>
                </h3>
                <p className={`text-[11px] sm:text-xs font-semibold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Opened on {new Date(selectedTicket.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className={`p-2 rounded-xl transition-colors ${darkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800"}`}>
                <X size={18} />
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 ${darkMode ? "bg-slate-950/50" : "bg-slate-50/50"}`}>
              
              <div className="flex flex-col items-end w-full">
                <span className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 mr-2 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>You • Original Request</span>
                <div className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-3xl rounded-tr-sm shadow-sm ${darkMode ? "bg-indigo-600 text-white shadow-indigo-500/20" : "bg-indigo-600 text-white shadow-indigo-500/20"}`}>
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
                  
                  {selectedTicket.attachmentUrl && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      {selectedTicket.attachmentType === 'image' ? (
                        <a href={`http://localhost:5000${selectedTicket.attachmentUrl}`} target="_blank" rel="noopener noreferrer">
                          <img src={`http://localhost:5000${selectedTicket.attachmentUrl}`} alt="Attachment" className="rounded-2xl max-h-48 w-full object-cover hover:opacity-95 transition-opacity" />
                        </a>
                      ) : (
                        <a href={`http://localhost:5000${selectedTicket.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-xs font-bold underline bg-white/10 p-3 rounded-2xl">
                          <span className="flex items-center gap-2"><FileText size={16} /> View Attached Document</span> <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-semibold mt-1.5 mr-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </span>
              </div>

              {selectedTicket.replies?.map((reply: any, idx: number) => {
                const isTeacher = reply.senderRole === 'teacher';
                return (
                  <div key={idx} className={`flex flex-col w-full ${isTeacher ? 'items-end' : 'items-start'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isTeacher ? 'mr-2 text-indigo-400' : 'ml-2 text-slate-400'}`}>
                      {isTeacher ? 'You' : 'Admin Support'}
                    </span>
                    <div className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-3xl shadow-sm ${
                      isTeacher 
                        ? (darkMode ? "bg-indigo-600 rounded-tr-sm text-white" : "bg-indigo-600 rounded-tr-sm text-white shadow-indigo-500/20") 
                        : (darkMode ? "bg-slate-800 rounded-tl-sm text-slate-200 border border-slate-700/80" : "bg-white border border-slate-200 text-slate-800 shadow-sm")
                    }`}>
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                      
                      {reply.attachmentUrl && (
                        <div className="mt-3 pt-3 border-t border-white/20">
                          {reply.attachmentType === 'image' ? (
                            <a href={`http://localhost:5000${reply.attachmentUrl}`} target="_blank" rel="noopener noreferrer">
                              <img src={`http://localhost:5000${reply.attachmentUrl}`} alt="Reply Attachment" className="rounded-2xl max-h-48 w-full object-cover hover:opacity-95 transition-opacity" />
                            </a>
                          ) : (
                            <a href={`http://localhost:5000${reply.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-xs font-bold underline bg-white/10 p-3 rounded-2xl">
                              <span className="flex items-center gap-2"><FileText size={16} /> View Attached Document</span> <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-semibold mt-1.5 ${isTeacher ? 'mr-2' : 'ml-2'} ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                      {new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                );
              })}
            </div>

            {selectedTicket.status === 'open' ? (
              <form onSubmit={handleReply} className={`p-3 sm:p-5 border-t flex flex-col gap-2.5 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"}`}>
                <div className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    value={replyMessage} 
                    onChange={e => setReplyMessage(e.target.value)} 
                    placeholder="Type your message..." 
                    className={`flex-1 px-4 py-3 rounded-2xl border text-xs sm:text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${
                      darkMode ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                    }`} 
                  />
                  <label className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-center shrink-0 ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"}`} title="Attach file">
                    <Paperclip size={18} />
                    <input type="file" onChange={e => setReplyFile(e.target.files ? e.target.files[0] : null)} className="hidden" />
                  </label>
                  <button 
                    type="submit" 
                    disabled={!replyMessage.trim() && !replyFile}
                    className="flex items-center justify-center px-4 sm:px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl shadow-md transition-all shrink-0"
                  >
                    <Send size={18} />
                  </button>
                </div>
                {replyFile && (
                  <div className="flex items-center justify-between text-xs px-3.5 py-2 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <span className="truncate">Attached: {replyFile.name}</span>
                    <button type="button" onClick={() => setReplyFile(null)} className="hover:text-red-400 ml-2"><X size={14} /></button>
                  </div>
                )}
              </form>
            ) : (
              <div className={`p-4 text-center text-xs sm:text-sm font-bold border-t ${darkMode ? "border-slate-800 bg-slate-900/50 text-slate-500" : "border-slate-100 bg-slate-50/50 text-slate-400"}`}>
                <CheckCircle2 size={16} className="inline mr-1.5 mb-0.5" /> This ticket has been closed by the Admin.
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