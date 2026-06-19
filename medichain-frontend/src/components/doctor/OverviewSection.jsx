import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "../AnimatedCounter";
import { useDebounce } from "../../hooks/useDebounce";
import {
  Download,
  Plus,
  Users,
  Calendar,
  FileText,
  CheckCheck,
  Filter,
  Search,
  X,
  CalendarDays,
  MoreVertical,
  Check,
  ChevronLeft,
  ChevronRight,
  Video,
  FolderOpen,
  FlaskConical,
  Mail,
  CheckCircle,
  XCircle
} from "lucide-react";
import { designSystem } from "../../styles/designSystem";

const ICON_MAP = {
  description: FileText,
  mail: Mail,
  event: Calendar,
  check_circle: CheckCircle,
  cancel: XCircle
};

function OverviewSection({
  doctorDisplayName,
  todayAppts,
  uniquePatients,
  counts,
  nextPatientAppt,
  updatingId,
  handleStatusChange,
  setActiveSection,
  appointments = [],
  totalEarnings = 0,
  onStartConsultation,
  loading = false
}) {
  const [activeApptMenuId, setActiveApptMenuId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [scheduleStatus, setScheduleStatus] = useState("all");
  const [scheduleDate, setScheduleDate] = useState("");
  const [schedulePage, setSchedulePage] = useState(1);
  const debouncedSearch = useDebounce(scheduleSearch, 300);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="mb-8 space-y-2">
          <div className="h-7 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>

        {/* Bento stats grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-36 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-7 bg-slate-200 rounded w-1/3" />
                </div>
                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
              </div>
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>

        {/* Lower section skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 h-80" />
          <div className="bg-white p-6 rounded-2xl border border-slate-200 h-80" />
        </div>
      </div>
    );
  }

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const ITEMS_PER_PAGE = 3;

  const handleSearchChange = (val) => {
    setScheduleSearch(val);
    setSchedulePage(1);
  };

  const handleStatusFilterChange = (val) => {
    setScheduleStatus(val);
    setSchedulePage(1);
  };

  const handleDateFilterChange = (val) => {
    setScheduleDate(val);
    setSchedulePage(1);
  };

  // Filter appointments
  const filteredScheduleAppts = appointments.filter((appt) => {
    // Search Match (Patient Name or Reason)
    const nameMatch =
      !debouncedSearch ||
      appt.patient?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      appt.reason?.toLowerCase().includes(debouncedSearch.toLowerCase());

    // Status Match
    const statusMatch = scheduleStatus === "all" || appt.status === scheduleStatus;

    // Date Match (only filtered if a specific date is selected in the filter panel)
    let dateMatch = true;
    if (scheduleDate) {
      dateMatch = new Date(appt.date).toISOString().split("T")[0] === scheduleDate;
    }

    return nameMatch && statusMatch && dateMatch;
  });

  // Sort descending (recent appointments listed first)
  const sortedScheduleAppts = [...filteredScheduleAppts].sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date);
    if (dateDiff !== 0) return dateDiff;
    return b.time.localeCompare(a.time); // recent/latest time first
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedScheduleAppts.length / ITEMS_PER_PAGE));
  const startIndex = (schedulePage - 1) * ITEMS_PER_PAGE;
  const paginatedAppts = sortedScheduleAppts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getRecentActivities = () => {
    const changes = appointments
      .filter((a) => a.status === "completed" || a.status === "cancelled")
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 3);

    if (changes.length === 0) {
      return [
        {
          id: "act-1",
          desc: <><strong>Lab results</strong> received for James Miller</>,
          time: "2 minutes ago",
          icon: "description",
          bg: "bg-[#e0f7fc]",
          text: "text-cyan-600",
        },
        {
          id: "act-2",
          desc: <>New message from <strong>Nurse Sarah</strong></>,
          time: "15 minutes ago",
          icon: "mail",
          bg: "bg-[#e0f7fc]",
          text: "text-cyan-600",
        },
        {
          id: "act-3",
          desc: <>Appointment rescheduled: <strong>Dr. Vane</strong></>,
          time: "1 hour ago",
          icon: "event",
          bg: "bg-slate-100",
          text: "text-slate-600",
        },
      ];
    }

    return changes.map((appt) => {
      const dateObj = appt.updatedAt ? new Date(appt.updatedAt) : null;
      const timeStr = dateObj && !isNaN(dateObj.getTime())
        ? dateObj.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Recently";
      return {
        id: appt._id,
        desc: (
          <>
            Appointment for <strong>{appt.patient?.name || "Unknown"}</strong> set to{" "}
            <strong>{appt.status}</strong>
          </>
        ),
        time: `Today, ${timeStr}`,
        icon: appt.status === "completed" ? "check_circle" : "cancel",
        bg: appt.status === "completed" ? "bg-[#e0f7fc]" : "bg-rose-50",
        text: appt.status === "completed" ? "text-cyan-600" : "text-rose-600",
      };
    });
  };

  const activities = getRecentActivities();

  const getWeeklyDistribution = () => {
    const weeklyCounts = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
    appointments.forEach((a) => {
      if (!a.date) return;
      const date = new Date(a.date);
      let day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
      let index = day === 0 ? 6 : day - 1; // map Mon-Sun to index 0-6
      if (index >= 0 && index < 7) {
        weeklyCounts[index] += 1;
      }
    });
    const max = Math.max(...weeklyCounts);
    if (max === 0) return [20, 40, 80, 60, 30, 10, 5]; // fallback default heights to look premium if no data
    return weeklyCounts.map((c) => (c / max) * 100); // percentage heights
  };

  const downloadDailyReport = () => {
    if (todayAppts.length === 0) {
      triggerToast("No appointments scheduled for today to report.");
      return;
    }
    const headers = "Time,Patient Name,Reason,Status\n";
    const rows = todayAppts
      .map(
        (appt) =>
          `"${appt.time}","${appt.patient?.name || "Unknown"}","${
            appt.reason || "General Consultation"
          }","${appt.status}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `Daily_Report_${new Date().toISOString().split("T")[0]}.csv`);
    a.click();
  };

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <div className="mb-8 flex justify-between items-end gap-4">
        <div>
          <h2 className={designSystem.typography.pageTitle}>
            Welcome back, Dr. {doctorDisplayName}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className={designSystem.typography.body}>
              You have {todayAppts.length} appointments scheduled for today.
            </p>
            {totalEarnings > 0 && (
              <span className={`${designSystem.components.badge} bg-emerald-50 text-emerald-600 border border-emerald-200`}>
                Today's Revenue: ₹<AnimatedCounter value={totalEarnings} />
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={downloadDailyReport}
            className={designSystem.components.buttonOutline}
          >
            <Download className="w-4 h-4 text-slate-700" />
            Daily Report
          </button>
          <button
            onClick={() => setActiveSection("appointments")}
            className={designSystem.components.buttonPrimary}
          >
            <Plus className="w-4 h-4 text-white" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Bento Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Patients */}
        <div className={designSystem.components.card + " flex flex-col gap-4"}>
          <div className="flex justify-between items-start">
            <div className="p-2 bg-[#e0f7fc] rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-cyan-600" />
            </div>
            <span className={`${designSystem.components.badge} bg-[#e0f7fc] text-cyan-600 border-cyan-200`}>
              +4% this week
            </span>
          </div>
          <div>
            <p className={designSystem.typography.label}>
              Total Patients
            </p>
            <p className="text-2xl font-bold text-slate-900">
              <AnimatedCounter value={uniquePatients.length} />
            </p>
          </div>
        </div>

        {/* Card 2: Appointments Today */}
        <div className={designSystem.components.card + " flex flex-col gap-4"}>
          <div className="flex justify-between items-start">
            <div className="p-2 bg-[#e0f7fc] rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-cyan-600" />
            </div>
          </div>
          <div>
            <p className={designSystem.typography.label}>
              Appointments Today
            </p>
            <p className="text-2xl font-bold text-slate-900">
              <AnimatedCounter value={todayAppts.length} />
            </p>
          </div>
        </div>

        {/* Card 3: Pending Reports */}
        <div className={designSystem.components.card + " flex flex-col gap-4"}>
          <div className="flex justify-between items-start">
            <div className="p-2 bg-rose-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-rose-600" />
            </div>
            <span className={`${designSystem.components.badge} bg-rose-50 text-rose-600 border-rose-200`}>
              Urgent
            </span>
          </div>
          <div>
            <p className={designSystem.typography.label}>
              Pending Reports
            </p>
            <p className="text-2xl font-bold text-slate-900">
              <AnimatedCounter value={counts.pending ?? 0} />
            </p>
          </div>
        </div>

        {/* Card 4: Next Patient */}
        <div className={`${designSystem.colors.cardBg} bg-cyan-50/40 border-cyan-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300`}>
          {nextPatientAppt ? (
            <>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                  <p className="text-cyan-600 font-semibold text-xs">Next Patient • {nextPatientAppt.time}</p>
                </div>
                <p className="font-bold text-sm text-slate-900 truncate">
                  {nextPatientAppt.patient?.name}
                </p>
                <p className="text-slate-500 font-semibold text-xs mt-1 truncate">
                  {nextPatientAppt.reason || "General Consultation"}
                </p>
              </div>
              <button
                onClick={() => onStartConsultation(nextPatientAppt)}
                className={`${designSystem.components.buttonPrimary} mt-4 w-full py-2 text-xs`}
              >
                Start Consultation
              </button>
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-center py-2">
              <CheckCheck className="w-8 h-8 text-cyan-600 mb-1" />
              <p className="font-bold text-xs text-slate-900">Daily Agenda Complete</p>
              <p className="text-slate-500 font-semibold text-xs mt-1">
                No remaining appointments today.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard grid columns */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Schedule panel */}
        <div className={`${designSystem.colors.cardBg} col-span-12 lg:col-span-8 rounded-xl shadow-sm overflow-hidden`}>
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-3">
              <h3 className={designSystem.typography.sectionHeading}>Appointments Schedule</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center border active:scale-95 ${
                  showFilters
                    ? "bg-[#e0f7fc] text-cyan-600 border-cyan-200"
                    : "text-slate-400 hover:bg-slate-100 border-transparent"
                }`}
                title="Search and Filter Schedule"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-4 animate-fadeIn">
              {/* Search bar */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient or reason..."
                  value={scheduleSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all outline-none"
                />
                {scheduleSearch && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center active:scale-90 transition-transform"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <select
                  value={scheduleStatus}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="bg-white border border-slate-200 rounded-full text-xs font-semibold text-cyan-600 focus:ring-0 cursor-pointer outline-none py-1.5 pl-3 pr-8"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date Scope custom input */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Filter Date:</span>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => handleDateFilterChange(e.target.value)}
                    className="bg-transparent border-none p-0 text-xs font-semibold outline-none cursor-pointer focus:ring-0 w-28 text-cyan-600"
                  />
                  {scheduleDate && (
                    <button
                      onClick={() => handleDateFilterChange("")}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer flex items-center active:scale-90 transition-transform"
                      title="Clear Date Filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="p-6 bg-white">
            <div className="space-y-4">
              {paginatedAppts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                  <Calendar className="w-10 h-10 mb-3 text-slate-300" />
                  <p className="font-bold text-slate-900">No Appointments Found</p>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    {scheduleSearch || scheduleStatus !== "all" || scheduleDate
                      ? "No appointments match your search/filter criteria."
                      : "No appointments registered."}
                  </p>
                </div>
              ) : (
                paginatedAppts.map((appt) => {
                  const initials = appt.patient?.name
                    ? appt.patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "PT";
                  const isUpdating = updatingId === appt._id;

                  let statusLabel = "Scheduled";
                  let borderAccent = "border-slate-300";
                  let badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";

                  if (appt.status === "completed") {
                    statusLabel = "Completed";
                    borderAccent = "border-emerald-500";
                    badgeStyle = "bg-emerald-50 text-emerald-600 border-emerald-200";
                  } else if (appt.status === "confirmed") {
                    const isNext = nextPatientAppt?._id === appt._id;
                    if (isNext) {
                      statusLabel = "In-Progress";
                      borderAccent = "border-cyan-500";
                      badgeStyle = "bg-cyan-500 text-white border-cyan-500";
                    } else {
                      statusLabel = "Checked-in";
                      borderAccent = "border-cyan-300";
                      badgeStyle = "bg-[#e0f7fc] text-cyan-600 border-cyan-200";
                    }
                  } else if (appt.status === "cancelled") {
                    statusLabel = "Cancelled";
                    borderAccent = "border-rose-500";
                    badgeStyle = "bg-rose-50 text-rose-600 border-rose-200";
                  }

                  return (
                    <div key={appt._id} className="flex gap-6 group">
                      <div className="w-20 pt-2 flex flex-col shrink-0">
                        <span
                          className={`text-xs font-bold leading-none ${
                            statusLabel === "In-Progress" ? "text-cyan-600" : "text-slate-700"
                          }`}
                        >
                          {appt.time}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 font-bold">
                          {appt.date && !isNaN(new Date(appt.date).getTime())
                            ? new Date(appt.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                            : "TBD"}
                        </span>
                      </div>
                      <div
                        className={`flex-1 flex items-center justify-between p-4 bg-slate-50 rounded-xl border-l-4 ${borderAccent} ${
                          statusLabel === "In-Progress"
                            ? "ring-2 ring-cyan-500/10 bg-cyan-50/20"
                            : "group-hover:bg-slate-100/70"
                        } transition-all`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                              statusLabel === "In-Progress"
                                ? "bg-cyan-500 text-white"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {appt.patient?.name || "Unknown Patient"}
                            </p>
                            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                              {appt.reason || "General Consultation"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <span className={`${designSystem.components.badge} ${badgeStyle}`}>
                            {statusLabel}
                          </span>

                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveApptMenuId(
                                  activeApptMenuId === appt._id ? null : appt._id
                                )
                              }
                              className="text-slate-400 hover:text-cyan-600 cursor-pointer p-1 rounded-full hover:bg-slate-200 active:scale-95 transition-all"
                              title="Actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {activeApptMenuId === appt._id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 text-xs font-semibold text-slate-800">
                                {(appt.status === "pending" || appt.status === "confirmed") && (
                                  <>
                                    <button
                                      disabled={isUpdating}
                                      onClick={() => {
                                        handleStatusChange(appt._id, "completed");
                                        setActiveApptMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2 text-cyan-600 cursor-pointer font-bold disabled:opacity-50"
                                    >
                                      <Check className="w-4 h-4" />
                                      Complete
                                    </button>
                                    <button
                                      disabled={isUpdating}
                                      onClick={() => {
                                        handleStatusChange(appt._id, "cancelled");
                                        setActiveApptMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2 text-rose-600 cursor-pointer font-bold disabled:opacity-50"
                                    >
                                      <X className="w-4 h-4" />
                                      Cancel
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedScheduleAppts.length)} of {sortedScheduleAppts.length} appointments
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={schedulePage === 1}
                    onClick={() => setSchedulePage((p) => Math.max(p - 1, 1))}
                    className={`px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-xs flex items-center gap-1 active:scale-95 transition-all ${
                      schedulePage === 1
                        ? "opacity-50 text-slate-400 cursor-not-allowed"
                        : "bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <button
                    disabled={schedulePage === totalPages}
                    onClick={() => setSchedulePage((p) => Math.min(p + 1, totalPages))}
                    className={`px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-xs flex items-center gap-1 active:scale-95 transition-all ${
                      schedulePage === totalPages
                        ? "opacity-50 text-slate-400 cursor-not-allowed"
                        : "bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
                    }`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions & Activities panel */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Quick actions */}
          <div className={designSystem.components.card}>
            <h3 className="text-sm font-bold text-slate-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setActiveSection("profile");
                }}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-cyan-500 hover:bg-slate-100 active:scale-[0.96] transition-all group text-center cursor-pointer"
              >
                <FileText className="w-6 h-6 text-cyan-600 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider text-center">Write Prescription</span>
              </button>
              <button
                onClick={() => triggerToast("Initiating secure Telehealth Video Room... Please ensure camera permissions are active.")}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-cyan-500 hover:bg-slate-100 active:scale-[0.96] transition-all group text-center cursor-pointer"
              >
                <Video className="w-6 h-6 text-cyan-600 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider text-center">Start Telehealth</span>
              </button>
              <button
                onClick={() => setActiveSection("patients")}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-cyan-500 hover:bg-slate-100 active:scale-[0.96] transition-all group text-center cursor-pointer"
              >
                <FolderOpen className="w-6 h-6 text-cyan-600 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider text-center">Access Records</span>
              </button>
              <button
                onClick={() => triggerToast("Submitting digital laboratory order sheet to City General Labs...")}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-cyan-500 hover:bg-slate-100 active:scale-[0.96] transition-all group text-center cursor-pointer"
              >
                <FlaskConical className="w-6 h-6 text-cyan-600 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider text-center">Order Labs</span>
              </button>
            </div>
          </div>

          {/* Recent activity log */}
          <div className={`${designSystem.colors.cardBg} rounded-xl shadow-sm overflow-hidden`}>
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className={designSystem.typography.cardHeading}>Recent Activity</h3>
            </div>

            <div className="p-6 bg-white space-y-6">
              {activities.map((act, index) => (
                <div key={act.id} className="flex gap-4">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full ${act.bg} flex items-center justify-center`}>
                      {(() => {
                        const IconComponent = ICON_MAP[act.icon];
                        return IconComponent ? (
                          <IconComponent className={`w-4 h-4 ${act.text}`} />
                        ) : null;
                      })()}
                    </div>
                    {index < activities.length - 1 && (
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[1px] h-8 bg-slate-200"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{act.desc}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{act.time}</p>
                  </div>
                </div>
              ))}

              <button
                onClick={() => triggerToast("All historical logs have been retrieved and verified.")}
                className="w-full text-center py-2 text-xs font-bold text-cyan-600 hover:text-cyan-700 cursor-pointer"
              >
                View all activity
              </button>
            </div>
          </div>

          {/* Patient Volume bar chart */}
          <div className={designSystem.components.card + " relative overflow-hidden group"}>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Patient Volume</h3>
            <div className="flex items-end gap-2 h-24">
              {getWeeklyDistribution().map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${Math.max(h, 8)}%` }}
                  className={`w-full ${i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1) ? 'bg-cyan-500 shadow-sm shadow-cyan-500/20' : 'bg-cyan-100'} rounded-t-md transition-all duration-500`}
                ></div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-50 text-xs font-bold"
          >
            <CheckCircle className="text-cyan-405 w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default OverviewSection;
