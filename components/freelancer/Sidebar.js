"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  FileText,
  Folder,
  DollarSign,
  MessageSquare,
  Bookmark,
  UserCircle,
  Settings,
  Award,
  Calendar,
  Bell,
  X,
  Briefcase,
  FolderCheck,
  Wallet,
  BookOpen,
  Heart,
  Workflow,
  Video,
  Receipt,
  Activity,
  Tag,
  Monitor,
  ChevronRight,
} from "lucide-react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .sb-serif { font-family: 'Playfair Display', Georgia, serif; }
  .sb-mono  { font-family: 'JetBrains Mono', monospace; }

  @keyframes sbSlideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .sb-animate { animation: sbSlideIn 0.32s cubic-bezier(.22,.68,0,1.2) forwards; }

  .nav-link {
    position: relative;
    transition: background 0.18s ease, color 0.18s ease;
  }
  .nav-link::before {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: #227C70;
    opacity: 0;
    transition: opacity 0.18s ease, top 0.18s ease, bottom 0.18s ease;
  }
  .nav-link.active::before { opacity: 1; top: 15%; bottom: 15%; }
  .nav-link:hover:not(.active)::before { opacity: 0.35; }

  .nav-icon-wrap {
    transition: background 0.18s ease, transform 0.18s ease;
  }
  .nav-link:hover .nav-icon-wrap { transform: scale(1.08); }

  .sb-close-btn {
    transition: background 0.15s ease, transform 0.15s ease;
  }
  .sb-close-btn:hover { transform: rotate(90deg); }

  /* Tooltip on hover for description */
  .nav-tooltip {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    left: calc(100% + 10px);
    top: 50%;
    transform: translateY(-50%);
    background: #0d1117;
    color: #e5e7eb;
    font-size: 11px;
    white-space: nowrap;
    padding: 5px 10px;
    border-radius: 7px;
    transition: opacity 0.15s ease;
    z-index: 100;
    font-family: system-ui, sans-serif;
  }
  .nav-tooltip::before {
    content: '';
    position: absolute;
    right: 100%; top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-right-color: #0d1117;
  }
  .nav-link:hover .nav-tooltip { visibility: visible; opacity: 1; }
`;

const PRIMARY = "#227C70";

export default function FreelancerSidebar({ onClose }) {
  const pathname = usePathname();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/freelancer/dashboard",
      description: "Overview of your activity",
    },
    {
      icon: Search,
      label: "Browse Jobs",
      href: "/freelancer/find-jobs",
      description: "Find new opportunities",
    },
    {
      icon: FileText,
      label: "My Proposals",
      href: "/freelancer/proposals",
      description: "Submitted proposals",
    },
    {
      icon: Receipt,
      label: "Invoices",
      href: "/freelancer/invoices",
      description: "Bills & payments",
    },
    {
      icon: Activity,
      label: "Activity Log",
      href: "/freelancer/freelancer-activity",
      description: "Track your work activity",
    },
    {
      icon: Tag,
      label: "Offers",
      href: "/freelancer/offers-list",
      description: "Client offers",
    },
    {
      icon: FolderCheck,
      label: "Completed",
      href: "/freelancer/completed-projects",
      description: "Finished projects",
    },
    {
      icon: Bookmark,
      label: "Saved Projects",
      href: "/freelancer/saved-projects",
      description: "Bookmarked opportunities",
    },
    {
      icon: Wallet,
      label: "Earnings",
      href: "/freelancer/earnings",
      description: "Income & payments",
    },
    {
      icon: Video,
      label: "Meetings",
      href: "/freelancer/meetings",
      description: "Scheduled client calls",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/freelancer/chat",
      description: "Client communications",
    },
    {
      icon: Calendar,
      label: "Contracts",
      href: "/freelancer/contract-list",
      description: "Active & past contracts",
    },
    {
      icon: Monitor,
      label: "Work Tracker",
      href: "/freelancer/tracking",
      description: "Freelancer workflow",
    },
  ];

  const accountItems = [
    {
      icon: UserCircle,
      label: "Profile",
      href: "/freelancer/profile",
      description: "Edit your profile",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/freelancer/settings",
      description: "Account preferences",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/freelancer/notifications",
      description: "Alerts & updates",
    },
  ];

  const handleLinkClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onClose?.();
    }
  };

  const NavItem = ({ item, index }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <li>
        <Link
          href={item.href}
          onClick={handleLinkClick}
          className={`nav-link${isActive ? " active" : ""} relative flex items-center gap-3 px-3 py-2.5 rounded-xl group`}
          style={{
            background: isActive ? `${PRIMARY}12` : "transparent",
            color: isActive ? PRIMARY : "#4b5563",
          }}
          onMouseEnter={(e) => {
            if (!isActive) e.currentTarget.style.background = "#f7f5f0";
          }}
          onMouseLeave={(e) => {
            if (!isActive) e.currentTarget.style.background = "transparent";
          }}
        >
          {/* Icon */}
          <div
            className="nav-icon-wrap flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: isActive ? `${PRIMARY}18` : "#f3f0eb",
            }}
          >
            <Icon
              className="w-4 h-4"
              style={{ color: isActive ? PRIMARY : "#6b7280" }}
            />
          </div>

          {/* Label */}
          <span
            className="text-sm font-medium leading-none flex-1 truncate"
            style={{ color: isActive ? PRIMARY : "#374151" }}
          >
            {item.label}
          </span>

          {/* Active indicator dot */}
          {isActive && (
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: PRIMARY }}
            />
          )}

          {/* Badge */}
          {item.badge && (
            <span className="flex-shrink-0 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
              {item.badge}
            </span>
          )}

          {/* Tooltip */}
          {item.description && (
            <span className="nav-tooltip hidden lg:block">{item.description}</span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <aside
        className="h-full w-64 flex flex-col overflow-hidden"
        style={{ background: "#ffffff", borderRight: "1px solid #ede9e2" }}
      >
        {/* ── Brand Header ─────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-5 flex-shrink-0"
          style={{ background: "#0d1117", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: PRIMARY }}
            >
              <Briefcase className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
            </div>
            <div>
              <p className="sb-serif text-white text-sm font-bold leading-tight">
                FreelancerHub
              </p>
              <p
                className="sb-mono text-xs leading-none mt-0.5"
                style={{ color: `${PRIMARY}cc` }}
              >
                Pro Dashboard
              </p>
            </div>
          </div>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="sb-close-btn lg:hidden w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)", color: "#9ca3af" }}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Nav ────────────────────────────────────────────── */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-4 space-y-6"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Work section */}
          <div>
            <p
              className="sb-mono text-[10px] font-semibold uppercase tracking-[0.14em] mb-2 px-3"
              style={{ color: "#9ca3af" }}
            >
              Work
            </p>
            <ul className="space-y-0.5">
              {menuItems.map((item, i) => (
                <NavItem key={i} item={item} index={i} />
              ))}
            </ul>
          </div>

          {/* Account section */}
          <div>
            <p
              className="sb-mono text-[10px] font-semibold uppercase tracking-[0.14em] mb-2 px-3"
              style={{ color: "#9ca3af" }}
            >
              Account
            </p>
            <ul className="space-y-0.5">
              {accountItems.map((item, i) => (
                <NavItem key={i} item={item} index={i} />
              ))}
            </ul>
          </div>
        </nav>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div
          className="flex-shrink-0 px-4 py-4"
          style={{ borderTop: "1px solid #ede9e2" }}
        >
          <div
            className="rounded-xl px-3 py-3 flex items-center gap-3"
            style={{ background: `${PRIMARY}0d` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${PRIMARY}20` }}
            >
              <Award className="w-4 h-4" style={{ color: PRIMARY }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 leading-tight truncate">
                Top Rated Freelancer
              </p>
              <p className="sb-mono text-[10px] mt-0.5" style={{ color: PRIMARY }}>
                95% Job Success
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
