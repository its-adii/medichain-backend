import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Trash2,
  Download,
  Plus,
  CalendarDays,
  Filter,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  ChevronDown,
  CalendarPlus
} from "lucide-react";
import api from "../../api/axios";
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

export default function AppointmentsTab({
  appointments,
  users,
  doctors,
  updatingApptStatusId,
  cancelConfirmId,
  setCancelConfirmId,
  clearingHistory,
  showClearHistoryConfirm,
  setShowClearHistoryConfirm,
  handleUpdateAppointmentStatus,
  handleClearHistory,
  apptSearch,
  setApptSearch,
  apptStatusFilter,
  setApptStatusFilter,
  apptPage,
  setApptPage,
  exportAppointmentsCSV,
  fetchAll
}) {
  // Add Appointment Modal Local States
  const [isAddApptModalOpen, setIsAddApptModalOpen] = useState(false);
  const [newApptPatient, setNewApptPatient] = useState("");
  const [newApptDoctor, setNewApptDoctor] = useState("");
  const [newApptDate, setNewApptDate] = useState("");
  const [newApptTime, setNewApptTime] = useState("");
  const [newApptReason, setNewApptReason] = useState("");
  const [addingAppt, setAddingAppt] = useState(false);
  const [addApptError, setAddApptError] = useState("");

  // Review Appointment Modal Local States
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  const allAppointments = appointments.map((a) => ({
    ...a,
    _id: a._id,
    patient: {
      name: a.patient?.name || "Patient",
      id: `PT-${(a._id || "").slice(-4).toUpperCase()}`,
      initial: (a.patient?.name || "P").slice(0, 2).toUpperCase(),
    },
    doctorName: formatDoctorName(a.doctor?.user?.name),
    specialization: a.doctor?.specialization || "General",
    type: a.reason || "Consultation",
    date: a.date ? new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    time: a.time || "—",
    status: a.status === "completed" ? "PAST" : (a.status === "confirmed" ? "ACTIVE" : (a.status === "cancelled" ? "CANCELLED" : "PENDING")),
    rawStatus: a.status,
  }));

  const filteredAppts = allAppointments.filter((a) => {
    const patientName = a.patient?.name || "";
    const doctorName = a.doctorName || "";
    const type = a.type || "";
    const status = a.status || "";
    const query = apptSearch.toLowerCase();
    const matchesSearch = patientName.toLowerCase().includes(query) ||
           doctorName.toLowerCase().includes(query) ||
           type.toLowerCase().includes(query) ||
           status.toLowerCase().includes(query);
    const matchesStatus = apptStatusFilter === "All" || status === apptStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const apptPageSize = 5;
  const paginatedAppts = filteredAppts.slice((apptPage - 1) * apptPageSize, apptPage * apptPageSize);
  const totalApptPages = Math.ceil(filteredAppts.length / apptPageSize) || 1;

  const selectedAppointment = allAppointments.find(a => a._id === selectedAppointmentId);

  async function handleAddAppointment(e) {
    e.preventDefault();
    setAddApptError("");
    setAddingAppt(true);
    try {
      await api.post("/appointments", {
        patientId: newApptPatient,
        doctorId: newApptDoctor,
        date: newApptDate,
        time: newApptTime,
        reason: newApptReason,
      });
      setNewApptPatient("");
      setNewApptDoctor("");
      setNewApptDate("");
      setNewApptTime("");
      setNewApptReason("");
      setIsAddApptModalOpen(false);
      fetchAll();
    } catch (err) {
      setAddApptError(err.response?.data?.message || "Failed to create appointment.");
    } finally {
      setAddingAppt(false);
    }
  }

  return (
    <motion.div
      key="appointments"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={designSystem.spacing.sectionGap}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={designSystem.typography.pageTitle}>Appointment Management</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium font-sans">Track and manage upcoming clinical sessions and patient history.</p>
        </div>
         <div className="flex items-center gap-3">
          {showClearHistoryConfirm ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 bg-rose-50 rounded-xl text-xs font-bold transition">
              <span className="text-rose-650 text-rose-600">Permanently clear history?</span>
              <button
                onClick={async () => {
                  await handleClearHistory();
                  setShowClearHistoryConfirm(false);
                }}
                disabled={clearingHistory}
                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center justify-center min-w-[28px] h-5"
              >
                {clearingHistory ? <Loader2 size={10} className="animate-spin inline" /> : "Yes"}
              </button>
              <button
                onClick={() => setShowClearHistoryConfirm(false)}
                className="px-2 py-0.5 border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold transition cursor-pointer h-5 flex items-center justify-center"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearHistoryConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-rose-200 hover:bg-rose-50 bg-white text-rose-600 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500 transition-transform duration-200 hover:scale-110" />
              Clear History
            </button>
          )}
          <button
            onClick={exportAppointmentsCSV}
            className={`${designSystem.components.buttonOutline} px-3.5 py-2 text-xs gap-1.5`}
          >
            <Download className="w-3.5 h-3.5 transition-transform duration-200 hover:scale-110" />
            Export List
          </button>
          <button
            onClick={() => { setAddApptError(""); setIsAddApptModalOpen(true); }}
            className={`${designSystem.components.buttonPrimary} px-3.5 py-2 text-xs gap-1.5`}
          >
            <Plus className="w-3.5 h-3.5 transition-transform duration-200 hover:scale-115" />
            New Appointment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Data Panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters Strip */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#e0f7fc]/70 border border-cyan-100 rounded-lg text-xs font-semibold text-cyan-700">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{filteredAppts.length} matching appointment{filteredAppts.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status</span>
              <select
                value={apptStatusFilter}
                onChange={(e) => setApptStatusFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-cyan-600 focus:ring-0 cursor-pointer outline-none"
              >
                <option value="All">All</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="PAST">Completed</option>
              </select>
            </div>
            <div className="flex-grow"></div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setApptSearch("");
                  setApptStatusFilter("All");
                }}
                className={`${designSystem.components.buttonOutline} px-3 py-1 text-xs`}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Appointments Table Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <table className={`${designSystem.components.table} table-fixed`}>
              <thead>
                <tr className={designSystem.components.tableHeaderRow}>
                  <th className="px-4 py-3.5 w-[18%]">Patient</th>
                  <th className="px-4 py-3.5 w-[18%]">Doctor</th>
                  <th className="px-4 py-3.5 w-[18%]">Reason</th>
                  <th className="px-4 py-3.5 w-[14%]">Date</th>
                  <th className="px-4 py-3.5 w-[12%]">Status</th>
                  <th className="px-4 py-3.5 w-[20%] text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-slate-100"
              >
                {paginatedAppts.map((a) => {
                  const initial = a.patient?.initial || "P";
                  const isCancelable = a.rawStatus === "pending" || a.rawStatus === "confirmed";
                  return (
                    <motion.tr
                      variants={rowVariants}
                      key={a._id}
                      className={designSystem.components.tableRow}
                    >
                      <td className={designSystem.components.tableCell}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{a.patient?.name}</p>
                            <p className="text-[10px] text-slate-450 font-medium mt-0.5">#{a.patient?.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className={designSystem.components.tableCell}>
                        <p className="font-bold text-slate-900 text-sm truncate">{a.doctorName}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">{a.specialization}</p>
                      </td>
                      <td className={designSystem.components.tableCell}>
                        <p className="text-xs font-semibold text-slate-700 truncate" title={a.type}>{a.type}</p>
                      </td>
                      <td className={designSystem.components.tableCell}>
                        <p className="font-bold text-slate-900 text-xs">{a.date}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{a.time}</p>
                      </td>
                      <td className={designSystem.components.tableCell}>
                        <span className={`${designSystem.components.badge} ${
                          a.status === "ACTIVE" ? designSystem.colors.status.confirmed :
                          a.status === "PENDING" ? designSystem.colors.status.pending :
                          a.status === "CANCELLED" ? designSystem.colors.status.flagged :
                          designSystem.colors.status.completed
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className={`${designSystem.components.tableCell} text-right`}>
                        {cancelConfirmId === a._id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-[10px] font-bold text-rose-600 whitespace-nowrap">Cancel?</span>
                            <button
                              onClick={async () => {
                                await handleUpdateAppointmentStatus(a._id, "cancelled");
                                setCancelConfirmId(null);
                              }}
                              disabled={updatingApptStatusId === a._id}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center justify-center min-w-[28px] h-5"
                            >
                              {updatingApptStatusId === a._id ? <Loader2 size={10} className="animate-spin" /> : "Yes"}
                            </button>
                            <button
                              onClick={() => setCancelConfirmId(null)}
                              className="px-2 py-0.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold transition cursor-pointer h-5 flex items-center justify-center"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {isCancelable && (
                              <button
                                onClick={() => setCancelConfirmId(a._id)}
                                disabled={updatingApptStatusId === a._id}
                                title="Cancel appointment"
                                className="p-1 hover:bg-rose-50 text-rose-600 rounded-lg transition disabled:opacity-40 cursor-pointer active:scale-[0.95]"
                              >
                                <XCircle className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedAppointmentId(a._id)}
                              className={`${designSystem.components.buttonOutline} px-2.5 py-1.5 text-[10px] font-bold shadow-sm cursor-pointer inline-flex rounded-lg h-7 items-center justify-center`}
                            >
                              Triage
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
                {paginatedAppts.length === 0 && (
                   <tr className="h-[100px]">
                     <td colSpan={6} className="px-4 py-12 text-center text-sm font-semibold text-slate-400 bg-white">
                       <div className="flex flex-col items-center justify-center py-6">
                         <CalendarDays className="w-10 h-10 text-slate-300 mb-2 animate-pulse" />
                         <p className="text-slate-700 font-bold text-sm">No Appointments Found</p>
                         <p className="text-xs text-slate-400 mt-1">No appointments match the filter criteria.</p>
                       </div>
                     </td>
                   </tr>
                 )}
              </motion.tbody>
            </table>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500">
                Showing {filteredAppts.length === 0 ? 0 : (apptPage - 1) * apptPageSize + 1} to {Math.min(apptPage * apptPageSize, filteredAppts.length)} of {filteredAppts.length} session{filteredAppts.length !== 1 ? "s" : ""}
              </p>
              
              <div className="flex items-center gap-1">
                <button
                  disabled={apptPage === 1}
                  onClick={() => setApptPage(prev => Math.max(1, prev - 1))}
                  className="p-1 hover:bg-slate-100 disabled:opacity-40 rounded-lg text-sm text-slate-600 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(totalApptPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = apptPage === pageNum;
                  return (
                    <button
                      key={`appt-page-${pageNum}`}
                      onClick={() => setApptPage(pageNum)}
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
                  disabled={apptPage === totalApptPages}
                  onClick={() => setApptPage(prev => Math.min(totalApptPages, prev + 1))}
                  className="p-1 hover:bg-slate-100 disabled:opacity-40 rounded-lg text-sm text-slate-600 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
        </div>
      </div>

      {/* Right Sidebar Stats Panel */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h4 className="font-bold text-sm text-slate-900 mb-4">Appointments Statistics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-medium text-slate-500">Active Sessions</span>
                <span className="text-xs font-bold text-slate-900">{allAppointments.filter(a => a.status === "ACTIVE").length}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-medium text-slate-500">Pending Verification</span>
                <span className="text-xs font-bold text-slate-900">{allAppointments.filter(a => a.status === "PENDING").length}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-medium text-slate-500">Completed Visits</span>
                <span className="text-xs font-bold text-slate-900">{allAppointments.filter(a => a.status === "PAST").length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-500">Cancelled Sessions</span>
                <span className="text-xs font-bold text-slate-900">{allAppointments.filter(a => a.status === "CANCELLED").length}</span>
              </div>
              <p className="text-xs font-medium text-slate-500 pt-2 border-t border-slate-100">Total: <span className="font-black text-slate-900">{allAppointments.length}</span> appointments tracked</p>
            </div>
          </section>

          {/* Health Tips Card */}
          <div className="rounded-2xl overflow-hidden relative h-48 group border border-slate-200 shadow-sm">
            <img alt="Clinical Environment" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400&h=200" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 to-transparent flex flex-col justify-end p-4">
              <h4 className="text-white font-bold text-sm">Clinical Best Practices</h4>
              <p className="text-white/80 text-xs mt-1">Learn about our updated patient intake protocol for faster check-ins.</p>
            </div>
          </div>
        </aside>
      </div>

      {/* ── APPOINTMENT REVIEW MODAL ── */}
      <AnimatePresence>
        {selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={designSystem.components.modalOverlay}
            onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedAppointmentId(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${designSystem.components.modalContent} max-w-lg mx-4`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Review Appointment</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">ID: {selectedAppointment._id}</p>
                </div>
                <button onClick={() => setSelectedAppointmentId(null)} className="p-1 hover:bg-slate-100 rounded-lg transition cursor-pointer active:scale-[0.95]" title="Close modal">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Status Badge */}
                <div className="flex justify-between items-center bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{selectedAppointment.status}</p>
                  </div>
                  <span className={`${designSystem.components.badge} ${
                    selectedAppointment.status === "ACTIVE" ? designSystem.colors.status.confirmed :
                    selectedAppointment.status === "PENDING" ? designSystem.colors.status.pending :
                    selectedAppointment.status === "CANCELLED" ? designSystem.colors.status.flagged :
                    designSystem.colors.status.completed
                  }`}>
                    {selectedAppointment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Name</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{selectedAppointment.patient?.name}</p>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctor Assigned</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{selectedAppointment.doctorName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                    <p className="text-xs font-bold text-slate-900 mt-1">{selectedAppointment.date}</p>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Slot</p>
                    <p className="text-xs font-bold text-slate-900 mt-1">{selectedAppointment.time}</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Reason for Visit</p>
                  <p className="text-xs text-slate-900 font-semibold mt-1 leading-relaxed">{selectedAppointment.reason}</p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                {selectedAppointment.rawStatus === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateAppointmentStatus(selectedAppointment._id, "cancelled")}
                      disabled={updatingApptStatusId === selectedAppointment._id}
                      className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition disabled:opacity-60 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateAppointmentStatus(selectedAppointment._id, "confirmed")}
                      disabled={updatingApptStatusId === selectedAppointment._id}
                      className={`${designSystem.components.buttonPrimary} px-5 py-2 text-xs`}
                    >
                      {updatingApptStatusId === selectedAppointment._id ? "Confirming..." : "Confirm Appointment"}
                    </button>
                  </>
                )}

                {selectedAppointment.rawStatus === "confirmed" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateAppointmentStatus(selectedAppointment._id, "cancelled")}
                      disabled={updatingApptStatusId === selectedAppointment._id}
                      className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition disabled:opacity-60 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateAppointmentStatus(selectedAppointment._id, "completed")}
                      disabled={updatingApptStatusId === selectedAppointment._id}
                      className="px-5 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-60 cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                      {updatingApptStatusId === selectedAppointment._id ? "Completing..." : "Complete Appointment"}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NEW APPOINTMENT MODAL ── */}
      <AnimatePresence>
        {isAddApptModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={designSystem.components.modalOverlay}
            onClick={() => setIsAddApptModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${designSystem.components.modalContent} max-w-lg mx-4`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-base">Schedule New Appointment</h3>
                <button onClick={() => setIsAddApptModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg transition cursor-pointer active:scale-[0.95]" title="Close modal">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleAddAppointment} className="p-6 space-y-4">
                {addApptError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-pulse">
                    <AlertCircle className="w-4 h-4" />
                    {addApptError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={designSystem.typography.label}>Patient</label>
                    <div className="relative">
                      <select
                        required
                        value={newApptPatient}
                        onChange={(e) => setNewApptPatient(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-sm font-medium focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition appearance-none cursor-pointer pr-10"
                      >
                        <option value="">Select patient...</option>
                        {users.filter(u => u.role === "patient").map(u => (
                          <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={designSystem.typography.label}>Doctor</label>
                    <div className="relative">
                      <select
                        required
                        value={newApptDoctor}
                        onChange={(e) => setNewApptDoctor(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-sm font-medium focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition appearance-none cursor-pointer pr-10"
                      >
                        <option value="">Select doctor...</option>
                        {doctors.map(d => (
                          <option key={d._id} value={d._id}>{d.user?.name || "Doctor"} — {d.specialization || "General"}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={designSystem.typography.label}>Date</label>
                    <input
                      type="date"
                      required
                      value={newApptDate}
                      onChange={(e) => setNewApptDate(e.target.value)}
                      className={designSystem.components.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={designSystem.typography.label}>Time</label>
                    <input
                      type="time"
                      required
                      value={newApptTime}
                      onChange={(e) => setNewApptTime(e.target.value)}
                      className={designSystem.components.input}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={designSystem.typography.label}>Reason for Visit</label>
                  <textarea
                    required
                    minLength={10}
                    value={newApptReason}
                    onChange={(e) => setNewApptReason(e.target.value)}
                    placeholder="Describe the reason for the appointment..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-sm font-medium focus:outline-none focus:border-cyan-650 focus:ring-4 focus:ring-cyan-100 transition resize-none outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddApptModalOpen(false)}
                    className={`${designSystem.components.buttonOutline} px-4 py-2 text-xs`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingAppt}
                    className={`${designSystem.components.buttonPrimary} px-6 py-2 text-xs gap-2`}
                  >
                    {addingAppt ? <Loader2 size={14} className="animate-spin" /> : <CalendarPlus className="w-4 h-4 transition-transform duration-200 hover:scale-110" />}
                    {addingAppt ? "Scheduling..." : "Schedule Appointment"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
