import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../components/Avatar";
import { useDebounce } from "../hooks/useDebounce";
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  IndianRupee, 
  Award, 
  Filter, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  User,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Calendar
} from "lucide-react";
import { designSystem } from "../styles/designSystem";

const SPECIALIZATIONS = [
  "All",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Orthopedics",
  "General Medicine",
  "Dentistry"
];

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeSpecialization, setActiveSpecialization] = useState("All");
  const [minExperience, setMinExperience] = useState("");
  const [maxFees, setMaxFees] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    async function fetchDoctors() {
      setLoading(true);
      setError("");
      try {
        const params = {
          page,
          limit: 6,
          search: debouncedSearch || undefined,
          specialization: activeSpecialization === "All" ? undefined : activeSpecialization,
          minExperience: minExperience || undefined,
          maxFees: maxFees || undefined
        };
        const response = await api.get("/doctors", { params });
        setDoctors(response.data.doctors || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
          setTotalCount(response.data.pagination.total || 0);
        }
      } catch (err) {
        setError("Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();
  }, [page, debouncedSearch, activeSpecialization, minExperience, maxFees]);

  const handleSearchChange = (e) => {
    setPage(1);
    setSearch(e.target.value);
  };

  const handleSpecializationChange = (spec) => {
    setPage(1);
    setActiveSpecialization(spec);
  };

  const resetFilters = () => {
    setPage(1);
    setSearch("");
    setActiveSpecialization("All");
    setMinExperience("");
    setMaxFees("");
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="p-8 space-y-8 bg-slate-50 transition-colors duration-300 min-h-screen"
    >
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Find the right specialist for you
          </h1>
        </div>

        {/* 1. Search Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" size={18} />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by name, specialty, or hospital..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 text-sm font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none"
              />
            </div>
            <button 
              onClick={() => setPage(1)}
              className="px-8 py-3.5 bg-cyan-600 hover:bg-cyan-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/10 transition-all cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>

        {/* 2. Filter Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Specialty Filters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Specialty</label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 no-scrollbar">
              {SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec}
                  onClick={() => handleSpecializationChange(spec)}
                  className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase transition-all cursor-pointer border ${
                    activeSpecialization === spec
                      ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Filter */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Experience</label>
              <select
                value={minExperience}
                onChange={(e) => { setPage(1); setMinExperience(e.target.value); }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none"
              >
                <option value="">Any Experience</option>
                <option value="1">1+ Years</option>
                <option value="3">3+ Years</option>
                <option value="5">5+ Years</option>
                <option value="10">10+ Years</option>
              </select>
            </div>
          </div>

          {/* Max Fees Filter */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Max. Consultation Fee</label>
              <select
                value={maxFees}
                onChange={(e) => { setPage(1); setMaxFees(e.target.value); }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none"
              >
                <option value="">Any Price</option>
                <option value="300">₹300 or less</option>
                <option value="500">₹500 or less</option>
                <option value="1000">₹1000 or less</option>
                <option value="1500">₹1500 or less</option>
                <option value="2000">₹2000 or less</option>
              </select>
            </div>
          </div>

        </div>

        {/* 3. Results Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-900 font-bold">{totalCount}</span> matching specialists
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse"
                >
                  <div className="w-full h-48 bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-8 bg-slate-200 rounded w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h2>
              <p className="text-slate-500 mb-6 font-medium">{error}</p>
              <button 
                onClick={() => resetFilters()}
                className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl font-bold text-xs shadow-md shadow-cyan-600/10 hover:bg-cyan-700 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
              <Search className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900 mb-1">No Results Found</h3>
              <p className="text-slate-500 font-semibold text-xs">We couldn't find any doctors matching your search criteria.</p>
              <button 
                onClick={resetFilters}
                className="mt-4 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs text-slate-700 font-bold cursor-pointer transition active:scale-[0.95]"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Doctor Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => {
                  return (
                    <article
                      key={doctor._id}
                      className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Card Top Image Section */}
                      <div className="relative h-48 bg-slate-100 overflow-hidden shrink-0">
                        <Avatar
                          src={doctor.profileImage}
                          name={doctor.user?.name || "Dr"}
                          className="w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-500 text-3xl"
                          alt={doctor.user?.name}
                        />
                        {/* Status/Verified Badge */}
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-cyan-600 text-[10px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                          <CheckCircle size={11} className="text-cyan-600" fill="none" />
                          Verified
                        </div>
                        {/* Rating Overlay */}
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                          <Star size={11} className="text-amber-400" fill="currentColor" />
                          4.8
                        </div>
                      </div>

                      {/* Card Content Details Section */}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-900 leading-snug">
                            {doctor.user?.name ? (doctor.user.name.toLowerCase().startsWith("dr.") ? doctor.user.name : `Dr. ${doctor.user.name}`) : "Doctor"}
                          </h2>
                          <p className="text-[10px] text-cyan-600 font-semibold tracking-wider uppercase mt-1">
                            {doctor.specialization?.toUpperCase() || "GENERAL MEDICINE"}
                          </p>

                          <div className="space-y-2 text-[11px] text-slate-400 font-semibold mt-4">
                            <p className="flex items-center gap-2">
                              <Award size={13} className="text-cyan-600" />
                              <span>{doctor.experience} Years Experience</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <IndianRupee size={13} className="text-cyan-600" />
                              <span>₹{doctor.fees} Consultation Fee</span>
                            </p>
                            {doctor.school && (
                              <p className="flex items-center gap-2">
                                <User size={13} className="text-slate-400" />
                                <span className="truncate">{doctor.school}</span>
                              </p>
                            )}
                            <p className="flex items-center gap-2">
                              <Clock size={13} className="text-emerald-500" />
                              <span className="text-emerald-600 font-semibold truncate">
                                {doctor.availability && doctor.availability.length > 0 
                                  ? `Available: ${doctor.availability.map(a => a.day.charAt(0).toUpperCase() + a.day.slice(1)).join(", ")}` 
                                  : "By Appointment Only"}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="border-t border-slate-50 pt-4">
                          <Link
                            to={`/doctors/${doctor._id}`}
                            className="w-full flex items-center justify-center py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/5 transition-colors cursor-pointer"
                          >
                            Book Appointment
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Bottom Pagination */}
              {totalPages > 1 && (
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </motion.main>
  );
}

export default Doctors;
