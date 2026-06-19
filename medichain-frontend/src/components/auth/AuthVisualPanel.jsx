import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Key, CheckCircle2, Network, Stethoscope, Activity, Database, HeartPulse, Sparkles } from "lucide-react";
import dashboardHudBg from "../../assets/dashboard_hud_bg.png";

const CAROUSEL_ITEMS = [
  {
    title: "Secure Medical Data, Simplified.",
    description: "Enterprise-grade healthcare data management powered by blockchain technology for unparalleled security, transparency, and data sovereignty.",
    icon: Shield,
    badge: "Data Privacy"
  },
  {
    title: "Patient Consent Control.",
    description: "Granular access settings let patients manage exactly who has access to their records, when, and for how long, with complete audit logs.",
    icon: Key,
    badge: "Granular Access"
  },
  {
    title: "HIPAA & SOC2 Compliance.",
    description: "Strict alignment with health data guidelines ensuring audit trails, data encryption at rest and in transit, and complete privacy protections.",
    icon: CheckCircle2,
    badge: "Regulatory Guardrails"
  },
  {
    title: "Direct Doctor Handshakes.",
    description: "Frictionless referral systems and instantaneous record sharing between general practitioners and specialized consulting physicians.",
    icon: Network,
    badge: "Interoperable Sync"
  },
];

function AuthVisualPanel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const ActiveIcon = CAROUSEL_ITEMS[index].icon;

  return (
    <section className="hidden md:flex flex-1 relative bg-[#060913] flex-col justify-between p-12 overflow-hidden text-left border-r border-slate-900">
      
      {/* Premium Background Network Nodes Animation */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2.5s' }} />

        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Animated network lines */}
          <motion.line
            x1="10%" y1="20%" x2="30%" y2="40%"
            stroke="rgba(6, 182, 212, 0.2)"
            strokeWidth="1"
            animate={{ strokeDashoffset: [0, -40] }}
            style={{ strokeDasharray: "4 4" }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <motion.line
            x1="30%" y1="40%" x2="20%" y2="70%"
            stroke="rgba(99, 102, 241, 0.2)"
            strokeWidth="1.5"
          />
          <motion.line
            x1="20%" y1="70%" x2="50%" y2="60%"
            stroke="rgba(6, 182, 212, 0.25)"
            strokeWidth="1"
            animate={{ strokeDashoffset: [0, 40] }}
            style={{ strokeDasharray: "5 5" }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.line
            x1="50%" y1="60%" x2="60%" y2="20%"
            stroke="rgba(99, 102, 241, 0.2)"
            strokeWidth="1"
          />
          <motion.line
            x1="60%" y1="20%" x2="80%" y2="45%"
            stroke="rgba(6, 182, 212, 0.25)"
            strokeWidth="1.5"
          />
          <motion.line
            x1="80%" y1="45%" x2="90%" y2="80%"
            stroke="rgba(99, 102, 241, 0.15)"
            strokeWidth="1"
          />

          {/* Glowing node vertices */}
          <g>
            <circle cx="10%" cy="20%" r="2" fill="#22d3ee" className="animate-ping" style={{ animationDuration: "3s" }} />
            <circle cx="30%" cy="40%" r="3.5" fill="#6366f1" />
            <circle cx="20%" cy="70%" r="2.5" fill="#22d3ee" />
            <circle cx="50%" cy="60%" r="4" fill="#22d3ee" className="animate-pulse" />
            <circle cx="60%" cy="20%" r="3" fill="#6366f1" />
            <circle cx="80%" cy="45%" r="4" fill="#22d3ee" />
            <circle cx="90%" cy="80%" r="2" fill="#6366f1" className="animate-ping" style={{ animationDuration: "4s" }} />
          </g>
        </svg>
      </div>

      {/* Brand Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center rounded-2xl shadow-lg shadow-cyan-500/25">
            <Network className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">
            MediChain
          </span>
        </div>

        {/* Live system state tag */}
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest select-none">
            Nodes Online
          </span>
        </div>
      </div>

      {/* Main Content Carousel */}
      <div className="relative z-10 my-auto max-w-xl space-y-12">
        <div className="min-h-[160px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <ActiveIcon className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-black text-cyan-400 tracking-widest">
                  {CAROUSEL_ITEMS[index].badge}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-tight tracking-tight">
                {CAROUSEL_ITEMS[index].title}
              </h1>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                {CAROUSEL_ITEMS[index].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Indicators */}
        <div className="flex gap-2">
          {CAROUSEL_ITEMS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === index ? "w-8 bg-cyan-400" : "w-1.5 bg-slate-800 hover:bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Floating Widgets surrounding Mockup Card */}
        <div className="relative flex justify-center items-center py-4">
          <motion.div
            className="absolute p-4 bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 z-20"
            style={{ left: "-8%", top: "5%" }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-inner">
              <HeartPulse className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Data Stream</div>
              <div className="text-xs font-black text-white">72 BPM · Syncing</div>
            </div>
          </motion.div>

          <motion.div
            className="absolute p-4 bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 z-20"
            style={{ right: "-5%", bottom: "5%" }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner">
              <Stethoscope className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Practitioner</div>
              <div className="text-xs font-black text-white">Verified Node</div>
            </div>
          </motion.div>

          {/* Interactive Mockup Graphic Frame */}
          <motion.div
            whileHover={{ scale: 1.015, rotateX: 1, rotateY: -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-full max-w-sm rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900/40 backdrop-blur-xl p-1 relative group"
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <img
              className="w-full h-auto object-cover opacity-85 group-hover:opacity-95 transition-opacity rounded-xl"
              alt="MediChain Dashboard HUD"
              src={dashboardHudBg}
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-8 text-left z-10 pt-8 border-t border-white/5">
        <div>
          <div className="text-2xl font-black text-white tracking-tight flex items-center gap-1">
            99.99%
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div className="text-[9px] uppercase tracking-widest text-slate-500 font-black mt-0.5">
            Network Uptime
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-white tracking-tight">AES-256</div>
          <div className="text-[9px] uppercase tracking-widest text-slate-500 font-black mt-0.5">
            Data Encryption
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-white tracking-tight">HIPAA</div>
          <div className="text-[9px] uppercase tracking-widest text-slate-500 font-black mt-0.5">
            Compliance Audit
          </div>
        </div>
      </div>
    </section>
  );
}

export default AuthVisualPanel;
