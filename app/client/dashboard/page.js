"use client";

import { useState, useEffect } from "react";
import {
  Folder,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  User as UserIcon,
  PlusCircle,
  TrendingUp,
  Calendar,
  Briefcase,
  FileText,
  CreditCard,
  AlertCircle,
  CheckSquare,
  MessageSquare,
  Award,
} from "lucide-react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { apiPrivate } from "@/lib/apiPrivate";

export default function ClientDashboard() {
  const user = useSelector((state) => state.user);
  const { username = "John", token } = user?.user || {};
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    active_projects: 0,
    completed_projects: 0,
    total_freelancers_hired: 0,
    total_spent: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentProjects();
    fetchRecentActivity();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiPrivate.get('/client/statistics/');
      setStatsData({
        active_projects: response.data?.active_projects || 0,
        completed_projects: response.data?.completed_projects || 0,
        total_freelancers_hired: response.data?.total_freelancers_hired || 0,
        total_spent: response.data?.total_spent || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentProjects = async () => {
    try {
      const response = await apiPrivate.get('/projects/');
      setRecentProjects(response.data?.results || []);
    } catch (error) {
      console.error('Error fetching recent projects:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const response = await apiPrivate.get('/client/activity/');
      setRecentActivity(response.data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getActivityIcon = (activityType) => {
    const icons = {
      'PROJECT_CREATED': FileText,
      'OFFER_RECEIVED': MessageSquare,
      'ESCROW_FUNDED': CreditCard,
      'ESCROW_RELEASED': CheckCircle,
      'ESCROW_REFUNDED': CreditCard,
      'CONTRACT_COMPLETED': Award,
      'DISPUTE_OPENED': AlertCircle,
    };
    return icons[activityType] || Clock;
  };

  const getActivityColor = (activityType) => {
    const colors = {
      'PROJECT_CREATED': 'from-blue-500 to-blue-600',
      'OFFER_RECEIVED': 'from-purple-500 to-purple-600',
      'ESCROW_FUNDED': 'from-green-500 to-green-600',
      'ESCROW_RELEASED': 'from-emerald-500 to-emerald-600',
      'ESCROW_REFUNDED': 'from-orange-500 to-orange-600',
      'CONTRACT_COMPLETED': 'from-indigo-500 to-indigo-600',
      'DISPUTE_OPENED': 'from-red-500 to-red-600',
    };
    return colors[activityType] || 'from-slate-500 to-slate-600';
  };

  const getDurationLabel = (duration) => {
    const durationMap = {
      'less_than_1_month': '< 1 month',
      '1_3_months': '1-3 months',
      '3_6_months': '3-6 months',
      'more_than_6_months': '> 6 months',
    };
    return durationMap[duration] || duration;
  };

  const getExperienceLabel = (level) => {
    const levelMap = {
      'entry': 'Entry Level',
      'intermediate': 'Intermediate',
      'expert': 'Expert',
    };
    return levelMap[level] || level;
  };

  const getStatusStyle = (status) => {
    const styles = {
      'open': 'bg-green-50 text-green-700 border-green-200',
      'in_progress': 'bg-blue-50 text-blue-700 border-blue-200',
      'completed': 'bg-purple-50 text-purple-700 border-purple-200',
      'closed': 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return styles[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'open': 'Open',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'closed': 'Closed',
    };
    return labels[status] || status;
  };

  const stats = [
    {
      label: "Active Projects",
      value: loading ? "..." : (statsData?.active_projects ?? 0).toString(),
      icon: Folder,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Freelancers Hired",
      value: loading ? "..." : (statsData?.freelancers_hired ?? 0).toString(),
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Total Spent",
      value: loading ? "..." : formatCurrency(statsData?.total_spent),
      icon: DollarSign,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Completed Projects",
      value: loading ? "..." : (statsData?.completed_projects ?? 0).toString(),
      icon: CheckCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const quickActions = [
    { icon: PlusCircle, label: "Post a Project", href: "/client/post-project" },
    { icon: Users, label: "Browse Freelancers", href: "/client/browse-freelancers" },
    { icon: TrendingUp, label: "View Analytics", href: "/client/analytics" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-600 mt-2 text-base lg:text-lg font-medium">
          Welcome back, {username}! Here's what's happening with your projects.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border-2 border-slate-200 rounded-2xl p-4 lg:p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <span className="text-slate-600 text-xs lg:text-sm font-semibold">
                {stat.label}
              </span>
              <div className={`p-2 lg:p-3 rounded-xl ${stat.bg} shadow-sm`}>
                <stat.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl lg:text-4xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-2xl p-5 lg:p-7 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 lg:mb-6">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
                Recent Projects
              </h2>
              <p className="text-sm lg:text-base text-slate-600 mt-1 font-medium">
                Your latest project updates
              </p>
            </div>
            <Link 
              href="/client/post-project"
              className="px-4 lg:px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 w-full sm:w-auto text-sm lg:text-base font-semibold shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Post New Project</span>
            </Link>
          </div>

          <div className="space-y-4">
            {recentProjects.length > 0 ? recentProjects.map((project) => (
              <div
                key={project.id}
                className="border-2 border-slate-200 rounded-xl p-4 lg:p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-base lg:text-lg mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.skills?.slice(0, 3).map((skill) => (
                        <span
                          key={skill.id}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {project.skills?.length > 3 && (
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
                          +{project.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 lg:gap-4 text-sm text-slate-600">
                      <span className="flex items-center font-semibold">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                        {project.budget_type === 'fixed' 
                          ? formatCurrency(project.fixed_budget)
                          : `${formatCurrency(project.hourly_min_rate)}-${formatCurrency(project.hourly_max_rate)}/hr`
                        }
                      </span>
                      <span className="flex items-center font-medium">
                        <Clock className="h-4 w-4 mr-1 text-orange-600" />
                        {getDurationLabel(project.duration)}
                      </span>
                      <span className="flex items-center font-medium">
                        <Briefcase className="h-4 w-4 mr-1 text-purple-600" />
                        {getExperienceLabel(project.experience_level)}
                      </span>
                      <span className="flex items-center font-medium">
                        <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                        {formatDate(project.created_at)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 lg:px-4 py-1.5 rounded-lg text-xs font-bold border-2 ${getStatusStyle(project.status)} self-start sm:self-auto whitespace-nowrap`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                </div>

                {project.client && (
                  <div className="flex items-center justify-between pt-3 border-t-2 border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm lg:text-base font-bold shadow-lg ring-4 ring-slate-100">
                        {project.client.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm lg:text-base text-slate-900 font-bold block">
                          {project.client.username}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Project Owner
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/client/my-projects/${project.id}`}
                      className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                <Folder className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  No recent projects found. Start by posting a new project!
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 lg:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg lg:text-xl font-bold text-slate-900">
                Recent Activity
              </h3>
              <Link 
                href="/client/activity" 
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {activityLoading ? (
                // Loading skeleton
                Array(3).fill(null).map((_, index) => (
                  <div key={index} className="flex items-start space-x-3 animate-pulse">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.activity_type);
                  const gradientColor = getActivityColor(activity.activity_type);
                  
                  return (
                    <div key={activity.id || index} className="flex items-start space-x-3 group hover:bg-slate-50 p-2 rounded-xl transition-all">
                      <div className={`w-10 h-10 bg-gradient-to-br ${gradientColor} rounded-xl flex-shrink-0 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
                        <ActivityIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 font-medium leading-tight">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-medium flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.time_ago || formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <Clock className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm font-medium">
                    No recent activity
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 lg:p-6 shadow-lg">
            <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-all text-left border-2 border-transparent hover:border-slate-200 hover:shadow-md"
                >
                  <action.icon className="h-5 w-5 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-900">
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