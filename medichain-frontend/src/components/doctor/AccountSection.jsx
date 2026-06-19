import { Settings, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { designSystem } from "../../styles/designSystem";

function AccountSection({
  accountName,
  setAccountName,
  accountEmail,
  setAccountEmail,
  accountPassword,
  setAccountPassword,
  accountConfirmPassword,
  setAccountConfirmPassword,
  savingAccount,
  accountSuccess,
  accountError,
  handleAccountSubmit,
}) {
  return (
    <div className="col-span-12 lg:col-span-5 space-y-6">
      <div className={`${designSystem.colors.cardBg} rounded-xl p-6 shadow-sm space-y-6 bg-white`}>
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4 group">
          <Settings className="w-5 h-5 text-cyan-600 transition-transform duration-200 group-hover:rotate-45" />
          <h3 className={designSystem.typography.sectionHeading}>Account Settings</h3>
        </div>

        <form onSubmit={handleAccountSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className={designSystem.typography.label}>
              Full Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
              className={designSystem.components.input}
            />
          </div>

          <div className="space-y-1">
            <label className={designSystem.typography.label}>
              Email Address
            </label>
            <input
              type="email"
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              required
              className={designSystem.components.input}
            />
          </div>

          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div>
              <h4 className={designSystem.typography.cardHeading}>
                Change Password (Optional)
              </h4>
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <label className={designSystem.typography.label}>
                  New Password
                </label>
                <input
                  type="password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  placeholder="••••••••"
                  className={designSystem.components.input}
                />
              </div>
              <div className="space-y-1">
                <label className={designSystem.typography.label}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={accountConfirmPassword}
                  onChange={(e) => setAccountConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={designSystem.components.input}
                />
              </div>
            </div>
          </div>

          {/* Account Actions Log */}
          <AnimatePresence>
            {accountSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`${designSystem.colors.status.completed} border text-xs font-bold p-4 rounded-xl overflow-hidden`}
              >
                {accountSuccess}
              </motion.div>
            )}
            {accountError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`${designSystem.colors.status.flagged} border text-xs font-bold p-4 rounded-xl overflow-hidden`}
              >
                {accountError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={savingAccount}
              className={designSystem.components.buttonPrimary}
            >
              {savingAccount ? (
                <>
                  <Loader2 size={14} className="animate-spin text-white" />
                  Saving...
                </>
              ) : (
                "Save Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AccountSection;
