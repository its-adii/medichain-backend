import api from "../api/axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, Database, Mail } from "lucide-react";
import FloatingLabelInput from "../components/auth/FloatingLabelInput";
import AuthVisualPanel from "../components/auth/AuthVisualPanel";
import AlertBanner from "../components/auth/AlertBanner";
import PasswordStrengthIndicator from "../components/auth/PasswordStrengthIndicator";

const ROLE_REDIRECTS = {
  patient: "/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard",
};

function Login() {
  const [view, setView] = useState("login"); // 'login' | 'forgot-request' | 'forgot-check' | 'forgot-reset'
  
  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  
  // Reset Password states
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Action/UX states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  // Password Requirements verification
  const reqLength = newPassword.length >= 12;
  const reqSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const reqCase = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const reqNumbers = /\d/.test(newPassword);
  const isResetValid = reqLength && reqSymbols && reqCase && reqNumbers && newPassword === confirmPassword;

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, accessToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      setAccessToken(accessToken);
      setUser(user);

      navigate(ROLE_REDIRECTS[user.role] || "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleForgotPasswordRequest(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      setLoading(false);
      setView("forgot-check");
    }, 1200);
  }

  // Resend email handler with custom toast transition
  function handleResendEmail() {
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  }

  function handleResetPasswordSubmit(e) {
    e.preventDefault();
    if (!reqLength || !reqSymbols || !reqCase || !reqNumbers) {
      setError("Please satisfy all security requirements.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      setLoading(false);
      alert("Password has been reset successfully! You can now log in with your new password.");
      setPassword("");
      setView("login");
    }, 1500);
  }

  const viewVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-screen w-full flex bg-[#f8f9ff] dark:bg-[#060913] overflow-hidden antialiased transition-colors duration-300"
    >
      {/* Left Column: Reusable Animated Branding Panel */}
      <AuthVisualPanel />

      {/* Right Column: Sliding Form Section */}
      <section className="w-full md:w-[640px] shrink-0 flex flex-col items-center justify-center px-6 md:px-12 py-6 bg-[#f8f9ff] dark:bg-[#060913] relative transition-colors duration-300 h-screen overflow-y-auto md:overflow-y-hidden">
        
        {/* Back Button Link (Absolute layout top left) */}
        <div className="absolute top-8 left-6 md:left-12">
          <Link
            to="/"
            className="group font-semibold text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to website
          </Link>
        </div>

        {/* Center Glassmorphic Auth Card */}
        <div className="w-full max-w-xl my-auto">
          <AnimatePresence mode="wait">
            {view === "login" && (
              <motion.div
                key="login"
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-[24px] p-6 md:p-7 shadow-xl shadow-slate-100/40 dark:shadow-none backdrop-blur-xl"
              >
                {/* Header */}
                <div className="mb-5 text-left">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">
                    Welcome back
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Please enter your credentials to access your secure portal.
                  </p>
                </div>

                {/* Animated Error Banner */}
                <AlertBanner message={error} />

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                  <FloatingLabelInput
                    id="email"
                    label="Email Address"
                    icon="mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                    required
                  />

                  <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setView("forgot-request");
                        }}
                        className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline cursor-pointer transition-colors duration-200"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <FloatingLabelInput
                      id="password"
                      label="Password"
                      icon="lock"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  {/* Keep signed in */}
                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        className="w-4.5 h-4.5 text-cyan-600 dark:text-cyan-500 border-slate-250 dark:border-slate-800 rounded-lg focus:ring-cyan-500 cursor-pointer accent-slate-900 dark:accent-white"
                        id="remember"
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        Keep me signed in
                      </span>
                    </label>
                  </div>

                  {/* CTA Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-sm rounded-2xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-slate-900/10 dark:shadow-none disabled:opacity-75 disabled:pointer-events-none group"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin mr-2" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </motion.button>

                  {/* Divider */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100 dark:border-slate-800/80"></div>
                    </div>
                    <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest">
                      <span className="px-4 bg-white dark:bg-slate-900/10 text-slate-400 dark:text-slate-600">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Google Login */}
                  <button
                    className="w-full py-3.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-bold text-sm rounded-2xl hover:border-slate-350 dark:hover:border-slate-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
                    type="button"
                    onClick={() => alert("Google Sign-In is a prototype.")}
                  >
                    <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                    </svg>
                    <span>Google Account</span>
                  </button>
                </form>

                {/* Footer Link */}
                <div className="text-center mt-5 pt-3 border-t border-slate-50 dark:border-slate-800/40">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Don't have an account?{" "}
                    <Link
                      className="text-cyan-600 dark:text-cyan-400 font-black hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline transition-colors"
                      to="/register"
                    >
                      Create an account
                    </Link>
                  </p>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-5 mt-5 text-slate-400 dark:text-slate-655 font-black text-[8px] md:text-[9px] uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" /> HIPAA Secure
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" /> SOC2 Verified
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-500" /> GDPR Compliant
                  </span>
                </div>
              </motion.div>
            )}

            {view === "forgot-request" && (
              <motion.div
                key="forgot-request"
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-[24px] p-6 md:p-7 shadow-xl shadow-slate-100/40 dark:shadow-none backdrop-blur-xl"
              >
                <div className="mb-5 text-left">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">
                    Reset password
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 dark:text-slate-400 font-medium">
                    Enter the email associated with your account and we'll send you recovery instructions.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleForgotPasswordRequest}>
                  <FloatingLabelInput
                    id="recovery-email"
                    label="Email Address"
                    icon="mail"
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-sm rounded-2xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-75 disabled:pointer-events-none"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/40 text-center">
                  <button
                    onClick={() => {
                      setError("");
                      setView("login");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 animate-pulse" />
                    Back to Login
                  </button>
                </div>
              </motion.div>
            )}

            {view === "forgot-check" && (
              <motion.div
                key="forgot-check"
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-[24px] p-6 md:p-7 shadow-xl shadow-slate-100/40 dark:shadow-none backdrop-blur-xl text-center"
              >
                <div className="w-14 h-14 bg-cyan-50 dark:bg-cyan-950/20 rounded-2xl flex items-center justify-center mb-5 mx-auto border border-cyan-100/40 dark:border-cyan-900/40 text-cyan-600 dark:text-cyan-400 shadow-sm">
                  <Mail className="w-7 h-7 animate-pulse" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">
                  Check your email
                </h2>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto leading-relaxed">
                  We have sent a secure password reset link to <strong className="text-slate-800 dark:text-slate-200">{recoveryEmail || "your email"}</strong>.
                </p>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setView("forgot-reset")}
                    className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm rounded-2xl active:scale-[0.99] transition-all cursor-pointer shadow-md"
                  >
                    Proceed to Set New Password
                  </motion.button>
                  <button
                    onClick={() => {
                      setError("");
                      setView("login");
                    }}
                    className="w-full py-3.5 border border-slate-205 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 font-bold text-sm rounded-2xl active:scale-[0.99] transition-all cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-8 font-semibold">
                  Didn't receive the email?{" "}
                  <button
                    onClick={handleResendEmail}
                    className="text-cyan-600 dark:text-cyan-400 font-black hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline cursor-pointer"
                  >
                    Click to resend
                  </button>
                </p>
              </motion.div>
            )}

            {view === "forgot-reset" && (
              <motion.div
                key="forgot-reset"
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-[24px] p-6 md:p-7 shadow-xl shadow-slate-100/40 dark:shadow-none backdrop-blur-xl"
              >
                <div className="mb-5 text-left">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">
                    Set new password
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 dark:text-slate-400 font-medium">
                    Create a strong, unique password to secure your medical portal.
                  </p>
                </div>

                <AlertBanner message={error} />

                <form className="space-y-5" onSubmit={handleResetPasswordSubmit}>
                  <FloatingLabelInput
                    id="new_password"
                    label="New Password"
                    icon="lock"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />

                  <FloatingLabelInput
                    id="confirm_password"
                    label="Confirm New Password"
                    icon="lock"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />

                  <PasswordStrengthIndicator password={newPassword} />

                  <div className="space-y-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-sm py-3.5 rounded-2xl transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:pointer-events-none"
                      type="submit"
                      disabled={loading || !isResetValid}
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </motion.button>
                    <button
                      className="w-full text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer text-center"
                      type="button"
                      onClick={() => {
                        setError("");
                        setView("login");
                      }}
                    >
                      Cancel and return to login
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Floating Animated Toast Alert */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-8 left-1/2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 z-50 text-xs font-semibold border border-white/10 dark:border-slate-200/50"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-pulse" />
            <span>Verification email resent successfully.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Login;

