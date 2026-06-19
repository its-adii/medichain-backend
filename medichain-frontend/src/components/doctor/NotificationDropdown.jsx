import { useEffect, useRef } from "react";
import { BellOff, CalendarCheck, XCircle } from "lucide-react";
import { designSystem } from "../../styles/designSystem";

function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onClearAll,
  onClose,
}) {
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-800"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-cyan-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 hover:text-cyan-700 hover:underline cursor-pointer transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-400 italic text-xs font-semibold">
            <BellOff className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && onMarkAsRead(n.id)}
              className={`p-4 flex gap-3 cursor-pointer transition-colors ${
                n.read ? "bg-white hover:bg-slate-50/50" : "bg-cyan-50/40 hover:bg-cyan-50"
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {n.type === "booked" ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-150">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-150">
                    <XCircle className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-normal ${n.read ? "text-slate-500 font-semibold" : "text-slate-800 font-bold"}`}>
                  {n.message}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block font-semibold">
                  {n.timestamp}
                </span>
              </div>

              {/* Status indicator */}
              {!n.read && (
                <div className="flex-shrink-0 self-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full block"></span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;
