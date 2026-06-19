import { useState } from "react";
import { motion } from "framer-motion";
import { useDebounce } from "../../hooks/useDebounce";
import {
  Download,
  Search,
  X,
  CalendarDays,
  AlertCircle,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { designSystem } from "../../styles/designSystem";

const STATUS_STYLES = {
  pending: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", label: "PENDING" },
  confirmed: { bg: "bg-[#e0f7fc]", text: "text-cyan-600", border: "border-cyan-200", label: "ACTIVE" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", label: "PAST" },
  cancelled: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", label: "CANCELLED" },
};

const NEXT_STATUSES = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
};

const APPOINTMENT_TABS = ["all", "pending", "confirmed", "completed", "cancelled"];

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

function AppointmentsSection({
  appointments,
  filteredAppointments,
  loading,
  error,
  updatingId,
  counts,
  apptFilterTab,
  setApptFilterTab,
  apptSortOrder,
  setApptSortOrder,
  handleStatusChange,
  todayAppts,
  onStartConsultation,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const displayAppointments = filteredAppointments.filter((appt) => {
    const nameMatch = appt.patient?.name
      ?.toLowerCase()
      .includes((debouncedSearchQuery || "").toLowerCase());
    const dateMatch =
      !dateFilter ||
      new Date(appt.date).toISOString().split("T")[0] === dateFilter;
    return nameMatch && dateMatch;
  });

  return (
    <motion.div
      key="appointments"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h2 className={designSystem.typography.pageTitle}>
            Appointment Management
          </h2>
          <p className={`${designSystem.typography.body} mt-1`}>
            Track and manage upcoming clinical sessions and patient history.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => alert("Exporting appointment logs as CSV...")}
            className={`${designSystem.components.buttonOutline} w-full md:w-auto justify-center`}
          >
            <Download className="w-4 h-4 text-slate-700 shrink-0" />
            <span>Export List</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: list table */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* Filters band */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
            <div className="w-full lg:w-auto flex gap-1 overflow-x-auto pb-1 no-scrollbar">
              {APPOINTMENT_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setApptFilterTab(tab)}
                  className={`px-4 py-2 rounded-full font-bold text-xs capitalize whitespace-nowrap transition cursor-pointer border ${
                    apptFilterTab === tab
                      ? "bg-cyan-500 text-white border-cyan-500 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  {tab} ({counts[tab] || 0})
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 w-full sm:w-44 transition-all outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer active:scale-90 transition-transform"
                    title="Clear Search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Date Filter */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-slate-600">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-transparent border-none p-0 text-xs font-semibold outline-none cursor-pointer focus:ring-0 w-24 text-cyan-600"
                  />
                  {dateFilter && (
                    <button onClick={() => setDateFilter("")} className="text-slate-400 hover:text-rose-600 cursor-pointer active:scale-90 transition-transform shrink-0" title="Clear Date">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort Order */}
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-slate-500">Sort:</span>
                  <select
                    value={apptSortOrder}
                    onChange={(e) => setApptSortOrder(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-cyan-600 focus:ring-0 cursor-pointer outline-none py-0 pl-1 pr-6"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="recent">Recent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings log */}
          <div className={`${designSystem.colors.cardBg} rounded-xl shadow-sm overflow-hidden`}>
            {loading ? (
              <div className="divide-y divide-slate-100 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="px-4 py-4 flex items-center justify-between gap-4 bg-white">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-9 h-9 bg-slate-200 rounded-full shrink-0" />
                      <div className="space-y-2 flex-1 max-w-[120px]">
                        <div className="h-3 bg-slate-200 rounded w-full" />
                        <div className="h-2 bg-slate-200 rounded w-2/3" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2 hidden md:block max-w-[120px]">
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-2 bg-slate-200 rounded w-1/2" />
                    </div>
                    <div className="flex-1 space-y-2 max-w-[100px]">
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                      <div className="h-2 bg-slate-200 rounded w-1/2" />
                    </div>
                    <div className="h-5 bg-slate-200 rounded w-12 shrink-0" />
                    <div className="h-8 bg-slate-200 rounded w-20 shrink-0" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white">
                <AlertCircle className="w-10 h-10 mx-auto text-rose-500 mb-2 animate-bounce" />
                <p className="text-slate-900 font-bold">{error}</p>
              </div>
            ) : displayAppointments.length === 0 ? (
              <div className="text-center py-24 flex flex-col items-center justify-center bg-white">
                <Calendar className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
                <h3 className="font-bold text-slate-700 text-sm">No Appointments Found</h3>
                <p className="text-slate-500 font-semibold text-xs mt-1">
                  {searchQuery || dateFilter
                    ? "No appointments match your search/filters."
                    : apptFilterTab === "all"
                    ? "No bookings registered."
                    : `No appointments in ${apptFilterTab} status.`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
                  <thead>
                    <tr className={designSystem.components.tableHeaderRow}>
                      <th className="px-4 py-3.5 w-[24%] font-bold text-xs">Patient</th>
                      <th className="px-4 py-3.5 w-[20%] font-bold text-xs">Reason</th>
                      <th className="px-4 py-3.5 w-[16%] font-bold text-xs">Date</th>
                      <th className="px-4 py-3.5 w-[16%] font-bold text-xs">Status</th>
                      <th className="px-4 py-3.5 w-[24%] text-right font-bold text-xs">Actions</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-slate-100"
                  >
                    {[...displayAppointments]
                      .sort((a, b) => {
                        if (apptSortOrder === "upcoming") {
                          return new Date(a.date) - new Date(b.date);
                        } else {
                          return new Date(b.date) - new Date(a.date);
                        }
                      })
                      .map((appt) => {
                        const style = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
                        const isUpdating = updatingId === appt._id;
                        const initials = appt.patient?.name
                          ? appt.patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          : "PT";
                        return (
                          <motion.tr
                            variants={rowVariants}
                            key={appt._id}
                            className="hover:bg-slate-50/50 transition-colors group text-sm h-[64px]"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 text-xs truncate">
                                    {appt.patient?.name || "Unknown Patient"}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                                    {appt.patient?.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-xs font-semibold text-slate-700 truncate" title={appt.reason}>
                                {appt.reason || "Consultation"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                Clinical appointment
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900 text-xs">
                                {appt.date && !isNaN(new Date(appt.date).getTime())
                                  ? new Date(appt.date).toLocaleDateString("en-US", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "TBD"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {appt.time}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`${designSystem.components.badge} ${style.bg} ${style.text} ${style.border} inline-flex`}
                              >
                                {style.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => onStartConsultation(appt)}
                                  className={`${designSystem.components.buttonOutline} px-2 py-1 text-[10px] font-bold`}
                                  title="Clinical Consultation"
                                >
                                  <FileText className="w-3 h-3 text-slate-500" />
                                  Consult
                                </button>
                                
                                {appt.status === "pending" && (
                                  <button
                                    disabled={isUpdating}
                                    onClick={() => handleStatusChange(appt._id, "confirmed")}
                                    className="p-1 hover:bg-emerald-50 text-emerald-600 rounded-lg transition disabled:opacity-40 cursor-pointer active:scale-[0.95]"
                                    title="Confirm Appointment"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}

                                {(appt.status === "pending" || appt.status === "confirmed") && (
                                  <button
                                    disabled={isUpdating}
                                    onClick={() => handleStatusChange(appt._id, "cancelled")}
                                    className="p-1 hover:bg-rose-50 text-rose-600 rounded-lg transition disabled:opacity-40 cursor-pointer active:scale-[0.95]"
                                    title="Cancel Appointment"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
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

        {/* Right Sidebar panel */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Priority Queue list */}
          <div className={designSystem.components.card}>
            <div className="flex justify-between items-center mb-6 group">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-rose-500 transition-transform duration-200 group-hover:scale-110" />
                Today's Priority
              </h3>
              <span className={`${designSystem.components.badge} bg-rose-50 text-rose-600 border border-rose-200`}>
                {todayAppts.filter((a) => a.status === "pending" || a.status === "confirmed").length}{" "}
                Cases
              </span>
            </div>

            <div className="space-y-4">
              {todayAppts
                .filter((a) => a.status === "pending" || a.status === "confirmed")
                .map((appt) => (
                  <div
                    key={appt._id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden group cursor-pointer hover:shadow-sm transition-all"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-xs text-slate-900">{appt.patient?.name}</p>
                        <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mt-1">
                          {appt.status} booking
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{appt.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold line-clamp-2">{appt.reason}</p>
                  </div>
                ))}
              {todayAppts.filter((a) => a.status === "pending" || a.status === "confirmed").length ===
                0 && (
                <p className="text-xs text-slate-400 font-semibold italic text-center py-6">
                  No critical/active consults left today.
                </p>
              )}
            </div>
          </div>

          {/* Capacity Graph */}
          <div className={designSystem.components.card}>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Capacity Glance</h3>
            <div className="h-32 bg-slate-50 border border-slate-200 rounded-xl flex items-end gap-2 p-4">
              <div
                className="flex-1 bg-cyan-500/20 rounded-t h-[40%] hover:bg-cyan-500 transition-all cursor-pointer"
                title="Mon: 40%"
              ></div>
              <div
                className="flex-1 bg-cyan-500/40 rounded-t h-[65%] hover:bg-cyan-500 transition-all cursor-pointer"
                title="Tue: 65%"
              ></div>
              <div
                className="flex-1 bg-cyan-500/80 rounded-t h-[95%] hover:bg-cyan-500 transition-all cursor-pointer"
                title="Wed: 95%"
              ></div>
              <div
                className="flex-1 bg-cyan-500 rounded-t h-[80%] hover:bg-cyan-500 transition-all cursor-pointer"
                title="Thu: 80%"
              ></div>
              <div
                className="flex-1 bg-cyan-500/30 rounded-t h-[50%] hover:bg-cyan-500 transition-all cursor-pointer"
                title="Fri: 50%"
              ></div>
              <div
                className="flex-1 bg-slate-300 rounded-t h-[15%] hover:bg-cyan-500 transition-all cursor-pointer"
                title="Sat: 15%"
              ></div>
              <div
                className="flex-1 bg-slate-300 rounded-t h-[5%] hover:bg-cyan-500 transition-all cursor-pointer"
                title="Sun: 5%"
              ></div>
            </div>
            <div className="mt-4 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>
            <p className="mt-6 text-xs text-slate-400 font-semibold italic text-center">
              Consultation volumes peak mid-week.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AppointmentsSection;
