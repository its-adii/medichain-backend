import { useState, useEffect, useMemo } from "react";
import { useSocket } from "../context/SocketContext";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import Avatar from "../components/Avatar";
import {
  ShieldPlus,
  LayoutDashboard,
  CalendarDays,
  Users,
  Mail,
  UserCircle,
  Siren,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  Camera,
  CheckCircle,
  Clock,
  MapPin,
  Menu,
  AlertCircle
} from "lucide-react";
import { designSystem } from "../styles/designSystem";

// Section Components
import OverviewSection from "../components/doctor/OverviewSection";
import AppointmentsSection from "../components/doctor/AppointmentsSection";
import PatientsSection from "../components/doctor/PatientsSection";
import ProfileSection from "../components/doctor/ProfileSection";
import AccountSection from "../components/doctor/AccountSection";
import ClinicalWorkflowModal from "../components/doctor/ClinicalWorkflowModal";
import NotificationDropdown from "../components/doctor/NotificationDropdown";

function DoctorDashboard() {
  const { user, setUser, setAccessToken } = useAuth();
  const socket = useSocket();

  // Navigation Section State
  const [activeSection, setActiveSection] = useState("dashboard"); // 'dashboard' | 'appointments' | 'patients' | 'profile'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on section change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [activeSection]);

  // Data States
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Appointments Tab Filtering & Sorting
  const [apptFilterTab, setApptFilterTab] = useState("all");
  const [apptSortOrder, setApptSortOrder] = useState("upcoming");

  // Patient Directory Tab Preview State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeConsultationAppt, setActiveConsultationAppt] = useState(null);

  // Profile Form States
  const [profileExists, setProfileExists] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [fees, setFees] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState([]);
  const [license, setLicense] = useState("");
  const [issuingBody, setIssuingBody] = useState("");
  const [school, setSchool] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Notifications state
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("doctor_notifications");
    return saved ? JSON.parse(saved) : [];
  });
  const [showNotifications, setShowNotifications] = useState(false);

  // Account Form States
  const [accountName, setAccountName] = useState(user?.name || "");
  const [accountEmail, setAccountEmail] = useState(user?.email || "");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountConfirmPassword, setAccountConfirmPassword] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState("");
  const [accountError, setAccountError] = useState("");

  // Sync account states when user loads
  useEffect(() => {
    if (user) {
      setAccountName(user.name || "");
      setAccountEmail(user.email || "");
    }
  }, [user]);

  async function handleAccountSubmit(e) {
    e.preventDefault();
    setAccountSuccess("");
    setAccountError("");

    if (accountPassword && accountPassword !== accountConfirmPassword) {
      setAccountError("Passwords do not match.");
      return;
    }

    setSavingAccount(true);

    const updateData = {
      name: accountName,
      email: accountEmail,
    };

    if (accountPassword) {
      updateData.password = accountPassword;
    }

    try {
      const res = await api.patch("/auth/me", updateData);
      setAccountSuccess("Account settings updated successfully!");
      setUser(res.data.user);
      setAccountPassword("");
      setAccountConfirmPassword("");
    } catch (err) {
      setAccountError(err.response?.data?.message || "Failed to update account settings.");
    } finally {
      setSavingAccount(false);
    }
  }

  async function fetchAppointments(silent = false) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const res = await api.get("/appointments/doctor");
      setAppointments(res.data.appointments || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setAppointments([]);
      } else {
        setError("Failed to load appointments.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function fetchProfile() {
    try {
      const res = await api.get("/doctors/profile/me");
      if (res.data.doctor) {
        const doc = res.data.doctor;
        setProfileExists(true);
        setSpecialization(doc.specialization);
        setExperience(doc.experience);
        setFees(doc.fees);
        setBio(doc.bio || "");
        setAvailability(doc.availability || []);
        setProfileImagePreview(doc.profileImage || "");
        setLicense(doc.license || "");
        setIssuingBody(doc.issuingBody || "");
        setSchool(doc.school || "");
        setGradYear(doc.gradYear || "");
        setSpecialties(doc.specialties || []);
        setIsVerified(doc.isVerified || false);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setProfileExists(false);
        setIsVerified(false);
      }
    }
  }

  useEffect(() => {
    fetchAppointments();
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleAppointmentsUpdated = () => {
      console.log("Appointments updated. Refreshing doctor dashboard...");
      fetchAppointments(true);
    };

    const handleDoctorsUpdated = () => {
      console.log("Doctor profile updated. Refreshing doctor dashboard...");
      fetchProfile();
    };

    const handleAppointmentBooked = (data) => {
      console.log("appointmentBooked received", data);
      const newNotif = {
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        type: "booked",
        message: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      };
      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        localStorage.setItem("doctor_notifications", JSON.stringify(updated));
        return updated;
      });
    };

    const handleAppointmentStatusChanged = (data) => {
      console.log("appointmentStatusChanged received", data);
      const newNotif = {
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        type: "statusChanged",
        message: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      };
      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        localStorage.setItem("doctor_notifications", JSON.stringify(updated));
        return updated;
      });
    };

    socket.on("appointmentsUpdated", handleAppointmentsUpdated);
    socket.on("doctorsUpdated", handleDoctorsUpdated);
    socket.on("appointmentBooked", handleAppointmentBooked);
    socket.on("appointmentStatusChanged", handleAppointmentStatusChanged);

    return () => {
      socket.off("appointmentsUpdated", handleAppointmentsUpdated);
      socket.off("doctorsUpdated", handleDoctorsUpdated);
      socket.off("appointmentBooked", handleAppointmentBooked);
      socket.off("appointmentStatusChanged", handleAppointmentStatusChanged);
    };
  }, [socket]);

  const handleMarkAsRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem("doctor_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAllNotifs = () => {
    setNotifications([]);
    localStorage.removeItem("doctor_notifications");
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    }
    setUser(null);
    setAccessToken(null);
    window.location.href = "/login";
  };

  async function handleStatusChange(appointmentId, newStatus) {
    setUpdatingId(appointmentId);
    try {
      const res = await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointmentId ? { ...a, status: res.data.appointment.status } : a))
      );
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  // Profile Save Action
  async function handleProfileSubmit(e) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess("");
    setProfileError("");

    const formData = new FormData();
    formData.append("specialization", specialization);
    formData.append("experience", Number(experience));
    formData.append("fees", Number(fees));
    formData.append("bio", bio);
    formData.append("availability", JSON.stringify(availability));
    formData.append("license", license);
    formData.append("issuingBody", issuingBody);
    formData.append("school", school);
    formData.append("gradYear", gradYear ? Number(gradYear) : "");
    formData.append("specialties", JSON.stringify(specialties));
    if (profileImageFile) {
      formData.append("profileImage", profileImageFile);
    }

    try {
      if (profileExists) {
        await api.patch("/doctors/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setProfileSuccess("Profile updated successfully!");
      } else {
        await api.post("/doctors/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setProfileSuccess("Profile created successfully! You are now visible to patients.");
        setProfileExists(true);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to save profile details.");
    } finally {
      setSavingProfile(false);
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setProfileError("Only image files are allowed.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setProfileError("Profile image must be less than 2MB.");
        return;
      }
      setProfileError("");
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  // Extract unique patients from appointments
  const uniquePatients = useMemo(() => {
    const list = [];
    const seenPatients = new Set();

    appointments.forEach((appt) => {
      if (appt.patient && appt.patient._id && !seenPatients.has(appt.patient._id)) {
        seenPatients.add(appt.patient._id);

        const patientAppts = appointments.filter((a) => a.patient?._id === appt.patient._id);
        const sortedAppts = [...patientAppts].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latestAppt = sortedAppts[0];

        const pId = appt.patient._id;
        const idCode = `#PT-${pId.substring(pId.length - 4).toUpperCase()}`;
        const valCode = pId.charCodeAt(0) + pId.charCodeAt(pId.length - 1);
        const age = appt.patient.age !== undefined && appt.patient.age !== null ? appt.patient.age : 22 + (valCode % 45);
        const bloodTypes = ["A+", "O-", "B+", "AB+", "O+", "A-"];
        const blood = appt.patient.bloodGroup || bloodTypes[valCode % bloodTypes.length];
        const weight = appt.patient.weight !== undefined && appt.patient.weight !== null ? (typeof appt.patient.weight === 'number' ? `${appt.patient.weight}kg` : appt.patient.weight) : `${50 + (valCode % 40)}kg`;
        const gender = appt.patient.gender || (valCode % 2 === 0 ? "Female" : "Male");

        let status = "active";
        if (latestAppt.status === "cancelled") status = "cancelled";
        else if (latestAppt.status === "pending") status = "pending lab";
        else if (latestAppt.status === "completed") status = "completed";

        list.push({
          ...appt.patient,
          idCode,
          age,
          gender,
          blood,
          weight,
          status,
          lastVisitDate: latestAppt.date,
          lastVisitReason: latestAppt.reason,
          latestStatus: latestAppt.status,
          appointmentsCount: patientAppts.length,
        });
      }
    });
    return list;
  }, [appointments]);

  // Today's appointments calculations
  const todayAppts = useMemo(() => {
    const isToday = (dateStr) => {
      const today = new Date().toDateString();
      const apptDate = new Date(dateStr).toDateString();
      return today === apptDate;
    };
    return appointments.filter((a) => isToday(a.date));
  }, [appointments]);

  // Determine Next Patient Appointment today
  const nextPatientAppt = useMemo(() => {
    const upcomingToday = todayAppts
      .filter((a) => a.status === "confirmed" || a.status === "pending")
      .sort((a, b) => a.time.localeCompare(b.time));
    return upcomingToday[0];
  }, [todayAppts]);

  // Appointment filtering counters
  const counts = useMemo(() => {
    return {
      all: appointments.length,
      pending: appointments.filter((a) => a.status === "pending").length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
    };
  }, [appointments]);

  const searchedAppointments = useMemo(() => {
    if (!searchTerm.trim()) return appointments;
    const term = searchTerm.toLowerCase();
    return appointments.filter(a => {
      const patientName = a.patient?.name?.toLowerCase() || "";
      const reason = a.reason?.toLowerCase() || "";
      return patientName.includes(term) || reason.includes(term);
    });
  }, [appointments, searchTerm]);

  const filteredAppointments = useMemo(() => {
    return apptFilterTab === "all" ? searchedAppointments : searchedAppointments.filter((a) => a.status === apptFilterTab);
  }, [searchedAppointments, apptFilterTab]);

  const doctorDisplayName = user?.name ? user.name.replace(/^(dr\.\s*|dr\s*)+/gi, "").trim() : "Consultant";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-slate-50 text-slate-900 font-body-md overflow-x-hidden flex w-full"
    >
      {/* Mobile Sidebar Backdrop Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* SideNavBar (Shared Layout) */}
      <nav 
        className={`fixed left-0 top-0 bottom-0 h-full w-[280px] bg-white border-r border-slate-200 flex flex-col py-6 px-4 shadow-sm z-50 transition-transform duration-300 md:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/10 transition-transform group-hover:scale-105">
            <ShieldPlus className="text-white" size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
              Medi<span className="text-cyan-600">Chain</span>
            </span>
          </div>
        </div>

        {/* Portal Dashboard Subheading */}
        <div className="px-3 mb-6">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            DOCTOR PORTAL
          </span>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mt-0.5">
            Dr. {doctorDisplayName}
          </span>
        </div>

        <div className="flex-1 space-y-1.5">
          <button
            onClick={() => {
              setActiveSection("dashboard");
              setProfileSuccess("");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all relative group cursor-pointer ${
              activeSection === "dashboard"
                ? "text-cyan-900"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {activeSection === "dashboard" && (
              <motion.div
                layoutId="doctorActiveSidebarBg"
                className="absolute inset-0 bg-[#e0f7fc] border border-cyan-100 rounded-xl z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <LayoutDashboard size={18} className={`z-10 transition-all duration-200 ${activeSection === "dashboard" ? "text-cyan-600 scale-110" : "text-slate-400 group-hover:text-slate-600 group-hover:scale-110"}`} />
            <span className="z-10">Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveSection("appointments");
              setProfileSuccess("");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all relative group cursor-pointer ${
              activeSection === "appointments"
                ? "text-cyan-900"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {activeSection === "appointments" && (
              <motion.div
                layoutId="doctorActiveSidebarBg"
                className="absolute inset-0 bg-[#e0f7fc] border border-cyan-100 rounded-xl z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <CalendarDays size={18} className={`z-10 transition-all duration-200 ${activeSection === "appointments" ? "text-cyan-600 scale-110" : "text-slate-400 group-hover:text-slate-600 group-hover:scale-110"}`} />
            <span className="z-10">Appointments</span>
          </button>

          <button
            onClick={() => {
              setActiveSection("patients");
              setProfileSuccess("");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all relative group cursor-pointer ${
              activeSection === "patients"
                ? "text-cyan-900"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {activeSection === "patients" && (
              <motion.div
                layoutId="doctorActiveSidebarBg"
                className="absolute inset-0 bg-[#e0f7fc] border border-cyan-100 rounded-xl z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Users size={18} className={`z-10 transition-all duration-200 ${activeSection === "patients" ? "text-cyan-600 scale-110" : "text-slate-400 group-hover:text-slate-600 group-hover:scale-110"}`} />
            <span className="z-10">Patients</span>
          </button>

          <button
            onClick={() => {
              setActiveSection("dashboard");
              alert("Direct Messaging interface is currently read-only. No new messages.");
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer relative group"
          >
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-slate-400 group-hover:text-slate-600 group-hover:scale-110 transition-all duration-200" />
              <span className="font-bold text-sm tracking-wide">Messages</span>
            </div>
            <span className="absolute right-4 w-2 h-2 bg-rose-500 rounded-full border border-white" />
          </button>

          <button
            onClick={() => {
              setActiveSection("profile");
              setProfileSuccess("");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all relative group cursor-pointer ${
              activeSection === "profile" && !profileSuccess
                ? "text-cyan-900"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {activeSection === "profile" && !profileSuccess && (
              <motion.div
                layoutId="doctorActiveSidebarBg"
                className="absolute inset-0 bg-[#e0f7fc] border border-cyan-100 rounded-xl z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <UserCircle size={18} className={`z-10 transition-all duration-200 ${activeSection === "profile" && !profileSuccess ? "text-cyan-600 scale-110" : "text-slate-400 group-hover:text-slate-600 group-hover:scale-110"}`} />
            <span className="z-10">Profile</span>
          </button>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4 space-y-1">
          <button
            onClick={() => alert("Emergency hospital notification sent successfully.")}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-500/10 transition-all cursor-pointer mb-4 group"
          >
            <Siren size={16} className="animate-pulse group-hover:scale-110 transition-transform duration-200" />
            Emergency Call
          </button>

          <button
            onClick={() => {
              setActiveSection("profile");
              setProfileSuccess("");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-sm font-bold tracking-wide transition-colors cursor-pointer group"
          >
            <Settings size={18} className="text-slate-400 group-hover:text-slate-600 group-hover:scale-110 transition-all duration-200" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => alert("Support interface loaded.")}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-sm font-bold tracking-wide transition-colors cursor-pointer group"
          >
            <HelpCircle size={18} className="text-slate-400 group-hover:text-slate-600 group-hover:scale-110 transition-all duration-200" />
            <span>Support</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-red-50 rounded-xl text-sm font-bold tracking-wide transition-colors cursor-pointer group"
          >
            <LogOut size={18} className="text-slate-400 group-hover:text-rose-500 group-hover:scale-110 transition-all duration-200" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Container Wrapper */}
      <div className="flex-1 min-w-0 min-h-screen flex flex-col md:pl-[280px]">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4 md:gap-8 h-full">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-50 md:hidden cursor-pointer flex items-center justify-center"
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            <span className="text-lg md:text-xl font-black tracking-tight text-slate-900 mr-2 uppercase shrink-0 md:hidden">
              MediChain
            </span>
          </div>

          <div className="flex items-center gap-6">

            {/* Search Input bar */}
            <div className="relative w-64 group hidden sm:block">
              <Search 
                size={16} 
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" 
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patients, reasons..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 text-xs font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none"
              />
            </div>

            {/* Notification Bell Icon */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell size={18} />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
                )}
              </button>
              {showNotifications && (
                <NotificationDropdown
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onClearAll={handleClearAllNotifs}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>

            {/* Settings Gear Icon */}
            <button
              onClick={() => {
                setActiveSection("profile");
                setProfileSuccess("");
              }}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings size={18} />
            </button>

            {/* User Profile Avatar */}
            <div 
              className="cursor-pointer"
              onClick={() => {
                setActiveSection("profile");
                setProfileSuccess("");
              }}
            >
              <Avatar 
                src={profileImagePreview} 
                name={user?.name} 
                className="h-9 w-9 text-xs border border-slate-200 hover:border-cyan-300 shadow-sm flex-shrink-0" 
                alt="Dr. Avatar"
              />
            </div>

          </div>
        </header>

        {/* Main Content Body Container */}
        <main className="pt-8 px-4 sm:px-10 pb-10 min-h-screen bg-slate-50">
          <AnimatePresence>
            {!profileExists && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-amber-50 border border-amber-200 text-amber-850 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-xs font-semibold shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-600 shrink-0" />
                  <span>
                    <strong>Onboarding Profile Required:</strong> Welcome! Please fill out your medical specialties, consultation fees, and availability slots under the <strong>Profile</strong> section to start receiving patient consultations.
                  </span>
                </div>
                <button
                  onClick={() => setActiveSection("profile")}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition shrink-0 cursor-pointer text-[10px] uppercase font-bold"
                >
                  Create Profile
                </button>
              </motion.div>
            )}
            {profileExists && !isVerified && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-blue-50 border border-blue-200 text-cyan-800 p-4 rounded-xl flex items-center gap-2 mb-6 text-xs font-semibold shadow-sm"
              >
                <AlertCircle size={18} className="text-cyan-600 shrink-0" />
                <span>
                  <strong>Verification Pending:</strong> Your credentials are currently being reviewed by our clinical admin team. You can still modify your settings, but you won't be visible to patients until verification is complete.
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeSection === "dashboard" && (
              <OverviewSection
                doctorDisplayName={doctorDisplayName}
                todayAppts={todayAppts.filter(a => !searchTerm.trim() || a.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || a.reason?.toLowerCase().includes(searchTerm.toLowerCase()))}
                uniquePatients={uniquePatients}
                counts={counts}
                nextPatientAppt={nextPatientAppt}
                updatingId={updatingId}
                handleStatusChange={handleStatusChange}
                setActiveSection={setActiveSection}
                appointments={searchedAppointments}
                totalEarnings={appointments.filter((a) => a.status === "completed").length * Number(fees || 0)}
                onStartConsultation={(appt) => setActiveConsultationAppt(appt)}
                loading={loading}
              />
            )}

            {activeSection === "appointments" && (
              <AppointmentsSection
                appointments={appointments}
                filteredAppointments={filteredAppointments}
                loading={loading}
                error={error}
                updatingId={updatingId}
                counts={counts}
                apptFilterTab={apptFilterTab}
                setApptFilterTab={setApptFilterTab}
                apptSortOrder={apptSortOrder}
                setApptSortOrder={setApptSortOrder}
                handleStatusChange={handleStatusChange}
                todayAppts={todayAppts}
                onStartConsultation={(appt) => setActiveConsultationAppt(appt)}
              />
            )}

            {activeSection === "patients" && (
              <PatientsSection
                uniquePatients={uniquePatients}
                selectedPatient={selectedPatient}
                setSelectedPatient={setSelectedPatient}
              />
            )}

            {activeSection === "profile" && (
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Profile card */}
                <div className={`${designSystem.colors.cardBg} rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6`}>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Picture upload avatar */}
                    <div className="relative group shrink-0">
                      <Avatar 
                        src={profileImagePreview} 
                        name={user?.name} 
                        className="w-24 h-24 text-2xl border-4 border-slate-100 shadow" 
                        alt="Doctor profile avatar"
                      />
                      <label className="absolute bottom-0 right-0 bg-cyan-500 text-white p-2 rounded-full shadow-md cursor-pointer hover:scale-105 transition-transform flex items-center justify-center">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="text-center md:text-left">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                          Dr. {doctorDisplayName}
                        </h2>
                        {isVerified ? (
                          <span className={`${designSystem.components.badge} ${designSystem.colors.status.completed}`}>
                            VERIFIED
                          </span>
                        ) : (
                          <span className={`${designSystem.components.badge} ${designSystem.colors.status.pending}`}>
                            PENDING VERIFICATION
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        {specialization || "General Practitioner"}
                      </p>
                      <p className="text-xs font-semibold text-slate-500 flex items-center justify-center md:justify-start gap-1 mt-1">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        St. Metropolitan General Hospital, New York
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 shrink-0">
                    <button
                      onClick={fetchProfile}
                      className={designSystem.components.buttonOutline}
                    >
                      Discard Changes
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6 animate-fade-in">
                  <ProfileSection
                    profileExists={profileExists}
                    specialization={specialization}
                    setSpecialization={setSpecialization}
                    experience={experience}
                    setExperience={setExperience}
                    fees={fees}
                    setFees={setFees}
                    bio={bio}
                    setBio={setBio}
                    availability={availability}
                    setAvailability={setAvailability}
                    savingProfile={savingProfile}
                    profileSuccess={profileSuccess}
                    profileError={profileError}
                    handleProfileSubmit={handleProfileSubmit}
                    license={license}
                    setLicense={setLicense}
                    issuingBody={issuingBody}
                    setIssuingBody={setIssuingBody}
                    school={school}
                    setSchool={setSchool}
                    gradYear={gradYear}
                    setGradYear={setGradYear}
                    specialties={specialties}
                    setSpecialties={setSpecialties}
                  />

                  <AccountSection
                    accountName={accountName}
                    setAccountName={setAccountName}
                    accountEmail={accountEmail}
                    setAccountEmail={setAccountEmail}
                    accountPassword={accountPassword}
                    setAccountPassword={setAccountPassword}
                    accountConfirmPassword={accountConfirmPassword}
                    setAccountConfirmPassword={setAccountConfirmPassword}
                    savingAccount={savingAccount}
                    accountSuccess={accountSuccess}
                    accountError={accountError}
                    handleAccountSubmit={handleAccountSubmit}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {activeConsultationAppt && (
          <ClinicalWorkflowModal
            appointment={activeConsultationAppt}
            appointments={appointments}
            onClose={() => setActiveConsultationAppt(null)}
            onConsultationSubmit={() => {
              fetchAppointments(true);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default DoctorDashboard;
