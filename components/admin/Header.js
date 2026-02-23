"use client";

import { useState, useEffect } from "react";
import { Shield, Menu, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../app/store/slices/userSlice";
import { persistor } from "@/app/store/store";
import { useRouter } from "next/navigation";
import Link from "next/link";

import NotificationBell from "@/components/NotificationBell";

export default function AdminHeader({ onMenuClick }) {
  const [scrolled, setScrolled] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((state) => state.user);
  const { username = "Admin User" } = user?.user || {};

  // Scroll shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      dispatch(logout());
      await persistor.purge();

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header
      className={`fixed top-0 w-full bg-white border-b transition-all duration-300 z-50 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link
            href="/admin/dashboard"
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              AdminPanel
            </span>
          </Link>

          {/* Badge */}
          <span className="hidden sm:inline-flex px-3 py-1 bg-red-100 text-red-700 text-sm rounded-md font-medium">
            Admin
          </span>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* ✅ REAL Notifications Bell */}
          <NotificationBell />

          {/* User Dropdown */}
          <div className="hidden sm:flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 group relative">
            {/* Avatar */}
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-xs">
                {username
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>

            <span className="text-sm font-medium text-gray-900 hidden md:block">
              {username}
            </span>

            {/* Dropdown */}
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="py-1">
                <Link
                  href="/admin/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Admin Profile
                </Link>

                <Link
                  href="/admin/settings"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
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

          {/* Mobile Avatar */}
          <div className="sm:hidden flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-xs">
                {username
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
