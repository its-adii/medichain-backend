import { motion } from "framer-motion";

function AlertBanner({ message, type = "error" }) {
  if (!message) return null;

  const isError = type === "error";

  const shakeVariants = {
    initial: { opacity: 0, y: -10, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      x: isError ? [0, -10, 10, -10, 10, -5, 5, 0] : 0,
      transition: {
        x: { type: "spring", duration: 0.5 },
        default: { duration: 0.2 },
      },
    },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      variants={shakeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`border p-3.5 rounded-xl text-xs font-bold mb-6 flex items-start gap-2.5 shadow-sm
        ${
          isError
            ? "bg-red-50/80 dark:bg-red-950/20 border-red-200/50 dark:border-red-900/30 text-red-600 dark:text-red-400"
            : "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400"
        }`}
    >
      <span className="material-symbols-outlined text-[18px] shrink-0 select-none">
        {isError ? "error" : "check_circle"}
      </span>
      <span className="leading-relaxed">{message}</span>
    </motion.div>
  );
}

export default AlertBanner;
