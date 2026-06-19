import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../Avatar";
import {
  Loader2,
  SlidersHorizontal,
  Plus,
  Clock,
  BadgeCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Info,
  History,
  X,
  Search
} from "lucide-react";
import { designSystem } from "../../styles/designSystem";

const formatDoctorName = (name) => {
  if (!name) return "Doctor";
  return name.trim().toLowerCase().startsWith("dr.") ? name : `Dr. ${name}`;
};

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

export default function DoctorsTab({
  doctors,
  verifyingId,
  flaggingId,
  handleToggleVerify,
  handleToggleFlag,
  doctorSearch,
  setDoctorSearch,
  doctorStatusFilter,
  setDoctorStatusFilter,
  doctorPage,
  setDoctorPage,
  setNewUserRole,
  setAddUserError,
  setIsAddUserModalOpen
}) {
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [showDoctorFilters, setShowDoctorFilters] = useState(false);

  // Derive selectedDoctor from doctors list to automatically keep in sync with parent updates
  const selectedDoctor = doctors.find(d => d._id === selectedDoctorId);

  const awaitingCount = doctors.filter(d => d.user && d.user.role === "doctor" && !d.isVerified).length;
  const activeCount = doctors.filter(d => d.user && d.user.role === "doctor" && d.isVerified).length;
  const flaggedCount = doctors.filter(d => d.user && d.user.role === "doctor" && d.isFlagged).length;

  const filteredDoctors = doctors.filter((d) => {
    if (!d.user || d.user.role !== "doctor") return false;

    const doctorName = d.user?.name || "";
    const doctorEmail = d.user?.email || "";
    const specialization = d.specialization || "";
    const matchesSearch = doctorName.toLowerCase().includes(doctorSearch.toLowerCase()) ||
           doctorEmail.toLowerCase().includes(doctorSearch.toLowerCase()) ||
           specialization.toLowerCase().includes(doctorSearch.toLowerCase());
    const matchesStatus =
      doctorStatusFilter === "All" ||
      (doctorStatusFilter === "Verified" && d.isVerified) ||
      (doctorStatusFilter === "Pending" && !d.isVerified && !d.isFlagged) ||
      (doctorStatusFilter === "Flagged" && d.isFlagged);

    return matchesSearch && matchesStatus;
  });

  const doctorPageSize = 5;
  const paginatedDoctors = filteredDoctors.slice((doctorPage - 1) * doctorPageSize, doctorPage * doctorPageSize);
  const totalDoctorPages = Math.ceil(filteredDoctors.length / doctorPageSize) || 1;

  return (
    <motion.div
      key="doctors"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={designSystem.spacing.sectionGap}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={designSystem.typography.pageTitle}>Doctor Verification</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Review and manage professional credentials for healthcare providers.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDoctorFilters((value) => !value)}
            className={`${designSystem.components.buttonOutline} px-3.5 py-2 text-xs gap-1.5`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 transition-transform duration-200 hover:rotate-12" />
            Filter
          </button>
          <button
            onClick={() => { setNewUserRole("doctor"); setAddUserError(""); setIsAddUserModalOpen(true); }}
            className={`${designSystem.components.buttonPrimary} px-3.5 py-2 text-xs gap-1.5`}
          >
            <Plus className="w-3.5 h-3.5 transition-transform duration-200 hover:scale-115" />
            Register New Doctor
          </button>
        </div>
      </div>

      {/* Verification stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          type="button"
          onClick={() => {
            setDoctorStatusFilter("Pending");
            setShowDoctorFilters(true);
          }}
          className="text-left bg-white border border-slate-200 border-l-4 border-l-amber-500 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <Clock className="w-9 h-9 p-2 bg-amber-50 text-amber-600 rounded-lg transition-transform duration-250 group-hover:scale-110" />
            <span className={`${designSystem.components.badge} ${designSystem.colors.status.pending}`}>Urgent</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 leading-none">{awaitingCount}</h3>
          <p className="text-xs text-slate-500 font-bold mt-2">Awaiting Verification</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setDoctorStatusFilter("Verified");
            setShowDoctorFilters(true);
          }}
          className="text-left bg-white border border-slate-200 border-l-4 border-l-emerald-500 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <BadgeCheck className="w-9 h-9 p-2 bg-emerald-50 text-emerald-600 rounded-lg transition-transform duration-250 group-hover:scale-110" />
            <span className={`${designSystem.components.badge} ${designSystem.colors.status.completed}`}>Total</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 leading-none">{activeCount.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 font-bold mt-2">Active Practitioners</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setDoctorStatusFilter("Flagged");
            setShowDoctorFilters(true);
          }}
          className="text-left bg-white border border-slate-200 border-l-4 border-l-rose-500 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <AlertTriangle className="w-9 h-9 p-2 bg-rose-50 text-rose-600 rounded-lg transition-transform duration-250 group-hover:scale-110" />
            <span className={`${designSystem.components.badge} ${designSystem.colors.status.flagged}`}>Warning</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 leading-none">{flaggedCount}</h3>
          <p className="text-xs text-slate-500 font-bold mt-2">Flagged Credentials</p>
        </button>
      </div>

      {showDoctorFilters && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <label className={designSystem.typography.label}>Credential Status</label>
            <select
              value={doctorStatusFilter}
              onChange={(e) => setDoctorStatusFilter(e.target.value)}
              className="min-w-40 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending only</option>
              <option value="Verified">Verified only</option>
              <option value="Flagged">Flagged only</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setDoctorStatusFilter("All");
              setDoctorSearch("");
            }}
            className={`${designSystem.components.buttonOutline} px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm`}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Credential Workspace */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className={designSystem.typography.sectionHeading}>Credentialing Workspace</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-amber-600 text-xs font-bold">Pending Priority</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className={designSystem.components.table}>
            <thead>
              <tr className={designSystem.components.tableHeaderRow}>
                <th className="px-6 py-4">Doctor Name</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4">Experience</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Toggle Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-slate-100"
            >
              {paginatedDoctors.map((d) => (
                <motion.tr
                  variants={rowVariants}
                  key={d._id}
                  className={`${designSystem.components.tableRow} ${(!d.isVerified && !d.isFlagged) ? "bg-amber-50/15 hover:bg-amber-50/35" : ""}`}
                >
                  <td className={`${designSystem.components.tableCell} flex items-center gap-3`}>
                    <Avatar
                      src={d.profileImage}
                      name={d.user?.name || "Doctor"}
                      className="w-8 h-8 border border-slate-200 text-[10px]"
                      alt={formatDoctorName(d.user?.name)}
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{formatDoctorName(d.user?.name)}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{d.user?.email || "—"}</p>
                    </div>
                  </td>
                  <td className={`${designSystem.components.tableCell} text-sm font-semibold text-slate-700`}>{d.specialization || "General"}</td>
                  <td className={`${designSystem.components.tableCell} text-xs font-medium text-slate-500`}>{d.experience != null ? `${d.experience} yrs` : "—"}</td>
                  <td className={designSystem.components.tableCell}>
                    {d.isVerified ? (
                      <span className={`${designSystem.components.badge} ${designSystem.colors.status.completed}`}>Verified</span>
                    ) : d.isFlagged ? (
                      <span className={`${designSystem.components.badge} ${designSystem.colors.status.flagged}`}>Flagged</span>
                    ) : (
                      <span className={`${designSystem.components.badge} ${designSystem.colors.status.pending}`}>Pending</span>
                    )}
                  </td>
                  <td className={designSystem.components.tableCell}>
                    <button
                      onClick={() => handleToggleVerify(d)}
                      disabled={verifyingId === d._id}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                        d.isVerified ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          d.isVerified ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                  <td className={`${designSystem.components.tableCell} text-right`}>
                    <button
                      onClick={() => setSelectedDoctorId(d._id)}
                      className={`${designSystem.components.buttonOutline} px-3 py-1.5 text-xs font-bold shadow-sm cursor-pointer inline-flex items-center gap-1.5 group`}
                    >
                      <History className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                      Review Credentials
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredDoctors.length === 0 && (
                <tr className="h-[100px]">
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-semibold text-slate-400 bg-white">
                    <div className="flex flex-col items-center justify-center py-6">
                      <Search className="w-10 h-10 text-slate-300 mb-2 animate-pulse" />
                      <p className="text-slate-700 font-bold text-sm">No Doctors Found</p>
                      <p className="text-xs text-slate-400 mt-1">No doctor credentials match the current filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500">
            Showing {filteredDoctors.length === 0 ? 0 : (doctorPage - 1) * doctorPageSize + 1} to {Math.min(doctorPage * doctorPageSize, filteredDoctors.length)} of {filteredDoctors.length} healthcare provider{filteredDoctors.length !== 1 ? "s" : ""}
          </p>
          
          <div className="flex items-center gap-1">
            <button
              disabled={doctorPage === 1}
              onClick={() => setDoctorPage(prev => Math.max(1, prev - 1))}
              className="p-1 hover:bg-slate-100 disabled:opacity-40 rounded-lg text-sm text-slate-600 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(totalDoctorPages)].map((_, i) => {
              const pageNum = i + 1;
              const isActive = doctorPage === pageNum;
              return (
                <button
                  key={`doctor-page-${pageNum}`}
                  onClick={() => setDoctorPage(pageNum)}
                  className={`w-6 h-6 text-xs font-bold rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={doctorPage === totalDoctorPages}
              onClick={() => setDoctorPage(prev => Math.min(totalDoctorPages, prev + 1))}
              className="p-1 hover:bg-slate-100 disabled:opacity-40 rounded-lg text-sm text-slate-600 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Verification Guide & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#e0f7fc]/50 p-5 rounded-2xl flex items-start gap-4 border border-cyan-100/50 shadow-sm group">
          <div className="p-2 bg-cyan-100/60 text-cyan-600 rounded-lg">
            <Info className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Verification Guide</h4>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Ensure all license numbers are cross-referenced with the National Provider Identifier (NPI) database. For doctors in pending status, check the "Review Credentials" panel for uploaded PDF certifications.
            </p>
            <a href="#doc-guide" className="inline-block mt-3 text-xs font-bold text-cyan-600 hover:underline transition-colors hover:text-cyan-700">View Full Documentation →</a>
          </div>
        </div>

        <div className="bg-[#e0f7fc]/50 p-5 rounded-2xl flex items-start gap-4 border border-cyan-100/50 shadow-sm group">
          <div className="p-2 bg-cyan-100/60 text-cyan-600 rounded-lg">
            <History className="w-5 h-5 transition-transform duration-200 group-hover:rotate-12" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-slate-900 mb-2">Recent Activity</h4>
            <div className="space-y-2 text-xs font-medium text-slate-500">
              {doctors.filter((d) => d.isFlagged).slice(0, 2).map((d) => (
                <div key={`flagged-${d._id}`} className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <span className="text-rose-600">{formatDoctorName(d.user?.name)} credentials flagged</span>
                  <span className="text-[10px] text-slate-400">Current</span>
                </div>
              ))}
              {doctors.filter((d) => d.isVerified).slice(0, 2).map((d) => (
                <div key={`verified-${d._id}`} className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <span>{formatDoctorName(d.user?.name)} verified</span>
                  <span className="text-[10px] text-slate-400">Current</span>
                </div>
              ))}
              {doctors.length === 0 && (
                <div className="flex justify-between items-center">
                  <span>No doctor records loaded.</span>
                  <span className="text-[10px] text-slate-400">Live</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── DOCTOR CREDENTIAL REVIEW MODAL ── */}
      <AnimatePresence>
        {selectedDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={designSystem.components.modalOverlay}
            onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedDoctorId(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${designSystem.components.modalContent} max-w-2xl mx-4`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Review Credentials</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">{formatDoctorName(selectedDoctor.user?.name)}</p>
                </div>
                <button onClick={() => setSelectedDoctorId(null)} className="p-1 hover:bg-slate-100 rounded-lg transition cursor-pointer active:scale-[0.95]" title="Close modal">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctor</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{formatDoctorName(selectedDoctor.user?.name)}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{selectedDoctor.user?.email || "No email on file"}</p>
                  </div>
                  <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedDoctor.isVerified ? (
                        <span className={`${designSystem.components.badge} ${designSystem.colors.status.completed}`}>Verified</span>
                      ) : (
                        <span className={`${designSystem.components.badge} ${designSystem.colors.status.pending}`}>Pending</span>
                      )}
                      {selectedDoctor.isFlagged && (
                        <span className={`${designSystem.components.badge} ${designSystem.colors.status.flagged}`}>Flagged</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specialization</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{selectedDoctor.specialization || "General"}</p>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{selectedDoctor.experience ?? 0} yrs</p>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fee</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">₹{selectedDoctor.fees ?? 0}</p>
                  </div>
                </div>

                <div className="bg-amber-500/40 border border-amber-200/60 rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-800">Credential documents</p>
                  <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">
                    No uploaded credential document field exists in the current doctor schema. This panel reviews the saved doctor profile data and supports verification and credential flagging.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleFlag(selectedDoctor)}
                  disabled={flaggingId === selectedDoctor._id}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition disabled:opacity-60 cursor-pointer border flex items-center gap-1.5 group ${
                    selectedDoctor.isFlagged
                      ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                      : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                  }`}
                >
                  {flaggingId === selectedDoctor._id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <AlertTriangle size={12} className="group-hover:scale-110 transition-transform duration-200" />
                  )}
                  {flaggingId === selectedDoctor._id ? "Updating..." : selectedDoctor.isFlagged ? "Clear Flag" : "Flag Credentials"}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleVerify(selectedDoctor)}
                  disabled={verifyingId === selectedDoctor._id}
                  className={`${designSystem.components.buttonPrimary} px-5 py-2 text-xs flex items-center gap-1.5 group`}
                >
                  {verifyingId === selectedDoctor._id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <BadgeCheck size={14} className="group-hover:scale-110 transition-transform duration-200" />
                  )}
                  {verifyingId === selectedDoctor._id ? "Updating..." : selectedDoctor.isVerified ? "Mark Pending" : "Verify Doctor"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
