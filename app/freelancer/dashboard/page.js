"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiPrivate } from "@/lib/apiPrivate";
import dynamic from "next/dynamic";
import {
  Briefcase,
  CheckCircle,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Wallet,
  CalendarDays,
  Layers,
} from "lucide-react";
import Link from "next/link";

// ── ApexCharts SSR-safe ─────────────────────────────────────────────────────
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (val) => {
  if (val === null || val === undefined) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(val);
};

const fmtShort = (v) => {
  if (v == null) return "—";
  if (v >= 100_000) return `₹${(v / 100_000).toFixed(1)}L`;
  if (v >= 1_000)   return `₹${(v / 1_000).toFixed(1)}K`;
  return `₹${Number(v).toFixed(0)}`;
};

const fmtMonthShort = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { month: "short" }) : "";

const fmtMonth = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "";

// ── Dashboard Area Chart ────────────────────────────────────────────────────
function DashboardEarningsChart({ data, loading }) {
  const options = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "inherit",
      background: "transparent",
      animations: { enabled: true, speed: 700 },
    },
    stroke: { curve: "smooth", width: [2.5, 1.5] },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.22,
        opacityTo: 0.02,
        stops: [0, 90, 100],
      },
    },
    colors: ["#111827", "#d1d5db"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((d) => fmtMonthShort(d.month)),
      labels: { style: { colors: "#9ca3af", fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks:  { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#9ca3af", fontSize: "11px" },
        formatter: fmtShort,
      },
    },
    grid: {
      borderColor: "#f3f4f6",
      strokeDashArray: 4,
      padding: { left: 0, right: 8 },
    },
    tooltip: {
      theme: "light",
      style: { fontSize: "12px" },
      y: { formatter: (v) => fmt(v) },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#6b7280" },
      fontSize: "12px",
      markers: { width: 8, height: 8, radius: 2 },
    },
  };

  const series = [
    { name: "Net",   data: data.map((d) => parseFloat((d.total_net   ?? 0).toFixed(2))) },
    { name: "Gross", data: data.map((d) => parseFloat((d.total_gross ?? 0).toFixed(2))) },
  ];

  if (loading) {
    return (
      <div className="h-44 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-44 flex flex-col items-center justify-center text-gray-400 gap-2">
        <BarChart3 className="w-10 h-10 opacity-30" />
        <p className="text-sm">No earnings data yet</p>
      </div>
    );
  }

  return <ReactApexChart options={options} series={series} type="area" height={175} />;
}

// ── Profile Radial Bar ──────────────────────────────────────────────────────
function ProfileRadial({ percentage }) {
  const options = {
    chart: {
      type: "radialBar",
      background: "transparent",
      fontFamily: "inherit",
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: "58%" },
        dataLabels: {
          name:  { show: false },
          value: {
            fontSize: "16px",
            fontWeight: "700",
            color: "#111827",
            offsetY: 6,
            formatter: (v) => `${v}%`,
          },
        },
        track: { background: "#f3f4f6", strokeWidth: "100%" },
      },
    },
    colors: ["#111827"],
    tooltip: { enabled: false },
  };

  return (
    <ReactApexChart
      options={options}
      series={[percentage]}
      type="radialBar"
      height={110}
      width={110}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function FreelancerDashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const user = useSelector((state) => state.user);
  const { username = "Sarah", id: userId } = user?.user || {};

  // ── API state ────────────────────────────────────────────────────────────
  const [earningsSummary, setEarningsSummary] = useState(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [loadingEarnings, setLoadingEarnings] = useState(true);

  const [relatedProjects, setRelatedProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoadingEarnings(true);
        const [summaryRes, monthlyRes] = await Promise.all([
          apiPrivate.get("freelancer/earnings/summary/"),
          apiPrivate.get("freelancer/earnings/monthly/"),
        ]);
        setEarningsSummary(summaryRes.data);
        setMonthlyEarnings(Array.isArray(monthlyRes.data) ? monthlyRes.data : []);
      } catch (err) {
        console.error("Failed to fetch earnings:", err);
      } finally {
        setLoadingEarnings(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        setLoadingProjects(true);
        const res = await apiPrivate.get(`related-projects/${userId}/`);
        setRelatedProjects(res.data.results ?? []);
      } catch (err) {
        console.error("Failed to fetch related projects:", err);
      } finally {
        setLoadingProjects(false);
      }
    })();
  }, [userId]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const totalEarnings = earningsSummary?.total_net    ?? null;
  const totalGross    = earningsSummary?.total_gross  ?? null;
  const platformFee   = earningsSummary?.platform_fee ?? null;
  const invoiceCount  = earningsSummary?.invoice_count ?? null;

  const currentMonthData  = monthlyEarnings[monthlyEarnings.length - 1] ?? null;
  const prevMonthData     = monthlyEarnings[monthlyEarnings.length - 2] ?? null;
  const thisMonthEarnings = currentMonthData?.total_net ?? null;
  const lastMonthEarnings = prevMonthData?.total_net    ?? null;

  const completedJobs      = invoiceCount;
  const thisMonthProposals = null;
  const jobsWon            = null;
  const rating             = null;

  const monthChange =
    lastMonthEarnings != null && thisMonthEarnings != null
      ? (((thisMonthEarnings - lastMonthEarnings) / (lastMonthEarnings || 1)) * 100).toFixed(1)
      : null;
  const monthChangePositive = monthChange !== null && parseFloat(monthChange) >= 0;

  const profileStrength = {
    percentage: 85,
    completed: ["Profile photo added", "Skills listed", "Portfolio added"],
    pending:   ["Add certifications"],
  };

  const stats = [
    {
      label: "Total Earnings (Net)",
      value: loadingEarnings ? null : fmt(totalEarnings),
      icon: Wallet,
      color: "bg-emerald-50", iconColor: "text-emerald-600", borderColor: "border-emerald-100",
    },
    {
      label: "This Month (Net)",
      value: loadingEarnings ? null : fmt(thisMonthEarnings),
      icon: BarChart3,
      color: "bg-blue-50", iconColor: "text-blue-600", borderColor: "border-blue-100",
      badge: monthChange !== null ? (
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${monthChangePositive ? "text-emerald-600" : "text-red-500"}`}>
          {monthChangePositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(monthChange)}%
        </span>
      ) : null,
    },
    {
      label: "Invoices Completed",
      value: loadingEarnings ? null : completedJobs ?? "—",
      icon: CheckCircle,
      color: "bg-orange-50", iconColor: "text-orange-600", borderColor: "border-orange-100",
    },
    {
      label: "Platform Fee (Total)",
      value: loadingEarnings ? null : fmt(platformFee),
      icon: Briefcase,
      color: "bg-violet-50", iconColor: "text-violet-600", borderColor: "border-violet-100",
    },
  ];

  const chartData = monthlyEarnings.slice(-6);

  if (!mounted) return null;

  return (
    <div className="lg:ml-0 pt-16 lg:mr-4 w-full">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
              <p className="text-gray-500 text-sm lg:text-base">
                Welcome back,{" "}
                <span className="font-medium text-gray-700">{username}</span>! Here's your overview.
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
                className={`bg-white border ${stat.borderColor} rounded-xl p-4 lg:p-6 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-xs lg:text-sm mb-1 truncate">{stat.label}</p>
                    {stat.value === null ? (
                      <div className="h-7 w-24 bg-gray-100 animate-pulse rounded mt-1" />
                    ) : (
                      <p className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
                    )}
                    {stat.badge && <div className="mt-1">{stat.badge}</div>}
                  </div>
                  <div className={`p-2 lg:p-3 rounded-lg ${stat.color} flex-shrink-0 ml-3`}>
                    <stat.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">

            {/* Earnings Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-1">
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900">Earnings Overview</h2>
                  <p className="text-gray-500 text-xs lg:text-sm">Last 6 months — Net vs Gross</p>
                </div>
                <Link
                  href="/freelancer/earnings"
                  className="text-sm font-medium text-blue-600 hover:underline whitespace-nowrap"
                >
                  Full Report →
                </Link>
              </div>

              <DashboardEarningsChart data={chartData} loading={loadingEarnings} />
            </div>

            {/* Related Projects */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 lg:mb-6">
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900">Open Projects For You</h2>
                  <p className="text-gray-500 text-xs lg:text-sm">Matching your skills</p>
                </div>
                <Link href="/freelancer/find-jobs" className="text-sm font-medium text-blue-600 hover:underline whitespace-nowrap">
                  Browse All
                </Link>
              </div>

              {loadingProjects ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
                      <div className="flex gap-2">
                        <div className="h-5 bg-gray-100 rounded w-16" />
                        <div className="h-5 bg-gray-100 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : relatedProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                  <Layers className="w-10 h-10 opacity-30" />
                  <p className="text-sm">No open projects matching your skills yet</p>
                  <Link href="/freelancer/find-jobs" className="text-xs text-blue-600 hover:underline mt-1">
                    Browse all jobs →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {relatedProjects.slice(0, 5).map((project, index) => (
                    <div
                      key={project.id ?? index}
                      className="border border-gray-200 rounded-xl p-4 lg:p-5 hover:shadow-sm hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm lg:text-base leading-snug flex-1">
                          {project.title}
                        </h3>
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100 whitespace-nowrap flex-shrink-0">
                          Open
                        </span>
                      </div>

                      {project.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
                        {project.budget_min && project.budget_max && (
                          <span className="font-semibold text-gray-800">
                            ₹{Number(project.budget_min).toLocaleString("en-IN")} – ₹{Number(project.budget_max).toLocaleString("en-IN")}
                          </span>
                        )}
                        {project.rate_type && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs capitalize">
                            {project.rate_type}
                          </span>
                        )}
                        {project.created_at && (
                          <span>
                            {new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>

                      {project.required_skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.required_skills.slice(0, 4).map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                              {s.name ?? s}
                            </span>
                          ))}
                          {project.required_skills.length > 4 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                              +{project.required_skills.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* This Month Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <h3 className="text-base lg:text-lg font-bold text-gray-900">This Month</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Net Earnings",   value: loadingEarnings ? null : fmt(thisMonthEarnings) },
                  { label: "Gross Earnings", value: loadingEarnings ? null : fmt(currentMonthData?.total_gross ?? null) },
                  { label: "Platform Fee",   value: loadingEarnings ? null : fmt(currentMonthData?.platform_fee ?? null) },
                  { label: "Proposals Sent", value: loadingEarnings ? null : thisMonthProposals ?? "—" },
                  { label: "Jobs Won",       value: loadingEarnings ? null : jobsWon ?? "—" },
                  { label: "Client Rating",  value: loadingEarnings ? null : rating ? `⭐ ${rating}` : "—" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    {item.value === null ? (
                      <div className="h-4 w-16 bg-gray-100 animate-pulse rounded" />
                    ) : (
                      <span className="font-semibold text-gray-900">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>

              {!loadingEarnings && lastMonthEarnings !== null && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Last Month (Net)</span>
                    <span className="font-medium">{fmt(lastMonthEarnings)}</span>
                  </div>
                  {monthChange !== null && (
                    <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${monthChangePositive ? "text-emerald-600" : "text-red-500"}`}>
                      {monthChangePositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(monthChange)}% vs last month
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Total Breakdown */}
            {!loadingEarnings && earningsSummary && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4">Total Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: "Gross Earnings", value: fmt(totalGross),         color: "text-gray-900" },
                    { label: "Platform Fee",   value: `- ${fmt(platformFee)}`, color: "text-red-500"  },
                    { label: "Net Earnings",   value: fmt(totalEarnings),      color: "text-emerald-600" },
                  ].map((row, i) => (
                    <div key={i} className={`flex justify-between items-center text-sm ${i === 2 ? "border-t border-gray-100 pt-3 font-bold" : ""}`}>
                      <span className="text-gray-500">{row.label}</span>
                      <span className={`font-semibold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Strength — ApexCharts radial */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base lg:text-lg font-bold text-gray-900">Profile Strength</h3>
                <Star className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-500" />
              </div>

              {/* Radial gauge + label side by side */}
              <div className="flex items-center gap-3 mb-3 -mx-2">
                <div className="flex-shrink-0">
                  <ProfileRadial percentage={profileStrength.percentage} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {profileStrength.percentage}% Complete
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {profileStrength.pending.length} item{profileStrength.pending.length !== 1 ? "s" : ""} left to finish
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {profileStrength.completed.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs lg:text-sm">
                    <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
                {profileStrength.pending.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs lg:text-sm text-gray-400">
                    <Clock className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Complete Profile
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}