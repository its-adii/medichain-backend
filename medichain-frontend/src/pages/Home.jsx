import { useNavigate, Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Database, 
  Activity, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  HeartPulse, 
  Stethoscope, 
  ShieldAlert 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { motion } from "framer-motion";

function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated, redirect them directly to their dashboard
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "patient") {
        navigate("/dashboard", { replace: true });
      } else if (user.role === "doctor") {
        navigate("/doctor/dashboard", { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // If loading session, show animated splash spinner
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4 transition-colors duration-300">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <HeartPulse size={20} className="text-cyan-600 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 font-semibold animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  // Render Premium Landing Page
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen w-full bg-[#f8f9ff] dark:bg-[#060913] text-slate-900 dark:text-white overflow-x-hidden antialiased transition-colors duration-300"
    >
      
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow Effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/3 w-[350px] h-[250px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Chip */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/30 rounded-full text-xs font-black uppercase tracking-wider mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" /> Decentralized Healthcare Security
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl leading-[1.15]"
        >
          Healthcare Data, <br />
          <span className="bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">Secured by Blockchain</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mt-6 leading-relaxed"
        >
          A decentralized, secure ecosystem for medical patient records, automated consent sharing, and clinical doctor referrals. Fully HIPAA and SOC2 compliant.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto"
        >
          <Link
            to="/register"
            className="group px-8 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-sm rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>Register Secure Account</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 bg-white hover:bg-slate-50 dark:bg-slate-900/40 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center"
          >
            Access Portal
          </Link>
        </motion.div>

        {/* Floating Mockup Illustration */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-4xl mt-16 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/35 backdrop-blur-xl p-4 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-radial-gradient from-cyan-500/5 to-transparent pointer-events-none" />
          <div className="h-6 w-full flex items-center gap-1.5 px-2 mb-3 border-b border-slate-100 dark:border-slate-850">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <span className="text-[10px] text-slate-400 font-bold ml-2">secure.medichain.network/dashboard</span>
          </div>
          {/* Mock Dashboard Layout */}
          <div className="grid grid-cols-3 gap-4 p-4 text-left">
            <div className="col-span-3 md:col-span-1 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">Active Patient Node</span>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">Verified ID</p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold mt-2">
                  <ShieldCheck className="w-4 h-4" /> HIPAA Consent Active
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">Connected Nodes</span>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">12 Hospitals</p>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                  <div className="h-full w-3/4 bg-cyan-500 rounded-full" />
                </div>
              </div>
            </div>
            <div className="col-span-3 md:col-span-2 bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">Decentralized Vault Log</span>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between text-xs py-2 border-b border-slate-200/40 dark:border-slate-850">
                    <span className="font-semibold text-slate-700 dark:text-slate-350">Cardiology Referral Shared</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400">0x8B7C...41A2</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-2 border-b border-slate-200/40 dark:border-slate-850">
                    <span className="font-semibold text-slate-700 dark:text-slate-350">Consent Granted - Dr. Sarah Jenkins</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400">0xFA2C...9802</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-350">Lab Results Encrypted (AES-256)</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400">0x39AC...77BC</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-200/40 dark:border-slate-800 text-[11px] text-slate-450">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Real-time Blockchain ledger synchronization active
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. Stats Section */}
      <section className="bg-white dark:bg-slate-900/30 border-y border-slate-200/60 dark:border-slate-800/60 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-500">99.99%</p>
            <p className="text-xs sm:text-sm font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wide mt-2">Node Uptime</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-500">256-bit</p>
            <p className="text-xs sm:text-sm font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wide mt-2">AES Vault Encryption</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-500">SOC2</p>
            <p className="text-xs sm:text-sm font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wide mt-2">Security Audited</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-500">&lt; 1 sec</p>
            <p className="text-xs sm:text-sm font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wide mt-2">Record Sharing Sync</p>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Built for Clinical Reliability</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-4 max-w-xl mx-auto leading-relaxed">
            MediChain combines top-tier cryptographic protocols with an intuitive interface to streamline healthcare administration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm hover:border-cyan-500/55 dark:hover:border-cyan-500/40 transition-all duration-300">
            <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-950/40 rounded-2xl flex items-center justify-center mb-6 border border-cyan-100 dark:border-cyan-900/30 text-cyan-600 dark:text-cyan-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Cryptography Protected</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-3">
              Patient records are encrypted locally before being published. Access is restricted using asymmetric public-private key signatures.
            </p>
          </div>
          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm hover:border-cyan-500/55 dark:hover:border-cyan-500/40 transition-all duration-300">
            <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-950/40 rounded-2xl flex items-center justify-center mb-6 border border-cyan-100 dark:border-cyan-900/30 text-cyan-600 dark:text-cyan-400">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Immutable Audit Trails</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-3">
              Every data access request, physician referral, and record sync log is saved on an immutable ledger, satisfying security regulations.
            </p>
          </div>
          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm hover:border-cyan-500/55 dark:hover:border-cyan-500/40 transition-all duration-300">
            <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-950/40 rounded-2xl flex items-center justify-center mb-6 border border-cyan-100 dark:border-cyan-900/30 text-cyan-600 dark:text-cyan-400">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Frictionless Referrals</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-3">
              Physicians can securely request medical records and transfer case histories instantly, reducing administrative delays.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Workflow Section */}
      <section className="py-20 bg-slate-100/40 dark:bg-slate-950/40 border-y border-slate-200/40 dark:border-slate-900/60 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Getting Started Is Simple</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-4">
              Integrate with the secure health portal in three easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
            <div>
              <div className="w-10 h-10 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center mx-auto mb-6 text-sm">1</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Configure Identity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-3 max-w-xs mx-auto">
                Sign up as either a Patient or Doctor. Verify credentials through our encrypted KYC layer.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center mx-auto mb-6 text-sm">2</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sync Records</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-3 max-w-xs mx-auto">
                Patients upload records locally. Doctors configure their availability slots and consulting guidelines.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center mx-auto mb-6 text-sm">3</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Share Securely</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-3 max-w-xs mx-auto">
                Execute medical consent keys or book appointments directly with specialized verified physicians.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Call To Action Section */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-r from-cyan-600/10 to-indigo-600/10 dark:from-cyan-950/20 dark:to-indigo-950/20 border border-cyan-100/40 dark:border-cyan-900/30 rounded-[32px] p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-2xl" />
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Ready to secure your medical records?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto mt-4 leading-relaxed">
            Create your decentralized MediChain ID today and take complete control over your health profile access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 w-full sm:w-auto">
            <Link
              to="/register"
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-sm rounded-2xl shadow-md transition-all"
            >
              Sign Up Now
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 bg-white hover:bg-slate-50 dark:bg-slate-900/40 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-white font-bold text-sm rounded-2xl transition-all"
            >
              Access Account
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Footer Section */}
      <footer className="border-t border-slate-200/60 dark:border-slate-900 py-12 px-6 bg-white/40 dark:bg-slate-950/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-white" size={18} />
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Medi<span className="text-cyan-600 dark:text-cyan-500">Chain</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Decentralized medical data vaults & physician directory.</p>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-cyan-500" /> HIPAA Secure</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" /> SOC2 Verified</span>
            <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5 text-cyan-500" /> GDPR Compliant</span>
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-8 font-medium">
          &copy; {new Date().getFullYear()} MediChain. All rights reserved.
        </p>
      </footer>
    </motion.div>
  );
}

export default Home;
