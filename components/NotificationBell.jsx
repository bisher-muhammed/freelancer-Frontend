"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bell, BellRing, CheckCheck, Wifi, WifiOff,
  FileText, MessageSquare, CreditCard, CheckCircle,
  Award, AlertCircle, Clock, X,
} from "lucide-react";
import { useNotificationContext } from "@/lib/providers/NotificationsProvider";

// ─── Icon map matching Django `notif_type` values ───────────────────────────
const NOTIF_ICONS = {
  PROJECT_CREATED:    { Icon: FileText,      bg: "bg-blue-100",    text: "text-blue-600"   },
  OFFER_RECEIVED:     { Icon: MessageSquare, bg: "bg-violet-100",  text: "text-violet-600" },
  ESCROW_FUNDED:      { Icon: CreditCard,    bg: "bg-emerald-100", text: "text-emerald-600"},
  ESCROW_RELEASED:    { Icon: CheckCircle,   bg: "bg-teal-100",    text: "text-teal-600"   },
  ESCROW_REFUNDED:    { Icon: CreditCard,    bg: "bg-orange-100",  text: "text-orange-600" },
  CONTRACT_COMPLETED: { Icon: Award,         bg: "bg-indigo-100",  text: "text-indigo-600" },
  DISPUTE_OPENED:     { Icon: AlertCircle,   bg: "bg-red-100",     text: "text-red-600"    },
};

const DEFAULT_ICON = { Icon: Bell, bg: "bg-slate-100", text: "text-slate-600" };

function getNotifStyle(notif_type) {
  return NOTIF_ICONS[notif_type] || DEFAULT_ICON;
}

function formatTime(ts) {
  if (!ts) return "";
  const d    = new Date(ts);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationBell() {
  const { notifications, isConnected, markAsRead, markAllAsRead } =
    useNotificationContext();

  const [open, setOpen] = useState(false);
  const panelRef        = useRef(null);
  const buttonRef       = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── Close panel on outside click ─────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        panelRef.current  && !panelRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── Close on Escape ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleNotifClick = useCallback((n) => {
    if (!n.is_read) markAsRead(n.id);
  }, [markAsRead]);

  return (
    <div className="relative">
      {/* ── Bell Button ─────────────────────────────────────────────────── */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ""}`}
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          open
            ? "bg-slate-100 text-slate-900"
            : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
        }`}
      >
        {unreadCount > 0
          ? <BellRing className="h-5 w-5 animate-[wiggle_0.5s_ease-in-out]" />
          : <Bell className="h-5 w-5" />
        }

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* WS connection dot */}
        <span
          className={`absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full ring-1 ring-white ${
            isConnected ? "bg-emerald-400" : "bg-slate-300"
          }`}
        />
      </button>

      {/* ── Dropdown Panel ──────────────────────────────────────────────── */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-[360px] bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 z-50 overflow-hidden"
          style={{ maxHeight: "480px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* WS status */}
              <span className={`flex items-center gap-1 text-xs font-medium ${isConnected ? "text-emerald-600" : "text-slate-400"}`}>
                {isConnected
                  ? <><Wifi className="h-3 w-3" /> Live</>
                  : <><WifiOff className="h-3 w-3" /> Offline</>
                }
              </span>
              {/* Mark all read */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs font-semibold text-[#227C70] hover:text-[#1a5f55] transition-colors px-2 py-1 rounded-lg hover:bg-[#e8f4f2]"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: "380px" }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                  <Bell className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const { Icon, bg, text } = getNotifStyle(n.notif_type);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    className={`flex items-start gap-3 px-4 py-3.5 border-b border-slate-50 cursor-pointer transition-colors duration-150 ${
                      n.is_read
                        ? "bg-white hover:bg-slate-50"
                        : "bg-blue-50/40 hover:bg-blue-50/70"
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl ${bg} flex-shrink-0 flex items-center justify-center mt-0.5`}>
                      <Icon className={`h-4 w-4 ${text}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${n.is_read ? "text-slate-700 font-medium" : "text-slate-900 font-semibold"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(n.created_at)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.is_read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}