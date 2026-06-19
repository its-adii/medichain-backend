import { useState, useEffect } from "react";

export default function Avatar({ src, name = "User", className = "w-10 h-10", alt = "Avatar", role }) {
  const [error, setError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setError(false);
  }, [src]);

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

  // Fallback state: Premium animated SVG avatar based on role
  const normalizedRole = role ? role.toLowerCase() : "";

  // CSS animations to be injected locally
  const animationStyles = `
    @keyframes avatarPulse-${normalizedRole} {
      0%, 100% { filter: drop-shadow(0 0 2px rgba(14, 116, 144, 0.2)); }
      50% { filter: drop-shadow(0 0 8px rgba(14, 116, 144, 0.6)); }
    }
    @keyframes avatarBreathe-${normalizedRole} {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-1.5px) scale(1.02); }
    }
    @keyframes avatarEcg-${normalizedRole} {
      0% { stroke-dashoffset: 80; opacity: 0.4; }
      50% { stroke-dashoffset: 0; opacity: 1; }
      100% { stroke-dashoffset: -80; opacity: 0.4; }
    }
    @keyframes avatarGearRotate-${normalizedRole} {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes avatarFloatCross-${normalizedRole} {
      0%, 100% { transform: translateY(0px) scale(0.9); opacity: 0.6; }
      50% { transform: translateY(-4px) scale(1.1); opacity: 1; }
    }
    @keyframes avatarPulseRing-${normalizedRole} {
      0% { r: 43px; opacity: 0.6; stroke-width: 1px; }
      50% { r: 47px; opacity: 0.2; stroke-width: 1.5px; }
      100% { r: 43px; opacity: 0.6; stroke-width: 1px; }
    }
    @keyframes avatarGradient-${normalizedRole} {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  // Draw role-specific animated SVG
  if (normalizedRole === "doctor") {
    return (
      <div className={`relative ${className} ${roundedClass} select-none overflow-hidden shrink-0 shadow-inner flex items-center justify-center`} style={{
        background: "linear-gradient(135deg, #0891b2, #0284c7, #2563eb)",
        backgroundSize: "200% 200%",
        animation: `avatarGradient-${normalizedRole} 6s ease infinite`
      }}>
        <style>{animationStyles}</style>
        
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Pulsing Outer Aura Ring */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e0f7fc" style={{
            animation: `avatarPulseRing-${normalizedRole} 3s ease-in-out infinite`,
            transformOrigin: "50px 50px"
          }} />

          {/* Floating Medical Crosses */}
          <g style={{ animation: `avatarFloatCross-${normalizedRole} 4s ease-in-out infinite`, transformOrigin: "50px 50px" }}>
            {/* Top Left Cross */}
            <path d="M18 22H22V18H24V22H28V24H24V28H22V24H18V22Z" fill="#a5f3fc" opacity="0.7" />
            {/* Top Right Cross */}
            <path d="M74 25H77V22H79V25H82V27H79V30H77V27H74V25Z" fill="#a5f3fc" opacity="0.5" />
          </g>

          {/* Breathing Silhouette */}
          <g style={{
            animation: `avatarBreathe-${normalizedRole} 3.5s ease-in-out infinite`,
            transformOrigin: "50px 70px"
          }}>
            {/* Shoulders / Doctor Coat */}
            <path d="M22 85 C22 70 30 60 50 60 C70 60 78 70 78 85 Z" fill="#ffffff" />
            {/* Shirt V-Neck */}
            <path d="M42 60 L50 74 L58 60 Z" fill="#0891b2" />
            {/* Neck */}
            <rect x="45" y="47" width="10" height="15" rx="2" fill="#fed7aa" />
            {/* Face */}
            <circle cx="50" cy="38" r="15" fill="#fecdd3" />
            
            {/* Doctor Headband reflector or mirror */}
            <circle cx="50" cy="27" r="4" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            
            {/* Stethoscope around neck */}
            <path d="M38 60 C38 72, 62 72, 62 60" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            <path d="M50 71 L50 78" fill="none" stroke="#475569" strokeWidth="2.5" />
            <circle cx="50" cy="80" r="3.5" fill="#0891b2" stroke="#e2e8f0" strokeWidth="1" />
          </g>
        </svg>
      </div>
    );
  }

  if (normalizedRole === "admin") {
    return (
      <div className={`relative ${className} ${roundedClass} select-none overflow-hidden shrink-0 shadow-inner flex items-center justify-center`} style={{
        background: "linear-gradient(135deg, #6d28d9, #db2777, #ea580c)",
        backgroundSize: "200% 200%",
        animation: `avatarGradient-${normalizedRole} 6s ease infinite`
      }}>
        <style>{animationStyles}</style>
        
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Rotating System Gear in background */}
          <g transform="translate(72, 28)" style={{
            animation: `avatarGearRotate-${normalizedRole} 8s linear infinite`,
            transformOrigin: "center"
          }}>
            <circle cx="0" cy="0" r="8" fill="none" stroke="#fdf2f8" strokeWidth="3.5" strokeDasharray="3 2" opacity="0.6" />
            <circle cx="0" cy="0" r="4" fill="#fdf2f8" opacity="0.6" />
          </g>

          {/* Breathing Silhouette */}
          <g style={{
            animation: `avatarBreathe-${normalizedRole} 4s ease-in-out infinite`,
            transformOrigin: "50px 70px"
          }}>
            {/* Shoulders / Admin Suit */}
            <path d="M22 85 C22 72 32 62 50 62 C68 62 78 72 78 85 Z" fill="#1e1b4b" />
            {/* Tie / Accent */}
            <path d="M48 62 L50 78 L52 62 Z" fill="#db2777" />
            {/* Neck */}
            <rect x="46" y="49" width="8" height="15" fill="#ffedd5" />
            {/* Face */}
            <circle cx="50" cy="38" r="14" fill="#fed7aa" />
            
            {/* Admin Glasses */}
            <path d="M40 36 H47" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <path d="M53 36 H60" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <circle cx="43" cy="38" r="3.5" fill="none" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="57" cy="38" r="3.5" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    );
  }

  // Fallback for Patient / General User role
  return (
    <div className={`relative ${className} ${roundedClass} select-none overflow-hidden shrink-0 shadow-inner flex items-center justify-center`} style={{
      background: "linear-gradient(135deg, #4f46e5, #06b6d4, #10b981)",
      backgroundSize: "200% 200%",
      animation: `avatarGradient-patient 6s ease infinite`
    }}>
      <style>{animationStyles}</style>
      
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Animated ECG Heartbeat Line in background */}
        <path d="M15 50 H35 L40 38 L45 68 L50 44 L54 52 L58 50 H85" fill="none" stroke="#ccfbf1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="80" style={{
          animation: `avatarEcg-patient 4s linear infinite`,
          transformOrigin: "50px 50px"
        }} />

        {/* Breathing Patient Silhouette */}
        <g style={{
          animation: `avatarBreathe-patient 3.8s ease-in-out infinite`,
          transformOrigin: "50px 70px"
        }}>
          {/* Shoulders */}
          <path d="M24 85 C24 72 32 63 50 63 C68 63 76 72 76 85 Z" fill="#e0f2fe" opacity="0.9" />
          {/* Neck */}
          <rect x="46" y="51" width="8" height="13" fill="#ffedd5" />
          {/* Face */}
          <circle cx="50" cy="40" r="13" fill="#fed7aa" />
        </g>
      </svg>
    </div>
  );
}
