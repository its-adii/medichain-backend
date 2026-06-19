import React from "react";
import { motion } from "framer-motion";
import Avatar from "../Avatar";
import {
  Loader2,
  Download,
  UserPlus,
  Search,
  ChevronDown,
  ListFilter,
  LayoutGrid,
  ArrowDown,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Info,
  RefreshCw
} from "lucide-react";
import { designSystem } from "../../styles/designSystem";

const getRolePill = (role) => {
  const r = role.toLowerCase();
  if (r === "doctor") {
    return (
      <span className={`${designSystem.components.badge} bg-[#e0f7fc] text-cyan-600 border-cyan-200`}>
        Doctor
      </span>
    );
  }
  if (r === "patient") {
    return (
      <span className={`${designSystem.components.badge} bg-slate-100 text-slate-600 border-slate-200`}>
        Patient
      </span>
    );
  }
  if (r === "staff") {
    return (
      <span className={`${designSystem.components.badge} bg-emerald-50 text-emerald-700 border-emerald-200`}>
        Staff
      </span>
    );
  }
  return (
    <span className={`${designSystem.components.badge} bg-slate-900 text-white border-slate-950`}>
      Admin
    </span>
  );
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

export default function UsersTab({
  users,
  doctors,
  deletingId,
  deleteConfirmId,
  setDeleteConfirmId,
  handleDeleteUser,
  userSearch,
  setUserSearch,
  userSearchDebounced,
  userRoleFilter,
  setUserRoleFilter,
  userPage,
  setUserPage,
  getUserGrowth,
  exportUsersCSV,
  setIsAddUserModalOpen,
  setAddUserError,
  setNewUserRole
}) {
  const combinedUsers = users.map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role.toLowerCase(),
    detail: u.role === "doctor" ? "General Medicine" : (u.role === "admin" ? "Staff / Admin" : "Patient ID: #" + (u._id || "").slice(-4)),
    joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—",
    avatar: (() => {
      // For doctors, check their Doctor profile image first
      if (u.role === "doctor") {
        const doc = doctors.find(d => d.user && (d.user._id === u._id || d.user === u._id));
        if (doc?.profileImage) return doc.profileImage;
      }
      // Then check the User model's profileImage
      if (u.profileImage) return u.profileImage;
      // Fallback to empty string to trigger Avatar component's animated fallback
      return "";
    })(),
    status: (() => {
      if (u.role !== "doctor") return "ACTIVE";
      const doc = doctors.find(d => d.user && (d.user._id === u._id || d.user === u._id));
      if (!doc) return "PENDING";
      if (doc.isFlagged) return "FLAGGED";
      return doc.isVerified ? "ACTIVE" : "PENDING";
    })(),
    isMock: false
  }));

  const filteredUsers = combinedUsers.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes((userSearchDebounced || "").toLowerCase()) || 
                          u.email.toLowerCase().includes((userSearchDebounced || "").toLowerCase());
    const matchesRole = userRoleFilter === "All" || u.role === userRoleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const userPageSize = 5;
  const paginatedUsers = filteredUsers.slice((userPage - 1) * userPageSize, userPage * userPageSize);
  const totalUserPages = Math.ceil(filteredUsers.length / userPageSize) || 1;

  return (
    <motion.div
      key="users"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={designSystem.spacing.sectionGap}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={designSystem.typography.pageTitle}>User Management</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Monitor and control access for all patients and medical staff.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:gap-3 shrink-0">
          <button
            onClick={exportUsersCSV}
            className={`${designSystem.components.buttonOutline} px-3.5 py-2 text-xs gap-1.5 w-full sm:w-auto justify-center`}
          >
            <Download className="w-3.5 h-3.5 transition-transform duration-200 hover:scale-110 shrink-0" />
            <span>Export Data</span>
          </button>
          <button 
            onClick={() => { 
              setNewUserRole("patient");
              setAddUserError(""); 
              setIsAddUserModalOpen(true); 
            }} 
            className={`${designSystem.components.buttonPrimary} px-3.5 py-2 text-xs gap-1.5 w-full sm:w-auto justify-center`}
          >
            <UserPlus className="w-3.5 h-3.5 transition-transform duration-200 hover:scale-110 shrink-0" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Bento Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${designSystem.components.card} flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300`}>
          <p className={designSystem.typography.label}>TOTAL USERS</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-black text-slate-900">{users.length.toLocaleString()}</h3>
            <span className="text-emerald-600 font-bold text-xs">{getUserGrowth()} this month</span>
          </div>
        </div>
        <div className={`${designSystem.components.card} flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300`}>
          <p className={designSystem.typography.label}>ACTIVE PATIENTS</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-black text-slate-900">{users.filter(u => u.role === 'patient').length.toLocaleString()}</h3>
            <span className="text-emerald-600 font-bold text-xs">active in system</span>
          </div>
        </div>
        <div className={`${designSystem.components.card} flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300`}>
          <p className={designSystem.typography.label}>VERIFIED DOCTORS</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-black text-slate-900">{doctors.filter(d => d.isVerified).length.toLocaleString()}</h3>
            <span className="text-emerald-600 font-bold text-xs">{doctors.length} registered</span>
          </div>
        </div>
        <div className={`${designSystem.components.card} flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300`}>
          <p className={designSystem.typography.label}>PENDING APPROVALS</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-black text-slate-900">{doctors.filter(d => !d.isVerified).length}</h3>
            <span className="text-rose-500 font-bold text-xs">{doctors.filter(d => !d.isVerified).length} awaiting review</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                className={`${designSystem.components.input} pl-9 py-1.5 text-xs font-medium bg-white text-slate-900`}
                placeholder="Search by name, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                type="text"
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <select
                className="bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 text-slate-700 appearance-none cursor-pointer w-full sm:w-auto"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor</option>
                <option value="Admin">Admin</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-slate-400 self-end sm:self-auto">
            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer active:scale-[0.95]" title="Filter list">
              <ListFilter className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
            </button>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer active:scale-[0.95]" title="Grid view">
              <LayoutGrid className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className={`${designSystem.components.table} min-w-[650px]`}>
            <thead>
              <tr className={designSystem.components.tableHeaderRow}>
                <th className="px-6 py-4 text-left">
                  <span className="flex items-center gap-1 cursor-pointer">Name <ArrowDown className="w-3 h-3" /></span>
                </th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-left">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-slate-100"
            >
              {paginatedUsers.map((u) => (
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
                      role={u.role}
                    />
                    <div>
                      <p className="font-bold text-sm text-slate-900">{u.name}</p>
                      <p className="text-[10px] text-slate-450 font-medium mt-0.5">{u.detail}</p>
                    </div>
                  </td>
                  <td className={`${designSystem.components.tableCell} text-slate-600 font-medium`}>{u.email}</td>
                  <td className={designSystem.components.tableCell}>
                    {getRolePill(u.role)}
                  </td>
                  <td className={`${designSystem.components.tableCell} text-slate-500 font-medium`}>
                    {u.joinedDate}
                  </td>
                  <td className={`${designSystem.components.tableCell} text-right`}>
                    {deleteConfirmId === u._id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-[10px] font-bold text-rose-600 whitespace-nowrap">Delete?</span>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={deletingId === u._id}
                          className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition cursor-pointer flex items-center justify-center min-w-[28px] h-5"
                        >
                          {deletingId === u._id ? <Loader2 size={10} className="animate-spin inline" /> : "Yes"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-0.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded text-[10px] font-bold transition cursor-pointer h-5 flex items-center justify-center"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={deletingId === u._id || u.role === "admin"}
                        title={u.role === "admin" ? "Admin users cannot be deleted" : "Delete user"}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.95]"
                      >
                        {deletingId === u._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 className="w-4 h-4 transition-transform duration-200 hover:scale-110" />}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr className="h-[100px]">
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-semibold text-slate-400 bg-white">
                    <div className="flex flex-col items-center justify-center py-6">
                      <Search className="w-10 h-10 text-slate-300 mb-2 animate-pulse" />
                      <p className="text-slate-700 font-bold text-sm">No Users Found</p>
                      <p className="text-xs text-slate-400 mt-1">No users match the search parameters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500">
            Showing {filteredUsers.length === 0 ? 0 : (userPage - 1) * userPageSize + 1} to {Math.min(userPage * userPageSize, filteredUsers.length)} of {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
          </p>
          
          <div className="flex items-center gap-1">
            <button
              disabled={userPage === 1}
              onClick={() => setUserPage(prev => Math.max(1, prev - 1))}
              className="p-1 hover:bg-slate-100 disabled:opacity-40 rounded-lg text-sm text-slate-600 cursor-pointer active:scale-[0.95]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(totalUserPages)].map((_, i) => {
              const pageNum = i + 1;
              const isActive = userPage === pageNum;
              return (
                <button
                  key={`user-page-${pageNum}`}
                  onClick={() => setUserPage(pageNum)}
                  className={`w-6 h-6 text-xs font-bold rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={userPage === totalUserPages}
              onClick={() => setUserPage(prev => Math.min(totalUserPages, prev + 1))}
              className="p-1 hover:bg-slate-100 disabled:opacity-40 rounded-lg text-sm text-slate-600 cursor-pointer active:scale-[0.95]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#e0f7fc]/50 p-5 rounded-2xl flex items-start gap-4 border border-cyan-100/50 shadow-sm group">
          <div className="p-2 bg-cyan-100/60 text-cyan-600 rounded-lg">
            <Info className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Data Privacy Notice</h4>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">All user data is encrypted with AES-256. Access to patient records is logged and audited according to HIPAA compliance standards.</p>
          </div>
        </div>

        <div className="bg-emerald-50/50 p-5 rounded-2xl flex items-start gap-4 border border-emerald-100/50 shadow-sm group">
          <div className="p-2 bg-emerald-100/60 text-emerald-600 rounded-lg">
            <RefreshCw className="w-5 h-5 transition-transform duration-200 group-hover:rotate-180" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Next System Sync</h4>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">The regional database is scheduled for synchronization in 14 minutes. Some user modifications may experience a propagation delay.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
