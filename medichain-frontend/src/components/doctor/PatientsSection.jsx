import { motion } from "framer-motion";
import { ChevronRight, Users, Pill, Search } from "lucide-react";
import { designSystem } from "../../styles/designSystem";

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut"
    }
  }
};

function PatientsSection({ uniquePatients, selectedPatient, setSelectedPatient }) {
  return (
    <motion.div
      key="patients"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h2 className={designSystem.typography.pageTitle}>Patient Directory</h2>
          <p className={`${designSystem.typography.body} mt-1`}>
            Managing {uniquePatients.length} active patient records under your care.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedPatient(null)}
            className={designSystem.components.buttonOutline}
          >
            Reset Preview
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: List table */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className={`${designSystem.colors.cardBg} rounded-xl shadow-sm overflow-hidden bg-white`}>
            {uniquePatients.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center">
                <Users className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
                <p className="font-bold text-slate-700 text-sm">No Patients Found</p>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Patients booking sessions with you will be populated automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={designSystem.components.tableHeaderRow}>
                      <th className="px-6 py-4 font-bold text-xs">Patient Name</th>
                      <th className="px-6 py-4 font-bold text-xs">Patient ID / Status</th>
                      <th className="px-6 py-4 font-bold text-xs">Last Visit Date</th>
                      <th className="px-6 py-4 font-bold text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-slate-100"
                  >
                    {uniquePatients.map((pat) => {
                      const initials = pat.name
                        ? pat.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "PT";
                      const isSelected = selectedPatient?._id === pat._id;
                      return (
                        <motion.tr
                          variants={rowVariants}
                          key={pat._id}
                          onClick={() => setSelectedPatient(pat)}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer group text-sm h-[64px] ${
                            isSelected ? "bg-slate-50" : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 text-cyan-600 flex items-center justify-center font-bold text-xs shrink-0">
                                {initials}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                                  {pat.name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                  {pat.gender} • {pat.age} yrs
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-slate-500">{pat.idCode}</p>
                            <span
                              className={`${designSystem.components.badge} mt-1 ${
                                pat.latestStatus === "cancelled"
                                  ? "bg-rose-50 text-rose-600 border-rose-200"
                                  : pat.latestStatus === "pending"
                                  ? "bg-amber-50 text-amber-600 border-amber-200"
                                  : "bg-emerald-50 text-emerald-600 border-emerald-200"
                              }`}
                            >
                              {pat.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900 text-xs">
                              {pat.lastVisitDate && !isNaN(new Date(pat.lastVisitDate).getTime())
                                ? new Date(pat.lastVisitDate).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "TBD"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[120px]">
                              {pat.lastVisitReason}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatient(pat);
                              }}
                              className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-slate-100 rounded-lg transition cursor-pointer active:scale-[0.95]"
                            >
                              <ChevronRight size={18} />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </motion.tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: preview sidebar card */}
        <div className="col-span-12 lg:col-span-4">
          {selectedPatient ? (
            <div className={`${designSystem.components.card} sticky top-[100px] transition-all bg-white`}>
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 border-4 border-slate-200 flex items-center justify-center text-cyan-600 font-bold text-2xl mb-4 shrink-0 shadow-sm">
                  {selectedPatient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {selectedPatient.name}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Patient ID: {selectedPatient.idCode}</p>
              </div>

              {/* stats */}
              <div className="grid grid-cols-3 gap-2 mt-6">
                <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-200">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Age</p>
                  <p className="font-bold text-xs text-cyan-600 mt-1">{selectedPatient.age}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-200">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Blood</p>
                  <p className="font-bold text-xs text-cyan-600 mt-1">{selectedPatient.blood}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-200">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Weight</p>
                  <p className="font-bold text-xs text-cyan-600 mt-1">{selectedPatient.weight}</p>
                </div>
              </div>

              {/* Treatment card */}
              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h4 className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    Last Consultation
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {selectedPatient.lastVisitDate && !isNaN(new Date(selectedPatient.lastVisitDate).getTime())
                      ? new Date(selectedPatient.lastVisitDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : "TBD"}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 group">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-[#e0f7fc] text-cyan-600 rounded-lg shrink-0 border border-cyan-200">
                      <Pill className="w-4 h-4 block transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900">Standard Consultation</p>
                      <p className="text-[11px] text-slate-500 font-semibold mt-1 truncate">
                        {selectedPatient.lastVisitReason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-6 border-t border-slate-200 mt-6">
                <button
                  onClick={() =>
                    alert(`Opening medical report log files for ${selectedPatient.name}...`)
                  }
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg font-bold text-xs transition cursor-pointer active:scale-[0.98]"
                >
                  Medical Log
                </button>
                <button
                  onClick={() =>
                    alert(`Opening patient consultation interface for ${selectedPatient.name}...`)
                  }
                  className="w-full py-2 bg-cyan-500 text-white hover:bg-cyan-600 rounded-lg font-bold text-xs transition shadow-sm cursor-pointer active:scale-[0.98]"
                >
                  Patient Portal
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 py-24 sticky top-[100px] shadow-sm">
              <Search className="w-8 h-8 mx-auto mb-4 text-slate-300 animate-pulse" />
              <p className="font-bold text-slate-700 text-sm">Select a Patient</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Click any row in the directory list to display full clinical records preview.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default PatientsSection;
