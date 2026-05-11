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
} from "lucide-react";

export default function FreelancerSidebar({ onClose }) {
  const pathname = usePathname();
  const primaryColor = "#227C70";

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
      description: "Your submitted proposals",
    },

    {
      icon: FileText,
      label: "Invoices",
      href: "/freelancer/invoices",
      description: "Your submitted proposals",
    },
    {
      icon: BookOpen,
      label: "Activity Log",
      href: "/freelancer/freelancer-activity",
      description: "Track your work activity",
    },

    {
      icon: Folder,
      label: "Offers",
      href: "/freelancer/offers-list",
      description: "Offers",
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
      icon: MessageSquare,
      label: "Meetings",
      href: "/freelancer/meetings",
      description: "Client communications",
    },

    {
      icon: MessageSquare,
      label: "Messages",
      href: "/freelancer/chat",
      description: "communications",
    },
    
    {
      icon: Calendar,
      label: "Contracts",
      href: "/freelancer/contract-list",
    
    },

    {
      icon:Workflow,
      label: "work",
      href: "/freelancer/tracking",
      description: "freelancer work flow",
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

  return (
    <aside className="h-full w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
      {/* Logo/Brand Section with close button for mobile */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Freelancer</h2>
            <p className="text-xs text-gray-500">Professional Hub</p>
          </div>
        </div>
        
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 flex-1">
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
            Work
          </h3>
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
                        ? "bg-blue-50 text-blue-600 border-l-4"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    style={isActive ? { 
                      borderLeftColor: primaryColor,
                      backgroundColor: `${primaryColor}10`
                    } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-white shadow-sm' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                        <Icon
                          className={`h-4 w-4 ${
                            isActive ? "text-blue-600" : "text-gray-500"
                          } group-hover:text-blue-600 transition-colors`}
                          style={isActive ? { color: primaryColor } : {}}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{item.label}</span>
                        <span className="text-xs text-gray-500 mt-0.5">{item.description}</span>
                      </div>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Account Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
            Account
          </h3>
          <ul className="space-y-1">
            {accountItems.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={index}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose?.();
                      }
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-blue-50 text-blue-600 border-l-4"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    style={isActive ? { 
                      borderLeftColor: primaryColor,
                      backgroundColor: `${primaryColor}10`
                    } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-white shadow-sm' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                        <Icon
                          className={`h-4 w-4 ${
                            isActive ? "text-blue-600" : "text-gray-500"
                          } group-hover:text-blue-600 transition-colors`}
                          style={isActive ? { color: primaryColor } : {}}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{item.label}</span>
                        <span className="text-xs text-gray-500 mt-0.5">{item.description}</span>
                      </div>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

    </aside>
  );
}