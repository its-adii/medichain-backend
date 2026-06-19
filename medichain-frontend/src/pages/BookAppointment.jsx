import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../components/Avatar";
import {
  Calendar,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  Stethoscope,
  MapPin,
  Award,
  IndianRupee,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Star,
  FileText,
  Search,
  Filter,
  CheckCircle
} from "lucide-react";
import { designSystem } from "../styles/designSystem";

function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = parseInt(searchParams.get("step") || "1", 10);
  const doctorIdParam = searchParams.get("doctorId") || "";

  // Booking Flow State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [visitType, setVisitType] = useState("In-Person"); // 'In-Person' | 'Virtual'
  const [insuranceProvider, setInsuranceProvider] = useState("BlueCross HealthShield");
  const [insurancePolicyNo, setInsurancePolicyNo] = useState("BC-8821-3942");
  const [hasInsurance, setHasInsurance] = useState("yes"); // 'yes' | 'no'
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState("");
  const [bookSuccess, setBookSuccess] = useState(false);

  // Loading & error states
  const [loadingDoctor, setLoadingDoctor] = useState(false);
  const [errorDoctor, setErrorDoctor] = useState("");

  // Doctor list selection states (Step 1)
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [specialty, setSpecialty] = useState("All");

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

  // Sync / fetch doctor details if doctorId is present in URL
  useEffect(() => {
    if (doctorIdParam) {
      async function fetchSelectedDoctor() {
        setLoadingDoctor(true);
        setErrorDoctor("");
        try {
          const res = await api.get(`/doctors/${doctorIdParam}`);
          setSelectedDoctor(res.data.doctor);
        } catch (err) {
          setErrorDoctor("Failed to load doctor profile.");
        } finally {
          setLoadingDoctor(false);
        }
      }
      fetchSelectedDoctor();
    } else {
      setSelectedDoctor(null);
    }
  }, [doctorIdParam]);

  // Fetch doctors for Step 1
  useEffect(() => {
    if (currentStep !== 1) return;
    
    async function fetchDoctors() {
      setLoadingList(true);
      setErrorList("");
      try {
        const params = {
          search: searchQuery || undefined,
          specialization: specialty === "All" ? undefined : specialty,
          limit: 100 // Load all for selection grid
        };
        const res = await api.get("/doctors", { params });
        setDoctorsList(res.data.doctors || []);
      } catch (err) {
        setErrorList("Failed to fetch doctors.");
      } finally {
        setLoadingList(false);
      }
    }

    const delay = setTimeout(() => {
      fetchDoctors();
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery, specialty, currentStep]);

  // Navigate to steps helper
  const goToStep = (step, docId = doctorIdParam) => {
    const params = { step };
    if (docId) params.doctorId = docId;
    setSearchParams(params);
  };

  const nextStep = () => {
    if (currentStep < 4) goToStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  };

  async function handleBook() {
    setBooking(true);
    setBookError("");
    setBookSuccess(false);
    try {
      await api.post("/appointments", {
        doctorId: doctorIdParam,
        date: selectedDate,
        time: selectedTime,
        reason: reason
      });
      setBookSuccess(true);
      
      // Auto-redirect to dashboard after 3.5 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 3500);
    } catch (err) {
      setBookError(err.response?.data?.message || "Failed to book appointment.");
    } finally {
      setBooking(false);
    }
  }

  const getAvailableDates = () => {
    if (!selectedDoctor || !selectedDoctor.availability) return [];
    const dates = [];
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const activeDays = selectedDoctor.availability.map(a => a.day.toLowerCase());

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayName = daysOfWeek[d.getDay()];
      if (activeDays.includes(dayName)) {
        dates.push({
          dateStr: d.toISOString().split("T")[0],
          dayName,
          dayNum: d.getDate(),
          month: d.toLocaleString("default", { month: "short" }),
          year: d.getFullYear(),
          config: selectedDoctor.availability.find(a => a.day.toLowerCase() === dayName)
        });
      }
    }
    return dates;
  };

  const getTimeSlotsForDate = (dateStr) => {
    if (!selectedDoctor || !dateStr) return [];
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const d = new Date(dateStr);
    const dayName = daysOfWeek[d.getDay()];
    const config = selectedDoctor.availability.find(a => a.day.toLowerCase() === dayName);
    if (!config) return [];

    const slots = [];
    const [startHour, startMin] = config.startTime.split(":").map(Number);
    const [endHour, endMin] = config.endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;
      slots.push(timeStr);

      currentMin += 30;
      if (currentMin >= 60) {
        currentHour += 1;
        currentMin -= 60;
      }
    }
    return slots;
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
        
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
          Go Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Multi-Step Flow */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex-grow">
              
              {/* Stepper Progress Bar (Image 3) */}
              <div className="flex items-center justify-between mb-10 px-2 sm:px-6">
                {[
                  { num: 1, label: "Doctor" },
                  { num: 2, label: "Schedule" },
                  { num: 3, label: "Details" },
                  { num: 4, label: "Confirm" }
                ].map((step, idx) => {
                  const isCompleted = currentStep > step.num;
                  const isActive = currentStep === step.num;
                  
                  return (
                    <div key={step.num} className="flex items-center flex-1 last:flex-initial">
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                          isCompleted
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : isActive
                              ? "bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/10"
                              : "bg-slate-150 text-slate-400 border-slate-200"
                        }`}>
                          {isCompleted ? <Check size={14} className="stroke-[3]" /> : step.num}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                          isActive || isCompleted ? "text-cyan-600 font-black" : "text-slate-400 font-semibold"
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      {idx < 3 && (
                        <div className={`h-[2px] flex-grow mx-1 sm:mx-4 transition-all duration-500 ${
                          isCompleted ? "bg-emerald-500" : "bg-slate-200"
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step Panels */}
              <div className="flex-1 flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex-1"
                  >
                    {/* Step 1: Select Doctor */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Doctor</h2>
                          <p className="text-xs text-slate-500 mt-1 font-semibold">
                            Choose a specialist from our network to schedule your consultation.
                          </p>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-grow">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search by name..."
                              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 text-xs font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none"
                            />
                          </div>
                        </div>

                        {/* Specialization Pills */}
                        <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
                          {SPECIALIZATIONS.map((spec) => (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => setSpecialty(spec)}
                              className={`px-4 py-1.5 rounded-full font-bold text-[10px] uppercase whitespace-nowrap border cursor-pointer transition-all ${
                                specialty === spec
                                  ? "bg-cyan-500 text-white border-cyan-500 shadow-sm"
                                  : "bg-slate-50 text-slate-600 border-slate-205 hover:bg-slate-100"
                              }`}
                            >
                              {spec}
                            </button>
                          ))}
                        </div>

                        {/* Doctors List */}
                        {loadingList ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(2)].map((_, i) => (
                              <div key={i} className="bg-white rounded-xl border border-slate-150 p-5 animate-pulse space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-slate-200 rounded-full" />
                                  <div className="flex-grow space-y-2">
                                    <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                                    <div className="h-2.5 bg-slate-200 rounded w-1/3" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : errorList ? (
                          <div className="text-center py-12 border border-dashed border-red-200 rounded-xl bg-red-50/20">
                            <AlertCircle size={32} className="text-rose-500 mx-auto mb-2" />
                            <p className="text-slate-700 font-bold text-sm">{errorList}</p>
                          </div>
                        ) : doctorsList.length === 0 ? (
                          <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl">
                            <Search size={36} className="text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-700 font-bold text-sm">No doctors found</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                            {doctorsList.map((doc) => (
                              <div
                                key={doc._id}
                                className={`group p-5 border rounded-xl hover:shadow-md hover:border-cyan-400 transition-all duration-200 flex flex-col justify-between ${
                                  selectedDoctor?._id === doc._id
                                    ? "border-cyan-500 bg-cyan-50/10"
                                    : "border-slate-200 bg-white"
                                }`}
                              >
                                <div className="flex items-start gap-3.5">
                                  <div className="relative shrink-0">
                                    <Avatar
                                      src={doc.profileImage}
                                      name={doc.user?.name || "Dr"}
                                      className="w-12 h-12 rounded-xl border border-slate-200 shadow-sm text-xs"
                                      alt={doc.user?.name}
                                    />
                                    {doc.isVerified && (
                                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-md border border-white">
                                        <CheckCircle size={10} className="stroke-[3]" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-cyan-600 transition-colors leading-tight">
                                      {doc.user?.name ? (doc.user.name.toLowerCase().startsWith("dr.") ? doc.user.name : `Dr. ${doc.user.name}`) : "Specialist"}
                                    </h4>
                                    <p className="text-[10px] text-cyan-600 font-black tracking-wider uppercase mt-1">
                                      {doc.specialization}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-semibold">
                                      <span className="flex items-center gap-0.5"><Award size={11} /> {doc.experience} yrs</span>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5"><IndianRupee size={11} /> ₹{doc.fees}</span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => goToStep(2, doc._id)}
                                  className={`${
                                    selectedDoctor?._id === doc._id
                                      ? "bg-cyan-500 text-white hover:bg-cyan-650"
                                      : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                                  } w-full mt-4 py-2 rounded-xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm`}
                                >
                                  {selectedDoctor?._id === doc._id ? (
                                    <>
                                      Selected
                                      <Check size={13} className="stroke-[3]" />
                                    </>
                                  ) : (
                                    "Select & Continue"
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2: Select Date & Time (Image 3 Left Layout) */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        {!selectedDoctor ? (
                          <div className="text-center py-12">
                            <AlertCircle size={32} className="text-amber-500 mx-auto mb-2" />
                            <p className="text-slate-700 font-bold">No doctor selected</p>
                            <button
                              type="button"
                              onClick={() => goToStep(1)}
                              className="mt-4 text-xs text-cyan-600 font-bold hover:underline"
                            >
                              Go to Step 1 to select a doctor
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div>
                              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Date &amp; Time</h2>
                            </div>

                            {/* Date Selector */}
                            <div className="space-y-2.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Available Dates</label>
                              {getAvailableDates().length === 0 ? (
                                <p className="text-xs text-slate-400 font-medium">No available slots in the next 14 days.</p>
                              ) : (
                                <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                                  {getAvailableDates().map((dateObj) => (
                                    <button
                                      key={dateObj.dateStr}
                                      type="button"
                                      onClick={() => {
                                        setSelectedDate(dateObj.dateStr);
                                        setSelectedTime("");
                                      }}
                                      className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-xl border text-center transition cursor-pointer ${
                                        selectedDate === dateObj.dateStr
                                          ? "bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/10"
                                          : "bg-slate-50 text-slate-700 border-slate-202 hover:border-cyan-400 hover:bg-white"
                                      }`}
                                    >
                                      <span className="text-[8px] uppercase font-black tracking-wide opacity-80">
                                        {dateObj.month}
                                      </span>
                                      <span className="text-lg font-black leading-none mt-0.5">
                                        {dateObj.dayNum}
                                      </span>
                                      <span className="text-[8px] uppercase font-black opacity-85 mt-0.5">
                                        {dateObj.dayName.substring(0, 3)}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Time Slots Grid */}
                            {selectedDate && (
                              <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-300">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Available Time Slots</label>
                                {getTimeSlotsForDate(selectedDate).length === 0 ? (
                                  <p className="text-xs text-slate-400 font-medium">No slots available on this date.</p>
                                ) : (
                                  <div className="space-y-4">
                                    {/* Morning Slots */}
                                    {getTimeSlotsForDate(selectedDate).filter(slot => parseInt(slot.split(":")[0]) < 12).length > 0 && (
                                      <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Morning Slots</p>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                          {getTimeSlotsForDate(selectedDate)
                                            .filter(slot => parseInt(slot.split(":")[0]) < 12)
                                            .map((slot) => (
                                              <button
                                                key={slot}
                                                type="button"
                                                onClick={() => setSelectedTime(slot)}
                                                className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                                                  selectedTime === slot
                                                    ? "bg-cyan-500 text-white border-cyan-500 shadow-sm"
                                                    : "bg-white text-slate-700 border-slate-200 hover:border-cyan-400 hover:bg-slate-55"
                                                }`}
                                              >
                                                {slot} AM
                                              </button>
                                            ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Afternoon Slots */}
                                    {getTimeSlotsForDate(selectedDate).filter(slot => parseInt(slot.split(":")[0]) >= 12).length > 0 && (
                                      <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Afternoon &amp; Evening Slots</p>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                          {getTimeSlotsForDate(selectedDate)
                                            .filter(slot => parseInt(slot.split(":")[0]) >= 12)
                                            .map((slot) => {
                                              const [h, m] = slot.split(":").map(Number);
                                              const displayHour = h > 12 ? h - 12 : h;
                                              const ampm = h >= 12 ? "PM" : "AM";
                                              const displayStr = `${String(displayHour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
                                              return (
                                                <button
                                                  key={slot}
                                                  type="button"
                                                  onClick={() => setSelectedTime(slot)}
                                                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                                                    selectedTime === slot
                                                      ? "bg-cyan-500 text-white border-cyan-500 shadow-sm"
                                                      : "bg-white text-slate-700 border-slate-200 hover:border-cyan-400 hover:bg-slate-55"
                                                  }`}
                                                >
                                                  {displayStr}
                                                </button>
                                              );
                                            })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3: Appointment Details */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        {!selectedDoctor || !selectedDate || !selectedTime ? (
                          <div className="text-center py-12">
                            <AlertCircle size={32} className="text-amber-500 mx-auto mb-2" />
                            <p className="text-slate-700 font-bold">Incomplete schedule details</p>
                            <button
                              type="button"
                              onClick={() => goToStep(2)}
                              className="mt-4 text-xs text-cyan-600 font-bold hover:underline"
                            >
                              Go back to select date & time
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div>
                              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Appointment Details</h2>
                              <p className="text-xs text-slate-500 mt-1 font-semibold">
                                Enter the reason for your visit and review consultation options.
                              </p>
                            </div>

                            {/* Reason for visit */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Reason for Visit</label>
                              <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Describe your symptoms, concern, or medical history relevant to this consultation..."
                                rows={4}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs font-semibold focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none resize-none min-h-[120px]"
                                required
                              />
                              <p className="text-[10px] text-slate-400 font-semibold">Please enter at least 5 characters describing your symptoms.</p>
                            </div>

                            {/* Visit Type & Insurance */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Visit Type</label>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setVisitType("In-Person")}
                                    className={`flex-1 py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition ${
                                      visitType === "In-Person"
                                        ? "bg-cyan-500 text-white border-cyan-500 shadow-sm"
                                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                    }`}
                                  >
                                    <User size={13} />
                                    In-Person
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setVisitType("Virtual")}
                                    className={`flex-1 py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition ${
                                      visitType === "Virtual"
                                        ? "bg-cyan-500 text-white border-cyan-500 shadow-sm"
                                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                    }`}
                                  >
                                    <Clock size={13} />
                                    Virtual Visit
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Insurance Status</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setHasInsurance("yes")}
                                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                                      hasInsurance === "yes"
                                        ? "bg-cyan-600 text-white border-cyan-600"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                    }`}
                                  >
                                    Use Insurance
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setHasInsurance("no")}
                                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                                      hasInsurance === "no"
                                        ? "bg-cyan-600 text-white border-cyan-600"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                    }`}
                                  >
                                    Self-Pay / Cash
                                  </button>
                                </div>
                                {hasInsurance === "yes" && (
                                  <div className="space-y-2 mt-2 animate-in fade-in duration-200">
                                    <input
                                      type="text"
                                      value={insuranceProvider}
                                      onChange={(e) => setInsuranceProvider(e.target.value)}
                                      placeholder="Insurance Provider (e.g. BlueCross)"
                                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl focus:bg-white focus:border-cyan-500 focus:outline-none transition-all outline-none"
                                    />
                                    <input
                                      type="text"
                                      value={insurancePolicyNo}
                                      onChange={(e) => setInsurancePolicyNo(e.target.value)}
                                      placeholder="Policy Number"
                                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl focus:bg-white focus:border-cyan-500 focus:outline-none transition-all outline-none"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 4: Confirm */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        {bookSuccess ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-10"
                          >
                            <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Check className="stroke-[3]" size={28} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Appointment Booked!</h2>
                            <p className="text-slate-500 text-xs mt-2 max-w-sm mx-auto font-semibold">
                              Your appointment with Dr. {selectedDoctor?.user?.name} has been successfully scheduled. A confirmation has been sent to your email.
                            </p>
                            <div className="mt-8">
                              <Link
                                to="/dashboard"
                                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold text-xs shadow-md mx-auto w-fit block"
                              >
                                Go to Dashboard
                              </Link>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="space-y-6">
                            <div>
                              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Review &amp; Confirm</h2>
                              <p className="text-xs text-slate-500 mt-1 font-semibold">
                                Please review your consultation details carefully before confirming.
                              </p>
                            </div>

                            <AnimatePresence>
                              {bookError && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl flex items-center gap-3 text-xs font-bold"
                                >
                                  <AlertCircle size={18} />
                                  {bookError}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-xs font-semibold">
                              <div className="flex justify-between items-center py-2.5 border-b border-slate-200">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Doctor</span>
                                <span className="font-bold text-slate-800">
                                  Dr. {selectedDoctor?.user?.name}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-2.5 border-b border-slate-200">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Date &amp; Time</span>
                                <span className="font-bold text-slate-800">
                                  {new Date(selectedDate).toLocaleDateString("en-IN", {
                                    day: "numeric", month: "short", year: "numeric"
                                  })} at {selectedTime}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-2.5 border-b border-slate-200">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Visit Type</span>
                                <span className="font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">
                                  {visitType}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Location</span>
                                <span className="font-bold text-slate-800 truncate max-w-[200px]">
                                  {visitType === "Virtual" ? "Online Video Call" : "MediChain Central Clinic"}
                                </span>
                              </div>
                            </div>

                            <div className="p-4 bg-cyan-50/10 border border-cyan-100 rounded-xl text-xs text-slate-500 leading-relaxed font-semibold">
                              <p className="font-bold text-cyan-600 mb-1">Important Notice</p>
                              You will receive a notification alert and email 15 minutes before your scheduled slot. Cancellations must be made at least 2 hours in advance.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer Controls */}
              {!bookSuccess && (
                <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100 shrink-0">
                  {currentStep > 1 ? (
                    <button
                      onClick={prevStep}
                      className="px-5 py-2.5 bg-slate-50 border border-slate-205 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                      Back
                    </button>
                  ) : (
                    <div />
                  )}
                  {currentStep < 4 ? (
                    <button
                      onClick={nextStep}
                      disabled={
                        (currentStep === 1 && !doctorIdParam) ||
                        (currentStep === 2 && (!selectedDate || !selectedTime)) ||
                        (currentStep === 3 && reason.trim().length < 5)
                      }
                      className="px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ml-auto"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={handleBook}
                      disabled={booking}
                      className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60 ml-auto"
                    >
                      {booking ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Confirm Appointment"
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Doctor Summary Card & Help Desk Card */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Doctor Card Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              
              {/* Card Banner Header */}
              <div className="h-28 bg-cyan-100/40 border-b border-slate-100 relative shrink-0" />

              {/* Doctor Details */}
              <div className="px-6 pb-6 -mt-10 relative z-10 text-center flex-1 flex flex-col justify-between">
                <div>
                  <Avatar
                    src={selectedDoctor?.profileImage}
                    name={selectedDoctor?.user?.name || "Dr"}
                    className="w-20 h-20 rounded-2xl border-4 border-white mx-auto mb-4 shadow-md bg-slate-100 shrink-0 text-xl"
                    alt={selectedDoctor?.user?.name || "Selected doctor"}
                  />

                  {selectedDoctor ? (
                    <>
                      <h3 className="text-sm font-black text-slate-900 leading-tight mb-1">
                        {selectedDoctor.user?.name ? (selectedDoctor.user.name.toLowerCase().startsWith("dr.") ? selectedDoctor.user.name : `Dr. ${selectedDoctor.user.name}`) : "Unknown"}
                      </h3>
                      <p className="text-[10px] text-cyan-600 font-black tracking-wider uppercase mb-3">
                        {selectedDoctor.specialization}
                      </p>

                      <div className="flex items-center justify-center gap-1 mb-5">
                        <span className="flex text-amber-400 gap-0.5 mr-1">
                          <Star size={12} fill="currentColor" />
                          <Star size={12} fill="currentColor" />
                          <Star size={12} fill="currentColor" />
                          <Star size={12} fill="currentColor" />
                          <Star size={12} fill="currentColor" />
                        </span>
                        <span className="text-[10px] font-black text-slate-700">4.9</span>
                        <span className="text-slate-400 text-[10px] font-semibold">(124 reviews)</span>
                      </div>

                      <div className="space-y-3.5 text-left border-t border-slate-100 pt-5 text-[11px] text-slate-505 font-semibold">
                        <div className="flex items-start gap-3">
                          <MapPin size={15} className="text-cyan-600 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">MediChain Central, 4th Floor, Cardiothoracic Wing</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <Award size={15} className="text-cyan-600 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                             {selectedDoctor.school || "Johns Hopkins University"}, {selectedDoctor.experience}+ years experience
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <IndianRupee size={15} className="text-cyan-600 shrink-0 mt-0.5" />
                          <p className="font-bold text-slate-800 leading-relaxed">
                            Co-pay starts at ₹{selectedDoctor.fees}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs font-semibold leading-relaxed">
                      Select a doctor to view their professional profile details and check slot availability here.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Help Card Panel */}
            <div className="bg-[#0f172a] text-white p-6 rounded-2xl shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <HelpCircle className="text-cyan-400 shrink-0" size={20} />
                <h4 className="font-bold text-xs uppercase tracking-wider">Need assistance?</h4>
              </div>
              <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                If you have questions about specific requirements or insurance, our support team is available 24/7.
              </p>
              <button
                onClick={() => navigate("/support")}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                Live Chat Support
              </button>
            </div>

          </div>

        </div>

      </div>
    </motion.main>
  );
}

export default BookAppointment;
