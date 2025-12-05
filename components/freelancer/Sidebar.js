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
  Briefcase,
  X,
} from "lucide-react";

export default function FreelancerSidebar({ onClose }) {
  const pathname = usePathname();
  const primaryColor = "#227C70";

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/freelancer/dashboard",
    },
    {
      icon: Search,
      label: "Browse Jobs",
      href: "/freelancer/find-jobs",
    },
    {
      icon: FileText,
      label: "My Proposals",
      href: "/freelancer/proposals",
      badge: 5,
    },
    {
      icon: Folder,
      label: "Active Projects",
      href: "/freelancer/projects",
      badge: 3,
    },
    {
      icon: DollarSign,
      label: "Earnings",
      href: "/freelancer/earnings",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/freelancer/messages",
      badge: 2,
    },
  ];

  return (
    <aside className="h-full w-64 bg-white border-r border-gray-200 overflow-y-auto">
      {/* Logo/Brand Section with close button for mobile */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
        </div>
        
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={index}>
                <Link
                  href={item.href}
                  onClick={() => {
                    // Close sidebar on mobile when a link is clicked
                    if (window.innerWidth < 1024) {
                      onClose?.();
                    }
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? "text-blue-600" : "text-gray-500"
                      } group-hover:text-blue-600 transition-colors`}
                    />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
