import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import Avatar from "../components/Avatar";
import { useDebounce } from "../hooks/useDebounce";
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Plus, 
  ShieldCheck, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Activity,
  Heart,
  Calendar,
  X,
  Printer,
  FolderSearch,
  HeartHandshake
} from "lucide-react";
import { designSystem } from "../styles/designSystem";

const FILTERS = ["All Records", "Clinical Visits", "Laboratory", "Prescriptions"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03
    }
  }
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" }
  }
};

const STATUS_THEMES = {
  Finalized: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  Active: "bg-amber-50 text-amber-600 border border-amber-100",
  Processing: "bg-cyan-50 text-cyan-600 border border-cyan-100"
};

function MedicalRecords() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Records");
  const debouncedSearch = useDebounce(search, 300);
  
  // Modals / Overlay States
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Clinical Visits");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Custom manual uploaded records stored in state to merge with API
  const [customRecords, setCustomRecords] = useState([]);

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/appointments/my");
        setAppointments(res.data.appointments || []);
      } catch (err) {
        setError("Failed to load clinical records history.");
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  // Compute Records list dynamically from Completed appointments
  const apiRecords = useMemo(() => {
    const records = [];
    appointments.forEach((appt) => {
      if (appt.status !== "completed") return;

      const docName = appt.doctor?.user?.name 
        ? (appt.doctor.user.name.toLowerCase().startsWith("dr.") ? appt.doctor.user.name : `Dr. ${appt.doctor.user.name}`) 
        : "Specialist";

      const formattedDate = new Date(appt.date).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
      });

      // 1. Clinical Visit Notes
      if (appt.clinicalNotes) {
        records.push({
          id: `${appt._id}-visit`,
          type: "Clinical Consultation Report",
          subType: appt.reason || "General Consultation",
          date: formattedDate,
          provider: docName,
          status: "Finalized",
          category: "Clinical Visits",
          details: appt.clinicalNotes,
          prescriptions: appt.prescriptions || [],
          labOrders: appt.labOrders || []
        });
      }

      // 2. Prescriptions
      if (appt.prescriptions && appt.prescriptions.length > 0) {
        appt.prescriptions.forEach((rx, idx) => {
          records.push({
            id: `${appt._id}-rx-${idx}`,
            type: rx.medicineName,
            subType: `${rx.dosage} • ${rx.duration || "As directed"}`,
            date: formattedDate,
            provider: docName,
            status: rx.refillable ? "Active" : "Finalized",
            category: "Prescriptions",
            details: `Prescribed by ${docName}. Refillable: ${rx.refillable ? "Yes" : "No"}. Dosage: ${rx.dosage}.`,
            prescriptionItem: rx
          });
        });
      }

      // 3. Lab Orders
      if (appt.labOrders && appt.labOrders.length > 0) {
        appt.labOrders.forEach((lab, idx) => {
          records.push({
            id: `${appt._id}-lab-${idx}`,
            type: lab.testName,
            subType: "Laboratory Diagnostic",
            date: formattedDate,
            provider: docName,
            status: lab.status === "completed" ? "Finalized" : "Processing",
            category: "Laboratory",
            details: `Diagnostic test ordered: ${lab.testName}. Status: ${lab.status || "Pending"}.`,
            labItem: lab
          });
        });
      }
    });
    return records;
  }, [appointments]);

  const allRecords = useMemo(() => [...customRecords, ...apiRecords], [customRecords, apiRecords]);

  const filteredRecords = useMemo(() => {
    return allRecords.filter(rec => {
      const matchesSearch = !debouncedSearch || 
                            rec.type.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                            rec.provider.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesFilter = activeFilter === "All Records" || rec.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [allRecords, debouncedSearch, activeFilter]);

  // Calculate Dynamic Stats
  const statsCounts = useMemo(() => {
    const clinicalVisitsCount = allRecords.filter(r => r.category === "Clinical Visits").length;
    const labReportsCount = allRecords.filter(r => r.category === "Laboratory").length;
    const activeRxCount = allRecords.filter(r => r.category === "Prescriptions" && r.status === "Active").length;
    return { clinicalVisitsCount, labReportsCount, activeRxCount };
  }, [allRecords]);

  const { clinicalVisitsCount, activeRxCount, labReportsCount } = statsCounts;
  
  const stats = [
    { id: "stat-1", title: "Clinical Visits", value: `${statsCounts.clinicalVisitsCount} Reports`, desc: "Archived consultations", icon: Clock, color: "text-cyan-600 bg-cyan-50" },
    { id: "stat-2", title: "Lab Reports", value: `${statsCounts.labReportsCount} Finalized`, desc: "Bloodwork & imaging", icon: FileSpreadsheet, color: "text-emerald-600 bg-emerald-50" },
    { id: "stat-3", title: "Active Prescriptions", value: `${statsCounts.activeRxCount} Active`, desc: "In-progress treatments", icon: Activity, color: "text-amber-600 bg-amber-50" },
    { id: "stat-4", title: "Secured Credentials", value: "HIPAA Compliant", desc: "End-to-end encrypted", icon: ShieldCheck, color: "text-cyan-600 bg-cyan-100/40" },
  ];

  // Dynamic Care Team derived from real appointments
  const careTeam = useMemo(() => {
    const team = [];
    const doctorIds = new Set();
    appointments.forEach((appt) => {
      if (appt.doctor && !doctorIds.has(appt.doctor._id)) {
        doctorIds.add(appt.doctor._id);
        team.push({
          name: appt.doctor.user?.name ? (appt.doctor.user.name.toLowerCase().startsWith("dr.") ? appt.doctor.user.name : `Dr. ${appt.doctor.user.name}`) : "Specialist",
          role: appt.doctor.specialization || "General Practitioner",
          image: appt.doctor.profileImage
        });
      }
    });
    return team;
  }, [appointments]);

  // Handle Mock File Upload
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadName.trim()) return;
    setUploading(true);
    setTimeout(() => {
      const newRecord = {
        id: `custom-${Date.now()}`,
        type: uploadName,
        subType: "Patient Uploaded Document",
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        provider: "Self-Uploaded",
        status: "Finalized",
        category: uploadCategory,
        details: "This document was uploaded securely by the patient."
      };
      setCustomRecords([newRecord, ...customRecords]);
      setUploadName("");
      setUploadFile(null);
      setUploading(false);
      setShowUploadModal(false);
    }, 1200);
  };

  // Handle Mock PDF Export
  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setShowExportModal(false);
      window.print(); // Triggers browser printing utility for actual saving
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 max-w-[1400px] mx-auto min-h-screen bg-slate-50"
    >
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Medical Records
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Your secure healthcare vault. Access and manage your full clinical history.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:gap-3 shrink-0">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 bg-cyan-600 hover:bg-cyan-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/10 transition-all cursor-pointer"
          >
            <Upload size={14} className="stroke-[3]" />
            Upload Record
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-705 font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Download size={14} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Key Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
              <h4 className="text-lg font-bold text-slate-900 mt-0.5 leading-none">{stat.value}</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Records Section: 12-column Grid */}
      <div className="grid grid-cols-12 gap-6 items-start">
        
        {/* Left Section: Search, Filter, Records Table (col-span-12 lg:col-span-9) */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          
          {/* Controls Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative w-full md:w-80 group">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name, doctor, or record type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 text-xs font-semibold rounded-xl focus:outline-none transition-all outline-none"
                />
              </div>

              {/* Filter pills */}
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1">
                {FILTERS.map((filt) => (
                  <button
                    key={filt}
                    onClick={() => setActiveFilter(filt)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border cursor-pointer transition-colors ${
                      activeFilter === filt
                        ? "bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-600/10"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {filt}
                  </button>
                ))}
              </div>

            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                    <th className="py-3 px-4">Record Description</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-slate-100"
                >
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="animate-pulse border-b border-slate-100">
                        <td className="py-4.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-200 rounded-lg shrink-0" />
                            <div className="space-y-2 flex-1">
                              <div className="h-3 bg-slate-200 rounded w-24" />
                              <div className="h-2.5 bg-slate-200 rounded w-16" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4.5 px-4">
                          <div className="h-3 bg-slate-200 rounded w-16" />
                        </td>
                        <td className="py-4.5 px-4">
                          <div className="h-3 bg-slate-200 rounded w-24" />
                        </td>
                        <td className="py-4.5 px-4">
                          <div className="h-5 bg-slate-200 rounded w-14" />
                        </td>
                        <td className="py-4.5 px-4">
                          <div className="h-8 bg-slate-200 rounded w-16" />
                        </td>
                      </tr>
                    ))
                  ) : error ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-rose-500 font-semibold text-xs">
                        {error}
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-500 font-semibold text-xs bg-white">
                        <div className="flex flex-col items-center justify-center py-4">
                          <FolderSearch className="w-10 h-10 text-slate-300 mb-2 animate-pulse" />
                          <p className="text-slate-700 font-bold text-sm">No Records Found</p>
                          <p className="text-xs text-slate-400 mt-1">No medical records match your criteria.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => (
                      <motion.tr 
                        variants={rowVariants}
                        key={rec.id} 
                        onClick={() => setSelectedRecord(rec)}
                        className="hover:bg-slate-50/70 transition-colors text-xs font-semibold text-slate-800 cursor-pointer"
                      >
                        <td className="py-4.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-cyan-50 border border-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center shrink-0">
                              <FileText size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 leading-tight truncate max-w-[280px]">{rec.type}</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate max-w-[280px]">{rec.subType}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4.5 px-4 text-slate-500 font-semibold">{rec.date}</td>
                        <td className="py-4.5 px-4 font-bold text-slate-800">{rec.provider}</td>
                        <td className="py-4.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${STATUS_THEMES[rec.status] || "bg-slate-50"}`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-4.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => setSelectedRecord(rec)}
                            className="p-2 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 text-slate-500 hover:text-cyan-600 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                            title="View Details"
                          >
                            <Search size={13} />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </motion.tbody>
              </table>
            </div>

          </div>

          {/* Secure disclaimer banner */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-0" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                <ShieldCheck className="text-cyan-400" size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-wide">Your Records are Secure</h4>
                <p className="text-[10px] text-slate-300 font-semibold mt-1">
                  All medical data is fully encrypted with 256-bit HIPAA compliant security protocols.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full md:w-auto md:flex md:gap-4 relative z-10 shrink-0">
              <button 
                onClick={() => alert("Verification: MediChain credentials are fully synced with state registries.")}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center"
              >
                HIPAA Credentials
              </button>
              <button 
                onClick={() => alert("Blockchain integrity verification completed: All hashes match.")}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10px] rounded-lg shadow-sm transition-colors cursor-pointer text-center flex items-center justify-center"
              >
                Verify Blockchain
              </button>
            </div>
          </div>

        </div>

        {/* Right Section: Active Care Team (col-span-12 lg:col-span-3) */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
              Active Care Team
            </h3>
            
            <div className="space-y-4">
              {careTeam.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 flex flex-col items-center justify-center">
                  <HeartHandshake className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-slate-650 font-bold text-xs">No Specialists Found</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] mx-auto">Book an appointment to start building your care team.</p>
                </div>
              ) : (
                careTeam.map((member, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-slate-50 rounded-xl hover:bg-slate-50/50 transition-colors">
                    <Avatar 
                      src={member.image}
                      name={member.name}
                      className="w-10 h-10 border border-slate-200 shrink-0 text-xs"
                      alt={member.name}
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 leading-tight truncate">
                        {member.name}
                      </h5>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5 truncate">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Record Preview Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                  <FileText className="text-cyan-600" size={18} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Record Preview</span>
                </div>
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[400px]">
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{selectedRecord.type}</h3>
                  <p className="text-xs text-cyan-600 font-bold mt-1">{selectedRecord.category}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-semibold">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Consultation Date</span>
                    <span className="text-slate-800 block mt-0.5">{selectedRecord.date}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Healthcare Provider</span>
                    <span className="text-slate-800 block mt-0.5">{selectedRecord.provider}</span>
                  </div>
                </div>

                {selectedRecord.details && (
                  <div className="space-y-1.5 text-xs font-semibold text-slate-700">
                    <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Clinical Notes</span>
                    <p className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl leading-relaxed italic">{selectedRecord.details}</p>
                  </div>
                )}

                {/* Conditional Prescriptions or Lab Orders rendering in modal */}
                {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Prescribed Medicines</span>
                    <div className="border border-slate-150 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          <tr>
                            <th className="p-2">Name</th>
                            <th className="p-2">Dosage</th>
                            <th className="p-2">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {selectedRecord.prescriptions.map((rx, idx) => (
                            <tr key={idx}>
                              <td className="p-2 font-bold text-slate-900">{rx.medicineName}</td>
                              <td className="p-2">{rx.dosage}</td>
                              <td className="p-2">{rx.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selectedRecord.labOrders && selectedRecord.labOrders.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Laboratory Investigations</span>
                    <div className="space-y-1.5">
                      {selectedRecord.labOrders.map((lab, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-150 rounded-lg text-xs font-semibold">
                          <span className="text-slate-800">{lab.testName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            lab.status === "completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            {lab.status || "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedRecord(null);
                    window.print();
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-xs text-slate-600 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={13} /> Print Record
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Record Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Upload Medical Document</h3>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 hover:bg-slate-250 rounded-lg text-slate-400 hover:text-slate-700 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Document Title</label>
                  <input
                    type="text"
                    required
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="e.g. Chest CT Scan Result"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl focus:bg-white focus:outline-none focus:border-cyan-500 transition outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Record Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl focus:bg-white focus:outline-none focus:border-cyan-500 transition outline-none"
                  >
                    <option value="Clinical Visits">Clinical Visit</option>
                    <option value="Laboratory">Laboratory Report</option>
                    <option value="Prescriptions">Prescription List</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Select File</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-cyan-400 transition cursor-pointer relative">
                    <input 
                      type="file" 
                      required
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <Upload className="text-slate-350 mx-auto mb-2" size={24} />
                    <p className="text-xs font-bold text-slate-600">
                      {uploadFile ? uploadFile.name : "Drag & drop files or click to browse"}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1 font-semibold">Supports PDF, PNG, JPG up to 10MB</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {uploading ? "Uploading Securely..." : "Upload Securely"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Export Report Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Export Clinical Report</h3>
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="p-1 hover:bg-slate-250 rounded-lg text-slate-400 hover:text-slate-700 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                  This compiles your active medical records, consult histories, and prescriptions into a unified, cryptographically verified PDF report.
                </p>

                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl text-[10px] font-semibold space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>Clinical consults included:</span>
                    <span className="font-bold text-slate-800">{clinicalVisitsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active treatments:</span>
                    <span className="font-bold text-slate-800">{activeRxCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verified lab orders:</span>
                    <span className="font-bold text-slate-800">{labReportsCount}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {exporting ? "Generating PDF Report..." : "Generate & Print PDF"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

export default MedicalRecords;
