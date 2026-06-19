import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Avatar from "./Avatar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldPlus, 
  LayoutDashboard, 
  Stethoscope, 
  ShieldCheck, 
  CreditCard, 
  HelpCircle, 
  Plus, 
  LogOut, 
  Bell, 
  Settings, 
  User, 
  ChevronDown,
  Search,
  CalendarCheck,
  FileText,
  Menu,
  X,
  Loader2,
  Mail,
  Lock,
  Activity
} from "lucide-react";
import { designSystem } from "../styles/designSystem";

function PatientLayout() {
  const { user, setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Settings Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsName, setSettingsName] = useState("");
  const [settingsEmail, setSettingsEmail] = useState("");
  const [settingsAge, setSettingsAge] = useState("");
  const [settingsGender, setSettingsGender] = useState("");
  const [settingsBloodGroup, setSettingsBloodGroup] = useState("");
  const [settingsWeight, setSettingsWeight] = useState("");
  const [settingsPassword, setSettingsPassword] = useState("");
  const [settingsImageFile, setSettingsImageFile] = useState(null);
  const [settingsImagePreview, setSettingsImagePreview] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");

  // Sync / load settings when modal opens or user profile changes
  useEffect(() => {
    if (user) {
      setSettingsName(user.name || "");
      setSettingsEmail(user.email || "");
      setSettingsAge(user.age || "");
      setSettingsGender(user.gender || "");
      setSettingsBloodGroup(user.bloodGroup || "");
      setSettingsWeight(user.weight || "");
      setSettingsImagePreview(user.profileImage || "");
    }
  }, [user, isSettingsOpen]);

  async function handleSettingsSubmit(e) {
    e.preventDefault();
    setSettingsSuccess("");
    setSettingsError("");
    setSavingSettings(true);

    const formData = new FormData();
    formData.append("name", settingsName);
    formData.append("email", settingsEmail);
    if (settingsPassword) {
      formData.append("password", settingsPassword);
    }
    if (settingsAge !== "") formData.append("age", settingsAge);
    if (settingsGender !== "") formData.append("gender", settingsGender);
    if (settingsBloodGroup !== "") formData.append("bloodGroup", settingsBloodGroup);
    if (settingsWeight !== "") formData.append("weight", settingsWeight);

    if (settingsImageFile) {
      formData.append("profileImage", settingsImageFile);
    }

    try {
      const res = await api.patch("/auth/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUser(res.data.user);
      setSettingsSuccess("Profile updated successfully!");
      setSettingsPassword("");
      setTimeout(() => {
        setIsSettingsOpen(false);
        setSettingsSuccess("");
      }, 1500);
    } catch (err) {
      setSettingsError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingSettings(false);
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image file size must be less than 2MB.");
        return;
      }
      setSettingsImageFile(file);
      setSettingsImagePreview(URL.createObjectURL(file));
    }
  };

  // Close profile dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("accessToken");
      setAccessToken(null);
      setUser(null);
      setIsProfileOpen(false);
      navigate("/login");
    }
  }

  // Sidebar links (Image 2 & 4 Left Sidebar)
  const sidebarLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Appointments", path: "/appointments", icon: CalendarCheck },
    { name: "Medical Records", path: "/medical-records", icon: FileText },
    { name: "My Doctors", path: "/doctors", icon: Stethoscope },
    { name: "Insurance", path: "/insurance", icon: ShieldCheck },
    { name: "Billings", path: "/billings", icon: CreditCard },
    { name: "Help Center", path: "/support", icon: HelpCircle },
  ];

  // Top header links (Image 2 & 4 Top header)
  const headerLinks = [
    { name: "Find Doctors", path: "/doctors" },
    { name: "Appointments", path: "/appointments" },
    { name: "Medical Records", path: "/medical-records" },
    { name: "Support", path: "/support" },
  ];

  const isActive = (path) => location.pathname === path;
  
  // Highlight active top tab: if route starts with the path
  const isHeaderActive = (path) => {
    if (path === "/doctors") {
      return location.pathname === "/doctors" || location.pathname.startsWith("/doctors/");
    }
    return location.pathname === path;
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex transition-colors duration-300">
      
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

      {/* 1. Left Sidebar - Fixed/Responsive position */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 h-full w-[280px] bg-white border-r border-slate-200 flex flex-col py-6 px-5 z-50 transition-transform duration-300 md:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        
        {/* Logo and Brand */}
        <Link to="/dashboard" className="flex items-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/10 transition-transform group-hover:scale-105">
            <ShieldPlus className="text-white" size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
              Medi<span className="text-cyan-600">Chain</span>
            </span>
          </div>
        </Link>

        {/* Portal Dashboard Subheading */}
        <div className="px-3 mb-6">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            PORTAL
          </span>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mt-0.5">
            Dashboard
          </span>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 space-y-1.5">
          {sidebarLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all relative group cursor-pointer ${
                  active 
                    ? "text-cyan-900" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {/* Active cyan pill shape background */}
                {active && (
                  <motion.div 
                    layoutId="activeSidebarBg"
                    className="absolute inset-0 bg-[#e0f7fc] border border-cyan-100 rounded-xl z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                <link.icon 
                  size={18} 
                  className={`z-10 transition-colors ${
                    active ? "text-cyan-600" : "text-slate-400 group-hover:text-slate-600"
                  }`} 
                />
                <span className="z-10">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Book Appointment CTA Button */}
        <div className="my-6">
          <Link
            to="/book"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/10 transition-all cursor-pointer"
          >
            <Plus size={16} className="stroke-[3]" />
            Book Appointment
          </Link>
        </div>

        {/* Settings and Sign Out at the Bottom */}
        <div className="pt-4 border-t border-slate-100 space-y-1">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-sm font-bold tracking-wide transition-colors cursor-pointer group"
          >
            <Settings size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-red-50 rounded-xl text-sm font-bold tracking-wide transition-colors cursor-pointer group"
          >
            <LogOut size={18} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Right Container */}
      <div className="flex-1 md:pl-[280px] flex flex-col min-h-screen">
        
        {/* Top Header sub-navbar */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-20 flex items-center justify-between px-4 sm:px-6 md:px-8">
          
          {/* Left Navigation Tabs (Stitch Top Header links) */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8 h-full">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-50 md:hidden cursor-pointer flex items-center justify-center"
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            <span className="text-lg md:text-xl font-black tracking-tight text-slate-900 mr-2 uppercase shrink-0">
              MediChain
            </span>
            <div className="hidden lg:flex items-center gap-4 xl:gap-6 h-full">
              {headerLinks.map((link) => {
                const active = isHeaderActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative flex items-center h-full text-xs font-black tracking-widest uppercase transition-colors hover:text-cyan-600 ${
                      active ? "text-cyan-600" : "text-slate-500"
                    }`}
                  >
                    {link.name}
                    {active && (
                      <motion.div
                        layoutId="activeHeaderUnderline"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500 rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Header controls: search, notification, settings, avatar */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            
            {/* Search Input bar (records/history searching indicator) */}
            <div className="relative w-64 group hidden sm:block">
              <Search 
                size={16} 
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" 
              />
              <input
                type="text"
                placeholder="Search records..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 text-xs font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none"
              />
            </div>

            {/* Notification Bell Icon */}
            <button className="relative p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer" title="Notifications">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>

            {/* Settings Gear Icon */}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer" 
              title="Settings"
            >
              <Settings size={18} />
            </button>

            {/* User Profile Avatar Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pl-2.5 bg-slate-50 border border-slate-200 hover:border-cyan-300 rounded-full transition-colors cursor-pointer"
              >
                <span className="text-[11px] font-black text-slate-700 tracking-wider hidden sm:inline">
                  {user?.name ? user.name.split(" ")[0].toUpperCase() : "ACCOUNT"}
                </span>
                <Avatar 
                  src={user?.profileImage} 
                  name={user?.name} 
                  className="w-8 h-8 text-[11px] shadow-sm" 
                  alt="Profile"
                />
                <ChevronDown 
                  size={14} 
                  className={`text-slate-400 mr-1 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} 
                />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-150 overflow-hidden py-2 z-[60]"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged In As</p>
                      <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{user?.name}</p>
                      <span className="inline-block px-2 py-0.5 mt-1.5 bg-cyan-50 text-cyan-600 border border-cyan-100 rounded text-[9px] font-black uppercase tracking-wider">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <LayoutDashboard size={16} className="text-cyan-600" />
                      Portal Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setIsSettingsOpen(true);
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Settings size={16} className="text-cyan-600" />
                      Account Settings
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </header>

        {/* 3. Page Content Area */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full h-full flex flex-col"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* Settings Modal (Google Stitch Premium Style) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-600" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Account Settings</h3>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form Scrollable */}
              <form onSubmit={handleSettingsSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                
                {/* Profile Picture Upload Section */}
                <div className="flex flex-col items-center gap-4 border-b border-slate-100 pb-4 sm:pb-6">
                  <div className="relative group shrink-0">
                    <Avatar 
                      src={settingsImagePreview} 
                      name={user?.name} 
                      className="w-20 h-20 text-xl shadow" 
                      alt="Patient profile avatar"
                    />
                    <label className="absolute bottom-0 right-0 bg-cyan-500 text-white p-1.5 rounded-full shadow-md cursor-pointer hover:scale-105 transition-transform flex items-center justify-center border border-white">
                      <Settings className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Max size: 2MB. Format: JPG, PNG</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className={designSystem.typography.label}>Full Name</label>
                    <div className="relative w-full group">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors pointer-events-none select-none" />
                      <input
                        type="text"
                        required
                        value={settingsName}
                        onChange={(e) => setSettingsName(e.target.value)}
                        className={`${designSystem.components.input} pl-10`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className={designSystem.typography.label}>Email Address</label>
                    <div className="relative w-full group">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors pointer-events-none select-none" />
                      <input
                        type="email"
                        required
                        value={settingsEmail}
                        onChange={(e) => setSettingsEmail(e.target.value)}
                        className={`${designSystem.components.input} pl-10`}
                      />
                    </div>
                  </div>

                  {/* Age */}
                  <div className="space-y-1">
                    <label className={designSystem.typography.label}>Age (Years)</label>
                    <div className="relative w-full group">
                      <CalendarCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors pointer-events-none select-none" />
                      <input
                        type="number"
                        min="0"
                        max="125"
                        placeholder="e.g. 25"
                        value={settingsAge}
                        onChange={(e) => setSettingsAge(e.target.value)}
                        className={`${designSystem.components.input} pl-10`}
                      />
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="space-y-1">
                    <label className={designSystem.typography.label}>Weight (kg)</label>
                    <div className="relative w-full group">
                      <Activity size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors pointer-events-none select-none" />
                      <input
                        type="number"
                        min="0"
                        max="400"
                        placeholder="e.g. 70"
                        value={settingsWeight}
                        onChange={(e) => setSettingsWeight(e.target.value)}
                        className={`${designSystem.components.input} pl-10`}
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className={designSystem.typography.label}>Gender</label>
                    <select
                      value={settingsGender}
                      onChange={(e) => setSettingsGender(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-sm font-medium focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div className="space-y-1">
                    <label className={designSystem.typography.label}>Blood Group</label>
                    <select
                      value={settingsBloodGroup}
                      onChange={(e) => setSettingsBloodGroup(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-sm font-medium focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  {/* Password (Optional) */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className={designSystem.typography.label}>New Password (leave blank to keep current)</label>
                    <div className="relative w-full group">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors pointer-events-none select-none" />
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={settingsPassword}
                        onChange={(e) => setSettingsPassword(e.target.value)}
                        className={`${designSystem.components.input} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                {/* Status Messages */}
                <AnimatePresence>
                  {settingsSuccess && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold p-4 rounded-xl overflow-hidden"
                    >
                      {settingsSuccess}
                    </motion.div>
                  )}
                  {settingsError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold p-4 rounded-xl overflow-hidden"
                    >
                      {settingsError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className={designSystem.components.buttonSecondary}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className={designSystem.components.buttonPrimary}
                  >
                    {savingSettings ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-white" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default PatientLayout;
