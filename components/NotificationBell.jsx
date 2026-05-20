"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bell, BellRing, CheckCheck, Wifi, WifiOff, X,
  Clock, ShieldCheck, FileText, Trophy, TriangleAlert,
  Banknote, Briefcase, UserCheck, MessageSquare, ChevronRight,
} from "lucide-react";
import { useNotificationContext } from "@/lib/providers/NotificationsProvider";

// ─── Icon + color map ────────────────────────────────────────────────────────
const NOTIF_STYLE = {
  PROJECT_CREATED:    { Icon: Briefcase,     bg: "bg-blue-50",    ring: "ring-blue-100",   text: "text-blue-600"    },
  PROPOSAL_SUBMITTED: { Icon: FileText,      bg: "bg-violet-50",  ring: "ring-violet-100", text: "text-violet-600"  },
  OFFER_SENT:         { Icon: MessageSquare, bg: "bg-violet-50",  ring: "ring-violet-100", text: "text-violet-600"  },
  OFFER_ACCEPTED:     { Icon: UserCheck,     bg: "bg-teal-50",    ring: "ring-teal-100",   text: "text-teal-600"    },
  CONTRACT_CREATED:   { Icon: FileText,      bg: "bg-blue-50",    ring: "ring-blue-100",   text: "text-blue-600"    },
  CONTRACT_COMPLETED: { Icon: Trophy,        bg: "bg-amber-50",   ring: "ring-amber-100",  text: "text-amber-600"   },
  ESCROW_FUNDED:      { Icon: ShieldCheck,   bg: "bg-emerald-50", ring: "ring-emerald-100",text: "text-emerald-600" },
  ESCROW_RELEASED:    { Icon: Banknote,      bg: "bg-emerald-50", ring: "ring-emerald-100",text: "text-emerald-600" },
  ESCROW_REFUNDED:    { Icon: Banknote,      bg: "bg-orange-50",  ring: "ring-orange-100", text: "text-orange-500"  },
  PAYMENT_COMPLETED:  { Icon: Banknote,      bg: "bg-emerald-50", ring: "ring-emerald-100",text: "text-emerald-600" },
  DISPUTE_OPENED:     { Icon: TriangleAlert, bg: "bg-red-50",     ring: "ring-red-100",    text: "text-red-600"     },
  PROFILE_UPDATED:    { Icon: UserCheck,     bg: "bg-slate-50",   ring: "ring-slate-100",  text: "text-slate-600"   },
  SYSTEM:             { Icon: Bell,          bg: "bg-slate-50",   ring: "ring-slate-100",  text: "text-slate-500"   },
};

const DEFAULT_STYLE = { Icon: Bell, bg: "bg-slate-50", ring: "ring-slate-100", text: "text-slate-500" };

// Map notif_type → tab category
const TYPE_TAB = {
  ESCROW_FUNDED: "payments", ESCROW_RELEASED: "payments",
  ESCROW_REFUNDED: "payments", PAYMENT_COMPLETED: "payments",
  PROPOSAL_SUBMITTED: "proposals", OFFER_SENT: "proposals", OFFER_ACCEPTED: "proposals",
};

const TABS = [
  { id: "all",       label: "All"       },
  { id: "proposals", label: "Proposals" },
  { id: "payments",  label: "Payments"  },
  { id: "unread",    label: "Unread"    },
];

function formatTime(ts) {
  if (!ts) return "";
  const d    = new Date(ts);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Single notification row ─────────────────────────────────────────────────
function NotifRow({ n, onRead }) {
  const { Icon, bg, ring, text } = NOTIF_STYLE[n.notif_type] ?? DEFAULT_STYLE;

  return (
    <div
      onClick={() => !n.is_read && onRead(n.id)}
      className={`
        group flex items-start gap-3 px-4 py-3.5
        border-b border-slate-100 last:border-0
        cursor-pointer transition-colors duration-150
        ${n.is_read ? "hover:bg-slate-50/70" : "bg-blue-50/30 hover:bg-blue-50/60"}
      `}
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl ${bg} ring-1 ${ring} flex-shrink-0 flex items-center justify-center mt-0.5`}>
        <Icon className={`h-[17px] w-[17px] ${text}`} strokeWidth={1.75} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] leading-snug mb-0.5 ${n.is_read ? "text-slate-600 font-medium" : "text-slate-900 font-semibold"}`}>
          {n.title}
        </p>
        {n.message && (
          <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 mb-1">
            {n.message}
          </p>
        )}
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="h-3 w-3" strokeWidth={1.5} />
          {formatTime(n.created_at)}
        </span>
      </div>

      {/* Unread indicator */}
      {!n.is_read
        ? <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
        : <ChevronRight className="h-3.5 w-3.5 text-slate-300 flex-shrink-0 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      }
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function NotificationBell() {
  const { notifications, isConnected, markAsRead, markAllAsRead } =
    useNotificationContext();

  const [open,      setOpen]      = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const panelRef  = useRef(null);
  const buttonRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Filter
  const visible = notifications.filter((n) => {
    if (activeTab === "all")    return true;
    if (activeTab === "unread") return !n.is_read;
    return (TYPE_TAB[n.notif_type] ?? "other") === activeTab;
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (
        panelRef.current  && !panelRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  const handleRead = useCallback((id) => markAsRead(id), [markAsRead]);

  return (
    <div className="relative">

      {/* ── Bell button ───────────────────────────────────────────────── */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        className={`
          relative p-2 rounded-xl transition-all duration-200
          ${open
            ? "bg-slate-100 text-slate-900"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }
        `}
      >
        {unreadCount > 0
          ? <BellRing className="h-5 w-5 animate-[wiggle_0.6s_ease-in-out]" />
          : <Bell className="h-5 w-5" />
        }

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* WS dot */}
        <span className={`absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full ring-[1.5px] ring-white ${isConnected ? "bg-emerald-400" : "bg-slate-300"}`} />
      </button>

      {/* ── Panel ─────────────────────────────────────────────────────── */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 mt-2 w-[380px] bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-semibold rounded-full ring-1 ring-blue-100">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* WS status */}
                <span className={`flex items-center gap-1 text-[11px] font-medium ${isConnected ? "text-emerald-600" : "text-slate-400"}`}>
                  {isConnected
                    ? <><Wifi className="h-3 w-3" strokeWidth={1.75} /> Live</>
                    : <><WifiOff className="h-3 w-3" strokeWidth={1.75} /> Offline</>
                  }
                </span>

                {/* Mark all read */}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />
                    Mark all read
                  </button>
                )}

                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close notifications"
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1" role="tablist">
              {TABS.map((tab) => {
                const tabUnread = tab.id === "unread" ? unreadCount : 0;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all
                      ${activeTab === tab.id
                        ? "bg-slate-900 text-white"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                      }
                    `}
                  >
                    {tab.label}
                    {tab.id === "unread" && unreadCount > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "unread" ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: "390px" }}>
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                  <Bell className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] font-semibold text-slate-600">
                  {activeTab === "unread" ? "You're all caught up" : "Nothing here yet"}
                </p>
                <p className="text-[12px] text-slate-400 mt-1">
                  {activeTab === "unread" ? "No unread notifications." : "New activity will appear here."}
                </p>
              </div>
            ) : (
              visible.map((n) => (
                <NotifRow key={n.id} n={n} onRead={handleRead} />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 flex justify-center">
              <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-blue-50 transition-colors">
                View all activity
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
