import { useState } from "react";
import { GraduationCap, Info, X, Plus, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { designSystem } from "../../styles/designSystem";

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function ProfileSection({
  profileExists,
  specialization,
  setSpecialization,
  experience,
  setExperience,
  fees,
  setFees,
  bio,
  setBio,
  availability,
  setAvailability,
  savingProfile,
  profileSuccess,
  profileError,
  handleProfileSubmit,
  license,
  setLicense,
  issuingBody,
  setIssuingBody,
  school,
  setSchool,
  gradYear,
  setGradYear,
  specialties,
  setSpecialties,
}) {
  const [newDay, setNewDay] = useState("monday");
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("17:00");
  const [newSpecialty, setNewSpecialty] = useState("");

  const addAvailabilitySlot = () => {
    if (newStart >= newEnd) {
      alert("Start time must be before end time.");
      return;
    }
    if (availability.some((slot) => slot.day === newDay)) {
      alert("Availability slot for this day is already added. Remove it first to change times.");
      return;
    }
    setAvailability([...availability, { day: newDay, startTime: newStart, endTime: newEnd }]);
  };

  const removeAvailabilitySlot = (dayToRemove) => {
    setAvailability(availability.filter((slot) => slot.day !== dayToRemove));
  };

  const handleAddSpecialty = (e) => {
    e.preventDefault();
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty("");
    }
  };

  const handleRemoveSpecialty = (spec) => {
    setSpecialties(specialties.filter((s) => s !== spec));
  };

  return (
    <div className="col-span-12 lg:col-span-7 space-y-6">
      <div className={`${designSystem.colors.cardBg} rounded-xl p-6 shadow-sm space-y-6 bg-white`}>
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4 group">
          <GraduationCap className="w-5 h-5 text-cyan-600 transition-transform duration-200 group-hover:scale-110" />
          <h3 className={designSystem.typography.sectionHeading}>Professional Credentials</h3>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {!profileExists && (
            <div className={`${designSystem.colors.status.pending} border p-4 rounded-xl flex items-start gap-2 text-xs font-bold leading-normal group`}>
              <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 transition-transform duration-250 group-hover:scale-110" />
              <div>
                <p className="font-bold">Profile Registration Required</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Please build your profile credentials below so that patients can search, filter,
                  and schedule consultations with you.
                </p>
              </div>
            </div>
          )}

          {/* Primary Profile Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={designSystem.typography.label}>
                Specialization
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Cardiology, Pediatrics"
                required
                className={designSystem.components.input}
              />
            </div>

            <div className="space-y-1">
              <label className={designSystem.typography.label}>
                Experience (Years)
              </label>
              <input
                type="number"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 10"
                required
                min="0"
                className={designSystem.components.input}
              />
            </div>

            <div className="space-y-1">
              <label className={designSystem.typography.label}>
                Consultation Fee (₹)
              </label>
              <input
                type="number"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                placeholder="e.g. 500"
                required
                min="0"
                className={designSystem.components.input}
              />
            </div>
          </div>

          {/* Medical License and Education Details */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <h4 className={designSystem.typography.cardHeading}>
              Licensing & Education
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={designSystem.typography.label}>
                  License Number
                </label>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder="e.g. NY-882910-MC"
                  className={designSystem.components.input}
                />
              </div>

              <div className="space-y-1">
                <label className={designSystem.typography.label}>
                  Issuing Medical Board
                </label>
                <input
                  type="text"
                  value={issuingBody}
                  onChange={(e) => setIssuingBody(e.target.value)}
                  placeholder="e.g. Medical Board of New York"
                  className={designSystem.components.input}
                />
              </div>

              <div className="space-y-1">
                <label className={designSystem.typography.label}>
                  Medical School
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. Harvard Medical School"
                  className={designSystem.components.input}
                />
              </div>

              <div className="space-y-1">
                <label className={designSystem.typography.label}>
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  placeholder="e.g. 2008"
                  min="1950"
                  max={new Date().getFullYear()}
                  className={designSystem.components.input}
                />
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-1">
            <label className={designSystem.typography.label}>
              Public Biography
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share credentials, clinical background, and expertise fields..."
              rows={4}
              className={`${designSystem.components.input} resize-none h-28`}
            />
          </div>

          {/* Specialties Tags Selector */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div>
              <h4 className={designSystem.typography.cardHeading}>
                Specialties & Clinical Skills
              </h4>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Add keyword tags describing your areas of clinical interest.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-slate-50 border border-slate-200 rounded-xl">
              {specialties.length === 0 ? (
                <span className="text-xs text-slate-400 font-semibold italic">No specialty tags added yet.</span>
              ) : (
                specialties.map((spec) => (
                  <span
                    key={spec}
                    className={`${designSystem.components.badge} bg-[#e0f7fc] text-cyan-600 border-cyan-200 font-bold flex items-center gap-1.5`}
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialty(spec)}
                      className="hover:text-rose-600 transition-colors cursor-pointer text-slate-500 font-bold active:scale-[0.85]"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5 block" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="e.g. Echocardiography"
                className={designSystem.components.input}
              />
              <button
                type="button"
                onClick={handleAddSpecialty}
                className={designSystem.components.buttonPrimary}
              >
                <Plus className="w-4 h-4 text-white" />
                Add Tag
              </button>
            </div>
          </div>

          {/* Availability Planner */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div>
              <h4 className={designSystem.typography.cardHeading}>
                Availability Schedule
              </h4>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Configure start and end timings for weekdays you are active.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
              <div>
                <label className={designSystem.typography.label}>
                  Day
                </label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-cyan-500 transition-all outline-none cursor-pointer"
                >
                  {WEEKDAYS.map((d) => (
                    <option key={d} value={d} className="capitalize">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={designSystem.typography.label}>
                  Start
                </label>
                <input
                  type="time"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-cyan-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className={designSystem.typography.label}>
                  End
                </label>
                <input
                  type="time"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-cyan-500 transition-all outline-none"
                />
              </div>
              <button
                type="button"
                onClick={addAvailabilitySlot}
                className={designSystem.components.buttonPrimary + " w-full py-2.5"}
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                Add Slot
              </button>
            </div>

            {availability.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold italic text-center py-2">
                No availability schedule slots configured yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availability.map((slot) => (
                  <div
                    key={slot.day}
                    className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2 border border-slate-200"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 capitalize text-xs block">
                        {slot.day}
                      </span>
                      <span className="text-cyan-600 font-bold text-xs block mt-1">
                        {slot.startTime} — {slot.endTime}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAvailabilitySlot(slot.day)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-200 transition cursor-pointer active:scale-[0.95]"
                      title="Remove Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Notifications */}
          <AnimatePresence>
            {profileSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`${designSystem.colors.status.completed} border text-xs font-bold p-4 rounded-xl overflow-hidden`}
              >
                {profileSuccess}
              </motion.div>
            )}
            {profileError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`${designSystem.colors.status.flagged} border text-xs font-bold p-4 rounded-xl overflow-hidden`}
              >
                {profileError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={savingProfile}
              className={designSystem.components.buttonPrimary}
            >
              {savingProfile ? (
                <>
                  <Loader2 size={14} className="animate-spin text-white" />
                  Saving...
                </>
              ) : (
                "Save Credentials"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileSection;
