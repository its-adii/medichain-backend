import { useState } from "react";
import api from "../../api/axios";
import { X, Plus, Trash2, Check, History } from "lucide-react";
import { motion } from "framer-motion";
import { designSystem } from "../../styles/designSystem";

function ClinicalWorkflowModal({ appointment, appointments, onClose, onConsultationSubmit }) {
  const [clinicalNotes, setClinicalNotes] = useState(appointment.clinicalNotes || "");
  const [prescriptions, setPrescriptions] = useState(
    appointment.prescriptions && appointment.prescriptions.length > 0
      ? appointment.prescriptions
      : [{ medicineName: "", dosage: "", duration: "", refillable: false }]
  );
  const [selectedLabs, setSelectedLabs] = useState(
    appointment.labOrders && appointment.labOrders.length > 0
      ? appointment.labOrders.map((l) => l.testName)
      : []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Consistent patient stats calculation based on patient ID
  const age = appointment.patient?.age || "N/A";
  const blood = appointment.patient?.bloodGroup || "N/A";
  const weight = appointment.patient?.weight ? `${appointment.patient.weight}kg` : "N/A";
  const gender = appointment.patient?.gender || "N/A";

  // Filter previous appointments for the same patient
  const patientHistory = appointments
    .filter((a) => a.patient?._id === appointment.patient?._id && a._id !== appointment._id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const addPrescriptionRow = () => {
    setPrescriptions([...prescriptions, { medicineName: "", dosage: "", duration: "", refillable: false }]);
  };

  const removePrescriptionRow = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updated = prescriptions.map((p, i) => {
      if (i === index) {
        return { ...p, [field]: value };
      }
      return p;
    });
    setPrescriptions(updated);
  };

  const toggleLabOrder = (testName) => {
    if (selectedLabs.includes(testName)) {
      setSelectedLabs(selectedLabs.filter((t) => t !== testName));
    } else {
      setSelectedLabs([...selectedLabs, testName]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Filter out blank prescriptions
    const validPrescriptions = prescriptions.filter((p) => p.medicineName.trim() !== "");

    // Construct labOrders format
    const labOrders = selectedLabs.map((testName) => ({
      testName,
      status: "pending",
    }));

    try {
      await api.patch(`/appointments/${appointment._id}/status`, {
        status: "completed",
        clinicalNotes,
        prescriptions: validPrescriptions,
        labOrders,
      });

      onConsultationSubmit();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit consultation details.");
    } finally {
      setSaving(false);
    }
  };

  const LAB_TEST_OPTIONS = [
    "Complete Blood Count (CBC)",
    "Lipid Panel",
    "ECG / EKG",
    "Liver Function Test (LFT)",
    "Thyroid Profile (T3, T4, TSH)",
    "Urinalysis",
    "HbA1c Diabetes Screen",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={designSystem.components.modalOverlay}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white border border-slate-200 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] mx-4"
      >
        {/* Header */}
        <header className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className={designSystem.typography.sectionHeading}>Clinical Workflow Suite</h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Consultation records for {appointment.patient?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 transition cursor-pointer text-slate-500 hover:text-slate-800 active:scale-[0.92]"
            title="Close"
          >
            <X className="w-5 h-5 block" />
          </button>
        </header>

        {/* Modal content body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white">
          {/* Left Side: Forms (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Patient Stats card */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-900">{appointment.patient?.name}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                  {gender} • {age} yrs • Blood: {blood} • Weight: {weight}
                </p>
              </div>
              <div className="text-right">
                <span className={`${designSystem.components.badge} bg-[#e0f7fc] text-cyan-600 border-cyan-200 inline-flex`}>
                  {appointment.time}
                </span>
                <p className="text-[10px] font-semibold text-slate-500 mt-1">
                  Reason: {appointment.reason || "General Consultation"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className={`${designSystem.colors.status.flagged} border p-3 rounded-lg text-xs font-bold`}>
                  {error}
                </div>
              )}

              {/* Notes Editor */}
              <div className="space-y-2">
                <label className={designSystem.typography.label}>
                  Clinical Examination & Notes
                </label>
                <textarea
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Record symptoms, diagnosis findings, and treatment advice..."
                  required
                  rows={4}
                  className={`${designSystem.components.input} resize-none h-28`}
                />
              </div>

              {/* Prescriptions Builder */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className={designSystem.typography.label}>
                    Prescriptions (Rx Medications)
                  </label>
                  <button
                    type="button"
                    onClick={addPrescriptionRow}
                    className="text-cyan-600 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Medication
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500">
                        <th className="px-4 py-2.5 font-semibold">Medicine Name</th>
                        <th className="px-4 py-2.5 font-semibold">Dosage Frequency</th>
                        <th className="px-4 py-2.5 font-semibold">Duration</th>
                        <th className="px-4 py-2.5 font-semibold text-center">Refill</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prescriptions.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2">
                            <input
                              type="text"
                              value={p.medicineName}
                              onChange={(e) => handlePrescriptionChange(idx, "medicineName", e.target.value)}
                              placeholder="e.g. Paracetamol 650mg"
                              required
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 text-slate-900 rounded-lg text-xs font-semibold focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={p.dosage}
                              onChange={(e) => handlePrescriptionChange(idx, "dosage", e.target.value)}
                              placeholder="e.g. 1-0-1 after food"
                              required
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 text-slate-900 rounded-lg text-xs font-semibold focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={p.duration}
                              onChange={(e) => handlePrescriptionChange(idx, "duration", e.target.value)}
                              placeholder="e.g. 5 days"
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 text-slate-900 rounded-lg text-xs font-semibold focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="checkbox"
                              checked={p.refillable}
                              onChange={(e) => handlePrescriptionChange(idx, "refillable", e.target.checked)}
                              className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => removePrescriptionRow(idx)}
                              disabled={prescriptions.length === 1}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 cursor-pointer active:scale-[0.95] transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lab Orders Section */}
              <div className="space-y-3">
                <label className={designSystem.typography.label}>
                  Order Diagnostic Lab Tests
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {LAB_TEST_OPTIONS.map((lab) => {
                    const isChecked = selectedLabs.includes(lab);
                    return (
                      <label
                        key={lab}
                        className="flex items-center gap-3 p-2 rounded border border-transparent hover:border-slate-200 hover:bg-white cursor-pointer transition-all text-xs font-semibold"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleLabOrder(lab)}
                          className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                        />
                        <span className={isChecked ? "font-bold text-cyan-600" : "text-slate-600"}>
                          {lab}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submission buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className={`${designSystem.components.buttonOutline} flex items-center gap-1.5 group`}
                >
                  <X size={14} className="group-hover:scale-110 transition-transform duration-200" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={designSystem.components.buttonPrimary}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Submit Consultation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side: Patient history (4 Cols) */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-6 flex flex-col max-h-full">
            <h4 className={designSystem.typography.label}>
              Visit History ({patientHistory.length})
            </h4>

            {patientHistory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <History className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
                <p className="text-xs text-slate-400 font-semibold italic">First consultation recorded in the system.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {patientHistory.map((appt) => (
                  <div
                    key={appt._id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-cyan-600">
                        {appt.date && !isNaN(new Date(appt.date).getTime())
                          ? new Date(appt.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "TBD"}
                      </span>
                      <span className={`${designSystem.components.badge} ${designSystem.colors.status.completed}`}>
                        {appt.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-600">
                      <strong className="text-slate-800">Reason:</strong> {appt.reason}
                    </p>

                    {appt.clinicalNotes && (
                      <div className="text-xs font-semibold text-slate-600">
                        <strong className="text-slate-800">Notes:</strong>
                        <p className="bg-white p-2 rounded border border-slate-200 text-[11px] mt-1 max-h-20 overflow-y-auto italic">
                          {appt.clinicalNotes}
                        </p>
                      </div>
                    )}

                    {appt.prescriptions && appt.prescriptions.length > 0 && (
                      <div className="text-xs font-semibold text-slate-600">
                        <strong className="text-slate-800">Medications:</strong>
                        <ul className="list-disc list-inside text-[11px] mt-1 pl-1 space-y-0.5">
                          {appt.prescriptions.map((p, pIdx) => (
                            <li key={pIdx}>
                              {p.medicineName} — <span className="text-cyan-600 font-bold">{p.dosage}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ClinicalWorkflowModal;
