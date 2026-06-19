import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import AuthVisualPanel from "../components/auth/AuthVisualPanel";
import AlertBanner from "../components/auth/AlertBanner";

function VerifyEmail() {
  const { user, setUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Redirect if user is not logged in or already verified
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
    } else if (user.isEmailVerified || user.isGoogleUser) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  // Count down resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Handle digit inputs
  function handleChange(index, value) {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Get last char
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  }

  // Handle backspace/key down
  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  }

  // Handle paste events
  function handlePaste(e) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return; // Ensure exactly 6 digits

    const digits = pastedData.split("");
    setOtp(digits);
    inputRefs.current[5].focus();
  }

  async function handleVerify(e) {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the complete 6-digit passcode.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/verify-email", {
        email: user.email,
        otp: otpCode,
      });

      setSuccess("Email verified successfully!");
      
      // Update local context user state
      setTimeout(() => {
        setUser(response.data.user);
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please check the passcode and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!canResend) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/resend-verification-otp", {
        email: user.email,
      });
      setSuccess("A new verification code has been sent to your email.");
      setResendTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    } catch (err) {
      setError(err.response?.data?.message || "Resend failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Mail size={20} className="text-cyan-600 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Restoring session...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="h-screen w-full flex bg-[#f8f9ff] dark:bg-[#060913] overflow-hidden antialiased transition-colors duration-300"
    >
      <AuthVisualPanel />

      <section className="w-full md:w-[640px] shrink-0 flex flex-col items-center justify-center px-6 md:px-12 py-6 bg-[#f8f9ff] dark:bg-[#060913] relative transition-colors duration-300 h-screen overflow-y-auto md:overflow-y-hidden">
        
        {/* Back Button */}
        <div className="absolute top-8 left-6 md:left-12">
          <button
            onClick={() => {
              // Sign out or clear cookies/storage to go back safely
              localStorage.removeItem("accessToken");
              setUser(null);
              navigate("/login");
            }}
            className="group font-semibold text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Login
          </button>
        </div>

        <div className="w-full max-w-xl my-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-[24px] p-6 md:p-7 shadow-xl shadow-slate-100/40 dark:shadow-none backdrop-blur-xl text-center"
          >
            {/* Header Icon */}
            <div className="w-14 h-14 bg-cyan-50 dark:bg-cyan-950/20 rounded-2xl flex items-center justify-center mb-5 mx-auto border border-cyan-100/40 dark:border-cyan-900/40 text-cyan-600 dark:text-cyan-400 shadow-sm">
              <Mail className="w-7 h-7 animate-pulse" />
            </div>

            {/* Title & Desc */}
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">
              Verify your email
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">
              We have sent a 6-digit verification code to <br />
              <strong className="text-slate-850 dark:text-slate-200">{user.email}</strong>.
            </p>

            {/* Success and Error alerts */}
            <AnimatePresence mode="wait">
              {error && <AlertBanner message={error} />}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-450 text-xs font-semibold flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                  <span className="text-left leading-relaxed">{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* OTP Code Inputs Form */}
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex justify-center gap-2.5 md:gap-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold bg-[#f8f9ff] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-slate-900 dark:text-white shadow-xs"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-sm rounded-2xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-70 disabled:pointer-events-none group"
                type="submit"
                disabled={loading || otp.some(d => d === "")}
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin mr-2" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Resend Timer footer */}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-8 font-semibold">
              Didn't receive the email?{" "}
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-cyan-600 dark:text-cyan-400 font-black hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline cursor-pointer"
                >
                  Click to resend
                </button>
              ) : (
                <span className="text-slate-400 font-bold">
                  Resend in {resendTimer}s
                </span>
              )}
            </p>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}

export default VerifyEmail;
