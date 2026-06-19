import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../Avatar";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings,
  Shield,
  Code,
  Bell,
  Database,
  Upload,
  Search,
  Copy,
  Check,
  X
} from "lucide-react";
import { designSystem } from "../../styles/designSystem";

export default function SettingsTab({
  user,
  savingProfile,
  profileSuccess,
  setProfileSuccess,
  profileError,
  setProfileError,
  handleDiscardChanges,
  handleSaveChanges,
  handleClearAllSessions,
  settingsSubTab,
  setSettingsSubTab,
  platformName,
  setPlatformName,
  adminEmail,
  setAdminEmail,
  preferredLanguage,
  setPreferredLanguage,
  timezone,
  setTimezone,
  accessTokenTTL,
  setAccessTokenTTL,
  refreshTokenTTL,
  setRefreshTokenTTL,
  passwordRequireSymbols,
  setPasswordRequireSymbols,
  passwordMinLength12,
  setPasswordMinLength12,
  passwordForceReset90,
  setPasswordForceReset90,
  apiEnv,
  setApiEnv,
  baseApiUrl,
  setBaseApiUrl,
  systemApiKey,
  webhooksEnabled,
  setWebhooksEnabled,
  rateLimitingEnabled,
  setRateLimitingEnabled,
  profileName,
  setProfileName,
  profileImage,
  setProfileImage,
  setProfileImageFile,
  profilePassword,
  setProfilePassword,
  profileConfirmPassword,
  setProfileConfirmPassword,
  showRevokeAllConfirm,
  setShowRevokeAllConfirm,
  settingsSearch
}) {
  const fileInputRef = useRef(null);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const matchesSettingsSearch = (text) => {
    return !settingsSearch || text.toLowerCase().includes(settingsSearch.toLowerCase());
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(systemApiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header & Actions */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className={designSystem.typography.pageTitle}>System Settings</h2>
          <p className={`${designSystem.typography.body} mt-1 font-sans`}>Configure platform-wide security, API integration, and branding parameters.</p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={handleDiscardChanges}
            className={`${designSystem.components.buttonOutline} flex items-center gap-1.5 group`}
          >
            <X size={14} className="group-hover:scale-110 transition-transform duration-200" />
            Discard Changes
          </button>
          <button 
            type="button"
            onClick={handleSaveChanges}
            disabled={savingProfile}
            className={`${designSystem.components.buttonPrimary} min-w-[120px] flex items-center gap-1.5 group`}
          >
            {savingProfile ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} className="group-hover:scale-115 transition-transform duration-200 text-white" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Feedback Banners */}
      <AnimatePresence>
        {profileSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`${designSystem.colors.status.completed} border p-4 rounded-xl mb-4 flex items-center gap-3 text-sm font-bold`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>{profileSuccess}</span>
          </motion.div>
        )}
        {profileError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`${designSystem.colors.status.flagged} border p-4 rounded-xl mb-4 flex items-center gap-3 text-sm font-bold`}
          >
            <AlertCircle className="w-5 h-5" />
            <span>{profileError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-12 gap-6">
        {/* Vertical Sub-Navigation */}
        <div className="col-span-3">
          <nav className="flex flex-col gap-1 sticky top-32">
            {[
              { id: "general", label: "General", Icon: Settings, iconClass: "group-hover:rotate-45" },
              { id: "security", label: "Security & Auth", Icon: Shield, iconClass: "group-hover:scale-110" },
              { id: "api", label: "API Configuration", Icon: Code, iconClass: "group-hover:scale-110" },
              { id: "notifications", label: "Notifications", Icon: Bell, iconClass: "group-hover:animate-bounce" },
              { id: "database", label: "Database", Icon: Database, iconClass: "group-hover:scale-110" }
            ].map(({ id, label, Icon, iconClass }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSettingsSubTab(id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all cursor-pointer group relative ${
                  settingsSubTab === id
                    ? "text-slate-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {settingsSubTab === id && (
                  <motion.div
                    layoutId="settingsSubTabIndicator"
                    className="absolute inset-0 bg-slate-100 border border-slate-200 rounded-lg -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 transition-transform duration-200 ${iconClass} relative z-10`} />
                <span className="text-xs font-semibold relative z-10">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Forms Area */}
        <div className="col-span-9 space-y-6">
          {/* General Settings Card */}
          {settingsSubTab === "general" && (
            <section className={`${designSystem.colors.cardBg} rounded-xl overflow-hidden shadow-sm`}>
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className={designSystem.typography.cardHeading}>General Settings</h3>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                {matchesSettingsSearch("Profile Picture") && (
                  <div className="col-span-2 border-b border-slate-200 pb-6 mb-2 flex items-center gap-6">
                    <div className="relative group">
                      <Avatar 
                        src={profileImage} 
                        name={profileName || "Admin"} 
                        className="w-20 h-20 border-2 border-cyan-500 shadow-md text-xl" 
                        alt="Profile Preview"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200"
                      >
                        <Upload className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-900">Profile Picture</h4>
                      <p className="text-xs text-slate-500 font-medium">PNG, JPG or WEBP. Max 2MB.</p>
                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition cursor-pointer"
                        >
                          Upload New
                        </button>
                        {profileImage && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileImage("");
                              setProfileImageFile(null);
                            }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold text-rose-600 transition cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setProfileImageFile(file);
                            setProfileImage(URL.createObjectURL(file));
                          }
                        }}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                )}

                {matchesSettingsSearch("Platform Name") && (
                  <div className="space-y-1">
                    <label className={designSystem.typography.label}>Platform Name</label>
                    <input 
                      className={designSystem.components.input} 
                      type="text" 
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                    />
                  </div>
                )}
                {matchesSettingsSearch("Admin Name") && (
                  <div className="space-y-1">
                    <label className={designSystem.typography.label}>Admin Name</label>
                    <input 
                      className={designSystem.components.input} 
                      type="text" 
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </div>
                )}
                {matchesSettingsSearch("Admin Email") && (
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className={designSystem.typography.label}>Admin Email</label>
                    <input 
                      className={designSystem.components.input} 
                      type="email" 
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                    />
                  </div>
                )}
                {matchesSettingsSearch("Preferred Language") && (
                  <div className="space-y-1">
                    <label className={designSystem.typography.label}>Preferred Language</label>
                    <select 
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className={designSystem.components.input}
                    >
                      <option value="English (US)">English (US)</option>
                      <option value="German (DE)">German (DE)</option>
                      <option value="Spanish (ES)">Spanish (ES)</option>
                      <option value="French (FR)">French (FR)</option>
                    </select>
                  </div>
                )}
                {matchesSettingsSearch("Timezone") && (
                  <div className="space-y-1">
                    <label className={designSystem.typography.label}>Timezone</label>
                    <select 
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className={designSystem.components.input}
                    >
                      <option value="(GMT-05:00) Eastern Time">(GMT-05:00) Eastern Time</option>
                      <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                      <option value="(GMT+01:00) Central European Time">(GMT+01:00) Central European Time</option>
                    </select>
                  </div>
                )}
                {!(matchesSettingsSearch("Profile Picture") || matchesSettingsSearch("Platform Name") || matchesSettingsSearch("Admin Name") || matchesSettingsSearch("Admin Email") || matchesSettingsSearch("Preferred Language") || matchesSettingsSearch("Timezone")) && (
                  <div className="col-span-2 text-center py-10 text-slate-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-xs font-bold">No settings match your search query.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Security & Auth Card */}
          {settingsSubTab === "security" && (
            <section className={`${designSystem.colors.cardBg} rounded-xl overflow-hidden shadow-sm`}>
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className={designSystem.typography.cardHeading}>Security &amp; Auth</h3>
                <span className={`${designSystem.components.badge} bg-emerald-50 text-emerald-600 border-emerald-200`}>High Shield Active</span>
              </div>
              <div className="p-6 space-y-6">
                {matchesSettingsSearch("Token TTL") && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className={designSystem.typography.label}>Access Token TTL (Minutes)</label>
                      <input 
                        className={designSystem.components.input} 
                        type="number" 
                        value={accessTokenTTL}
                        onChange={(e) => setAccessTokenTTL(parseInt(e.target.value) || 0)}
                      />
                      <p className="text-[10px] text-slate-500 italic font-medium">Recommended: 15-30 minutes</p>
                    </div>
                    <div className="space-y-1">
                      <label className={designSystem.typography.label}>Refresh Token TTL (Days)</label>
                      <input 
                        className={designSystem.components.input} 
                        type="number" 
                        value={refreshTokenTTL}
                        onChange={(e) => setRefreshTokenTTL(parseInt(e.target.value) || 0)}
                      />
                      <p className="text-[10px] text-slate-500 italic font-medium">Tokens rotate on every use</p>
                    </div>
                  </div>
                )}

                {matchesSettingsSearch("Password Policy") && (
                  <div className="border-t border-slate-200 pt-6">
                    <h4 className="font-semibold text-xs text-slate-900 mb-4">Password Policy</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={passwordRequireSymbols}
                          onChange={(e) => setPasswordRequireSymbols(e.target.checked)}
                          className="w-4 h-4 rounded text-cyan-600 border-slate-300 focus:ring-cyan-500 cursor-pointer"
                        />
                        <span className="text-xs font-medium text-slate-700">Require Symbols</span>
                      </label>
                      <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={passwordMinLength12}
                          onChange={(e) => setPasswordMinLength12(e.target.checked)}
                          className="w-4 h-4 rounded text-cyan-600 border-slate-300 focus:ring-cyan-500 cursor-pointer"
                        />
                        <span className="text-xs font-medium text-slate-700">Min 12 Characters</span>
                      </label>
                      <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={passwordForceReset90}
                          onChange={(e) => setPasswordForceReset90(e.target.checked)}
                          className="w-4 h-4 rounded text-cyan-600 border-slate-300 focus:ring-cyan-500 cursor-pointer"
                        />
                        <span className="text-xs font-medium text-slate-700">Force 90-day reset</span>
                      </label>
                    </div>
                  </div>
                )}

                {matchesSettingsSearch("Change Admin Password") && (
                  <div className="border-t border-slate-200 pt-6">
                    <h4 className="font-semibold text-xs text-slate-900 mb-4">Change Admin Password</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className={designSystem.typography.label}>New Password</label>
                        <input 
                          className={designSystem.components.input} 
                          type="password" 
                          placeholder="Enter new password (min 6 chars)"
                          value={profilePassword}
                          onChange={(e) => setProfilePassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={designSystem.typography.label}>Confirm New Password</label>
                        <input 
                          className={designSystem.components.input} 
                          type="password" 
                          placeholder="Confirm new password"
                          value={profileConfirmPassword}
                          onChange={(e) => setProfileConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {matchesSettingsSearch("Session Management") && (
                  <div className="p-4 bg-rose-50 border border-rose-200/60 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-rose-600">Session Management</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">Instantly invalidate all active user sessions across the platform.</p>
                    </div>
                    {showRevokeAllConfirm ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 bg-rose-50 rounded-lg text-xs font-bold transition">
                        <span className="text-rose-600 text-[10px]">Revoke all sessions globally?</span>
                        <button
                          type="button"
                          onClick={handleClearAllSessions}
                          disabled={savingProfile}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition cursor-pointer flex items-center justify-center min-w-[28px] h-6"
                        >
                          {savingProfile ? <Loader2 size={10} className="animate-spin" /> : "Yes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRevokeAllConfirm(false)}
                          className="px-2.5 py-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded text-[10px] font-bold transition cursor-pointer h-6 flex items-center justify-center"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setShowRevokeAllConfirm(true)}
                        className={`${designSystem.components.buttonDanger} px-4 py-2 text-xs flex items-center gap-1.5 group`}
                      >
                        <AlertCircle size={14} className="group-hover:scale-110 transition-transform duration-200 text-white" />
                        Clear All Sessions
                      </button>
                    )}
                  </div>
                )}

                {!(matchesSettingsSearch("Token TTL") || matchesSettingsSearch("Password Policy") || matchesSettingsSearch("Change Admin Password") || matchesSettingsSearch("Session Management")) && (
                  <div className="text-center py-10 text-slate-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-xs font-bold">No settings match your search query.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* API Configuration Card */}
          {settingsSubTab === "api" && (
            <section className={`${designSystem.colors.cardBg} rounded-xl overflow-hidden shadow-sm`}>
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className={designSystem.typography.cardHeading}>API Configuration</h3>
                <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-slate-200">
                  <button 
                    type="button"
                    onClick={() => setApiEnv("production")}
                    className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                      apiEnv === "production" 
                        ? "bg-cyan-500 text-white shadow-sm" 
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    Production
                  </button>
                  <button 
                    type="button"
                    onClick={() => setApiEnv("staging")}
                    className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                      apiEnv === "staging" 
                        ? "bg-cyan-500 text-white shadow-sm" 
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    Staging
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {matchesSettingsSearch("Base API URL") && (
                  <div className="space-y-1">
                    <label className={designSystem.typography.label}>Base API URL</label>
                    <div className="flex">
                      <span className="bg-slate-50 border border-r-0 border-slate-200 px-4 py-2.5 rounded-l-xl font-mono text-xs text-slate-500 flex items-center">https://</span>
                      <input 
                        className="flex-grow border border-slate-200 rounded-r-xl px-4 py-2.5 font-mono text-xs focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all outline-none text-slate-900 bg-white" 
                        type="text" 
                        value={baseApiUrl}
                        onChange={(e) => setBaseApiUrl(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                {matchesSettingsSearch("System API Key") && (
                  <div className="space-y-1">
                    <label className={designSystem.typography.label}>System API Key (Encrypted)</label>
                    <div className="relative">
                      <input 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-500 cursor-not-allowed pr-10 outline-none" 
                        readOnly 
                        type="password" 
                        value={systemApiKey}
                      />
                      <button 
                        type="button"
                        onClick={handleCopyApiKey}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600 cursor-pointer active:scale-90 transition-transform"
                        title={apiKeyCopied ? "Copied" : "Copy API Key"}
                      >
                        {apiKeyCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
                {(matchesSettingsSearch("Webhooks") || matchesSettingsSearch("Rate Limiting")) && (
                  <div className="grid grid-cols-2 gap-6">
                    {matchesSettingsSearch("Webhooks") && (
                      <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-white">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-xs text-slate-900">Webhooks</p>
                          <div 
                            onClick={() => setWebhooksEnabled(!webhooksEnabled)}
                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                              webhooksEnabled ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          >
                            <div 
                              className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${
                                webhooksEnabled ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Enable real-time data streaming to connected hospital ERPs.</p>
                      </div>
                    )}
                    {matchesSettingsSearch("Rate Limiting") && (
                      <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-white">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-xs text-slate-900">Rate Limiting</p>
                          <div 
                            onClick={() => setRateLimitingEnabled(!rateLimitingEnabled)}
                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                              rateLimitingEnabled ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          >
                            <div 
                              className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${
                                rateLimitingEnabled ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Limit requests to 5000/hr per API consumer profile.</p>
                      </div>
                    )}
                  </div>
                )}
                {!(matchesSettingsSearch("Base API URL") || matchesSettingsSearch("System API Key") || matchesSettingsSearch("Webhooks") || matchesSettingsSearch("Rate Limiting")) && (
                  <div className="text-center py-10 text-slate-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-xs font-bold">No settings match your search query.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Notifications Settings Card Placeholder */}
          {settingsSubTab === "notifications" && (
            <section className={`${designSystem.colors.cardBg} rounded-xl overflow-hidden shadow-sm`}>
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className={designSystem.typography.cardHeading}>Notifications Settings</h3>
              </div>
              <div className="p-10 text-center space-y-2 bg-white">
                {matchesSettingsSearch("Notifications") || matchesSettingsSearch("Real-time alerts") || matchesSettingsSearch("email templates") || matchesSettingsSearch("SMTP credentials") ? (
                  <>
                    <Bell className="w-10 h-10 mx-auto mb-2 text-slate-400 animate-bounce" />
                    <h4 className="font-bold text-sm text-slate-900">Notifications Panel Coming Soon</h4>
                    <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">Real-time alerts, email templates, and SMTP credentials settings are currently being designed.</p>
                  </>
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-xs font-bold">No settings match your search query.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Database Card Placeholder */}
          {settingsSubTab === "database" && (
            <section className={`${designSystem.colors.cardBg} rounded-xl overflow-hidden shadow-sm`}>
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className={designSystem.typography.cardHeading}>Database Management</h3>
              </div>
              <div className="p-10 text-center space-y-2 bg-white">
                {matchesSettingsSearch("Database") || matchesSettingsSearch("Backup schedulers") || matchesSettingsSearch("data pruning") || matchesSettingsSearch("replication node") ? (
                  <>
                    <Database className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                    <h4 className="font-bold text-sm text-slate-900">Database Utilities Coming Soon</h4>
                    <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">Backup schedulers, data pruning operations, and replication node integrity status checks are currently being designed.</p>
                  </>
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-xs font-bold">No settings match your search query.</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </motion.div>
  );
}
