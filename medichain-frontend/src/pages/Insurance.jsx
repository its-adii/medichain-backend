import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, ShieldAlert, Plus, CheckCircle, Clock, XCircle, IndianRupee } from "lucide-react";

function Insurance() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/appointments/my");
        setAppointments(res.data.appointments || []);
      } catch (err) {
        setError("Failed to load insurance coverage and claims data.");
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  // Map appointments to claims
  const claims = appointments.map((appt) => {
    const isApproved = appt.status === "completed";
    const isProcessing = appt.status === "pending" || appt.status === "confirmed";
    const isCancelled = appt.status === "cancelled";

    let statusLabel = "Approved";
    if (isProcessing) statusLabel = "Processing";
    if (isCancelled) statusLabel = "Cancelled";

    const docName = appt.doctor?.user?.name 
      ? (appt.doctor.user.name.toLowerCase().startsWith("dr.") ? appt.doctor.user.name : `Dr. ${appt.doctor.user.name}`) 
      : "Specialist";

    return {
      id: appt._id ? `CLM-${appt._id.substring(appt._id.length - 6).toUpperCase()}` : "CLM-XXXX",
      date: new Date(appt.date).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
      }),
      description: `Consultation with ${docName} (${appt.reason || "General"})`,
      amount: appt.doctor?.fees || 500,
      status: statusLabel
    };
  });

  // Calculate Met Deductibles (Met is sum of approved consult fees, max limit is ₹5,000)
  const totalDeductible = 5000;
  const metDeductible = claims
    .filter(c => c.status === "Approved")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const cappedMet = Math.min(metDeductible, totalDeductible);
  const deductiblePercentage = (cappedMet / totalDeductible) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-8 space-y-8 max-w-[1400px] mx-auto min-h-screen bg-slate-50"
    >
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Insurance Policies
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          Verify coverage benefits, trace submitted claims, and check active deductibles.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 h-48 md:col-span-2 space-y-4">
              <div className="h-3 bg-slate-200 rounded w-1/4" />
              <div className="h-8 bg-slate-200 rounded w-1/3" />
              <div className="h-10 bg-slate-200 rounded w-full mt-6" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 h-48 space-y-4">
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-8 bg-slate-200 rounded w-1/3" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/6" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-200 rounded w-full" />
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-rose-500 font-semibold text-xs">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Active Policy Card */}
            <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden md:col-span-2">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                    <ShieldCheck className="text-white" size={20} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-cyan-200">Active Policy</span>
                    <h3 className="text-lg font-black leading-tight mt-0.5">BlueCross HealthShield</h3>
                  </div>
                </div>
                <span className="bg-white/20 text-white border border-white/10 text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Primary Plan
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-cyan-100 relative z-10 border-t border-white/10 pt-4 mt-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-cyan-200">Policy Number</p>
                  <p className="font-bold text-white mt-1">#BC-8821-3942-0199</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-cyan-200">Policy Holder</p>
                  <p className="font-bold text-white mt-1 truncate">{user?.name || "Patient"}</p>
                </div>
              </div>
            </div>

            {/* Deductible Progress */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Deductible Tracker</h3>
                <div className="flex justify-between text-xs font-semibold text-slate-800 mb-2">
                  <span className="flex items-center gap-0.5">Met: ₹{cappedMet}</span>
                  <span className="text-slate-400">Total Limit: ₹{totalDeductible}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${deductiblePercentage}%` }} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-6 leading-relaxed">
                Co-pay parameters:<br />
                General Consultation: ₹150 co-pay | Lab Orders: 10% co-insurance | Cardiology specialist: ₹300 co-pay
              </p>
            </div>

          </div>

          {/* Claims List Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Recent Insurance Claims</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                    <th className="py-3 px-4">Claim ID</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4">Details / Description</th>
                    <th className="py-3 px-4">Claimed Cost</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-400 font-semibold bg-white">
                        <div className="flex flex-col items-center justify-center py-6">
                          <ShieldAlert className="w-10 h-10 text-slate-300 mb-2 animate-pulse" />
                          <p className="text-slate-700 font-bold text-sm">No Claims Filed</p>
                          <p className="text-xs text-slate-400 mt-1">Book consultations to submit claims to BlueCross.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    claims.map((claim, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4.5 px-4 font-black uppercase text-slate-900">{claim.id}</td>
                        <td className="py-4.5 px-4 text-slate-400 font-semibold">{claim.date}</td>
                        <td className="py-4.5 px-4 text-slate-605 font-semibold">{claim.description}</td>
                        <td className="py-4.5 px-4 font-bold text-slate-900">₹{claim.amount}</td>
                        <td className="py-4.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                            claim.status === "Approved"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : claim.status === "Cancelled"
                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            {claim.status === "Approved" ? (
                              <CheckCircle size={10} />
                            ) : claim.status === "Cancelled" ? (
                              <XCircle size={10} />
                            ) : (
                              <Clock size={10} />
                            )}
                            {claim.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </motion.div>
  );
}

export default Insurance;
