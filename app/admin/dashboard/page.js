"use client";
import { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  DollarSign,
  FileText,
  Calendar,
  ArrowUp,
  ArrowDown,
  Menu,
} from "lucide-react";
import { useSelector } from "react-redux";

export default function AdminDashboard() {
  const user = useSelector((state) => state.user);
  const { username = "Admin" } = user?.user || {};
  const primaryColor = "#227C70";

  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    
    // Check mobile screen
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Platform statistics
  const platformStats = [
    {
      label: "Total Users",
      value: "12,458",
      change: "+12.5%",
      changeType: "up",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Active Projects",
      value: "1,247",
      change: "+8.2%",
      changeType: "up",
      icon: FileText,
      color: "bg-green-500",
    },
    {
      label: "Total Revenue",
      value: "$524,890",
      change: "+23.1%",
      changeType: "up",
      icon: DollarSign,
      color: "bg-purple-500",
    },
    {
      label: "Platform Fee",
      value: "$52,489",
      change: "+18.4%",
      changeType: "up",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  // Recent activity data
  const recentActivity = [
    {
      type: "user",
      icon: Users,
      color: "bg-blue-500",
      text: "New freelancer registered: Sarah Johnson",
      time: "5 minutes ago",
    },
    {
      type: "project",
      icon: FileText,
      color: "bg-green-500",
      text: "New project posted: E-commerce Website Development",
      time: "15 minutes ago",
    },
    {
      type: "payment",
      icon: DollarSign,
      color: "bg-purple-500",
      text: "Payment processed: $5,000 from Tech Startup Inc.",
      time: "1 hour ago",
    },
    {
      type: "dispute",
      icon: CheckCircle,
      color: "bg-red-500",
      text: "New dispute opened: Project #1234",
      time: "2 hours ago",
    },
    {
      type: "complete",
      icon: CheckCircle,
      color: "bg-green-500",
      text: "Project completed: Mobile App Design",
      time: "3 hours ago",
    },
  ];

  // Pending actions
  const pendingActions = [
    {
      title: "Withdrawal Request",
      subtitle: "John Doe - $5,000",
      time: "30 min ago",
    },
    {
      title: "Dispute Resolution",
      subtitle: "Website Development",
      time: "1 hour ago",
    },
    {
      title: "Profile Verification",
      subtitle: "Jane Smith",
      time: "2 hours ago",
    },
  ];

  // Platform health metrics
  const platformHealth = [
    { label: "System Uptime", value: "99.9%", status: "excellent" },
    { label: "Average Response Time", value: "124ms", status: "good" },
    { label: "Active Sessions", value: "2,456", status: "good" },
    { label: "Server Load", value: "45%", status: "excellent" },
  ];

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

  // Quick stats
  const quickStats = [
    { label: "Freelancers", value: "8,245" },
    { label: "Clients", value: "4,213" },
    { label: "Success Rate", value: "94.5%" },
    { label: "Avg Project Value", value: "$4,250" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Welcome Header */}
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1 text-sm lg:text-base">
          Welcome back, {username}! Here's what's happening on your platform.
        </p>
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
              {recentActivity.map((activity, index) => (
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
              ))}
            </div>
          </div>

          {/* Platform Health */}
          <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">
              Platform Health
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              System performance metrics
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {platformHealth.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                >
                  <span className="text-xs lg:text-sm text-gray-600 truncate pr-2">
                    {metric.label}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs lg:text-sm font-semibold text-gray-900">
                      {metric.value}
                    </span>
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md font-medium whitespace-nowrap">
                      {metric.status}
                    </span>
                  </div>
                </div>
              ))}
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
          {/* Pending Actions */}
          <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Pending Actions
              </h3>
              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                {pendingActions.length}
              </span>
            </div>

            <div className="space-y-3 lg:space-y-4">
              {pendingActions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3"
                >
                  <div className="p-2 bg-orange-50 rounded-lg flex-shrink-0 mt-0.5">
                    <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {action.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 truncate">
                      {action.subtitle}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {action.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
