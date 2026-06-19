import React from "react";
import { motion } from "framer-motion";
import Avatar from "../Avatar";
import AnimatedCounter from "../AnimatedCounter";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Users,
  Briefcase,
  AlertCircle,
  Cloud,
  Search,
  BadgeCheck,
  ChevronRight,
  UploadCloud,
  LayoutGrid,
  FileText
} from "lucide-react";
import { designSystem } from "../../styles/designSystem";

const PIE_COLORS = {
  Pending: "#f59e0b",     // Honey Amber
  Confirmed: "#2563eb",   // Electric Royal Blue
  Completed: "#10b981",   // Mint Green
  Cancelled: "#64748b"    // Slate
};

const getStatusBadge = (status) => {
  const s = status.toUpperCase();
  if (s === "PENDING") {
    return (
      <span className={`${designSystem.components.badge} ${designSystem.colors.status.pending}`}>
        PENDING
      </span>
    );
  }
  if (s === "FLAGGED") {
    return (
      <span className={`${designSystem.components.badge} ${designSystem.colors.status.flagged}`}>
        FLAGGED
      </span>
    );
  }
  return (
    <span className={`${designSystem.components.badge} ${designSystem.colors.status.completed}`}>
      ACTIVE
    </span>
  );
};

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut"
    }
  }
};

export default function OverviewTab({
  stats,
  doctors,
  appointments,
  recentUsers,
  setActiveTab,
  fetchAll,
  getUserGrowth,
  getVerificationRate,
  getPendingApptsCount,
  getPendingApptsLoad,
  getEarningsData,
  getStatusData
}) {
  const awaitingCount = doctors.filter(d => d.user && d.user.role === "doctor" && !d.isVerified).length;

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={designSystem.spacing.sectionGap}
    >
      {/* Page Header */}
      <div>
        <h2 className={designSystem.typography.pageTitle}>System Overview</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">Real-time infrastructure and user activity monitoring for the MediChain ecosystem.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${designSystem.components.card} flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={designSystem.typography.label}>Total Users</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                <AnimatedCounter value={stats?.totalUsers ?? 0} />
              </h3>
            </div>
            <div className="bg-[#e0f7fc] p-2.5 rounded-xl text-cyan-600 transition-colors duration-200 group-hover:bg-cyan-100/80">
              <Users className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            <span className="text-emerald-600 font-bold text-xs">{getUserGrowth()}</span>
            <span className="text-slate-400 text-xs font-medium">from last month</span>
          </div>
        </div>

        <div className={`${designSystem.components.card} flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={designSystem.typography.label}>Verified Doctors</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                <AnimatedCounter value={doctors.filter(d => d.isVerified).length} />
              </h3>
            </div>
            <div className="bg-[#e0f7fc] p-2.5 rounded-xl text-cyan-600 transition-colors duration-200 group-hover:bg-cyan-100/80">
              <Briefcase className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            <span className="text-emerald-600 font-bold text-xs">{getVerificationRate()}</span>
            <span className="text-slate-400 text-xs font-medium">verification rate</span>
          </div>
        </div>

        <div className={`${designSystem.components.card} flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={designSystem.typography.label}>Pending Appts</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                <AnimatedCounter value={getPendingApptsCount()} />
              </h3>
            </div>
            <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600 transition-colors duration-200 group-hover:bg-rose-100/80">
              <AlertCircle className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            <span className={`${getPendingApptsLoad() === "High Load" ? "text-rose-600" : "text-emerald-600"} font-bold text-xs`}>
              {getPendingApptsLoad()}
            </span>
            <span className="text-slate-400 text-xs font-medium">
              {getPendingApptsLoad() === "High Load" ? "needs triage" : "system clear"}
            </span>
          </div>
        </div>

        <div className={`${designSystem.components.card} flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={designSystem.typography.label}>System Uptime</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">99.98%</h3>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600 transition-colors duration-200 group-hover:bg-emerald-100/80">
              <Cloud className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            <span className="text-emerald-600 font-bold text-xs">Healthy</span>
            <span className="text-slate-400 text-xs font-medium">All nodes active</span>
          </div>
        </div>
      </div>

      {/* Main Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Registrations Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h4 className={designSystem.typography.sectionHeading}>Recent User Registrations</h4>
            <button
              onClick={() => setActiveTab("users")}
              className="text-cyan-600 text-xs font-bold hover:text-cyan-700 hover:underline transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className={`${designSystem.components.table} min-w-[600px]`}>
              <thead>
                <tr className={designSystem.components.tableHeaderRow}>
                  <th className="px-6 py-3 text-left">USER</th>
                  <th className="px-6 py-3 text-left">ROLE</th>
                  <th className="px-6 py-3 text-left">DATE</th>
                  <th className="px-6 py-3 text-left">STATUS</th>
                </tr>
              </thead>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-slate-100"
              >
                {recentUsers.length > 0 ? (
                  recentUsers.map((u) => (
                    <motion.tr
                      variants={rowVariants}
                      key={u._id}
                      className={designSystem.components.tableRow}
                    >
                      <td className={`${designSystem.components.tableCell} flex items-center gap-3 h-[64px]`}>
                        <Avatar
                          src={u.avatar}
                          name={u.name}
                          className="w-8 h-8 border border-slate-200 text-[10px]"
                          alt={u.name}
                        />
                        <div>
                          <p className="font-bold text-sm text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{u.email}</p>
                        </div>
                      </td>
                      <td className={`${designSystem.components.tableCell} text-sm font-semibold text-slate-700 capitalize`}>
                        {u.role}
                      </td>
                      <td className={`${designSystem.components.tableCell} text-sm text-slate-500 font-medium`}>
                        {u.joinedDate}
                      </td>
                      <td className={designSystem.components.tableCell}>
                        {getStatusBadge(u.status || "ACTIVE")}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr className="h-[100px]">
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                      <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-bold">No recent user registrations match your search query.</p>
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <button
                onClick={() => setActiveTab("doctors")}
                className="w-full flex items-center justify-between p-3.5 border border-slate-200 hover:bg-slate-50/85 hover:border-slate-300 rounded-xl transition duration-150 group cursor-pointer bg-white shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#e0f7fc] p-2 rounded-lg text-cyan-600 group-hover:bg-cyan-100">
                    <BadgeCheck className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs text-slate-900">Verify Doctor</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{doctors.filter(d => !d.isVerified).length} pending</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <button
                onClick={fetchAll}
                className="w-full flex items-center justify-between p-3.5 border border-slate-200 hover:bg-slate-50/85 hover:border-slate-300 rounded-xl transition duration-150 group cursor-pointer bg-white shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#e0f7fc] p-2 rounded-lg text-cyan-600 group-hover:bg-cyan-100">
                    <UploadCloud className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs text-slate-900">System Backup</p>
                    <p className="text-[10px] text-slate-500 font-semibold">Last backup 6h ago</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <button
                onClick={() => {}}
                className="w-full flex items-center justify-between p-3.5 border border-slate-200 hover:bg-slate-50/85 hover:border-slate-300 rounded-xl transition duration-150 group cursor-pointer bg-white shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#e0f7fc] p-2 rounded-lg text-cyan-600 group-hover:bg-cyan-100">
                    <LayoutGrid className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs text-slate-900">View Node Logs</p>
                    <p className="text-[10px] text-slate-500 font-semibold">Check blockchain integrity</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row lg:flex-col gap-4">
            <button className={`${designSystem.components.buttonPrimary} w-full py-2.5 text-xs justify-center`}>
              <FileText className="w-4 h-4 transition-transform duration-200 hover:scale-110 shrink-0" />
              <span>Generate Audit Report</span>
            </button>
            
            <div className="relative rounded-xl overflow-hidden h-28 sm:h-auto sm:aspect-video lg:h-28 w-full group cursor-pointer border border-slate-200 shadow-sm">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Security Center" src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400&h=200" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
                <p className="text-white font-bold text-xs">Security Compliance</p>
                <p className="text-slate-300 text-[10px] font-semibold mt-0.5">HIPAA standards maintained</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Platform Earnings Area Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h4 className="text-sm font-bold text-slate-900 mb-4">Platform Earnings Trend (₹)</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getEarningsData()}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#f8fafc', fontFamily: 'sans-serif' }} />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Distribution Pie */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
          <h4 className="text-sm font-bold text-slate-900 mb-2">Appointments Status</h4>
          <div className="h-48 relative flex-grow flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getStatusData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {getStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || "#cbd5e1"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center text-[10px] font-bold text-slate-500 mt-2">
            {Object.keys(PIE_COLORS).map((status) => (
              <div key={status} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[status] }} />
                <span>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Infrastructure Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <h5 className="font-bold text-xs text-slate-900">Primary Node [US-EAST]</h5>
          </div>
          <div className="flex gap-1 h-5 my-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-emerald-500 flex-1 h-full rounded-[2px]"></div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans">RESPONSE TIME 24ms</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <h5 className="font-bold text-xs text-slate-900">Storage Layer [S3-SYNC]</h5>
          </div>
          <div className="flex gap-1 h-5 my-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-emerald-500 flex-1 h-full rounded-[2px]"></div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans">AVAILABILITY 100%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <h5 className="font-bold text-xs text-slate-900">Backup Relay [EU-WEST]</h5>
          </div>
          <div className="flex gap-1 h-5 my-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`${i === 7 ? "bg-amber-500" : "bg-emerald-500"} flex-1 h-full rounded-[2px]`}></div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans">RESPONSE TIME 142ms</p>
        </div>
      </div>
    </motion.div>
  );
}
