import { useState } from "react";
import { Mail, Lock, User, Shield, Stethoscope, Search, Calendar, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

const ICON_MAP = {
  mail: Mail,
  lock: Lock,
  person: User,
  shield: Shield,
  stethoscope: Stethoscope,
  search: Search,
  calendar: Calendar,
};

function FloatingLabelInput({
  label,
  icon,
  type = "text",
  value,
  onChange,
  id,
  required = false,
  placeholder = "",
  disabled = false,
  error = "",
  success = false,
  rightElement = null,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  // Float label when focused or input has text
  const isFloating = focused || (value && value.length > 0);

  const LucideIcon = typeof icon === "string" ? ICON_MAP[icon] : icon;

  return (
    <div className="w-full group">
      <div className="relative mt-2">
        {/* Input Field */}
        <input
          id={id}
          type={actualType}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder || " "}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
          className={`w-full px-4 pt-6 pb-2 bg-white dark:bg-slate-900 border rounded-2xl text-sm transition-all duration-200 outline-none
            ${
              icon ? "pl-12" : "pl-4"
            } ${isPassword || rightElement || success ? "pr-12" : "pr-4"}
            ${
              error
                ? "border-rose-300 dark:border-rose-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                : success
                ? "border-emerald-300 dark:border-emerald-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                : focused
                ? "border-cyan-500 dark:border-cyan-400 focus:ring-1 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                : "border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
            }
            placeholder:text-transparent
            disabled:opacity-50 disabled:cursor-not-allowed`}
        />

        {/* Input Icon (Lucide SVG) */}
        {LucideIcon && (
          <div
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none select-none
              ${
                error
                  ? "text-rose-500"
                  : focused
                  ? "text-cyan-500 dark:text-cyan-400"
                  : "text-slate-400 dark:text-slate-600"
              }`}
          >
            <LucideIcon className="w-4.5 h-4.5" />
          </div>
        )}

        {/* Floating Label (Shopify/Google style) */}
        <label
          htmlFor={id}
          className={`absolute transition-all duration-200 pointer-events-none select-none
            ${icon ? "left-12" : "left-4"}
            ${
              isFloating
                ? "top-2 text-[10px] font-bold uppercase tracking-wider " +
                  (error
                    ? "text-rose-500"
                    : focused
                    ? "text-cyan-500 dark:text-cyan-400"
                    : "text-slate-400 dark:text-slate-500")
                : "top-1/2 -translate-y-1/2 text-[13px] md:text-sm text-slate-400 dark:text-slate-500 font-medium"
            }`}
        >
          {label}
        </label>

        {/* Actions / Status Indicators */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {/* Password Toggle */}
          {isPassword && !disabled && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg cursor-pointer outline-none"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          )}

          {/* Success Checkmark */}
          {success && !error && !isPassword && (
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 animate-fade-in" />
          )}

          {/* Other Custom Right Element */}
          {rightElement}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-rose-600 dark:text-rose-400 text-xs font-semibold mt-1.5 ml-1 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default FloatingLabelInput;
