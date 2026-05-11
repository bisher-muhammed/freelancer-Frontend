"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Briefcase, BarChart3, Settings,
  CreditCard, AlertTriangle, MessageSquare, X, Shield, Lock,
  Layers, Receipt, CalendarClock, SlidersHorizontal,
  ChevronLeft, ChevronRight, ChevronDown,
} from "lucide-react";

// ─── Nav config ─────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard",     href: "/admin/dashboard" },
      { icon: BarChart3,       label: "Activity Logs", href: "/admin/activity"  },
    ],
  },
  {
    label: "Management",
    items: [
      { icon: Users,     label: "Users",    href: "/admin/users"    },
      { icon: Briefcase, label: "Projects", href: "/admin/projects" },
    ],
  },
  {
    label: "Finance",
    items: [
      { icon: CreditCard, label: "Ledger",       href: "/admin/ledger-entry" },
      { icon: Receipt,    label: "Invoices",      href: "/admin/invoices"     },
      { icon: Layers,     label: "Billing",       href: "/admin/billing"      },
      { icon: Lock,       label: "Subscriptions", href: "/admin/subscription" },
    ],
  },
  {
    label: "Operations",
    items: [
      { icon: AlertTriangle, label: "Disputes", href: "/admin/termination-requests" },
      { icon: CalendarClock, label: "Meetings", href: "/admin/meetings"             },
      { icon: MessageSquare, label: "Messages", href: "/admin/messages"             },
    ],
  },
  {
    label: "Configuration",
    items: [
      { icon: SlidersHorizontal, label: "Score Settings", href: "/admin/proposal-score" },
      { icon: Settings,          label: "Settings",        href: "/admin/settings"       },
      { icon: Shield,            label: "Tracking Privacy",     href: "/admin/tracking-privacy"          },
    ],
  },
];

// ─── SSR-safe mobile detection ───────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

// ─── NavItem ─────────────────────────────────────────────────────────────────
function NavItem({ item, isActive, collapsed, onClick }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
        text-sm font-medium transition-all duration-150 outline-none
        focus-visible:ring-2 focus-visible:ring-blue-500
        ${isActive ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
        ${collapsed ? "justify-center" : ""}
      `}
    >
      {/* Active left-bar pill */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-blue-600" />
      )}

      <Icon
        className={`shrink-0 h-[18px] w-[18px] transition-colors
          ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}
      />

      {!collapsed && <span className="truncate">{item.label}</span>}

      {item.badge != null && !collapsed && (
        <span className="ml-auto shrink-0 bg-red-100 text-red-700 text-[11px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
          {item.badge}
        </span>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <span className="
          pointer-events-none absolute left-full ml-3 z-50
          whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5
          text-xs text-white shadow-lg
          opacity-0 group-hover:opacity-100 transition-opacity duration-150
        ">
          {item.label}
          {item.badge != null && (
            <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
          {/* Tooltip arrow */}
          <span className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </span>
      )}
    </Link>
  );
}

// ─── NavGroup ─────────────────────────────────────────────────────────────────
function NavGroup({ group, pathname, collapsed, onNavClick }) {
  const [open, setOpen] = useState(true);
  const hasActive = group.items.some((i) => i.href === pathname);

  // Always keep the active group expanded
  useEffect(() => { if (hasActive) setOpen(true); }, [hasActive]);

  return (
    <div>
      {!collapsed ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-1.5 mb-0.5
            text-[11px] font-semibold tracking-wider uppercase
            text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span>{group.label}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
        </button>
      ) : (
        <hr className="border-gray-100 mx-2 my-2" />
      )}

      <div className={`space-y-0.5 overflow-hidden transition-all duration-200
        ${!collapsed && !open ? "max-h-0" : "max-h-[500px]"}`}
      >
        {group.items.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            collapsed={collapsed}
            onClick={onNavClick}
          />
        ))}
      </div>
    </div>
  );
}

// ─── AdminSidebar (main export) ───────────────────────────────────────────────
export default function AdminSidebar({
  onClose,
  adminName = "Administrator",
  adminRole = "Super Admin",
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);

  const isCollapsed = !isMobile && collapsed; // never collapse on mobile

  return (
    <aside
      className={`relative flex flex-col h-full bg-white border-r border-gray-200
        transition-[width] duration-300 ease-in-out overflow-hidden
        ${isCollapsed ? "w-[68px]" : "w-64"}`}
    >
      {/* Mobile close */}
      <div className="lg:hidden p-3 border-b border-gray-100 flex justify-end shrink-0">
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Close sidebar">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Admin profile */}
      <div className={`shrink-0 border-b border-gray-100 transition-all duration-300
        ${isCollapsed ? "p-3 flex justify-center" : "p-4"}`}
      >
        {isCollapsed ? (
          <div title={`${adminName} — ${adminRole}`}
            className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
            <Shield className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">{adminName}</p>
              <p className="text-xs text-gray-500 truncate">{adminRole}</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4">
        {NAV_GROUPS.map((group) => (
          <NavGroup
            key={group.label}
            group={group}
            pathname={pathname}
            collapsed={isCollapsed}
            onNavClick={() => { if (isMobile) onClose?.(); }}
          />
        ))}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="hidden lg:flex shrink-0 border-t border-gray-100 p-3 justify-end">
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={isCollapsed ? "Expand" : "Collapse"}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg
            text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors font-medium"
        >
          {isCollapsed
            ? <ChevronRight className="h-4 w-4" />
            : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  );
}
