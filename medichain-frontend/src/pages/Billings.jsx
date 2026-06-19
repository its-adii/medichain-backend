import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { CreditCard, CheckCircle, Clock, ArrowUpRight, X, IndianRupee, Loader2 } from "lucide-react";

function Billings() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Checkout Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/appointments/my");
        setAppointments(res.data.appointments || []);
      } catch (err) {
        setError("Failed to load billing and invoice history.");
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  // Map appointments to invoices
  const invoices = appointments.map((appt) => {
    const isPaid = appt.status === "completed";
    const isPending = appt.status === "pending" || appt.status === "confirmed";
    const isCancelled = appt.status === "cancelled";
    
    let statusLabel = "Paid";
    if (isPending) statusLabel = "Pending";
    if (isCancelled) statusLabel = "Cancelled";

    return {
      id: appt._id ? `INV-${appt._id.substring(appt._id.length - 6).toUpperCase()}` : "INV-XXXX",
      service: appt.reason || "General Consultation",
      date: new Date(appt.date).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
      }),
      provider: appt.doctor?.user?.name 
        ? (appt.doctor.user.name.toLowerCase().startsWith("dr.") ? appt.doctor.user.name : `Dr. ${appt.doctor.user.name}`) 
        : "Healthcare Practitioner",
      amount: appt.doctor?.fees || 500,
      status: statusLabel,
      rawStatus: appt.status
    };
  });

  // Calculate Balances
  const outstanding = invoices
    .filter(i => i.status === "Pending")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPaid = invoices
    .filter(i => i.status === "Paid")
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Handle Mock Pay
  const handlePayment = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaySuccess(true);
      setTimeout(() => {
        setPaySuccess(false);
        setShowPayModal(false);
        // Set all pending in state to completed/paid
        setAppointments(prev =>
          prev.map(a => (a.status === "pending" || a.status === "confirmed") ? { ...a, status: "completed" } : a)
        );
      }, 1500);
    }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-8 space-y-8 max-w-[1400px] mx-auto min-h-screen bg-slate-50"
    >
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Billing & Invoices
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          Review outstanding statements, settle medical fees, and view receipts.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 h-48 space-y-4">
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-8 bg-slate-200 rounded w-1/3" />
              <div className="h-10 bg-slate-200 rounded w-full mt-6" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 h-48 md:col-span-2 space-y-4">
              <div className="h-3 bg-slate-200 rounded w-1/4" />
              <div className="h-16 bg-slate-200 rounded w-full" />
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
            
            {/* Balance Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-48">
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Outstanding Balance</h3>
                <h2 className="text-3xl font-black text-slate-900 mt-2 flex items-center gap-1">
                  <IndianRupee size={24} className="stroke-[2.5]" />
                  {outstanding}
                </h2>
                <p className="text-[10px] text-slate-450 font-semibold mt-1">Due within 15 days of consultation</p>
              </div>
              {outstanding > 0 ? (
                <button 
                  onClick={() => setShowPayModal(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-3 bg-cyan-600 hover:bg-cyan-705 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/10 transition-all cursor-pointer"
                >
                  Pay Outstanding Balance
                  <ArrowUpRight size={14} />
                </button>
              ) : (
                <div className="py-2.5 px-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-xs font-bold flex items-center gap-1.5 justify-center">
                  <CheckCircle size={14} /> Account Fully Settled
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-48 md:col-span-2">
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Payment Method</h3>
                <div className="flex items-center gap-4 border border-slate-100 p-4 rounded-xl mt-3 bg-slate-50/50">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Visa ending in •••• 4242</p>
                    <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Expires 12/2028 • Active Co-pay card</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => alert("Billing details integration: Active Visa 4242 is securely encrypted.")}
                className="w-fit flex items-center gap-1 text-xs font-bold text-cyan-600 hover:underline hover:text-cyan-700 cursor-pointer mt-4"
              >
                Manage Payment Options
              </button>
            </div>

          </div>

          {/* Invoices Logs Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Billing Statement History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                    <th className="py-3 px-4">Invoice ID</th>
                    <th className="py-3 px-4">Service Details</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Practitioner / Laboratory</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-400 font-semibold bg-white">
                        <div className="flex flex-col items-center justify-center py-6">
                          <CreditCard className="w-10 h-10 text-slate-300 mb-2" />
                          <p className="text-slate-700 font-bold text-sm">No Invoices Found</p>
                          <p className="text-xs text-slate-400 mt-1">Book consultations to generate invoice statements.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4.5 px-4 font-black uppercase text-slate-900">{inv.id}</td>
                        <td className="py-4.5 px-4 text-slate-700 font-bold">{inv.service}</td>
                        <td className="py-4.5 px-4 text-slate-400 font-semibold">{inv.date}</td>
                        <td className="py-4.5 px-4 text-slate-600 font-semibold">{inv.provider}</td>
                        <td className="py-4.5 px-4 font-bold text-slate-900">₹{inv.amount}</td>
                        <td className="py-4.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                            inv.status === "Paid"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : inv.status === "Cancelled"
                                ? "bg-slate-50 text-slate-500 border border-slate-200"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            {inv.status}
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

      {/* Payment Checkout Modal */}
      <AnimatePresence>
        {showPayModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Settle Invoice</h3>
                <button 
                  onClick={() => setShowPayModal(false)}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {paySuccess ? (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle size={24} />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Payment Succeeded!</h4>
                    <p className="text-[10px] text-slate-500 font-semibold">Your invoices have been updated to PAID status.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Outstanding</span>
                      <span className="text-2xl font-black text-slate-900 block mt-1 flex items-center gap-0.5">
                        <IndianRupee size={20} className="stroke-[2.5]" />
                        {outstanding}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Select Payment Card</label>
                      <div className="border border-cyan-500 bg-cyan-50/10 p-3 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-900 text-white rounded-md flex items-center justify-center shrink-0">
                          <CreditCard size={14} />
                        </div>
                        <div className="flex-grow">
                          <p className="text-xs font-bold text-slate-950">Visa ending in 4242</p>
                          <p className="text-[9px] text-slate-400 font-semibold">Expires 12/2028</p>
                        </div>
                        <div className="w-4 h-4 rounded-full border-4 border-cyan-500 shrink-0" />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                      <button
                        onClick={() => setShowPayModal(false)}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-600 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePayment}
                        disabled={paying}
                        className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {paying ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Authorize Payment"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

export default Billings;
