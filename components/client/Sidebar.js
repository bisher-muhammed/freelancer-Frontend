"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, PlusCircle, Folder, Users, MessageSquare,Lock, X,AppWindowIcon } from "lucide-react";

export default function ClientSidebar({ onClose }) {
  const pathname = usePathname();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/client/dashboard",
    },
    {
      icon: PlusCircle,
      label: "Post a Project",
      href: "/client/post-project",
    },
    {
      icon: Folder,
      label: "My Projects",
      href: "/client/my-projects",
    },
    {
    icon:AppWindowIcon,
    label:"applications",
    href:"/client/proposals"
    },

    
    {
      icon: Folder,
      label: "contracts",
      href: "/client/contract",
    },

    {
      icon: Folder,
      label: "offers",
      href: "/client/offers",
    },
    
    {
      icon: Users,
      label: "Browse Freelancers",
      href: "/client/browse-freelancers",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/client/chat",
      badge: 3,
    },

    {
      icon: MessageSquare,
      label: "Meetings",
      href: "/client/meetings",
      badge: 3,
    },
     {
      icon: Lock,
      label: "Plans",
      href: "/client/subscriptions",
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
              <span className="ml-auto bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}