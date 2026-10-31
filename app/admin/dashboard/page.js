"use client";
import { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  DollarSign,
  FileText,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { useSelector } from "react-redux";
import { apiPrivate } from "@/lib/apiPrivate";

export default function AdminDashboard() {
  const user = useSelector((state) => state.user);
  const { username = "Admin" } = user?.user || {};

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [financeStats, setFinanceStats] = useState(null);
  const [recentActivityData, setRecentActivityData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      isRefresh ? setIsRefreshing(true) : setIsLoading(true);

      const [statsResponse, activityResponse] = await Promise.all([
        apiPrivate.get("admin-finanas-states/"),
        apiPrivate.get("admin/activity/"),
      ]);

      setFinanceStats(statsResponse.data);

      const activityData = activityResponse.data;
      if (Array.isArray(activityData)) {
        setRecentActivityData(activityData);
      } else if (activityData && Array.isArray(activityData.results)) {
        setRecentActivityData(activityData.results);
      } else {
        setRecentActivityData([]);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      setRecentActivityData([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return "0";
    return new Intl.NumberFormat("en-US").format(value);
  };

  const formatChange = (changePct) => {
    if (changePct === null || changePct === undefined) return null;
    const sign = changePct >= 0 ? "+" : "";
    return `${sign}${changePct.toFixed(1)}%`;
  };

  const getActivityIcon = (description) => {
    if (!description) return { icon: FileText, color: "bg-gray-400" };
    const lower = description.toLowerCase();
    if (lower.includes("registered")) return { icon: Users, color: "bg-blue-500" };
    if (lower.includes("project posted") || lower.includes("project created"))
      return { icon: FileText, color: "bg-emerald-500" };
    if (lower.includes("payment")) return { icon: DollarSign, color: "bg-violet-500" };
    if (lower.includes("dispute")) return { icon: CheckCircle, color: "bg-red-500" };
    if (lower.includes("completed")) return { icon: CheckCircle, color: "bg-emerald-500" };
    return { icon: FileText, color: "bg-gray-400" };
  };

  const recentActivity = recentActivityData.map((activity) => {
    const { icon, color } = getActivityIcon(activity.description);
    return {
      icon,
      color,
      text: activity.description,
      time: activity.time_ago,
    };
  });

  const platformStats = financeStats
    ? [
        {
          label: "Total Users",
          value: formatNumber(financeStats.total_users?.value),
          change: formatChange(financeStats.total_users?.change_pct),
          changeType: (financeStats.total_users?.change_pct ?? 0) >= 0 ? "up" : "down",
          icon: Users,
          bg: "bg-blue-50",
          iconColor: "bg-blue-500",
          textColor: "text-blue-600",
        },
        {
          label: "Active Projects",
          value: formatNumber(financeStats.active_projects),
          change: null,
          changeType: "up",
          icon: FileText,
          bg: "bg-emerald-50",
          iconColor: "bg-emerald-500",
          textColor: "text-emerald-600",
        },
        {
          label: "Total Revenue",
          value: formatCurrency(financeStats.total_revenue?.value),
          change: formatChange(financeStats.total_revenue?.change_pct),
          changeType: (financeStats.total_revenue?.change_pct ?? 0) >= 0 ? "up" : "down",
          icon: DollarSign,
          bg: "bg-violet-50",
          iconColor: "bg-violet-500",
          textColor: "text-violet-600",
        },
        {
          label: "Platform Fee",
          value: formatCurrency(financeStats.platform_fee?.value),
          change: formatChange(financeStats.platform_fee?.change_pct),
          changeType: (financeStats.platform_fee?.change_pct ?? 0) >= 0 ? "up" : "down",
          icon: TrendingUp,
          bg: "bg-orange-50",
          iconColor: "bg-orange-500",
          textColor: "text-orange-600",
        },
      ]
    : [];

  const quickStats = financeStats
    ? [
        { label: "Total Users", value: formatNumber(financeStats.total_users?.value) },
        { label: "Active Projects", value: formatNumber(financeStats.active_projects) },
        { label: "Revenue (MTD)", value: formatCurrency(financeStats.total_revenue?.value) },
        { label: "Platform Fee (MTD)", value: formatCurrency(financeStats.platform_fee?.value) },
      ]
    : [];

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-red-100 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-gray-800 font-semibold mb-1">Something went wrong</p>
          <p className="text-gray-500 text-sm mb-5">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Welcome back, <span className="font-medium text-gray-700">{username}</span>. Here&apos;s your platform overview.
          </p>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {platformStats.map((stat, i) => (
          <div
            key={i}
            className={`${stat.bg} rounded-2xl p-4 lg:p-5 border border-white/60 hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate pr-2">
                {stat.label}
              </span>
              <div className={`w-8 h-8 ${stat.iconColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 truncate">
              {stat.value}
            </p>
            {stat.change ? (
              <div className="flex items-center gap-1 text-xs">
                {stat.changeType === "up" ? (
                  <ArrowUp className="w-3 h-3 text-emerald-600" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-red-500" />
                )}
                <span className={stat.changeType === "up" ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                  {stat.change}
                </span>
                <span className="text-gray-400">vs last month</span>
              </div>
            ) : (
              <div className="h-4"> {/* spacer to keep card height consistent */}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Activity */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 lg:p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-400 mt-0.5">Latest events across the platform</p>
          </div>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 ${activity.color} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <activity.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-relaxed">{activity.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">No recent activity to show</p>
            </div>
          )}
        </div>

        {/* Quick Stats Sidebar */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-gray-100 p-5 lg:p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-900">Quick Stats</h3>
            <p className="text-sm text-gray-400 mt-0.5">Month-to-date summary</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickStats.map((stat, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors"
              >
                <span className="text-xs text-gray-400 block mb-1.5 leading-tight">{stat.label}</span>
                <span className="text-base font-bold text-gray-900 block truncate">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
