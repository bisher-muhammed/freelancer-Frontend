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
  Menu,
} from "lucide-react";
import { useSelector } from "react-redux";
import { apiPrivate } from "@/lib/apiPrivate";

export default function AdminDashboard() {
  const user = useSelector((state) => state.user);
  const { username = "Admin" } = user?.user || {};
  const primaryColor = "#227C70";

  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [financeStats, setFinanceStats] = useState(null);
  const [recentActivityData, setRecentActivityData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check mobile screen
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Fetch data from backend
    fetchDashboardData();
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch both stats and activity in parallel
      const [statsResponse, activityResponse] = await Promise.all([
        apiPrivate.get('admin-finanas-states/'),
        apiPrivate.get('admin/activity/')
      ]);
      
      setFinanceStats(statsResponse.data);
      
      // Ensure activity data is always an array
      const activityData = activityResponse.data;
      if (Array.isArray(activityData)) {
        setRecentActivityData(activityData);
      } else if (activityData && Array.isArray(activityData.results)) {
        // Handle paginated response
        setRecentActivityData(activityData.results);
      } else {
        console.warn('Activity data is not an array:', activityData);
        setRecentActivityData([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setRecentActivityData([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format number with commas
  const formatNumber = (value) => {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Format percentage change
  const formatChange = (changePct) => {
    if (changePct === null || changePct === undefined) return 'N/A';
    const sign = changePct >= 0 ? '+' : '';
    return `${sign}${changePct.toFixed(1)}%`;
  };

  // Map activity actions to icons and colors
  const getActivityIcon = (description) => {
    if (!description) return { icon: FileText, color: 'bg-gray-500' };
    
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('registered')) {
      return { icon: Users, color: 'bg-blue-500' };
    }
    if (lowerDesc.includes('project posted') || lowerDesc.includes('project created')) {
      return { icon: FileText, color: 'bg-green-500' };
    }
    if (lowerDesc.includes('payment')) {
      return { icon: DollarSign, color: 'bg-purple-500' };
    }
    if (lowerDesc.includes('dispute')) {
      return { icon: CheckCircle, color: 'bg-red-500' };
    }
    if (lowerDesc.includes('completed')) {
      return { icon: CheckCircle, color: 'bg-green-500' };
    }
    
    // Default
    return { icon: FileText, color: 'bg-gray-500' };
  };

  // Format recent activity data from backend
  const recentActivity = recentActivityData.map((activity) => {
    const { icon, color } = getActivityIcon(activity.description);
    return {
      type: activity.action,
      icon,
      color,
      text: activity.description,
      time: activity.time_ago,
    };
  });

  // Platform statistics - now using real data
  const platformStats = financeStats ? [
    {
      label: "Total Users",
      value: formatNumber(financeStats.total_users.value),
      change: formatChange(financeStats.total_users.change_pct),
      changeType: financeStats.total_users.change_pct >= 0 ? "up" : "down",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Active Projects",
      value: formatNumber(financeStats.active_projects),
      change: "N/A", // Backend doesn't provide change for this yet
      changeType: "up",
      icon: FileText,
      color: "bg-green-500",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(financeStats.total_revenue.value),
      change: formatChange(financeStats.total_revenue.change_pct),
      changeType: financeStats.total_revenue.change_pct >= 0 ? "up" : "down",
      icon: DollarSign,
      color: "bg-purple-500",
    },
    {
      label: "Platform Fee",
      value: formatCurrency(financeStats.platform_fee.value),
      change: formatChange(financeStats.platform_fee.change_pct),
      changeType: financeStats.platform_fee.change_pct >= 0 ? "up" : "down",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ] : [];

  // Top performers
  const topFreelancers = [
    { name: "Sarah Johnson", rating: 4.9, jobs: 156, earnings: "$142,500" },
    { name: "Michael Chen", rating: 5.0, jobs: 112, earnings: "$128,300" },
    { name: "Emily Rodriguez", rating: 4.8, jobs: 287, earnings: "$98,750" },
  ];

  const topClients = [
    { name: "Tech Startup Inc.", projects: 23, spending: "$245,000" },
    { name: "Innovation Labs", projects: 18, spending: "$198,500" },
    { name: "Digital Marketing Pro", projects: 34, spending: "$156,800" },
  ];

  // Quick stats - using real data where available
  const quickStats = financeStats ? [
    { label: "Total Users", value: formatNumber(financeStats.total_users.value) },
    { label: "Active Projects", value: formatNumber(financeStats.active_projects) },
    { label: "Revenue (MTD)", value: formatCurrency(financeStats.total_revenue.value) },
    { label: "Platform Fee (MTD)", value: formatCurrency(financeStats.platform_fee.value) },
  ] : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Welcome Header */}
      <div className="mb-4 lg:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              Welcome back, {username}! Here's what's happening on your platform.
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Platform Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-6">
        {platformStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-3 lg:p-6 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-2 lg:mb-3">
              <span className="text-xs lg:text-sm text-gray-600 truncate pr-2">
                {stat.label}
              </span>
              <div className={`p-1.5 lg:p-2 rounded-lg ${stat.color} flex-shrink-0`}>
                <stat.icon className="h-3 w-3 lg:h-5 lg:w-5 text-white" />
              </div>
            </div>
            <p className="text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 lg:mb-2 truncate">
              {stat.value}
            </p>
            <div className="flex items-center text-xs lg:text-sm">
              {stat.changeType === "up" ? (
                <ArrowUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 lg:h-4 lg:w-4 text-red-600 mr-1" />
              )}
              <span className={`${stat.changeType === "up" ? "text-green-600" : "text-red-600"} truncate`}>
                {stat.change} vs last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-4 lg:space-y-6">
          {/* Recent Activity Section */}
          <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                  Recent Activity
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Latest platform events and updates
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={`p-2 rounded-lg ${activity.color} flex-shrink-0 mt-0.5`}
                    >
                      <activity.icon className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-relaxed break-words">
                        {activity.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Top Freelancers */}
            <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Top Freelancers
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Highest earning freelancers this month
              </p>

              <div className="space-y-3 lg:space-y-4">
                {topFreelancers.map((freelancer, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium text-gray-900 flex-shrink-0">
                          {index + 1}.
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate min-w-0">
                          {freelancer.name}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">
                            {freelancer.rating}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 ml-5">
                        {freelancer.jobs} jobs completed
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-600 ml-2 flex-shrink-0 whitespace-nowrap">
                      {freelancer.earnings}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Clients */}
            <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Top Clients
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Highest spending clients this month
              </p>

              <div className="space-y-3 lg:space-y-4">
                {topClients.map((client, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 shrink-0">
                          {index + 1}.
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {client.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 ml-5">
                        {client.projects} projects posted
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-purple-600 ml-2 flex-shrink-0 whitespace-nowrap">
                      {client.spending}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-4 lg:space-y-6">
          {/* Quick Stats */}
          <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Quick Stats
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-3 border border-gray-100 rounded-lg"
                >
                  <span className="text-xs text-gray-600 block mb-1 truncate">
                    {stat.label}
                  </span>
                  <span className="text-base lg:text-lg font-bold text-gray-900 block truncate">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                View Users
              </button>
              <button className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                Check Reports
              </button>
              <button className="p-3 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors">
                Manage Projects
              </button>
              <button className="p-3 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}