import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import FloatingLabelInput from "../components/auth/FloatingLabelInput";
import RoleSelector from "../components/auth/RoleSelector";
import AuthVisualPanel from "../components/auth/AuthVisualPanel";
import AlertBanner from "../components/auth/AlertBanner";

function Register() {
  const { setUser, setAccessToken } = useAuth();
  
  const [role, setRole] = useState("patient"); // 'patient' | 'doctor'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("General Medicine");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [customMockEmail, setCustomMockEmail] = useState("");

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!terms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
        specialization: role === "doctor" ? specialization : undefined,
      });
      
      const { user: registeredUser, accessToken } = response.data;
      
      // Auto login and save tokens
      localStorage.setItem("accessToken", accessToken);
      setAccessToken(accessToken);
      setUser(registeredUser);
      
      navigate("/verify-email");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleClick() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && clientId !== "YOUR_GOOGLE_CLIENT_ID" && !clientId.includes("placeholder")) {
      const redirectUri = encodeURIComponent(window.location.origin + "/login");
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=id_token&scope=openid%20email%20profile&nonce=medichain_${Date.now()}`;
      window.location.href = googleAuthUrl;
    } else {
      setShowSandboxModal(true);
    }
  }

  async function handleSandboxLogin(emailVal, nameVal) {
    setShowSandboxModal(false);
    setLoading(true);
    setError("");
    try {
      const mockToken = `mock-google-token-${emailVal}:${nameVal}`;
      const response = await api.post("/auth/google-login", { credential: mockToken });
      const { user: loggedUser, accessToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      setAccessToken(accessToken);
      setUser(loggedUser);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Sandbox login failed.");
    } finally {
      setLoading(false);
    }
  }

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

      {/* Right Column: Registration Form */}
      <section className="w-full md:w-[640px] shrink-0 flex flex-col items-center justify-center px-6 md:px-12 py-6 bg-[#f8f9ff] dark:bg-[#060913] relative transition-colors duration-300 h-screen overflow-y-auto md:overflow-y-hidden">
        
        {/* Back Button Link */}
        <div className="absolute top-8 left-6 md:left-12">
          <Link
            to="/login"
            className="group font-semibold text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Login
          </Link>
        </div>

        {/* Center Glassmorphic Registration Card */}
        <div className="w-full max-w-xl my-auto mt-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-[24px] p-6 md:p-7 shadow-xl shadow-slate-100/40 dark:shadow-none backdrop-blur-xl"
          >
            {/* Header */}
            <div className="mb-4 text-left">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">
                Create Account
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Choose your role and set up your secure medical identity.
              </p>
            </div>

            {/* Animated Error Banner */}
            <AnimatePresence mode="wait">
              {error && <AlertBanner message={error} />}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Segmented Role Selector */}
              <RoleSelector role={role} onChange={(newRole) => { setRole(newRole); setError(""); }} />

              {/* Specialty Field (Doctors Only, animate slide in) */}
              <AnimatePresence>
                {role === "doctor" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-1.5 overflow-hidden"
                  >
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 px-1" htmlFor="specialty">
                      Medical Specialty
                    </label>
                    <select
                      className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
                      id="specialty"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Dentistry">Dentistry</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Full Name */}
              <FloatingLabelInput
                id="full-name"
                label="Full Name"
                icon="person"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                autoComplete="name"
                required
              />

              {/* Email Address */}
              <FloatingLabelInput
                id="email"
                label="Email Address"
                icon="mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                autoComplete="email"
                required
              />

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <FloatingLabelInput
                  id="confirm-password"
                  label="Confirm Password"
                  icon="lock"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  className="mt-0.5 w-4.5 h-4.5 text-cyan-600 dark:text-cyan-500 border-slate-250 dark:border-slate-800 rounded-lg focus:ring-cyan-500 cursor-pointer accent-slate-900 dark:accent-white"
                  id="terms"
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                  I agree to the{" "}
                  <a className="text-cyan-600 dark:text-cyan-400 font-bold hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a className="text-cyan-600 dark:text-cyan-400 font-bold hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                    Privacy Policy
                  </a>.
                </span>
              </label>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-955 font-bold text-sm rounded-2xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-75 disabled:pointer-events-none group"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin mr-2" />
                    <span>Creating Secure Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Secure Account</span>
                    <ShieldCheck className="w-4.5 h-4.5 group-hover:scale-110 transition-transform duration-200" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Social Registration */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100 dark:border-slate-800/80"></div>
              </div>
              <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest">
                <span className="px-4 bg-white dark:bg-slate-900/10 text-slate-400 dark:text-slate-655">
                  Or register with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                className="h-10 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2 hover:border-slate-350 dark:hover:border-slate-700 transition-all cursor-pointer bg-white dark:bg-slate-900/50 text-xs font-bold text-slate-800 dark:text-white shadow-xs"
                onClick={handleGoogleClick}
                type="button"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                </svg>
                <span>Google</span>
              </button>
              <button
                className="h-10 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2 hover:border-slate-350 dark:hover:border-slate-700 transition-all cursor-pointer bg-white dark:bg-slate-900/50 text-xs font-bold text-slate-800 dark:text-white shadow-xs"
                onClick={() => alert("Apple ID registration is currently a prototype.")}
                type="button"
              >
                <span className="material-symbols-outlined text-slate-800 dark:text-white text-[18px]">id_card</span>
                <span>Apple ID</span>
              </button>
            </div>

            {/* Footer Link */}
            <div className="text-center mt-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Already have a MediChain ID?{" "}
                <Link className="text-cyan-600 dark:text-cyan-400 font-black hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline transition-colors" to="/login">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sandbox Chooser Modal */}
      <AnimatePresence>
        {showSandboxModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowSandboxModal(false)}
                className="absolute top-4 right-4 text-slate-450 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer flex items-center justify-center border-0 bg-transparent"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="text-left">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1.5">
                  Google OAuth Sandbox Mode
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                  No Client ID is configured. Select a mock Google account below to test the authentication flow.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => handleSandboxLogin("patient-google@medichain.com", "Google Patient")}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800 rounded-2xl flex items-center justify-between group cursor-pointer transition-all border-0"
                    type="button"
                  >
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-900 dark:text-white">Mock Google Patient</p>
                      <p className="text-[10px] text-slate-400 font-semibold">patient-google@medichain.com</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-cyan-500 transition-colors">login</span>
                  </button>

                  <button
                    onClick={() => handleSandboxLogin("doctor-google@medichain.com", "Google Doctor")}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800 rounded-2xl flex items-center justify-between group cursor-pointer transition-all border-0"
                    type="button"
                  >
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-900 dark:text-white">Mock Google Doctor</p>
                      <p className="text-[10px] text-slate-400 font-semibold">doctor-google@medichain.com</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-cyan-500 transition-colors">login</span>
                  </button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-150 dark:border-slate-800"></div></div>
                    <span className="relative px-2 bg-white dark:bg-slate-900 text-[9px] font-black uppercase text-slate-400 tracking-wider">Or custom email</span>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder="custom-email@gmail.com"
                      value={customMockEmail}
                      onChange={(e) => setCustomMockEmail(e.target.value)}
                      className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-850 border border-slate-205 dark:border-slate-850 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={() => handleSandboxLogin(customMockEmail, customMockEmail.split("@")[0] || "Custom User")}
                      disabled={!customMockEmail}
                      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl disabled:opacity-50 transition-all cursor-pointer border-0"
                      type="button"
                    >
                      Login with Custom Account
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Register;
