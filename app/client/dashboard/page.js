"use client";

import { useState } from "react";
import {
  Folder,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  User as UserIcon,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { useSelector } from "react-redux";
import Link from "next/link";

export default function ClientDashboard() {
  const user = useSelector((state) => state.user);
  const { username = "John" } = user?.user || {};

  const stats = [
    {
      label: "Active Projects",
      value: "5",
      icon: Folder,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Freelancers Hired",
      value: "12",
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Total Spent",
      value: "$24,500",
      icon: DollarSign,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Completed Projects",
      value: "18",
      icon: CheckCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const recentProjects = [
    {
      id: 1,
      title: "E-commerce Website Development",
      budget: "$5,000",
      applications: 12,
      daysLeft: 5,
      status: "In Progress",
      statusColor: "bg-blue-100 text-blue-700",
      freelancer: "Sarah Johnson",
    },
    {
      id: 2,
      title: "Mobile App UI/UX Design",
      budget: "$3,500",
      applications: 8,
      daysLeft: 12,
      status: "In Progress",
      statusColor: "bg-blue-100 text-blue-700",
      freelancer: "Michael Chen",
    },
    {
      id: 3,
      title: "Content Writing - Blog Posts",
      budget: "$800",
      applications: 15,
      daysLeft: 2,
      status: "Review",
      statusColor: "bg-orange-100 text-orange-700",
      freelancer: "Emily Davis",
    },
    {
      id: 4,
      title: "Logo Design & Branding",
      budget: "$1,200",
      applications: 24,
      daysLeft: 7,
      status: "Open",
      statusColor: "bg-green-100 text-green-700",
      freelancer: null,
    },
  ];

  const recentActivity = [
    {
      user: "Alex Martinez",
      action: 'New application from Alex Martinez on "E-commerce Website"',
      time: "2 hours ago",
    },
    {
      user: "Sarah Johnson",
      action: 'Sarah Johnson completed milestone 2 of "E-commerce Website"',
      time: "5 hours ago",
    },
    {
      user: "Michael Chen",
      action: "New message from Michael Chen",
      time: "1 day ago",
    },
    {
      user: "Emily Davis",
      action: "Emily Davis submitted work for review",
      time: "2 days ago",
    },
  ];

  const quickActions = [
    { icon: PlusCircle, label: "Post a Project", href: "/client/post-project" },
    { icon: Users, label: "Browse Freelancers", href: "/client/browse-freelancers" },
    { icon: TrendingUp, label: "View Analytics", href: "/client/analytics" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Welcome Header */}
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1 text-sm lg:text-base">
          Welcome back, {username}! Here's what's happening with your projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-3 lg:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2 lg:mb-3">
              <span className="text-gray-600 text-xs lg:text-sm font-medium">
                {stat.label}
              </span>
              <div className={`p-1 lg:p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 lg:h-5 lg:w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Recent Projects - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 lg:mb-6">
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                Recent Projects
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Your latest project updates
              </p>
            </div>
            <Link 
              href="/client/post-project"
              className="px-3 lg:px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto text-sm lg:text-base"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post New Project</span>
            </Link>
          </div>

          <div className="space-y-3 lg:space-y-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="border border-gray-200 rounded-lg p-3 lg:p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2 lg:mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base mb-1 lg:mb-2">
                      {project.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 lg:gap-4 text-xs lg:text-sm text-gray-600">
                      <span className="flex items-center">
                        <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        {project.budget}
                      </span>
                      <span className="flex items-center">
                        <UserIcon className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        {project.applications} applications
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        {project.daysLeft} days left
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 lg:px-3 py-1 rounded-full text-xs font-semibold ${project.statusColor} self-start sm:self-auto`}
                  >
                    {project.status}
                  </span>
                </div>

                {project.freelancer && (
                  <div className="flex items-center space-x-2 pt-2 lg:pt-3 border-t border-gray-100">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs lg:text-sm font-semibold">
                      {project.freelancer.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs lg:text-sm text-gray-700">
                      Working with {project.freelancer}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Takes 1 column */}
        <div className="space-y-4 lg:space-y-6">
          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-base lg:text-lg font-bold text-gray-900">
                Recent Activity
              </h3>
              <a href="#" className="text-xs lg:text-sm text-blue-600 hover:text-blue-700">
                View All
              </a>
            </div>

            <div className="space-y-3 lg:space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-2 lg:space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs lg:text-sm font-semibold">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm text-gray-900 leading-tight">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="w-full flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg hover:bg-gray-50 transition-colors text-left border border-transparent hover:border-gray-200"
                >
                  <action.icon className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
                  <span className="text-xs lg:text-sm font-medium text-gray-900">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
