"use client";

import { useState, useEffect } from "react";
import { Shield, Bell, User, Menu, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../app/store/slices/userSlice";
import { persistor } from "@/app/store/store";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminHeader({ onMenuClick }) {
  const [notifications] = useState(5);
  const [scrolled, setScrolled] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.user);
  const { username = "Admin User" } = user?.user || {};

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      dispatch(logout());
      await persistor.purge();
      if (typeof window !== "undefined") {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      }
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className={`fixed top-0 w-full bg-white border-b transition-all duration-300 z-50 ${
      scrolled ? "border-gray-200 shadow-sm" : "border-gray-200"
    }`}>
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Logo, Menu Button, and Badge */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">AdminPanel</span>
          </Link>
          
          <span className="hidden sm:inline-flex px-3 py-1 bg-red-100 text-red-700 text-sm rounded-md font-medium">
            Admin
          </span>
        </div>

        {/* Right: Notifications and User */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* User Profile - Hidden on mobile, visible on sm and up */}
          <div className="hidden sm:flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors group relative">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center overflow-hidden">
              <span className="text-white font-medium text-xs">
                {username.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 hidden md:block">{username}</span>

            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1">
                <Link
                  href="/admin/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Admin Profile
                </Link>
                <Link
                  href="/admin/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  System Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile User Menu Button */}
          <div className="sm:hidden flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center overflow-hidden">
              <span className="text-white font-medium text-xs">
                {username.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}