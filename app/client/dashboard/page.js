"use client";

import { useState, useEffect } from "react";
import {
  Folder,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  PlusCircle,
  TrendingUp,
  Calendar,
  Briefcase,
  FileText,
  CreditCard,
  AlertCircle,
  MessageSquare,
  Award,
  ArrowUpRight,
  Sparkles,
  Activity,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { apiPrivate } from "@/lib/apiPrivate";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const DURATION_MAP = {
  less_than_1_month: "< 1 month",
  "1_3_months": "1–3 months",
  "3_6_months": "3–6 months",
  more_than_6_months: "> 6 months",
};

const EXPERIENCE_MAP = {
  entry: "Entry Level",
  intermediate: "Intermediate",
  expert: "Expert",
};

const STATUS_STYLES = {
  open:        "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100",
  in_progress: "bg-sky-50 text-sky-700 border-sky-200 ring-sky-100",
  completed:   "bg-violet-50 text-violet-700 border-violet-200 ring-violet-100",
  closed:      "bg-slate-50 text-slate-600 border-slate-200 ring-slate-100",
};

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  closed: "Closed",
};

const ACTIVITY_ICONS = {
  PROJECT_CREATED:    FileText,
  OFFER_RECEIVED:     MessageSquare,
  ESCROW_FUNDED:      CreditCard,
  ESCROW_RELEASED:    CheckCircle,
  ESCROW_REFUNDED:    CreditCard,
  CONTRACT_COMPLETED: Award,
  DISPUTE_OPENED:     AlertCircle,
};

const ACTIVITY_COLORS = {
  PROJECT_CREATED:    { bg: "bg-blue-500",    ring: "ring-blue-100"   },
  OFFER_RECEIVED:     { bg: "bg-violet-500",  ring: "ring-violet-100" },
  ESCROW_FUNDED:      { bg: "bg-emerald-500", ring: "ring-emerald-100"},
  ESCROW_RELEASED:    { bg: "bg-teal-500",    ring: "ring-teal-100"   },
  ESCROW_REFUNDED:    { bg: "bg-orange-500",  ring: "ring-orange-100" },
  CONTRACT_COMPLETED: { bg: "bg-indigo-500",  ring: "ring-indigo-100" },
  DISPUTE_OPENED:     { bg: "bg-red-500",     ring: "ring-red-100"    },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, colorClass, bgClass, delay = 0 }) {
  return (
    <div
      className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 lg:p-6 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5 hover:border-slate-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle background accent */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 ${bgClass} rounded-full opacity-40 blur-xl group-hover:opacity-70 transition-opacity duration-300`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${bgClass} shadow-sm`}>
            <Icon className={`h-5 w-5 ${colorClass}`} />
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
        </div>
        <p className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-1">
          {value}
        </p>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          {label}
        </p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
        <div className="w-4 h-4 bg-slate-100 rounded" />
      </div>
      <div className="h-9 bg-slate-100 rounded-lg w-20 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-28" />
    </div>
  );
}

function ProjectCard({ project }) {
  const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES.closed;
  const statusLabel = STATUS_LABELS[project.status] || project.status;

  return (
    <div className="group border border-slate-200/80 rounded-xl p-5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100 transition-all duration-250 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2">
            <h3 className="font-bold text-slate-900 text-base leading-snug truncate">
              {project.title}
            </h3>
            <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold border ring-1 ${statusStyle}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-3 line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          {/* Skill tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.skills?.slice(0, 3).map((skill) => (
              <span
                key={skill.id}
                className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-full border border-slate-200"
              >
                {skill.name}
              </span>
            ))}
            {project.skills?.length > 3 && (
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-xs font-medium rounded-full border border-slate-200">
                +{project.skills.length - 3}
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              {project.budget_type === "fixed"
                ? formatCurrency(project.fixed_budget)
                : `${formatCurrency(project.hourly_min_rate)}–${formatCurrency(project.hourly_max_rate)}/hr`}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              {DURATION_MAP[project.duration] || project.duration}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-violet-500" />
              {EXPERIENCE_MAP[project.experience_level] || project.experience_level}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-blue-500" />
              {formatDate(project.created_at)}
            </span>
          </div>
        </div>
      </div>

      {project.client && (
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#227C70] to-[#1a5f55] rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {project.client.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-none">
                {project.client.username}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Project Owner</p>
            </div>
          </div>
          <Link
            href={`/client/my-projects/${project.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
          >
            View
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ activity, index }) {
  const ActivityIcon = ACTIVITY_ICONS[activity.activity_type] || Clock;
  const colors = ACTIVITY_COLORS[activity.activity_type] || { bg: "bg-slate-400", ring: "ring-slate-100" };

  return (
    <div className="flex items-start gap-3 group hover:bg-slate-50/80 p-2 -mx-2 rounded-xl transition-colors cursor-default">
      <div className={`w-9 h-9 ${colors.bg} ring-4 ${colors.ring} rounded-xl flex-shrink-0 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200`}>
        <ActivityIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm text-slate-800 font-medium leading-snug line-clamp-2">
          {activity.description}
        </p>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {activity.time_ago || formatDate(activity.created_at)}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ClientDashboard() {
  const user = useSelector((state) => state.user);
  const { username = "there", token } = user?.user || {};

  const [loading, setLoading]               = useState(true);
  const [statsData, setStatsData]           = useState(null);
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
      const { data } = await apiPrivate.get("/client/statistics/");
      setStatsData({
        active_projects:          data?.active_projects          || 0,
        completed_projects:       data?.completed_projects       || 0,
        // ✅ FIX: was incorrectly reading `freelancers_hired`; API returns `total_freelancers_hired`
        total_freelancers_hired:  data?.total_freelancers_hired  || 0,
        total_spent:              data?.total_spent              || 0,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setStatsData({ active_projects: 0, completed_projects: 0, total_freelancers_hired: 0, total_spent: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentProjects = async () => {
    try {
      const { data } = await apiPrivate.get("/projects/");
      setRecentProjects(data?.results || []);
    } catch (err) {
      console.error("Error fetching recent projects:", err);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const { data } = await apiPrivate.get("/client/activity/");
      setRecentActivity(data || []);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
    } finally {
      setActivityLoading(false);
    }
  };

  // ── Stat card definitions – reading correct key ──────────────────────────
  const statCards = [
    {
      label: "Active Projects",
      value: loading ? "—" : String(statsData?.active_projects ?? 0),
      icon: Folder,
      colorClass: "text-blue-600",
      bgClass: "bg-blue-50",
    },
    {
      label: "Freelancers Hired",
      // ✅ FIX: corrected key from `freelancers_hired` → `total_freelancers_hired`
      value: loading ? "—" : String(statsData?.total_freelancers_hired ?? 0),
      icon: Users,
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
    },
    {
      label: "Total Spent",
      value: loading ? "—" : formatCurrency(statsData?.total_spent),
      icon: DollarSign,
      colorClass: "text-violet-600",
      bgClass: "bg-violet-50",
    },
    {
      label: "Completed Projects",
      value: loading ? "—" : String(statsData?.completed_projects ?? 0),
      icon: CheckCircle,
      colorClass: "text-orange-600",
      bgClass: "bg-orange-50",
    },
  ];

  const quickActions = [
    { icon: PlusCircle,  label: "Post a Project",     href: "/client/post-project",        accent: "text-[#227C70]" },
    { icon: Users,       label: "Browse Freelancers",  href: "/client/browse-freelancers",  accent: "text-blue-600"  },
    { icon: TrendingUp,  label: "View Analytics",      href: "/client/analytics",           accent: "text-violet-600"},
    { icon: Activity,    label: "All Activity",         href: "/client/activity",            accent: "text-orange-600"},
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f9fb] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-7">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-[#227C70]" />
              <span className="text-xs font-semibold text-[#227C70] uppercase tracking-widest">
                Client Dashboard
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Welcome back, {username}
            </h1>
            <p className="text-slate-500 mt-1.5 text-sm font-medium">
              Here's everything happening across your projects today.
            </p>
          </div>
          <Link
            href="/client/post-project"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#227C70] text-white text-sm font-semibold rounded-xl hover:bg-[#1a5f55] active:scale-[0.98] transition-all duration-150 shadow-sm shadow-[#227C70]/20 self-start sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            Post New Project
          </Link>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array(4).fill(null).map((_, i) => <SkeletonCard key={i} />)
            : statCards.map((card, i) => (
                <StatCard key={card.label} {...card} delay={i * 60} />
              ))}
        </div>

        {/* ── Main Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Projects panel ── */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Projects</h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Your latest project activity</p>
              </div>
              <Link
                href="/client/my-projects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#227C70] hover:text-[#1a5f55] transition-colors"
              >
                View all
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-5 space-y-3">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <Folder className="h-7 w-7 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">No projects yet</p>
                  <p className="text-xs text-slate-400 mb-5">
                    Post your first project to get started.
                  </p>
                  <Link
                    href="/client/post-project"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#227C70] text-white text-sm font-semibold rounded-xl hover:bg-[#1a5f55] transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Post a Project
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5">

            {/* Activity feed */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-500" />
                  <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
                </div>
                <Link
                  href="/client/activity"
                  className="text-xs font-semibold text-[#227C70] hover:text-[#1a5f55] transition-colors"
                >
                  View all
                </Link>
              </div>

              <div className="px-5 py-4 space-y-1">
                {activityLoading ? (
                  Array(4).fill(null).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 animate-pulse">
                      <div className="w-9 h-9 bg-slate-100 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3.5 bg-slate-100 rounded w-4/5" />
                        <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity, i) => (
                    <ActivityItem key={activity.id || i} activity={activity} index={i} />
                  ))
                ) : (
                  <div className="flex flex-col items-center py-10 text-center">
                    <Clock className="h-8 w-8 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-500">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                <Zap className="h-4 w-4 text-slate-500" />
                <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
              </div>
              <div className="p-3 space-y-1">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors flex-shrink-0">
                      <action.icon className={`h-4 w-4 ${action.accent}`} />
                    </div>
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors flex-1">
                      {action.label}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}