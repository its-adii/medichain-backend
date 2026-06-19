import { useState, useEffect } from "react";

export default function Avatar({ src, name = "User", className = "w-10 h-10", alt = "Avatar" }) {
  const [error, setError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  // Generate initials
  const getInitials = (fullName) => {
    if (!fullName) return "U";
    // Strip "Dr." prefix if present
    const cleanName = fullName.replace(/^(dr\.|dr)\s+/i, "").trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  };

  // Generate a consistent background color based on name
  const getBgColor = (fullName) => {
    if (!fullName) return "bg-cyan-600 text-white";
    const colors = [
      "bg-cyan-600 text-white",
      "bg-blue-600 text-white",
      "bg-indigo-600 text-white",
      "bg-purple-600 text-white",
      "bg-teal-600 text-white",
      "bg-emerald-600 text-white",
      "bg-sky-600 text-white",
    ];
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const roundedClass = className.includes("rounded-") ? "" : "rounded-full";

  // If there's a valid src and no loading error, render the image
  if (src && !error) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${className} ${roundedClass} object-cover`}
        loading="lazy"
        onError={() => setError(true)}
      />
    );
  }

  // Fallback state: letter avatar
  const initials = getInitials(name);
  const colorClass = getBgColor(name);

  return (
    <div
      className={`${className} ${roundedClass} flex items-center justify-center font-semibold tracking-wider select-none ${colorClass}`}
      title={name}
    >
      {initials}
    </div>
  );
}
