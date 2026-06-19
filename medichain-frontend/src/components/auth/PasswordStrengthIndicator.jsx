import { CheckCircle2, Circle } from "lucide-react";

function PasswordStrengthIndicator({ password }) {
  // Requirements checks
  const checks = {
    length: password.length >= 12,
    symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    case: /[a-z]/.test(password) && /[A-Z]/.test(password),
    numbers: /\d/.test(password),
  };

  const satisfiedCount = Object.values(checks).filter(Boolean).length;

  const strengthLabels = ["Weak", "Fair", "Strong", "Enterprise Secure"];
  const strengthColors = [
    "bg-rose-500", // 0-1 satisfied
    "bg-amber-500", // 2 satisfied
    "bg-cyan-500", // 3 satisfied
    "bg-emerald-500", // 4 satisfied
  ];
  const textColors = [
    "text-rose-600 dark:text-rose-400",
    "text-amber-600 dark:text-amber-400",
    "text-cyan-600 dark:text-cyan-400",
    "text-emerald-600 dark:text-emerald-400",
  ];

  const getStrengthIndex = () => {
    if (satisfiedCount <= 1) return 0;
    if (satisfiedCount === 2) return 1;
    if (satisfiedCount === 3) return 2;
    return 3;
  };

  const strengthIndex = getStrengthIndex();
  const activeColor = strengthColors[strengthIndex];
  const activeLabel = strengthLabels[strengthIndex];
  const activeTextColor = textColors[strengthIndex];

  return (
    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 space-y-3 shadow-xs">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500">
          Security Requirements
        </h3>
        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-slate-200/40 dark:bg-slate-800/60 rounded-md ${password ? activeTextColor : 'text-slate-400'}`}>
          {password ? activeLabel : "Empty"}
        </span>
      </div>

      {/* Strength Progress Bar */}
      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-full flex-1 transition-all duration-300 ${
              index <= strengthIndex && password.length > 0
                ? activeColor
                : "bg-slate-200 dark:bg-slate-800"
            }`}
          />
        ))}
      </div>

      {/* Requirements List */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 pt-1">
        <li
          className={`flex items-center gap-2 text-xs font-semibold transition-all duration-200 ${
            checks.length
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-slate-400 dark:text-slate-600"
          }`}
        >
          {checks.length ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
          )}
          <span>12+ characters</span>
        </li>

        <li
          className={`flex items-center gap-2 text-xs font-semibold transition-all duration-200 ${
            checks.symbols
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-slate-400 dark:text-slate-600"
          }`}
        >
          {checks.symbols ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
          )}
          <span>Special symbol</span>
        </li>

        <li
          className={`flex items-center gap-2 text-xs font-semibold transition-all duration-200 ${
            checks.case
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-slate-400 dark:text-slate-600"
          }`}
        >
          {checks.case ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
          )}
          <span>Mixed case (A & a)</span>
        </li>

        <li
          className={`flex items-center gap-2 text-xs font-semibold transition-all duration-200 ${
            checks.numbers
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-slate-400 dark:text-slate-600"
          }`}
        >
          {checks.numbers ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
          )}
          <span>At least one digit</span>
        </li>
      </ul>
    </div>
  );
}

export default PasswordStrengthIndicator;
