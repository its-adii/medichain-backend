import { useState, useEffect, useMemo } from "react";
import { useSocket } from "../context/SocketContext";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../components/Avatar";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Stethoscope,
  IndianRupee,
  RefreshCw,
  Activity,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  X,
  Video,
  FileText,
} from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import { designSystem } from "../styles/designSystem";

const STATUS_STYLES = {
  pending:   { bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-200",  label: "Pending"   },
  confirmed: { bg: "bg-[#e0f7fc]",   text: "text-cyan-600",   border: "border-cyan-200",   label: "Confirmed" },
  completed: { bg: "bg-emerald-50",  text: "text-emerald-600",  border: "border-emerald-200",  label: "Completed" },
  cancelled: { bg: "bg-rose-50", text: "text-rose-600",  border: "border-rose-200",  label: "Cancelled" },
};

const containerVariants = {
  hidden: { opacity: 0 },
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
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

function Appointments() {
  const socket = useSocket();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("upcoming");
  const [selectedApptForModal, setSelectedApptForModal] = useState(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Reset page to 1 when filters or tabs change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearchQuery, dateFilter]);

  async function fetchAppointments(silent = false) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const res = await api.get("/appointments/my");
      setAppointments(res.data.appointments);
    } catch {
      setError("Failed to load appointments.");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleAppointmentsUpdated = () => {
      console.log("Appointments updated. Refreshing appointments list...");
      fetchAppointments(true);
    };

    socket.on("appointmentsUpdated", handleAppointmentsUpdated);

    return () => {
      socket.off("appointmentsUpdated", handleAppointmentsUpdated);
    };
  }, [socket]);

  async function handleCancel(id) {
    if (!window.confirm("Cancel this appointment?")) return;
    setCancellingId(id);
    try {
      await api.patch(`/appointments/${id}/status`, { status: "cancelled" });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "cancelled" } : a))
      );
    } catch {
      alert("Failed to cancel.");
    } finally {
      setCancellingId(null);
    }
  }

  const counts = useMemo(() => ({
    all: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  }), [appointments]);

  const filtered = useMemo(() => {
    return appointments
      .filter((appt) => {
        const matchesTab = activeTab === "all" || appt.status === activeTab;
        const matchesSearch = !debouncedSearchQuery || 
          appt.doctor?.user?.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          appt.doctor?.specialization?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
        const matchesDate = !dateFilter || 
          (appt.date && new Date(appt.date).toISOString().split("T")[0] === dateFilter);
        return matchesTab && matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        if (sortOrder === "upcoming") {
          return new Date(a.date) - new Date(b.date);
        } else {
          return new Date(b.date) - new Date(a.date);
        }
      });
  }, [appointments, activeTab, debouncedSearchQuery, dateFilter, sortOrder]);

  const nextAppt = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const upcoming = appointments.filter((a) => {
      if (a.status !== "confirmed" && a.status !== "pending") return false;
      if (!a.date) return false;
      const apptDateStr = new Date(a.date).toISOString().split("T")[0];
      return apptDateStr >= todayStr;
    });

    if (upcoming.length === 0) return null;

    return [...upcoming].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      return (a.time || "").localeCompare(b.time || "");
    })[0];
  }, [appointments]);

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedAppointments = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const TABS = ["all", "pending", "confirmed", "completed", "cancelled"];

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 bg-slate-50 transition-colors duration-300 min-h-screen"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Manage Appointments list */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className={designSystem.typography.pageTitle}>
                  My Appointments
                </h1>
                <p className={`${designSystem.typography.body} mt-1`}>
                  View and manage all your scheduled visits.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => fetchAppointments()}
                  className={designSystem.components.buttonOutline}
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
                <Link
                  to="/doctors"
                  className={designSystem.components.buttonPrimary}
                >
                  <Stethoscope size={16} />
                  Find a Doctor
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap capitalize transition-all cursor-pointer border ${
                    activeTab === tab
                      ? "bg-cyan-500 text-white border-cyan-500 shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tab} ({counts[tab]})
                </button>
              ))}
            </div>

            {/* Filters Strip */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                {/* Search Input */}
                <div className="relative flex-grow max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search practitioner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 w-full transition-all outline-none"
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

                {/* Date Picker */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-transparent border-none p-0 text-xs font-bold outline-none cursor-pointer focus:ring-0 w-24 text-cyan-600"
                  />
                  {dateFilter && (
                    <button onClick={() => setDateFilter("")} className="text-slate-400 hover:text-rose-600 cursor-pointer active:scale-90 transition-transform" title="Clear Date">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sort Order Dropdown */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs font-semibold text-slate-500">Sort:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-cyan-600 hover:text-cyan-700 focus:ring-0 cursor-pointer outline-none py-0 pl-1 pr-6"
                >
                  <option value="upcoming">Upcoming First</option>
                  <option value="recent">Recent First</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-slate-200 rounded-2xl shrink-0" />
                      <div className="space-y-2 flex-1 max-w-[200px]">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
                      <div className="h-5 bg-slate-200 rounded w-16" />
                      <div className="h-4 bg-slate-200 rounded w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-red-200">
                <AlertCircle size={40} className="text-rose-500 mx-auto mb-4 animate-bounce" />
                <p className="text-slate-700 font-bold">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
                <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-slate-700 mb-2">No appointments</h3>
                <p className="text-xs font-semibold text-slate-400 mb-6">
                  {activeTab === "all" ? "You haven't booked any appointments yet." : `No ${activeTab} appointments.`}
                </p>
                <Link
                  to="/doctors"
                  className={designSystem.components.buttonPrimary + " inline-flex max-w-fit mx-auto"}
                >
                  <Stethoscope size={16} />
                  Book Now
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_25px_rgb(0,0,0,0.01)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
                    <thead>
                      <tr className={designSystem.components.tableHeaderRow}>
                        <th className="px-4 py-3.5 w-[28%] font-bold text-[10px] uppercase tracking-wider">Practitioner</th>
                        <th className="px-4 py-3.5 w-[18%] font-bold text-[10px] uppercase tracking-wider">Visit Type</th>
                        <th className="px-4 py-3.5 w-[20%] font-bold text-[10px] uppercase tracking-wider">Date &amp; Time</th>
                        <th className="px-4 py-3.5 w-[16%] font-bold text-[10px] uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3.5 w-[18%] text-right font-bold text-[10px] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <AnimatePresence mode="wait">
                      <motion.tbody
                        key={activeTab + "_" + currentPage}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0 }}
                        className="divide-y divide-slate-100"
                      >
                        {paginatedAppointments.map((appt) => {
                          const style = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
                          const isCancelling = cancellingId === appt._id;
                          return (
                            <motion.tr
                              variants={rowVariants}
                              key={appt._id}
                              className="hover:bg-slate-50/40 transition-colors border-b border-slate-100 text-sm h-[72px]"
                            >
                              {/* Column 1: Practitioner */}
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3 min-w-0">
                                  <Avatar
                                    src={appt.doctor?.profileImage}
                                    name={appt.doctor?.user?.name || "Dr"}
                                    className="w-10 h-10 rounded-xl shadow-sm border border-slate-200 shrink-0 text-xs"
                                    alt="Doctor"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 text-xs truncate">
                                      {appt.doctor?.user?.name ? (appt.doctor.user.name.toLowerCase().startsWith("dr.") ? appt.doctor.user.name : `Dr. ${appt.doctor.user.name}`) : "Unknown Doctor"}
                                    </p>
                                    <p className="text-[10px] text-cyan-600 font-bold tracking-wider uppercase mt-0.5 truncate">
                                      {appt.doctor?.specialization}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Column 2: Visit Type */}
                              <td className="px-4 py-3.5">
                                <span className="font-semibold text-slate-700 text-xs">
                                  {appt.doctor?.user?.role === "doctor" ? "Consultation" : (appt.reason && appt.reason.toLowerCase().includes("virtual") ? "Virtual Visit" : "In-Person")}
                                </span>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 italic truncate max-w-[120px]" title={appt.reason}>
                                  {appt.reason}
                                </p>
                              </td>

                              {/* Column 3: Date & Time */}
                              <td className="px-4 py-3.5">
                                <p className="font-bold text-slate-900 text-xs">
                                  {appt.date && !isNaN(new Date(appt.date).getTime())
                                    ? new Date(appt.date).toLocaleDateString("en-IN", {
                                        day: "numeric", month: "short", year: "numeric"
                                      })
                                    : "TBD"}
                                </p>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                                  <Clock size={11} className="text-slate-400" />
                                  {appt.time}
                                </p>
                              </td>

                              {/* Column 4: Status */}
                              <td className="px-4 py-3.5">
                                <span className={`${designSystem.components.badge} ${style.bg} ${style.text} ${style.border} inline-flex`}>
                                  {style.label}
                                </span>
                              </td>

                              {/* Column 5: Actions */}
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {appt.status === "pending" && (
                                    <button
                                      onClick={() => handleCancel(appt._id)}
                                      disabled={isCancelling}
                                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center gap-1 ml-auto"
                                    >
                                      {isCancelling ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
                                      Cancel
                                    </button>
                                  )}

                                  {appt.status === "confirmed" && (
                                    <>
                                      {appt.reason && appt.reason.toLowerCase().includes("virtual") ? (
                                        <button
                                          onClick={() => alert("Mock Interaction: Entering virtual telehealth consultation room...")}
                                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-cyan-600 bg-[#e0f7fc] border border-cyan-100 hover:bg-cyan-100 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1"
                                        >
                                          <Video size={11} />
                                          Join
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => alert(`Directions: MediChain Central Clinic address is Cardiothoracic Wing, Level 3. Please show appointment ID: ${appt._id.substring(18)} at reception.`)}
                                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1"
                                        >
                                          <MapPin size={11} />
                                          Directions
                                        </button>
                                      )}
                                      
                                      <button
                                        onClick={() => handleCancel(appt._id)}
                                        disabled={isCancelling}
                                        className="px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
                                        title="Cancel Appointment"
                                      >
                                        {isCancelling ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
                                      </button>
                                    </>
                                  )}

                                  {appt.status === "completed" && (
                                    <button
                                      onClick={() => setSelectedApptForModal(appt)}
                                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1 ml-auto"
                                    >
                                      <FileText size={11} />
                                      Summary
                                    </button>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </motion.tbody>
                    </AnimatePresence>
                  </table>
                </div>

                {/* Bottom Pagination Strip */}
                {filtered.length > ITEMS_PER_PAGE && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} appointments
                    </span>
                    <div className="flex gap-1 items-center">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer active:scale-90 transition-transform"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      
                      {[...Array(totalPages)].map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                            currentPage === idx + 1
                              ? "bg-cyan-500 text-white"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer active:scale-90 transition-transform"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Spotlight Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Spotlight Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">
                <Activity size={16} className="text-cyan-600 animate-pulse" />
                Next Session Spotlight
              </h3>

              {nextAppt ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={nextAppt.doctor?.profileImage}
                      name={nextAppt.doctor?.user?.name || "Dr"}
                      className="w-11 h-11 rounded-xl shadow-sm border border-slate-200 text-xs"
                      alt="Doctor"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate">
                        Dr. {nextAppt.doctor?.user?.name}
                      </h4>
                      <p className="text-[10px] text-cyan-600 font-bold tracking-wider uppercase mt-0.5">
                        {nextAppt.doctor?.specialization}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3.5 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                      <Calendar size={13} className="text-cyan-600" />
                      <span>
                        {new Date(nextAppt.date).toLocaleDateString("en-IN", {
                          weekday: "short", day: "numeric", month: "short", year: "numeric"
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                      <Clock size={13} className="text-cyan-600" />
                      <span>{nextAppt.time}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-600 font-semibold">
                      <MapPin size={13} className="text-cyan-600 shrink-0 mt-0.5" />
                      <span>
                        {nextAppt.reason && nextAppt.reason.toLowerCase().includes("virtual")
                          ? "Online Video Call"
                          : "MediChain Central Clinic"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-cyan-50/20 border border-cyan-100 rounded-xl text-[10px] text-slate-500 leading-relaxed">
                    <p className="font-bold text-cyan-600 mb-0.5 capitalize">Status: {nextAppt.status}</p>
                    {nextAppt.status === "pending"
                      ? "Pending provider approval. We will notify you as soon as the status updates."
                      : "Confirmed. The consultation room link will be active 5 minutes prior to your slot."}
                  </div>

                  <button
                    onClick={() =>
                      nextAppt.reason && nextAppt.reason.toLowerCase().includes("virtual")
                        ? alert("Mock Interaction: Telehealth consultation room starting...")
                        : alert(`MediChain Central Clinic directions loaded. Please arrive 10 minutes early at Reception desk with appointment ID: ${nextAppt._id.substring(18)}`)
                    }
                    className={`${designSystem.components.buttonPrimary} w-full py-2.5 text-xs flex items-center justify-center gap-1.5`}
                  >
                    {nextAppt.reason && nextAppt.reason.toLowerCase().includes("virtual")
                      ? "Join Telehealth Room"
                      : "View Clinic Directions"}
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 animate-in fade-in duration-300">
                  <Calendar size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-700 font-bold text-xs">No Upcoming Visits</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1 mb-4 leading-normal max-w-[200px] mx-auto">
                    You do not have any pending or confirmed appointments at this moment.
                  </p>
                  <Link
                    to="/doctors"
                    className={designSystem.components.buttonPrimary + " w-full py-2 flex items-center justify-center gap-1.5 text-xs"}
                  >
                    <Stethoscope size={13} />
                    Schedule a Visit
                  </Link>
                </div>
              )}
            </div>

            {/* Safety Notice Shell */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold mb-2">Notice &amp; Procedures</h3>
              <p className="text-xs text-slate-350 leading-relaxed">
                Please make sure to join virtual appointments 5 minutes in advance. Bring necessary medical reports for in-person appointments.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Consultation Summary Modal */}
      <AnimatePresence>
        {selectedApptForModal && (
          <div className={designSystem.components.modalOverlay}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden border border-slate-200"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">Consultation Summary</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    With Dr. {selectedApptForModal.doctor?.user?.name} on {new Date(selectedApptForModal.date).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApptForModal(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[450px] overflow-y-auto scrollbar-thin">
                {/* Visit info */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-semibold">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Specialization</p>
                    <p className="text-slate-800 font-bold">{selectedApptForModal.doctor?.specialization}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Consultation Fee</p>
                    <p className="text-slate-800 font-bold">₹{selectedApptForModal.doctor?.fees}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Visit Type</p>
                    <p className="text-slate-800 font-bold">
                      {selectedApptForModal.reason && selectedApptForModal.reason.toLowerCase().includes("virtual")
                        ? "Virtual Video Call"
                        : "In-Person Visit"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Reason for Visit</p>
                    <p className="text-slate-800 font-bold truncate max-w-[200px]" title={selectedApptForModal.reason}>
                      {selectedApptForModal.reason}
                    </p>
                  </div>
                </div>

                {/* Clinical Notes */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Notes</h4>
                  <div className="p-4 bg-[#e0f7fc]/5 border border-slate-200 rounded-xl text-xs leading-relaxed text-slate-700 font-semibold whitespace-pre-line">
                    {selectedApptForModal.clinicalNotes || "No clinical diagnostic notes have been uploaded for this session yet."}
                  </div>
                </div>

                {/* Prescriptions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prescribed Medications</h4>
                  {selectedApptForModal.prescriptions && selectedApptForModal.prescriptions.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-450 font-bold">
                            <th className="px-4 py-2.5">Medicine</th>
                            <th className="px-4 py-2.5">Dosage</th>
                            <th className="px-4 py-2.5">Duration</th>
                            <th className="px-4 py-2.5 text-right">Refills</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {selectedApptForModal.prescriptions.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/20">
                              <td className="px-4 py-2.5 font-bold text-slate-900">{p.medicineName}</td>
                              <td className="px-4 py-2.5">{p.dosage}</td>
                              <td className="px-4 py-2.5">{p.duration}</td>
                              <td className="px-4 py-2.5 text-right">{p.refillable ? "Yes" : "No"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50/50 border border-slate-150 border-dashed rounded-xl text-center text-xs text-slate-400 font-semibold">
                      No prescription medicines have been issued for this session.
                    </div>
                  )}
                </div>

                {/* Lab Orders */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lab Orders</h4>
                  {selectedApptForModal.labOrders && selectedApptForModal.labOrders.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedApptForModal.labOrders.map((lab, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-150 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          <CheckCircle size={13} />
                          {lab.testName}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50/50 border border-slate-150 border-dashed rounded-xl text-center text-xs text-slate-400 font-semibold">
                      No diagnostic lab test orders were requested.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end">
                <button
                  onClick={() => setSelectedApptForModal(null)}
                  className={designSystem.components.buttonSecondary}
                >
                  Close Summary
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

export default Appointments;
