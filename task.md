# Redesign Execution Checklist

- `[x]` **1. Backend Enhancements**
  - `[x]` Add `age`, `gender`, `bloodGroup`, and `weight` to user model (`user.model.js`).
  - `[x]` Update `auth.controller.js` registration, login, getMe, and updateMe endpoints to return and accept these fields.

- `[x]` **2. Global Styling & Typo Polish**
  - `[x]` Standardize `designSystem.js` font weights to remove excessive `font-black` on small text labels and badges.
  - `[x]` Fix invalid Tailwind classes (slate-650, cyan-650, border-rose-250, etc.) in frontend components.
  - `[x]` Redesign `NotificationDropdown.jsx` to use standard styling tokens.

- `[x]` **3. Patient Settings & Core Pages**
  - `[x]` Implement "Account Settings" modal in `PatientLayout.jsx` for patients to update demographics.
  - `[x]` Bind patient `Dashboard.jsx` health widgets and specialists to real-time API values.
  - `[x]` Refactor `Doctors.jsx` directory filters (availability -> experience, rating -> fees), real pagination, and API bindings.
  - `[x]` Bind selected doctor credentials dynamically in `BookAppointment.jsx` stepper.

- `[x]` **4. Patient Sub-Portals Integration**
  - `[x]` Rewrite `MedicalRecords.jsx` to load real prescriptions, notes, and lab orders from completed appointments.
  - `[x]` Rewrite `Billings.jsx` to calculate paid/pending balances and list invoices from appointments.
  - `[x]` Rewrite `Insurance.jsx` to fetch claims history and deductible limits dynamically.
  - `[x]` Implement interactive chatbot slide-over panel in `Support.jsx`.

- `[x]` **5. Login.jsx Layout & Spacing**
  - `[x]` Add `flex-col` to right-hand container sections on all 4 views (login, forgot-request, forgot-check, forgot-reset)
  - `[x]` Replace custom margin variables with standard classes (`px-6 md:px-12 py-16`)

- `[x]` **6. Doctor Dashboard Fixes**
  - `[x]` Resolve 404 doctor profile onboarding crash in `DoctorDashboard.jsx`.
  - `[x]` Add verification warning banner for unverified doctors.
  - `[x]` Explace fake demographics algorithm in `AppointmentsSection.jsx` and `ClinicalWorkflowModal.jsx` with real database values.
  - `[x]` Connect header search bar to appointments filtering.
  - `[x]` Make "Capacity Glance" chart, Patient Volume chart, and Activity logs dynamically populated from appointments.

- `[x]` **7. Admin Portal Polish**
  - `[x]` Add real server health checks in `AdminDashboard.jsx` footer via `/api/health`.

- `[/]` **7. Verification**
  - `[/]` Verify frontend and backend compiles with success using `npm run build`.
