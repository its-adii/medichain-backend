import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useSocket } from "./context/SocketContext";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Stethoscope } from "lucide-react";
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Doctors = lazy(() => import("./pages/Doctors"));
const DoctorProfile = lazy(() => import("./pages/DoctorProfile"));
const Appointments = lazy(() => import("./pages/Appointments"));
const DoctorDashboard = lazy(() => import("./pages/DoctorDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const BookAppointment = lazy(() => import("./pages/BookAppointment"));
const PatientLayout = lazy(() => import("./components/PatientLayout"));
const MedicalRecords = lazy(() => import("./pages/MedicalRecords"));
const Insurance = lazy(() => import("./pages/Insurance"));
const Billings = lazy(() => import("./pages/Billings"));
const Support = lazy(() => import("./pages/Support"));


function App() {
  const location = useLocation();
  const hideNavbar = ["/login", "/register", "/admin/dashboard", "/doctor/dashboard"].includes(location.pathname);
  const { user } = useAuth();
  const socket = useSocket();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleBooking = (data) => {
      setToast({ type: "booking", message: data.message });
      setTimeout(() => setToast(null), 6000);
    };

    const handleStatusChange = (data) => {
      setToast({ type: "status", message: data.message });
      setTimeout(() => setToast(null), 6000);
    };

    socket.on("appointmentBooked", handleBooking);
    socket.on("appointmentStatusChanged", handleStatusChange);

    return () => {
      socket.off("appointmentBooked", handleBooking);
      socket.off("appointmentStatusChanged", handleStatusChange);
    };
  }, [socket]);

  return (
    <>
      {!hideNavbar && !user && <Navbar />}
      <Suspense fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4 transition-colors duration-300">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Stethoscope size={20} className="text-cyan-600 animate-pulse" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading MediChain...</p>
        </div>
      }>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient-only routes wrapped in PatientLayout */}
            <Route
              element={
                <ProtectedRoute roles={["patient"]}>
                  <PatientLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/book" element={<BookAppointment />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />
              <Route path="/medical-records" element={<MedicalRecords />} />
              <Route path="/insurance" element={<Insurance />} />
              <Route path="/billings" element={<Billings />} />
              <Route path="/support" element={<Support />} />
            </Route>

            {/* Doctor-only routes */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute roles={["doctor"]}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin-only routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </Suspense>

      {/* Real-time Notification Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 flex items-start gap-3 transition-colors"
          >
            <div className="w-10 h-10 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Real-Time Alert</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
