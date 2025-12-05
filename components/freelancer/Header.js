"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  Bell,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  DollarSign,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../app/store/slices/userSlice";
import { persistor } from "@/app/store/store";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FreelancerHeader({ onMenuClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications] = useState(1);

  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.user);
  const { username = "Sarah Johnson" } = user?.user || {};

  const primaryColor = "#227C70";

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

  // Get first letter for avatar
  const avatarLetter = username.charAt(0).toUpperCase();

  return (
    <header
      className={`fixed top-0 w-full bg-white backdrop-blur-sm border-b transition-all duration-300 z-50 ${
        scrolled ? "border-gray-200 shadow-sm" : "border-gray-200"
      }`}
    >
      <div className="mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center gap-8">
            {/* Mobile Menu Button for Sidebar */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link
              href="/freelancer/dashboard"
              className="flex items-center cursor-pointer"
            >
              <div className="bg-blue-600 p-2 rounded">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">
                FreelancerHub
              </span>
            </Link>

            {/* Freelancer Badge */}
            <span className="hidden md:inline-flex px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded">
              Freelancer
            </span>
          </div>

          {/* Right Side - Notification and User Profile */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
              >
                {/* Avatar with custom image */}
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                    alt={username}
                    className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                  />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {username}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600 hidden lg:block" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {username}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Freelancer</p>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/freelancer/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile Settings
                    </Link>
                    <Link
                      href="/freelancer/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </Link>
                    <Link
                      href="/freelancer/earnings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <DollarSign className="h-4 w-4" />
                      Earnings
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button for User Menu */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white animate-in slide-in-from-top duration-300">
          <div className="px-4 py-4 space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                alt={username}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {username}
                </p>
                <p className="text-xs text-gray-500">Freelancer</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-2 space-y-1">
              <Link
                href="/freelancer/profile"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                Profile Settings
              </Link>
              <Link
                href="/freelancer/settings"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                Account Settings
              </Link>
              <Link
                href="/freelancer/earnings"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <DollarSign className="h-5 w-5" />
                Earnings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
}
