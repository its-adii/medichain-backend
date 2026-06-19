import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";

import { 
  ShieldPlus, 
  Menu, 
  X, 
  LogOut, 
  User, 
  LayoutDashboard,
  Stethoscope,
  ChevronDown,
  Home,
  CalendarDays,
  LogIn,
  UserPlus
} from "lucide-react";

function Navbar() {
  const { user, setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

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

  // Handle scroll effect with requestAnimationFrame throttle
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.log(err);
    } finally {
      localStorage.removeItem("accessToken");
      setAccessToken(null);
      setUser(null);
      setIsProfileOpen(false);
      navigate("/login");
    }
  }


  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Doctors", path: "/doctors", icon: Stethoscope },
  ];

  const isActive = (path) => location.pathname === path;

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "doctor") return "/doctor/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/dashboard";
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg shadow-lg dark:shadow-slate-950/20 py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 group transition-transform hover:scale-105"
        >
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-200">
            <ShieldPlus className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Medi<span className="text-cyan-600 dark:text-cyan-500">Chain</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <section className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`relative flex items-center gap-1.5 text-sm font-bold tracking-wide transition-colors hover:text-cyan-600 dark:hover:text-cyan-500 group ${
                isActive(link.path) ? "text-cyan-600 dark:text-cyan-500" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <link.icon size={16} className="transition-transform duration-200 group-hover:scale-110" />
              {link.name}
              {isActive(link.path) && (
                <motion.div 
                  layoutId="navUnderline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-cyan-500 dark:bg-cyan-400 rounded-full"
                />
              )}
            </Link>
          ))}

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

          {!user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-500 transition group"
              >
                <LogIn size={16} className="transition-transform duration-200 group-hover:scale-110" />
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-cyan-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-cyan-600 transition shadow-lg shadow-cyan-100 dark:shadow-none flex items-center gap-1.5 group"
              >
                <UserPlus size={16} className="transition-transform duration-200 group-hover:scale-110" />
                Join Now
              </Link>
            </div>
          ) : (
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pl-3 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-full hover:border-cyan-300 dark:hover:border-cyan-750 transition cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {user?.name ? user.name.split(" ")[0] : "Account"}
                </span>
                <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-500 rounded-full flex items-center justify-center">
                  <User size={18} />
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden py-2"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Signed In As</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">{user.name}</p>
                      <span className="inline-block px-2 py-0.5 mt-1 bg-[#e0f7fc] dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-500 border border-cyan-100 dark:border-cyan-900/30 rounded text-[10px] font-black uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition mt-1"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <LayoutDashboard size={18} className="text-cyan-600 dark:text-cyan-500" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Mobile Actions */}
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-2 text-slate-600 dark:text-slate-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center gap-4 text-xl font-bold text-slate-800 dark:text-slate-200"
                >
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-cyan-600 dark:text-cyan-500">
                    <link.icon size={20} />
                  </div>
                  {link.name}
                </Link>
              ))}
              
              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

              {!user ? (
                <div className="flex flex-col gap-4">
                  <Link
                    to="/login"
                    className="w-full py-4 flex items-center justify-center gap-2 font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-2xl group transition-all duration-200 hover:border-cyan-300"
                  >
                    <LogIn size={18} className="transition-transform duration-200 group-hover:scale-110 text-cyan-600" />
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full py-4 flex items-center justify-center gap-2 font-bold text-white bg-cyan-500 rounded-2xl shadow-lg shadow-cyan-100 group transition-all duration-200 hover:bg-cyan-600"
                  >
                    <UserPlus size={18} className="transition-transform duration-200 group-hover:scale-110" />
                    Join Now
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="w-11 h-11 bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-500 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0">
                      {user.name ? user.name.charAt(0).toUpperCase() : <User size={22} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{user.name}</p>
                      <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">{user.role}</p>
                    </div>
                  </div>

                  <Link
                    to={getDashboardPath()}
                    className="flex items-center gap-4 text-xl font-bold text-slate-800 dark:text-slate-200 mt-2"
                  >
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-cyan-600 dark:text-cyan-500">
                      <LayoutDashboard size={20} />
                    </div>
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 text-xl font-bold text-red-600"
                  >
                    <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <LogOut size={20} />
                    </div>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
