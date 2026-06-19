import { motion } from "framer-motion";
import { User, Stethoscope } from "lucide-react";

function RoleSelector({ role, onChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
        I am a...
      </label>
      <div className="relative grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-900/50 rounded-2xl">
        {/* Patient Option */}
        <button
          type="button"
          onClick={() => onChange("patient")}
          className={`relative z-10 py-3 text-xs font-extrabold rounded-xl transition-colors duration-200 outline-none select-none cursor-pointer flex items-center justify-center gap-2
            ${role === "patient" ? "text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
        >
          <User className="w-4 h-4" />
          <span>Patient</span>
        </button>

        {/* Doctor Option */}
        <button
          type="button"
          onClick={() => onChange("doctor")}
          className={`relative z-10 py-3 text-xs font-extrabold rounded-xl transition-colors duration-200 outline-none select-none cursor-pointer flex items-center justify-center gap-2
            ${role === "doctor" ? "text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor</span>
        </button>

        {/* Animated Background Slider */}
        <motion.div
          className="absolute top-1 bottom-1 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200/10 dark:border-slate-800/10"
          layout
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          style={{
            width: "calc(50% - 4px)",
            left: role === "patient" ? "4px" : "calc(50%)",
          }}
        />
      </div>
    </div>
  );
}

export default RoleSelector;
