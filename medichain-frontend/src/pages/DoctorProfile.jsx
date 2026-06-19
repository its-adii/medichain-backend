import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../components/Avatar";
import {
  Award,
  Clock,
  IndianRupee,
  CheckCircle,
  Star,
  Calendar as CalendarIcon,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  User,
  FileText,
  Stethoscope,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { designSystem } from "../styles/designSystem";

const DAY_ORDER = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

function DoctorProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const res = await api.get(`/doctors/${id}`);
        setDoctor(res.data.doctor);
      } catch {
        setError("Failed to load doctor profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchDoctor();
  }, [id]);

  const sortedAvailability = doctor?.availability
    ? [...doctor.availability].sort(
        (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
      )
    : [];

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 transition-colors duration-300 animate-pulse">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 space-y-8">
          {/* Back button skeleton */}
          <div className="h-5 bg-slate-200 rounded w-32" />

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left column skeleton */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="w-28 h-28 bg-slate-200 rounded-2xl shrink-0" />
                  <div className="space-y-3 flex-1">
                    <div className="h-7 bg-slate-200 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="h-5 bg-slate-200 rounded w-1/4" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                </div>
              </div>
            </div>

            {/* Right column skeleton (Booking card) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 h-[400px] space-y-6">
              <div className="h-5 bg-slate-200 rounded w-1/2" />
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
              </div>
              <div className="h-12 bg-slate-200 rounded-xl w-full mt-12" />
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-24 transition-colors duration-300">
        <div className={`text-center p-8 ${designSystem.components.card} max-w-sm`}>
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-200">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Not Found</h2>
          <p className="text-slate-500 mb-6 font-medium">{error}</p>
          <Link to="/doctors" className={designSystem.components.buttonPrimary}>
            Back to Doctors
          </Link>
        </div>
      </div>
    );

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-screen bg-slate-50 pt-24 pb-20 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold mb-8 transition group cursor-pointer"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Doctors
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column: Profile details */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={designSystem.components.card}
            >
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={doctor.profileImage}
                    name={doctor.user?.name || "Dr"}
                    className="w-28 h-28 rounded-2xl text-3xl shadow-md"
                    alt={doctor.user?.name}
                  />
                  {doctor.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg border-2 border-white">
                      <CheckCircle size={14} className="stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h1 className={designSystem.typography.pageTitle}>
                        {doctor.user?.name ? (doctor.user.name.toLowerCase().startsWith("dr.") ? doctor.user.name : `Dr. ${doctor.user.name}`) : "Doctor Profile"}
                      </h1>
                      <div className="flex items-center gap-1.5 text-cyan-600 font-bold mt-1 text-sm tracking-wide uppercase">
                        <Award size={16} />
                        {doctor.specialization}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg font-bold text-xs border border-amber-200">
                      <Star size={14} fill="currentColor" />
                      4.9
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {[
                      { icon: User, label: "Experience", value: `${doctor.experience} yrs` },
                      { icon: IndianRupee, label: "Fees", value: `₹${doctor.fees}` },
                      { icon: ShieldCheck, label: "Status", value: doctor.isVerified ? "Verified" : "Pending", green: doctor.isVerified },
                    ].map(({ icon: Icon, label, value, green }) => (
                      <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-center">
                        <Icon size={18} className={`mx-auto mb-1 ${green === true ? "text-emerald-500" : green === false ? "text-amber-500" : "text-cyan-600"}`} />
                        <p className={designSystem.typography.label}>{label}</p>
                        <p className={`font-bold text-sm mt-0.5 ${green === true ? "text-emerald-600" : green === false ? "text-amber-600" : "text-slate-900"}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {doctor.bio && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    <FileText size={14} /> About
                  </h3>
                  <p className={designSystem.typography.body}>{doctor.bio}</p>
                </div>
              )}
            </motion.div>

            {/* Weekly Availability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={designSystem.components.card}
            >
              <h2 className={`flex items-center gap-2 mb-6 ${designSystem.typography.sectionHeading}`}>
                <Clock size={20} className="text-cyan-600" />
                Weekly Availability
              </h2>
              {sortedAvailability.length === 0 ? (
                <p className="text-slate-400 font-medium text-sm">No availability set.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sortedAvailability.map((slot) => (
                    <div
                      key={slot.day}
                      className="flex items-center justify-between bg-[#e0f7fc]/50 border border-cyan-100 rounded-xl px-5 py-3"
                    >
                      <span className="font-bold text-slate-800 capitalize text-sm">{slot.day}</span>
                      <span className="text-cyan-600 font-bold text-sm">
                        {slot.startTime} — {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column: Interactive Booking Panel */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className={`${designSystem.components.card} sticky top-28`}
            >
              <h2 className={`mb-2 ${designSystem.typography.sectionHeading}`}>Book Appointment</h2>
              <p className="text-slate-500 text-sm mb-6 font-medium">
                Consultation fee: <span className="font-bold text-slate-800">₹{doctor.fees}</span>
              </p>

              {/* Not logged in */}
              {!user && (
                <div className="bg-[#e0f7fc]/50 border border-cyan-100 rounded-xl p-6 text-center">
                  <p className="text-slate-700 font-medium mb-4 text-sm">
                    Please log in as a patient to book an appointment.
                  </p>
                  <Link
                    to="/login"
                    className={designSystem.components.buttonPrimary + " w-full"}
                  >
                    Log In
                  </Link>
                </div>
              )}

              {/* Wrong role */}
              {user && user.role !== "patient" && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center font-bold text-sm text-amber-700">
                  <p>Only patients can book appointments.</p>
                </div>
              )}

              {/* Patient booking CTA */}
              {user && user.role === "patient" && (
                <div className="space-y-5">
                  <div className="p-4 bg-cyan-50/20 border border-cyan-100 rounded-xl text-xs text-slate-500 leading-relaxed">
                    <p className="font-bold text-cyan-600 mb-1">Weekly availability configured</p>
                    This practitioner is currently accepting bookings. Click below to choose an available date and time slot using our unified booking flow.
                  </div>
                  <button
                    onClick={() => navigate(`/book?step=2&doctorId=${doctor._id}`)}
                    className={`${designSystem.components.buttonPrimary} w-full py-3.5 flex items-center justify-center gap-1.5`}
                  >
                    Select Slot &amp; Book
                  </button>
                  <p className="text-center text-xs text-slate-400 font-medium">
                    You can manage your appointments from your{" "}
                    <Link to="/dashboard" className="text-cyan-600 font-bold hover:underline">
                      dashboard
                    </Link>
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}

export default DoctorProfile;
