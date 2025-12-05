"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
  Star,
} from "lucide-react";
import Link from "next/link";

export default function FreelancerDashboard() {
  const user = useSelector((state) => state.user);
  const { username = "Sarah" } = user?.user || {};

  const primaryColor = "#227C70";

  // Dashboard statistics
  const stats = [
    {
      label: "Active Projects",
      value: "3",
      icon: Briefcase,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Total Earnings",
      value: "$12,450",
      icon: DollarSign,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Success Rate",
      value: "98%",
      icon: TrendingUp,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Completed Jobs",
      value: "156",
      icon: CheckCircle,
      color: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  // Active projects data
  const activeProjects = [
    {
      title: "E-commerce Website Development",
      client: "John Doe",
      progress: 60,
      status: "In Progress",
      currentTask: "Frontend Development",
      budget: "$5,000",
      daysLeft: "5 days left",
    },
    {
      title: "Mobile App UI/UX Design",
      client: "Tech Startup Inc.",
      progress: 40,
      status: "In Progress",
      currentTask: "Design Mockups",
      budget: "$3,500",
      daysLeft: "12 days left",
    },
    {
      title: "Content Writing - Blog Posts",
      client: "Marketing Agency",
      progress: 90,
      status: "Review",
      currentTask: "Final Review",
      budget: "$800",
      daysLeft: "2 days left",
    },
  ];

  // Recent activity
  const recentActivity = [
    {
      message: 'Your proposal was accepted for "E-commerce Website"',
      time: "1 hour ago",
      type: "success",
    },
    {
      message: 'Milestone deadline approaching for "Mobile App Design"',
      time: "3 hours ago",
      type: "warning",
    },
    {
      message: 'New job matches your skills: "React Developer"',
      time: "5 hours ago",
      type: "info",
    },
    {
      message: "Payment received: $1,000 for completed milestone",
      time: "1 day ago",
      type: "success",
    },
  ];

  // Recommended jobs
  const recommendedJobs = [
    {
      title: "React Developer Needed for SaaS Platform",
      budget: "$4,000 - $6,000",
      type: "Fixed Price",
      posted: "2 hours ago",
      proposals: "8 proposals",
      skills: ["React", "TypeScript", "Node.js"],
    },
    {
      title: "Logo Design for Tech Company",
      budget: "$500 - $1,000",
      type: "Fixed Price",
      posted: "5 hours ago",
      proposals: "15 proposals",
      skills: ["Illustrator", "Branding", "Logo Design"],
    },
    {
      title: "WordPress Website Customization",
      budget: "$50/hr",
      type: "Hourly",
      posted: "1 day ago",
      proposals: "12 proposals",
      skills: ["WordPress", "PHP", "CSS"],
    },
  ];

  // Profile strength data
  const profileStrength = {
    percentage: 85,
    completed: [
      "Profile photo added",
      "Skills listed",
      "Portfolio added",
    ],
    pending: ["Add certifications"],
  };

  // This month stats
  const thisMonth = {
    earnings: "$3,200",
    proposalsSent: 12,
    jobsWon: 4,
    rating: 4.9,
  };

  return (
    <div className="lg:ml-0 pt-16 lg:mr-4 w-full">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600 text-sm lg:text-base">
                Welcome back, {username}! Here's your overview.
              </p>
            </div>
            <Link
              href="/freelancer/find-jobs"
              className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-medium text-sm lg:text-base"
            >
              <span className="text-lg">🔍</span>
              Browse Jobs
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs lg:text-sm mb-1">{stat.label}</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 lg:p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Active Projects Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 lg:mb-6">
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                    Active Projects
                  </h2>
                  <p className="text-gray-600 text-xs lg:text-sm">Your ongoing work</p>
                </div>
                <Link
                  href="/freelancer/projects"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {activeProjects.map((project, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-4 lg:p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3 lg:mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm lg:text-base mb-1">
                          {project.title}
                        </h3>
                        <p className="text-xs lg:text-sm text-gray-600">
                          Client: {project.client}
                        </p>
                      </div>
                      <span className="px-2 lg:px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                        {project.status}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs lg:text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-900">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-black rounded-full h-2 transition-all"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <p className="text-xs lg:text-sm text-gray-600 mb-3">
                      Current: {project.currentTask}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs lg:text-sm">
                      <span className="font-semibold text-gray-900">
                        💵 {project.budget}
                      </span>
                      <span className="text-gray-600 flex items-center gap-1">
                        <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                        {project.daysLeft}
                      </span>
                      <button className="text-gray-700 hover:text-gray-900 font-medium">
                        View Project
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Jobs Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 lg:mb-6">
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                    Recommended Jobs
                  </h2>
                  <p className="text-gray-600 text-xs lg:text-sm">
                    Jobs matching your skills
                  </p>
                </div>
                <Link
                  href="/freelancer/find-jobs"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  See All
                </Link>
              </div>

              <div className="space-y-4">
                {recommendedJobs.map((job, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-4 lg:p-5 hover:shadow-sm transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base mb-2">
                      {job.title}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs lg:text-sm text-gray-600 mb-3">
                      <span className="font-semibold">💵 {job.budget}</span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {job.type}
                      </span>
                      <span>{job.posted}</span>
                      <span>{job.proposals}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 lg:gap-2">
                      {job.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                Recent Activity
              </h3>
              <p className="text-gray-600 text-xs lg:text-sm mb-3 lg:mb-4">Latest updates</p>
              <div className="space-y-3 lg:space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      activity.type === "success"
                        ? "bg-green-50"
                        : activity.type === "warning"
                        ? "bg-orange-50"
                        : "bg-blue-50"
                    }`}
                  >
                    <p className="text-xs lg:text-sm text-gray-900 mb-1">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-600">{activity.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Strength */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
              <div className="flex justify-between items-center mb-3 lg:mb-4">
                <h3 className="text-base lg:text-lg font-bold text-gray-900">
                  Profile Strength
                </h3>
                <Star className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-500" />
              </div>
              <div className="mb-3 lg:mb-4">
                <div className="flex justify-between text-xs lg:text-sm mb-2">
                  <span className="font-semibold">
                    {profileStrength.percentage}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black rounded-full h-2"
                    style={{ width: `${profileStrength.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2 mb-3 lg:mb-4">
                {profileStrength.completed.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs lg:text-sm">
                    <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
                {profileStrength.pending.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs lg:text-sm text-gray-500"
                  >
                    <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Complete Profile
              </button>
            </div>

            {/* This Month Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                This Month
              </h3>
              <div className="space-y-2 lg:space-y-3">
                <div className="flex justify-between items-center text-xs lg:text-sm">
                  <span className="text-gray-600">Earnings</span>
                  <span className="font-semibold text-gray-900">
                    {thisMonth.earnings}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs lg:text-sm">
                  <span className="text-gray-600">Proposals Sent</span>
                  <span className="font-semibold text-gray-900">
                    {thisMonth.proposalsSent}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs lg:text-sm">
                  <span className="text-gray-600">Jobs Won</span>
                  <span className="font-semibold text-gray-900">
                    {thisMonth.jobsWon}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs lg:text-sm">
                  <span className="text-gray-600">Client Rating</span>
                  <span className="font-semibold text-gray-900 flex items-center gap-1">
                    ⭐ {thisMonth.rating}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
