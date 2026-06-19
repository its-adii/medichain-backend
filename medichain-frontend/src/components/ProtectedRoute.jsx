import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldPlus } from "lucide-react";

function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();

  // Show a full-screen loader while session is being restored
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldPlus size={20} className="text-cyan-600" />
          </div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Loading your session...</p>
      </div>
    );
  }

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction: if roles are specified, check membership
  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on actual role
    const roleRedirects = {
      patient: "/dashboard",
      doctor: "/doctor/dashboard",
      admin: "/admin/dashboard",
    };
    return <Navigate to={roleRedirects[user.role] || "/dashboard"} replace />;
  }

  return children;
}

export default ProtectedRoute;
