import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../context/SocketContext";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  LayoutDashboard,
  Users,
  BadgeCheck,
  CalendarDays,
  Settings,
  LogOut,
  Search,
  Bell,
  HelpCircle,
  Lock,
  ShieldPlus,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronDown,
  UserPlus,
  Menu
} from "lucide-react";

import OverviewTab from "../components/admin/OverviewTab";
import UsersTab from "../components/admin/UsersTab";
import DoctorsTab from "../components/admin/DoctorsTab";
import AppointmentsTab from "../components/admin/AppointmentsTab";
import SettingsTab from "../components/admin/SettingsTab";
import { useDebounce } from "../hooks/useDebounce";
import { designSystem } from "../styles/designSystem";

const formatDoctorName = (name) => {
  if (!name) return "Doctor";
  return name.trim().toLowerCase().startsWith("dr.") ? name : `Dr. ${name}`;
};

function AdminDashboard() {
  const { user, setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();
  
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("admin_activeTab") || "overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on active tab change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [activeTab]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverHealth, setServerHealth] = useState("Checking...");
  
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); 
  const [verifyingId, setVerifyingId] = useState(null);
  const [flaggingId, setFlaggingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [updatingApptStatusId, setUpdatingApptStatusId] = useState(null);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

  // Search/Filter States
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorStatusFilter, setDoctorStatusFilter] = useState("All");
  const [apptSearch, setApptSearch] = useState("");
  const [apptStatusFilter, setApptStatusFilter] = useState("All");
  const [overviewSearch, setOverviewSearch] = useState("");
  const [settingsSearch, setSettingsSearch] = useState("");

  const debouncedUserSearch = useDebounce(userSearch, 300);
  const debouncedDoctorSearch = useDebounce(doctorSearch, 300);
  const debouncedApptSearch = useDebounce(apptSearch, 300);
  const debouncedOverviewSearch = useDebounce(overviewSearch, 300);
  const debouncedSettingsSearch = useDebounce(settingsSearch, 300);

  const [userPage, setUserPage] = useState(1);
  const [doctorPage, setDoctorPage] = useState(1);
  const [apptPage, setApptPage] = useState(1);

  // Add User Modal States (Shared between Users and Doctors tabs)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [newUserRole, setNewUserRole] = useState("patient");
  const [addingUser, setAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState("");

  // System Settings States
  const [settingsSubTab, setSettingsSubTab] = useState(() => localStorage.getItem("admin_settingsSubTab") || "general");
  const [platformName, setPlatformName] = useState(() => localStorage.getItem("settings_platformName") || "MediChain Global");
  const [adminEmail, setAdminEmail] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState(() => localStorage.getItem("settings_preferredLanguage") || "English (US)");
  const [timezone, setTimezone] = useState(() => localStorage.getItem("settings_timezone") || "(GMT-05:00) Eastern Time");

  const [accessTokenTTL, setAccessTokenTTL] = useState(() => parseInt(localStorage.getItem("settings_accessTokenTTL")) || 15);
  const [refreshTokenTTL, setRefreshTokenTTL] = useState(() => parseInt(localStorage.getItem("settings_refreshTokenTTL")) || 7);
  const [passwordRequireSymbols, setPasswordRequireSymbols] = useState(() => localStorage.getItem("settings_passwordRequireSymbols") !== "false");
  const [passwordMinLength12, setPasswordMinLength12] = useState(() => localStorage.getItem("settings_passwordMinLength12") !== "false");
  const [passwordForceReset90, setPasswordForceReset90] = useState(() => localStorage.getItem("settings_passwordForceReset90") === "true");

  const [apiEnv, setApiEnv] = useState(() => localStorage.getItem("settings_apiEnv") || "production");
  const [baseApiUrl, setBaseApiUrl] = useState(() => localStorage.getItem("settings_baseApiUrl") || "api.medichain.io/v1/core");
  const [systemApiKey, setSystemApiKey] = useState(() => localStorage.getItem("settings_systemApiKey") || "mc_prod_7721_ak_9918273645_secret");
  const [webhooksEnabled, setWebhooksEnabled] = useState(() => localStorage.getItem("settings_webhooksEnabled") !== "false");
  const [rateLimitingEnabled, setRateLimitingEnabled] = useState(() => localStorage.getItem("settings_rateLimitingEnabled") !== "false");

  const [originalSettings, setOriginalSettings] = useState(null);
  const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false);

  // Profile Settings States
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [profileImageFile, setProfileImageFile] = useState(null);

  // Persist active tab selection to localStorage
  useEffect(() => {
    localStorage.setItem("admin_activeTab", activeTab);
  }, [activeTab]);

  // Persist settings sub-tab selection to localStorage
  useEffect(() => {
    localStorage.setItem("admin_settingsSubTab", settingsSubTab);
  }, [settingsSubTab]);

  // Sync profile fields and fetch fresh details when user loads
  useEffect(() => {
    async function loadAdminDetails() {
      try {
        const res = await api.get("/auth/me");
        if (res.data?.user) {
          setProfileName(res.data.user.name || "");
          setProfileEmail(res.data.user.email || "");
          setAdminEmail(res.data.user.email || "");
          setProfileImage(res.data.user.profileImage || "");
          
          const initialData = {
            platformName: localStorage.getItem("settings_platformName") || "MediChain Global",
            adminEmail: res.data.user.email || "",
            preferredLanguage: localStorage.getItem("settings_preferredLanguage") || "English (US)",
            timezone: localStorage.getItem("settings_timezone") || "(GMT-05:00) Eastern Time",
            accessTokenTTL: parseInt(localStorage.getItem("settings_accessTokenTTL")) || 15,
            refreshTokenTTL: parseInt(localStorage.getItem("settings_refreshTokenTTL")) || 7,
            passwordRequireSymbols: localStorage.getItem("settings_passwordRequireSymbols") !== "false",
            passwordMinLength12: localStorage.getItem("settings_passwordMinLength12") !== "false",
            passwordForceReset90: localStorage.getItem("settings_passwordForceReset90") === "true",
            apiEnv: localStorage.getItem("settings_apiEnv") || "production",
            baseApiUrl: localStorage.getItem("settings_baseApiUrl") || "api.medichain.io/v1/core",
            systemApiKey: localStorage.getItem("settings_systemApiKey") || "mc_prod_7721_ak_9918273645_secret",
            webhooksEnabled: localStorage.getItem("settings_webhooksEnabled") !== "false",
            rateLimitingEnabled: localStorage.getItem("settings_rateLimitingEnabled") !== "false",
            profileName: res.data.user.name || "",
            profileImage: res.data.user.profileImage || "",
          };
          setOriginalSettings(initialData);
        }
      } catch (err) {
        console.error("Failed to fetch fresh admin details:", err);
      }
    }
    loadAdminDetails();
  }, [user]);

  async function handleSaveChanges() {
    setSavingProfile(true);
    setProfileSuccess("");
    setProfileError("");
    try {
      // 1. Save admin details (name, email, profile picture file, password) to backend
      const formData = new FormData();
      let hasProfileUpdates = false;

      if (adminEmail && adminEmail !== user?.email) {
        formData.append("email", adminEmail);
        hasProfileUpdates = true;
      }
      if (profileName && profileName !== user?.name) {
        formData.append("name", profileName);
        hasProfileUpdates = true;
      }
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
        hasProfileUpdates = true;
      } else if (profileImage === "") {
        formData.append("profileImage", ""); // Explicitly clear/remove avatar
        hasProfileUpdates = true;
      }
      if (profilePassword) {
        if (profilePassword.length < 6) {
          setProfileError("Password must be at least 6 characters.");
          setSavingProfile(false);
          return;
        }
        if (profilePassword !== profileConfirmPassword) {
          setProfileError("Passwords do not match.");
          setSavingProfile(false);
          return;
        }
        formData.append("password", profilePassword);
        hasProfileUpdates = true;
      }

      if (hasProfileUpdates) {
        const res = await api.patch("/auth/me", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (res.data?.user) {
          setUser(res.data.user);
          setProfileImage(res.data.user.profileImage || "");
          setProfileImageFile(null);
          setProfilePassword("");
          setProfileConfirmPassword("");
        }
      }

      // 2. Save all other settings to localStorage
      localStorage.setItem("settings_platformName", platformName);
      localStorage.setItem("settings_preferredLanguage", preferredLanguage);
      localStorage.setItem("settings_timezone", timezone);
      localStorage.setItem("settings_accessTokenTTL", String(accessTokenTTL));
      localStorage.setItem("settings_refreshTokenTTL", String(refreshTokenTTL));
      localStorage.setItem("settings_passwordRequireSymbols", String(passwordRequireSymbols));
      localStorage.setItem("settings_passwordMinLength12", String(passwordMinLength12));
      localStorage.setItem("settings_passwordForceReset90", String(passwordForceReset90));
      localStorage.setItem("settings_apiEnv", apiEnv);
      localStorage.setItem("settings_baseApiUrl", baseApiUrl);
      localStorage.setItem("settings_systemApiKey", systemApiKey);
      localStorage.setItem("settings_webhooksEnabled", String(webhooksEnabled));
      localStorage.setItem("settings_rateLimitingEnabled", String(rateLimitingEnabled));

      // 3. Update original values reference
      setOriginalSettings({
        platformName,
        adminEmail,
        preferredLanguage,
        timezone,
        accessTokenTTL,
        refreshTokenTTL,
        passwordRequireSymbols,
        passwordMinLength12,
        passwordForceReset90,
        apiEnv,
        baseApiUrl,
        systemApiKey,
        webhooksEnabled,
        rateLimitingEnabled,
        profileName,
        profileImage,
      });

      setProfileSuccess("System settings saved successfully!");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to save system settings.");
      setTimeout(() => setProfileError(""), 5000);
    } finally {
      setSavingProfile(false);
    }
  }

  function handleDiscardChanges() {
    if (!originalSettings) return;
    setPlatformName(originalSettings.platformName);
    setAdminEmail(originalSettings.adminEmail);
    setPreferredLanguage(originalSettings.preferredLanguage);
    setTimezone(originalSettings.timezone);
    setAccessTokenTTL(originalSettings.accessTokenTTL);
    setRefreshTokenTTL(originalSettings.refreshTokenTTL);
    setPasswordRequireSymbols(originalSettings.passwordRequireSymbols);
    setPasswordMinLength12(originalSettings.passwordMinLength12);
    setPasswordForceReset90(originalSettings.passwordForceReset90);
    setApiEnv(originalSettings.apiEnv);
    setBaseApiUrl(originalSettings.baseApiUrl);
    setSystemApiKey(originalSettings.systemApiKey);
    setWebhooksEnabled(originalSettings.webhooksEnabled);
    setRateLimitingEnabled(originalSettings.rateLimitingEnabled);
    setProfileName(originalSettings.profileName || "");
    setProfileImage(originalSettings.profileImage || "");
    setProfileImageFile(null);

    setProfileSuccess("Changes discarded. Reset to last saved state.");
    setTimeout(() => setProfileSuccess(""), 4000);
  }

  async function handleClearAllSessions() {
    setSavingProfile(true);
    setProfileSuccess("");
    setProfileError("");
    try {
      await api.delete("/auth/sessions/all");
      setProfileSuccess("All active user sessions revoked successfully. Logging you out...");
      setTimeout(() => {
        handleLogout();
      }, 2500);
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to invalidate sessions.");
      setShowRevokeAllConfirm(false);
    } finally {
      setSavingProfile(false);
    }
  }

  async function fetchAll(silent = false) {
    if (!silent) setLoading(true);
    try {
      const [statsRes, usersRes, doctorsRes, apptRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/doctors"),
        api.get("/appointments"),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setDoctors(doctorsRes.data.doctors);
      setAppointments(apptRes.data.appointments);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();

    async function checkHealth() {
      try {
        const res = await api.get("/health");
        if (res.status === 200) setServerHealth("Online");
        else setServerHealth("Degraded");
      } catch {
        setServerHealth("Offline");
      }
    }
    checkHealth();
    const healthInterval = setInterval(checkHealth, 30000);

    return () => {
      clearInterval(healthInterval);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleAppointmentsUpdated = () => {
      console.log("Appointments updated. Refreshing dashboard...");
      fetchAll(true);
    };

    const handleUsersUpdated = () => {
      console.log("Users list updated. Refreshing dashboard...");
      fetchAll(true);
    };

    const handleDoctorsUpdated = () => {
      console.log("Doctors list updated. Refreshing dashboard...");
      fetchAll(true);
    };

    socket.on("appointmentsUpdated", handleAppointmentsUpdated);
    socket.on("usersUpdated", handleUsersUpdated);
    socket.on("doctorsUpdated", handleDoctorsUpdated);

    return () => {
      socket.off("appointmentsUpdated", handleAppointmentsUpdated);
      socket.off("usersUpdated", handleUsersUpdated);
      socket.off("doctorsUpdated", handleDoctorsUpdated);
    };
  }, [socket]);

  async function handleDeleteUser(userId) {
    if (deleteConfirmId !== userId) {
      setDeleteConfirmId(userId);
      setTimeout(() => setDeleteConfirmId(null), 3500);
      return;
    }
    setDeleteConfirmId(null);
    setDeletingId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch {
      alert("Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  }

  function updateDoctorState(updatedDoctor) {
    setDoctors((prev) =>
      prev.map((d) => (d._id === updatedDoctor._id ? { ...d, ...updatedDoctor } : d))
    );
  }

  async function handleToggleVerify(doctor) {
    setVerifyingId(doctor._id);
    try {
      const res = await api.patch(`/admin/doctors/${doctor._id}/verify`);
      const updatedDoctor = res.data?.doctor || { ...doctor, isVerified: !doctor.isVerified };
      updateDoctorState(updatedDoctor);
    } catch {
      alert("Failed to toggle doctor verification.");
    } finally {
      setVerifyingId(null);
    }
  }

  async function handleToggleFlag(doctor) {
    setFlaggingId(doctor._id);
    try {
      const res = await api.patch(`/admin/doctors/${doctor._id}/flag`);
      const updatedDoctor = res.data?.doctor || { ...doctor, isFlagged: !doctor.isFlagged };
      updateDoctorState(updatedDoctor);
    } catch {
      alert("Failed to update credential flag.");
    } finally {
      setFlaggingId(null);
    }
  }

  async function handleUpdateAppointmentStatus(appointmentId, newStatus) {
    setUpdatingApptStatusId(appointmentId);
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointmentId ? { ...a, status: newStatus } : a))
      );
    } catch {
      alert("Failed to update appointment status.");
    } finally {
      setUpdatingApptStatusId(null);
    }
  }

  async function handleClearHistory() {
    setClearingHistory(true);
    try {
      await api.delete("/appointments/history");
      setAppointments((prev) =>
        prev.filter((a) => a.status !== "completed" && a.status !== "cancelled")
      );
    } catch {
      alert("Failed to clear appointment history.");
    } finally {
      setClearingHistory(false);
    }
  }

  async function handleAddUser(e) {
    e.preventDefault();
    setAddUserError("");
    setAddingUser(true);
    try {
      await api.post("/auth/register", {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("patient");
      setShowNewUserPassword(false);
      setIsAddUserModalOpen(false);
      fetchAll();
    } catch (err) {
      setAddUserError(err.response?.data?.message || "Failed to register user.");
    } finally {
      setAddingUser(false);
    }
  }

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.log(err);
    } finally {
      localStorage.removeItem("accessToken");
      setAccessToken(null);
      setUser(null);
      navigate("/login");
    }
  }

  // Analytics Aggregation Helpers
  const getUserGrowth = useCallback(() => {
    if (!users || users.length === 0) return "+0%";
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const recent = users.filter(u => u.createdAt && new Date(u.createdAt) > thirtyDaysAgo).length;
    const base = users.length - recent;
    if (base === 0) return `+${recent * 100}%`;
    const rate = (recent / base) * 100;
    return `+${rate.toFixed(0)}%`;
  }, [users]);

  const getVerificationRate = useCallback(() => {
    if (!doctors || doctors.length === 0) return "0.0%";
    const verified = doctors.filter(d => d.isVerified).length;
    return `${((verified / doctors.length) * 100).toFixed(1)}%`;
  }, [doctors]);

  const getPendingApptsCount = useCallback(() => {
    return appointments.filter(a => a.status === "pending").length;
  }, [appointments]);

  const getPendingApptsLoad = useCallback(() => {
    const pending = getPendingApptsCount();
    return pending > 5 ? "High Load" : "Optimal";
  }, [getPendingApptsCount]);

  const getEarningsData = useCallback(() => {
    const dailyEarnings = {};
    appointments.forEach((appt) => {
      if (appt.date && ["confirmed", "completed"].includes(appt.status)) {
        const date = new Date(appt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const fee = appt.doctor?.fees || 0;
        dailyEarnings[date] = (dailyEarnings[date] || 0) + fee;
      }
    });
    const data = Object.entries(dailyEarnings).map(([date, amount]) => ({ date, amount }));
    return data.length > 0 ? data.slice(-7) : [{ date: "Today", amount: 0 }];
  }, [appointments]);

  const getStatusData = useCallback(() => {
    const counts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    appointments.forEach((appt) => {
      if (counts[appt.status] !== undefined) {
        counts[appt.status]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [appointments]);

  function exportUsersCSV() {
    const combinedUsers = users.map(u => ({
      name: u.name,
      email: u.email,
      role: u.role,
      joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—",
    }));
    const headers = ["Name", "Email", "Role", "Joined Date"];
    const rows = combinedUsers.map((u) => [
      u.name,
      u.email,
      u.role,
      u.joinedDate,
    ]);
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `medichain_users_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function exportAppointmentsCSV() {
    const allAppointments = appointments.map((a) => ({
      patientName: a.patient?.name || "Patient",
      patientId: `PT-${(a._id || "").slice(-4).toUpperCase()}`,
      reason: a.reason || "Consultation",
      date: a.date ? new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
      time: a.time || "—",
      status: a.status,
    }));
    const headers = ["Patient Name", "Patient ID", "Type", "Date", "Time", "Status"];
    const rows = allAppointments.map((a) => [
      a.patientName,
      a.patientId,
      a.reason,
      a.date,
      a.time,
      a.status,
    ]);
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `medichain_appointments_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // Derive recent users for Overview tab search
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role.toLowerCase(),
      detail: u.role === "doctor" ? "General Medicine" : (u.role === "admin" ? "Staff / Admin" : "Patient ID: #" + (u._id || "").slice(-4)),
      joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—",
      avatar: (() => {
        // For doctors, check their Doctor profile image first
        if (u.role === "doctor") {
          const doc = doctors.find(d => d.user && (d.user._id === u._id || d.user === u._id));
          if (doc?.profileImage) return doc.profileImage;
        }
        // Then check the User model's profileImage
        if (u.profileImage) return u.profileImage;
        // Fallback to stock photo
        return u.role === "doctor"
          ? `https://images.unsplash.com/photo-${u.name.charCodeAt(0) % 2 === 0 ? "1559839734-2b71ea197ec2" : "1622253692010-333f2da6031d"}?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`
          : `https://images.unsplash.com/photo-${u.name.charCodeAt(0) % 2 === 0 ? "1507003211169-0a1dd7228f2d" : "1500648767791-00dcc994a43e"}?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`;
      })(),
      status: (() => {
        if (u.role !== "doctor") return "ACTIVE";
        const doc = doctors.find(d => d.user && (d.user._id === u._id || d.user === u._id));
        if (!doc) return "PENDING";
        if (doc.isFlagged) return "FLAGGED";
        return doc.isVerified ? "ACTIVE" : "PENDING";
      })(),
      isMock: false
    }))
    .filter(u => 
      u.name.toLowerCase().includes(debouncedOverviewSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(debouncedOverviewSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(debouncedOverviewSearch.toLowerCase())
    )
    .slice(0, 5);

  const TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: `User Management`, icon: Users },
    { id: "doctors", label: `Doctor Verification`, icon: BadgeCheck },
    { id: "appointments", label: `Appointments`, icon: CalendarDays },
    { id: "profile", label: "System Settings", icon: Settings },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen w-full flex font-sans antialiased"
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

      {/* SideNavBar */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 h-full w-[280px] bg-white border-r border-slate-200 flex flex-col py-6 px-4 shadow-sm z-50 transition-transform duration-300 md:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 mb-8 group px-2">
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
            ADMIN PORTAL
          </span>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mt-0.5">
            System Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1.5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-bold text-sm cursor-pointer group relative ${
                  isActive
                    ? "text-cyan-900"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="adminActiveTabIndicator"
                    className="absolute inset-0 bg-[#e0f7fc] border border-cyan-100 rounded-xl z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <IconComp
                  size={18}
                  className={`z-10 transition-all duration-200 ${
                    isActive ? "text-cyan-600 scale-110" : "text-slate-400 group-hover:text-slate-600 group-hover:scale-110"
                  }`}
                />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-red-50 text-sm font-bold tracking-wide transition-colors cursor-pointer group"
          >
            <LogOut size={18} className="text-slate-400 group-hover:text-rose-505 group-hover:scale-110 transition-all duration-200" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="md:ml-[280px] flex-1 flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="bg-white border-b border-slate-200 h-20 flex justify-between items-center w-full px-6 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 md:gap-8 h-full flex-1 max-w-[360px]">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-50 md:hidden cursor-pointer flex items-center justify-center animate-pulse"
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="relative w-full group hidden sm:block">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
              <input
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 transition-all text-slate-900 placeholder:text-slate-400 outline-none"
                placeholder={
                  activeTab === "doctors" ? "Search doctor records..." :
                  activeTab === "users" ? "Search by name, email..." :
                  activeTab === "appointments" ? "Search appointments..." :
                  activeTab === "overview" ? "Search recent users..." :
                  "Search system settings..."
                }
                type="text"
                value={
                  activeTab === "doctors" ? doctorSearch :
                  activeTab === "users" ? userSearch :
                  activeTab === "appointments" ? apptSearch :
                  activeTab === "overview" ? overviewSearch :
                  activeTab === "profile" ? settingsSearch :
                  ""
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (activeTab === "doctors") setDoctorSearch(val);
                  else if (activeTab === "users") setUserSearch(val);
                  else if (activeTab === "appointments") setApptSearch(val);
                  else if (activeTab === "overview") setOverviewSearch(val);
                  else if (activeTab === "profile") setSettingsSearch(val);
                }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer" title="Notifications">
                <Bell size={18} />
              </button>
              <button className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer" title="Help Center">
                <HelpCircle size={18} />
              </button>
              <button onClick={() => setActiveTab("profile")} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer" title="Settings">
                <Settings size={18} />
              </button>
            </div>
            
            <div className="h-6 w-px bg-slate-200"></div>
            
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab("profile")}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name || "Admin User"}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{user?.role?.toUpperCase() || "SUPER ADMINISTRATOR"}</p>
              </div>
              <Avatar
                src={user?.profileImage}
                name={user?.name || "Admin"}
                className="w-9 h-9 border border-slate-200 group-hover:border-cyan-300 shadow-sm text-xs"
                alt="Admin Profile"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 sm:p-8 space-y-6 flex-1 overflow-y-auto bg-[#f8f9ff]">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              {/* Header skeleton */}
              <div className="space-y-2">
                <div className="h-6 bg-slate-200 rounded w-1/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>

              {/* Stats grid skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-[130px]">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                        <div className="h-7 bg-slate-200 rounded w-1/3" />
                      </div>
                      <div className="w-9 h-9 bg-slate-200 rounded-lg" />
                    </div>
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                  </div>
                ))}
              </div>

              {/* Graph / Table skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 h-[350px]">
                  <div className="h-4 bg-slate-200 rounded w-1/4 mb-6" />
                  <div className="h-[250px] bg-slate-200 rounded w-full" />
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 h-[350px]">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-6" />
                  <div className="space-y-4">
                    {[...Array(4)].map((_, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="h-3 bg-slate-200 rounded w-1/2" />
                          <div className="h-2 bg-slate-200 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <OverviewTab
                  stats={stats}
                  doctors={doctors}
                  appointments={appointments}
                  recentUsers={recentUsers}
                  setActiveTab={setActiveTab}
                  fetchAll={fetchAll}
                  getUserGrowth={getUserGrowth}
                  getVerificationRate={getVerificationRate}
                  getPendingApptsCount={getPendingApptsCount}
                  getPendingApptsLoad={getPendingApptsLoad}
                  getEarningsData={getEarningsData}
                  getStatusData={getStatusData}
                />
              )}

              {activeTab === "users" && (
                <UsersTab
                  users={users}
                  doctors={doctors}
                  deletingId={deletingId}
                  deleteConfirmId={deleteConfirmId}
                  setDeleteConfirmId={setDeleteConfirmId}
                  handleDeleteUser={handleDeleteUser}
                  userSearch={userSearch}
                  setUserSearch={setUserSearch}
                  userSearchDebounced={debouncedUserSearch}
                  userRoleFilter={userRoleFilter}
                  setUserRoleFilter={setUserRoleFilter}
                  userPage={userPage}
                  setUserPage={setUserPage}
                  getUserGrowth={getUserGrowth}
                  exportUsersCSV={exportUsersCSV}
                  setIsAddUserModalOpen={setIsAddUserModalOpen}
                  setAddUserError={setAddUserError}
                  setNewUserRole={setNewUserRole}
                />
              )}

              {activeTab === "doctors" && (
                <DoctorsTab
                  doctors={doctors}
                  verifyingId={verifyingId}
                  flaggingId={flaggingId}
                  handleToggleVerify={handleToggleVerify}
                  handleToggleFlag={handleToggleFlag}
                  doctorSearch={debouncedDoctorSearch}
                  setDoctorSearch={setDoctorSearch}
                  doctorStatusFilter={doctorStatusFilter}
                  setDoctorStatusFilter={setDoctorStatusFilter}
                  doctorPage={doctorPage}
                  setDoctorPage={setDoctorPage}
                  setNewUserRole={setNewUserRole}
                  setAddUserError={setAddUserError}
                  setIsAddUserModalOpen={setIsAddUserModalOpen}
                />
              )}

              {activeTab === "appointments" && (
                <AppointmentsTab
                  appointments={appointments}
                  users={users}
                  doctors={doctors}
                  updatingApptStatusId={updatingApptStatusId}
                  cancelConfirmId={cancelConfirmId}
                  setCancelConfirmId={setCancelConfirmId}
                  clearingHistory={clearingHistory}
                  showClearHistoryConfirm={showClearHistoryConfirm}
                  setShowClearHistoryConfirm={setShowClearHistoryConfirm}
                  handleUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                  handleClearHistory={handleClearHistory}
                  apptSearch={debouncedApptSearch}
                  setApptSearch={setApptSearch}
                  apptStatusFilter={apptStatusFilter}
                  setApptStatusFilter={setApptStatusFilter}
                  apptPage={apptPage}
                  setApptPage={setApptPage}
                  exportAppointmentsCSV={exportAppointmentsCSV}
                  fetchAll={fetchAll}
                />
              )}

              {activeTab === "profile" && (
                <SettingsTab
                  user={user}
                  savingProfile={savingProfile}
                  profileSuccess={profileSuccess}
                  setProfileSuccess={setProfileSuccess}
                  profileError={profileError}
                  setProfileError={setProfileError}
                  handleDiscardChanges={handleDiscardChanges}
                  handleSaveChanges={handleSaveChanges}
                  handleClearAllSessions={handleClearAllSessions}
                  settingsSubTab={settingsSubTab}
                  setSettingsSubTab={setSettingsSubTab}
                  platformName={platformName}
                  setPlatformName={setPlatformName}
                  adminEmail={adminEmail}
                  setAdminEmail={setAdminEmail}
                  preferredLanguage={preferredLanguage}
                  setPreferredLanguage={setPreferredLanguage}
                  timezone={timezone}
                  setTimezone={setTimezone}
                  accessTokenTTL={accessTokenTTL}
                  setAccessTokenTTL={setAccessTokenTTL}
                  refreshTokenTTL={refreshTokenTTL}
                  setRefreshTokenTTL={setRefreshTokenTTL}
                  passwordRequireSymbols={passwordRequireSymbols}
                  setPasswordRequireSymbols={setPasswordRequireSymbols}
                  passwordMinLength12={passwordMinLength12}
                  setPasswordMinLength12={setPasswordMinLength12}
                  passwordForceReset90={passwordForceReset90}
                  setPasswordForceReset90={setPasswordForceReset90}
                  apiEnv={apiEnv}
                  setApiEnv={setApiEnv}
                  baseApiUrl={baseApiUrl}
                  setBaseApiUrl={setBaseApiUrl}
                  systemApiKey={systemApiKey}
                  webhooksEnabled={webhooksEnabled}
                  setWebhooksEnabled={setWebhooksEnabled}
                  rateLimitingEnabled={rateLimitingEnabled}
                  setRateLimitingEnabled={setRateLimitingEnabled}
                  profileName={profileName}
                  setProfileName={setProfileName}
                  profileImage={profileImage}
                  setProfileImage={setProfileImage}
                  setProfileImageFile={setProfileImageFile}
                  profilePassword={profilePassword}
                  setProfilePassword={setProfilePassword}
                  profileConfirmPassword={profileConfirmPassword}
                  setProfileConfirmPassword={setProfileConfirmPassword}
                  showRevokeAllConfirm={showRevokeAllConfirm}
                  setShowRevokeAllConfirm={setShowRevokeAllConfirm}
                  settingsSearch={debouncedSettingsSearch}
                />
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Global Footer */}
        <footer className="bg-white border-t border-[#e2e8f0] px-8 py-3.5 flex justify-between items-center text-[10px] font-bold text-[#7c839b] shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${
                serverHealth === "Online" ? "bg-emerald-500 animate-pulse" :
                serverHealth === "Offline" ? "bg-rose-500" :
                "bg-amber-500"
              }`}></span>
              Server Status: {serverHealth}
            </span>
            <span className="flex items-center gap-1.5">
              <Lock size={10} />
              SSL Secured
            </span>
          </div>
          <div>
            © 2024 MediChain Infrastructure Labs
          </div>
        </footer>
      </main>

      {/* ── ADD USER MODAL (Shared between Users and Doctors tabs) ── */}
      <AnimatePresence>
        {isAddUserModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]"
            onMouseDown={(e) => { if (e.target === e.currentTarget) setIsAddUserModalOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-[#e2e8f0] bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-[#0b1c30] text-base">Register New User</h3>
                <button onClick={() => { setIsAddUserModalOpen(false); setShowNewUserPassword(false); }} className="p-1 hover:bg-slate-200 rounded-lg transition cursor-pointer">
                  <X size={18} className="text-[#45464d]" />
                </button>
              </div>
              <form onSubmit={handleAddUser} autoComplete="off" className="p-6 space-y-4">
                <AnimatePresence>
                  {addUserError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl flex items-center gap-2 text-xs font-bold overflow-hidden"
                    >
                      <AlertCircle size={14} />
                      {addUserError}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45464d] uppercase tracking-wider">Full Name</label>
                  <input type="text" required autoComplete="off" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="e.g. Dr. Sarah Jenkins" className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#e2e8f0] text-[#0b1c30] rounded-xl text-sm font-medium focus:outline-none focus:border-[#00687a] focus:bg-white transition" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45464d] uppercase tracking-wider">Email Address</label>
                  <input type="email" required autoComplete="new-email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="user@medichain.org" className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#e2e8f0] text-[#0b1c30] rounded-xl text-sm font-medium focus:outline-none focus:border-[#00687a] focus:bg-white transition" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45464d] uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showNewUserPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      minLength={6}
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-2.5 pr-10 bg-[#f8f9ff] border border-[#e2e8f0] text-[#0b1c30] rounded-xl text-sm font-medium focus:outline-none focus:border-[#00687a] focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewUserPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45464d] hover:text-[#00687a] transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showNewUserPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45464d] uppercase tracking-wider">Role</label>
                  <div className="relative">
                    <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#e2e8f0] text-[#0b1c30] rounded-xl text-sm font-medium focus:outline-none focus:border-[#00687a] focus:bg-white transition appearance-none cursor-pointer pr-10">
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45464d] pointer-events-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-[#e2e8f0]">
                  <button type="button" onClick={() => { setIsAddUserModalOpen(false); setShowNewUserPassword(false); }} className="px-4 py-2 border border-[#e2e8f0] hover:bg-slate-50 rounded-xl text-xs font-bold text-[#45464d] transition cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={addingUser} className="px-6 py-2 bg-[#00687a] hover:bg-[#005c6e] text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-60 flex items-center gap-2 cursor-pointer">
                    {addingUser ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                    {addingUser ? "Registering..." : "Register User"}
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

export default AdminDashboard;
