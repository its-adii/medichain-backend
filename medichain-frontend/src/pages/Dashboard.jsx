import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
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
  User,
  RefreshCw,
  Activity,
  FileText,
  CreditCard,
  ChevronRight,
  Plus,
  ArrowRight,
  Download,
  ShieldCheck,
  Heart
} from "lucide-react";
import AnimatedCounter from "../components/AnimatedCounter";
import { designSystem } from "../styles/designSystem";

const STATUS_STYLES = {
  pending:   { bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-200",  label: "Pending"   },
  confirmed: { bg: "bg-[#e0f7fc]",   text: "text-cyan-600",   border: "border-cyan-200",   label: "Confirmed" },
  completed: { bg: "bg-emerald-50",  text: "text-emerald-600",  border: "border-emerald-200",  label: "Completed" },
  cancelled: { bg: "bg-rose-50", text: "text-rose-600",  border: "border-rose-200",  label: "Cancelled" },
};

function Dashboard() {
  const { user, setUser } = useAuth();
  const socket = useSocket();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [errorAppts, setErrorAppts] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  
  // Tab inside appointments card
  const [apptView, setApptView] = useState("upcoming"); // 'upcoming' | 'history'

  async function fetchUserProfile() {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to load user profile", err);
    }
  }

  async function fetchAppointments(silent = false) {
    if (!silent) setLoadingAppts(true);
    setErrorAppts("");
    try {
      const res = await api.get("/appointments/my");
      setAppointments(res.data.appointments || []);
    } catch (err) {
      setErrorAppts("Failed to load appointments.");
    } finally {
      if (!silent) setLoadingAppts(false);
    }
  }

  async function fetchDoctors() {
    setLoadingDocs(true);
    try {
      const res = await api.get("/doctors", { params: { limit: 3 } });
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error("Failed to load doctors in dashboard", err);
    } finally {
      setLoadingDocs(false);
    }
  }

  useEffect(() => {
    fetchUserProfile();
    fetchAppointments();
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleAppointmentsUpdated = () => {
      console.log("Appointments updated. Refreshing patient dashboard...");
      fetchAppointments(true);
    };

    socket.on("appointmentsUpdated", handleAppointmentsUpdated);

    return () => {
      socket.off("appointmentsUpdated", handleAppointmentsUpdated);
    };
  }, [socket]);

  async function handleCancel(appointmentId) {
    setCancellingId(appointmentId);
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: "cancelled" });
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointmentId ? { ...a, status: "cancelled" } : a))
      );
      setCancelConfirmId(null);
    } catch {
      alert("Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  }

  const upcomingAppts = appointments.filter(
    (a) => a.status === "pending" || a.status === "confirmed"
  );
  
  const historyAppts = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );

  const stats = {
    total: appointments.length,
    upcoming: upcomingAppts.length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  // Compute Health Score dynamically based on demographics completeness
  const getHealthScore = () => {
    let score = 60;
    if (user?.age) score += 10;
    if (user?.gender) score += 10;
    if (user?.bloodGroup) score += 10;
    if (user?.weight) score += 10;
    return score;
  };

  // Compute Active Treatments Count (Total Prescriptions in completed consults)
  const activeRxCount = appointments
    .filter(a => a.status === "completed")
    .reduce((acc, curr) => acc + (curr.prescriptions?.length || 0), 0);

  // Compute Medical Records (visitis, lab orders, prescriptions) from completed appointments
  const medicalRecords = [];
  appointments.forEach((appt) => {
    if (appt.status !== "completed") return;
    const docName = appt.doctor?.user?.name 
      ? (appt.doctor.user.name.toLowerCase().startsWith("dr.") ? appt.doctor.user.name : `Dr. ${appt.doctor.user.name}`) 
      : "Specialist";

    const formattedDate = new Date(appt.date).toLocaleDateString("en-IN", {
      day: "numeric", month: "short"
    });

    if (appt.clinicalNotes) {
      medicalRecords.push({
        id: `${appt._id}-visit`,
        name: "Consultation Summary",
        date: formattedDate,
        format: "EHR",
        provider: docName
      });
    }
    if (appt.prescriptions && appt.prescriptions.length > 0) {
      appt.prescriptions.slice(0, 1).forEach((rx, idx) => {
        medicalRecords.push({
          id: `${appt._id}-rx-${idx}`,
          name: rx.medicineName,
          date: formattedDate,
          format: "Rx",
          provider: docName
        });
      });
    }
  });

  // Compute Invoices from Appointments
  const billingInvoices = appointments.slice(0, 2).map((appt) => {
    const isPaid = appt.status === "completed";
    return {
      id: appt._id,
      service: appt.reason || "Consultation",
      date: new Date(appt.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      code: appt._id ? `INV-${appt._id.substring(appt._id.length - 4).toUpperCase()}` : "INV-XXXX",
      amount: appt.doctor?.fees || 500,
      status: isPaid ? "PAID" : "PENDING"
    };
  });

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  // Helper to format date nicely
  const getFormattedDateParts = (dateStr) => {
    if (!dateStr || isNaN(new Date(dateStr).getTime())) {
      return { day: "??", month: "TBD" };
    }
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    return { day, month };
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 bg-slate-50 transition-colors duration-300 min-h-screen"
    >
      <div className="max-w-[1400px] mx-auto">
        
        {/* Welcome Header Section */}
        <section className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Good morning, {user?.name || "Patient"}
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              You have <span className="text-cyan-600 font-bold">{stats.upcoming}</span> upcoming appointments scheduled.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:flex sm:gap-4">
            <div className="flex flex-col items-center justify-center bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm min-w-[120px] group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-1.5">
                <Activity size={18} className="text-cyan-600 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-cyan-600 text-3xl font-bold">
                  <AnimatedCounter value={getHealthScore()} />
                </span>
              </div>
              <span className="text-slate-450 text-[9px] font-bold uppercase tracking-widest mt-1">Profile Score</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm min-w-[120px] group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-1.5">
                <Heart size={18} className="text-cyan-600 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-cyan-600 text-3xl font-bold">
                  <AnimatedCounter value={activeRxCount} />
                </span>
              </div>
              <span className="text-slate-455 text-[9px] font-bold uppercase tracking-widest mt-1">Treatments</span>
            </div>
          </div>
        </section>

        {/* 2-Column Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-12 gap-6 items-start"
        >
          
          {/* LEFT COLUMN: col-span-12 lg:col-span-8 */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Card 1: Upcoming Appointments */}
            <motion.div
              variants={itemVariants}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="text-cyan-600" size={20} />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Upcoming Appointments</h3>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <Link to="/appointments" className="text-xs text-cyan-600 font-bold hover:underline mr-2">
                    View Calendar
                  </Link>
                  <button
                    onClick={() => { setApptView("upcoming"); setCancelConfirmId(null); }}
                    className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase transition cursor-pointer border ${
                      apptView === "upcoming"
                        ? "bg-cyan-600 text-white border-cyan-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Upcoming ({upcomingAppts.length})
                  </button>
                  <button
                    onClick={() => { setApptView("history"); setCancelConfirmId(null); }}
                    className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase transition cursor-pointer border ${
                      apptView === "history"
                        ? "bg-cyan-600 text-white border-cyan-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    History ({historyAppts.length})
                  </button>
                  <button
                    onClick={() => fetchAppointments()}
                    className="p-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer flex items-center justify-center w-7 h-7"
                    title="Refresh"
                  >
                    <RefreshCw size={12} className={loadingAppts ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {loadingAppts ? (
                <div className="space-y-4 py-6">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex gap-4 animate-pulse">
                      <div className="w-14 h-14 bg-slate-200 rounded-xl" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : errorAppts ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-red-200">
                  <AlertCircle size={36} className="text-rose-500 mx-auto mb-3" />
                  <p className="text-slate-605 font-bold text-sm">{errorAppts}</p>
                  <button onClick={() => fetchAppointments()} className="mt-2 text-xs text-cyan-600 font-bold hover:underline">
                    Try Again
                  </button>
                </div>
              ) : (apptView === "upcoming" ? upcomingAppts : historyAppts).length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center flex-1">
                  <Calendar size={40} className="text-slate-305 mb-3" />
                  <p className="text-slate-600 font-bold text-sm">No appointments found</p>
                  <p className="text-xs text-slate-400 mt-1 mb-5">
                    {apptView === "upcoming" ? "No scheduled appointments found." : "No past appointment history."}
                  </p>
                  {apptView === "upcoming" && (
                    <Link to="/doctors" className={designSystem.components.buttonPrimary}>
                      <Stethoscope size={16} /> Book Appointment
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1 scrollbar-thin">
                  {(apptView === "upcoming" ? upcomingAppts : historyAppts).map((appt) => {
                    const dateParts = getFormattedDateParts(appt.date);
                    const style = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
                    const isCancelling = cancellingId === appt._id;
                    const isConfirmingCancel = cancelConfirmId === appt._id;
                    
                    return (
                      <div
                        key={appt._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-slate-50 border border-slate-100 hover:border-slate-205 rounded-xl transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Date Pill */}
                          <div className="flex flex-col items-center justify-center min-w-[64px] h-[64px] bg-cyan-50 border border-cyan-100 text-cyan-600 rounded-xl font-bold shrink-0">
                            <span className="text-xl leading-none">{dateParts.day}</span>
                            <span className="text-[10px] tracking-wider uppercase mt-1">{dateParts.month}</span>
                          </div>

                          {/* Doctor Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">
                              {appt.doctor?.user?.name 
                                ? (appt.doctor.user.name.toLowerCase().startsWith("dr.") ? appt.doctor.user.name : `Dr. ${appt.doctor.user.name}`) 
                                : "Specialist"}
                            </p>
                            <p className="text-xs text-cyan-600 font-bold flex items-center gap-1 mt-0.5">
                              <Stethoscope size={12} />
                              {appt.doctor?.specialization || "General Medicine"}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-semibold">
                              <span className="flex items-center gap-1">
                                <Clock size={11} /> {appt.time}
                              </span>
                              <span>•</span>
                              <span className="truncate">{appt.reason}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                          <span className={`${designSystem.components.badge} ${style.bg} ${style.text} ${style.border}`}>
                            {style.label}
                          </span>
                          {appt.status === "pending" && (
                            <div className="flex gap-1">
                              {isConfirmingCancel ? (
                                <>
                                  <button
                                    onClick={() => handleCancel(appt._id)}
                                    disabled={isCancelling}
                                    className="text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-2 py-1 rounded-lg transition disabled:opacity-50 cursor-pointer shadow-sm"
                                  >
                                    {isCancelling ? "Cancelling..." : "Confirm"}
                                  </button>
                                  <button
                                    onClick={() => setCancelConfirmId(null)}
                                    className="text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition cursor-pointer"
                                  >
                                    No
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setCancelConfirmId(appt._id)}
                                  className="text-[10px] font-bold text-rose-605 bg-rose-50 border border-rose-100 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Card 3: Medical Records */}
            <motion.div
              variants={itemVariants}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="text-cyan-600" size={20} />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Medical Records</h3>
                </div>
                <div className="flex gap-2">
                  <Link 
                    to="/medical-records"
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-pointer flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                  >
                    View Vault
                  </Link>
                </div>
              </div>

              {medicalRecords.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center flex-1">
                  <FileText className="w-8 h-8 text-slate-305 mb-2 animate-pulse" />
                  <p className="text-slate-600 font-bold text-xs">No Medical Records Found</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Consultations will generate clinical reports.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  {medicalRecords.slice(0, 4).map((rec, index) => (
                    <div
                      key={index}
                      className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex items-start gap-3 group cursor-pointer hover:border-cyan-400 hover:bg-white transition-all duration-200"
                    >
                      <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 shrink-0">
                        <FileText size={16} className="text-cyan-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 text-xs truncate leading-tight group-hover:text-cyan-600 transition-colors">
                          {rec.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">
                          {rec.date} • {rec.format} • {rec.provider}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

          </div>

          {/* RIGHT COLUMN: col-span-12 lg:col-span-4 */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Card 2: My Doctors */}
            <motion.div
              variants={itemVariants}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Heart className="text-rose-500" size={18} />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">My Specialists</h3>
                </div>
                <Link to="/doctors" className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 hover:underline flex items-center gap-0.5">
                  Find More <ChevronRight size={12} />
                </Link>
              </div>

              {loadingDocs ? (
                <div className="space-y-4 py-3 flex-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-slate-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                        <div className="h-2.5 bg-slate-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center flex-1">
                  <User size={32} className="text-slate-305 mb-2" />
                  <p className="text-slate-600 font-bold text-xs">No doctors listed</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[150px] mx-auto leading-relaxed">
                    Search the directory to consult top doctors.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  {doctors.slice(0, 3).map((doc) => (
                    <div key={doc._id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          src={doc.profileImage}
                          name={doc.user?.name || "Dr"}
                          className="w-10 h-10 border border-slate-200 shadow-sm shrink-0 text-xs"
                          alt={doc.user?.name}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate leading-tight">
                            {doc.user?.name ? (doc.user.name.toLowerCase().startsWith("dr.") ? doc.user.name : `Dr. ${doc.user.name}`) : "Specialist"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5 truncate">
                            {doc.specialization}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link
                          to={`/book-appointment?step=2&doctorId=${doc._id}`}
                          className="p-2 bg-cyan-50 border border-cyan-100 rounded-lg text-cyan-600 hover:bg-cyan-100 transition-colors shrink-0 animate-pulse-subtle"
                          title="Book Appointment"
                        >
                          <Calendar size={13} />
                        </Link>
                      </div>
                    </div>
                  ))}
                  
                  <Link
                    to="/doctors"
                    className="mt-2 w-full py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Browse Doctor Directory
                    <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Card 4: Billing & Insurance */}
            <motion.div
              variants={itemVariants}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="text-cyan-600" size={20} />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Billing &amp; Insurance</h3>
              </div>

              <div className="p-4 bg-cyan-50/50 border border-cyan-100 rounded-xl mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] text-cyan-600 uppercase font-bold tracking-widest">Active Plan</span>
                  <span className="bg-cyan-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">BlueCross</span>
                </div>
                <p className="font-bold text-slate-900 text-sm">BlueCross HealthShield</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">ID: #BC-8821-3942-XXXX</p>
              </div>

              {billingInvoices.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-slate-300 mb-2" />
                  <p className="text-slate-600 font-bold text-[10px]">No Recent Invoices</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Invoice statements will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3 flex-1 mb-4">
                  {billingInvoices.map((inv, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
                      <div>
                        <p className="font-bold text-slate-900 truncate max-w-[120px]">{inv.service}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{inv.date} • {inv.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">₹{inv.amount}</p>
                        <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 ${
                          inv.status === "PAID"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link
                to="/billings"
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-600 hover:underline hover:text-cyan-700 transition-colors"
              >
                Access Billing Portal
                <ChevronRight size={14} />
              </Link>
            </motion.div>

          </div>

        </motion.div>

      </div>
    </motion.main>
  );
}

export default Dashboard;
