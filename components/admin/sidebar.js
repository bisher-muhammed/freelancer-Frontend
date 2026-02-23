"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  BarChart3, 
  Settings, 
  CreditCard, 
  Flag, 
  MessageSquare,
  X,
  Shield,
  Database,
  Lock,
  AppleIcon,
  ProjectorIcon,
  BlocksIcon,
  PaymentRequestUpdateEvent

  
} from "lucide-react";
import MeetingModal from "../client/SheduleMeeting";

export default function AdminSidebar({ onClose }) {
  const pathname = usePathname();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/admin/dashboard",
    },
    {
      icon:AppleIcon,
      label:"ScoreSetting",
      href:"/admin/proposal-score"
    },
    
    {
      icon: Users,
      label: "User Management",
      href: "/admin/users",
    },
    {
      icon: Briefcase,
      label: "Project Management",
      href: "/admin/projects",
    },
    {
      icon: CreditCard,
      label: "Ledger",
      href: "/admin/ledger-entry",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/admin/analytics",
    },

    {
      icon:  Flag,
      label: "Invoices",
      href: "/admin/invoices",
    },

    {
      icon: Flag,
      label: "Disputes",
      href: "/admin/termination-requests",
      badge: 3,
    },
    
    {
      icon: MessageSquare,
      label: "Activity Logs",
      href: "/admin/activity",
    },
    {
      icon: Lock,
      label: "Subscriptions",
      href: "/admin/subscription",
    },
    

    
    
    {
      icon: Settings,
      label: "Tracking Privacy",
      href: "/admin/tracking-privacy",
    },

    {
      icon:BlocksIcon,
      label: "Blling",
      href: "/admin/billing",
    },

    {
      icon: MeetingModal,
      label: "Meetings",
      href: "/admin/meetings"
    },
  ];

  const isActive = (href) => pathname === href;

  return (
    <aside className="h-full w-64 bg-white border-r border-gray-200 overflow-y-auto">
      {/* Close button for mobile */}
      <div className="lg:hidden p-4 border-b border-gray-200 flex justify-end">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Admin Info Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Administrator</p>
            <p className="text-xs text-gray-500">Super Admin Access</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              // Close sidebar on mobile when a link is clicked
              if (window.innerWidth < 1024) {
                onClose?.();
              }
            }}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.href)
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium text-sm">{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
