import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, MessageSquare, Phone, Mail, ChevronRight, X, Send, User, Bot, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const FAQS = [
  { q: "How do I cancel or reschedule my appointment?", a: "Go to the 'Appointments' tab in the top header or sidebar. Find your pending appointment and click the 'Cancel' button. You can then search for a new slot in the 'Find Doctors' section." },
  { q: "Will my insurance cover my upcoming consultation?", a: "Coverage parameters depend on your active plan. Standard co-pay and deductibles are tracked inside the 'Insurance' tab of the portal sidebar. We suggest confirming directly with BlueCross." },
  { q: "Where can I download my historical lab result documents?", a: "All clinical document uploads, blood panels, and imaging scan results are safely archived inside the 'Medical Records' vault page, accessible in the top header menu." }
];

function Support() {
  const { user } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { id: "msg-1", sender: "bot", text: "Hello! Welcome to MediChain Support. I am your automated assistant. How can I help you today?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: inputText
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = inputText.toLowerCase();
    setInputText("");
    setIsTyping(true);

    // Simulate smart bot response based on keywords
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "I've noted your concern. A representative will be connected if you require further assistance. Is there anything else I can help with?";
      
      if (query.includes("appointment") || query.includes("cancel") || query.includes("book") || query.includes("reschedule")) {
        replyText = "To manage your appointments, visit the 'Appointments' view. You can cancel pending bookings there, or search the 'Find Doctors' directory to schedule a new one.";
      } else if (query.includes("insurance") || query.includes("coverage") || query.includes("deductible") || query.includes("bluecross")) {
        replyText = "Under your active BlueCross plan, standard consultations are covered with co-pays automatically calculated. You can view claims under the 'Insurance' dashboard.";
      } else if (query.includes("record") || query.includes("lab") || query.includes("pdf") || query.includes("result") || query.includes("blood")) {
        replyText = "All reports finalized by doctors (such as prescriptions and lab orders) are stored inside the 'Medical Records' section. You can download and print them securely.";
      } else if (query.includes("hello") || query.includes("hi ") || query.includes("hey")) {
        replyText = `Hello ${user?.name || "there"}! Let me know if you have questions about appointments, bills, or medical documents.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-reply-${Date.now()}`,
          sender: "bot",
          text: replyText
        }
      ]);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-8 space-y-8 max-w-[1400px] mx-auto min-h-screen bg-slate-50"
    >
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Help Desk & Support
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          Resolve issues, consult our FAQ, or start a live support chat session.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Contact channels */}
        <div className="space-y-4 md:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Support Channels</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => setShowChat(true)}
                className="w-full flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                  <div className="w-9 h-9 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center">
                    <MessageSquare size={16} />
                  </div>
                  Live Assistant Chat
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </button>

              <a 
                href="tel:+18005550199"
                className="w-full flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                  <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                    <Phone size={16} />
                  </div>
                  1-800-555-0199
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </a>

              <a 
                href="mailto:support@medichain.com"
                className="w-full flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                  <div className="w-9 h-9 bg-[#e0f7fc] text-cyan-600 rounded-lg flex items-center justify-center">
                    <Mail size={16} />
                  </div>
                  support@medichain.com
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </a>
            </div>

          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm md:col-span-2 space-y-6">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Frequently Asked Questions</h3>
          
          <div className="space-y-6">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="space-y-2 border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="text-cyan-500 shrink-0 mt-0.5" size={16} />
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{faq.q}</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Support Drawer Modal */}
      <AnimatePresence>
        {showChat && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
            {/* Overlay background close click */}
            <div className="absolute inset-0" onClick={() => setShowChat(false)} />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-cyan-600" size={18} />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">MediChain Care Chat</span>
                </div>
                <button 
                  onClick={() => setShowChat(false)}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
                {messages.map((msg) => {
                  const isBot = msg.sender === "bot";
                  return (
                    <div key={msg.id} className={`flex items-start gap-3 ${!isBot && "flex-row-reverse"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${isBot ? "bg-cyan-600" : "bg-slate-800"}`}>
                        {isBot ? <Bot size={14} /> : <User size={14} />}
                      </div>
                      <div className={`p-3 rounded-2xl text-xs font-semibold max-w-[75%] leading-relaxed ${
                        isBot 
                          ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none" 
                          : "bg-cyan-600 text-white rounded-tr-none"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white shrink-0">
                      <Bot size={14} />
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-405 text-xs font-semibold rounded-tl-none flex items-center gap-1.5">
                      <Loader2 size={13} className="animate-spin text-cyan-600" />
                      Assistant is typing...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Footer */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your question (e.g. appointments)..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white text-xs font-semibold rounded-xl focus:outline-none focus:border-cyan-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl transition cursor-pointer"
                >
                  <Send size={15} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

export default Support;
