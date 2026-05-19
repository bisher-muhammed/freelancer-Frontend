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
  TrendingUp,
  Zap,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ── Global styles injected once ─────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

  .d-serif  { font-family: 'Playfair Display', Georgia, serif; }
  .d-mono   { font-family: 'JetBrains Mono', 'Courier New', monospace; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }

  .fu { animation: fadeUp 0.55s cubic-bezier(.22,.68,0,1.2) forwards; opacity: 0; }
  .fu-1 { animation-delay: 0.04s; }
  .fu-2 { animation-delay: 0.10s; }
  .fu-3 { animation-delay: 0.16s; }
  .fu-4 { animation-delay: 0.22s; }
  .fu-5 { animation-delay: 0.28s; }
  .fu-6 { animation-delay: 0.34s; }
  .fu-7 { animation-delay: 0.40s; }

  .stat-pill {
    transition: transform 0.22s ease, box-shadow 0.22s ease;
    cursor: default;
  }
  .stat-pill:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }

  .proj-card {
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  }
  .proj-card:hover {
    border-color: #0d1117;
    box-shadow: 0 6px 24px rgba(13,17,23,0.07);
    transform: translateX(2px);
  }

  .month-row {
    transition: background 0.15s ease;
    border-radius: 8px;
    padding: 6px 8px;
    margin: 0 -8px;
  }
  .month-row:hover { background: #f8f7f4; }

  .skeleton {
    background: linear-gradient(90deg, #f0ede8 25%, #e8e4df 50%, #f0ede8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 6px;
  }

  .progress-bar-fill {
    transition: width 1s cubic-bezier(.22,.68,0,1.2);
  }

  .badge-glow {
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }
`;

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (val) => {
  if (val === null || val === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val);
};

const fmtShort = (v) => {
  if (v == null) return "—";
  if (v >= 100_000) return `$${(v / 100_000).toFixed(1)}L`;
  if (v >= 1_000)   return `$${(v / 1_000).toFixed(1)}K`;
  return `$${Number(v).toFixed(0)}`;
};

const fmtMonthShort = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { month: "short" }) : "";

// ── Skeleton block ───────────────────────────────────────────────────────────
function Skeleton({ w = "w-24", h = "h-5" }) {
  return <span className={`skeleton inline-block ${w} ${h}`} />;
}

// ── Earnings Area Chart ──────────────────────────────────────────────────────
function EarningsChart({ data, loading }) {
  const options = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "JetBrains Mono, monospace",
      background: "transparent",
      animations: { enabled: true, speed: 800, easing: "easeinout" },
      dropShadow: { enabled: false },
    },
    stroke: { curve: "smooth", width: [2.5, 1.5] },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.18,
        opacityTo: 0.01,
        stops: [0, 85, 100],
      },
    },
    colors: ["#0d1117", "#d1fae5"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((d) => fmtMonthShort(d.month)),
      labels: {
        style: { colors: "#9ca3af", fontSize: "10px", fontFamily: "JetBrains Mono, monospace" },
      },
      axisBorder: { show: false },
      axisTicks:  { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#9ca3af", fontSize: "10px", fontFamily: "JetBrains Mono, monospace" },
        formatter: fmtShort,
      },
    },
    grid: {
      borderColor: "#f3f0eb",
      strokeDashArray: 5,
      padding: { left: 4, right: 8 },
    },
    tooltip: {
      theme: "light",
      style: { fontSize: "11px", fontFamily: "JetBrains Mono, monospace" },
      y: { formatter: (v) => fmt(v) },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#9ca3af" },
      fontSize: "11px",
      fontFamily: "JetBrains Mono, monospace",
      markers: { width: 7, height: 7, radius: 2 },
    },
  };

  const series = [
    { name: "Net",   data: data.map((d) => parseFloat((d.total_net   ?? 0).toFixed(2))) },
    { name: "Gross", data: data.map((d) => parseFloat((d.total_gross ?? 0).toFixed(2))) },
  ];

  if (loading) {
    return (
      <div className="h-44 flex items-center justify-center">
        <div className="space-y-3 w-full px-4">
          {[100, 70, 85, 60, 90, 75].map((w, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="skeleton rounded" style={{ height: `${w * 0.4}px`, width: `${100 / 6}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-44 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-gray-300" />
        </div>
        <p className="text-sm text-gray-400 d-mono">No earnings data yet</p>
      </div>
    );
  }

  return <ReactApexChart options={options} series={series} type="area" height={178} />;
}

// ── Profile Radial ────────────────────────────────────────────────────────────
function ProfileRadial({ percentage }) {
  const options = {
    chart: {
      type: "radialBar",
      background: "transparent",
      fontFamily: "JetBrains Mono, monospace",
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -130,
        endAngle: 130,
        hollow: { size: "60%" },
        dataLabels: {
          name:  { show: false },
          value: {
            fontSize: "15px",
            fontWeight: "600",
            fontFamily: "JetBrains Mono, monospace",
            color: "#0d1117",
            offsetY: 5,
            formatter: (v) => `${v}%`,
          },
        },
        track: { background: "#f3f0eb", strokeWidth: "100%" },
      },
    },
    colors: ["#0d1117"],
    tooltip: { enabled: false },
  };

  return (
    <ReactApexChart
      options={options}
      series={[percentage]}
      type="radialBar"
      height={108}
      width={108}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function FreelancerDashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const user = useSelector((state) => state.user);
  const { username = "Sarah", id: userId } = user?.user || {};

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

  const chartData = monthlyEarnings.slice(-6);

  if (!mounted) return null;

  return (
    <>
      {/* Font + animation injection */}
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />

      <div className="lg:ml-0 pt-16 lg:mr-4 w-full min-h-screen" style={{ background: "#f7f5f0" }}>

        {/* ── Dark Hero Header ───────────────────────────────────────────── */}
        <div style={{ background: "#0d1117" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 lg:pt-10 lg:pb-12">

            {/* Greeting row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
              <div className="fu fu-1">
                <p className="text-xs tracking-[0.18em] uppercase text-gray-500 mb-2">
                  Freelancer Dashboard
                </p>
                <h1 className="d-serif text-3xl lg:text-4xl font-bold text-white leading-tight">
                  Welcome back, {username}.
                </h1>
                <p className="text-gray-500 text-sm mt-1.5">
                  Here's how your business is doing right now.
                </p>
              </div>

              <div className="flex items-center gap-4 fu fu-2">
                {/* Hero metric in header */}
                {!loadingEarnings && totalEarnings !== null && (
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-500 tracking-wide uppercase mb-0.5">Total Net Earned</p>
                    <p className="d-mono text-2xl lg:text-3xl font-semibold text-white">
                      {fmt(totalEarnings)}
                    </p>
                  </div>
                )}
                <Link
                  href="/freelancer/find-jobs"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "#fff",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                >
                  <span>Browse Jobs</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* ── Stat Cards (inside dark band) ─────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {[
                {
                  label: "Total Net Earnings",
                  value: loadingEarnings ? null : fmt(totalEarnings),
                  icon: Wallet,
                  accent: "#10b981",
                  delay: "fu-3",
                },
                {
                  label: "This Month (Net)",
                  value: loadingEarnings ? null : fmt(thisMonthEarnings),
                  icon: BarChart3,
                  accent: "#3b82f6",
                  delay: "fu-4",
                  badge: monthChange !== null ? (
                    <span
                      className={`d-mono inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                        monthChangePositive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {monthChangePositive
                        ? <ArrowUpRight className="w-3 h-3" />
                        : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(monthChange)}%
                    </span>
                  ) : null,
                },
                {
                  label: "Invoices Completed",
                  value: loadingEarnings ? null : (invoiceCount ?? "—"),
                  icon: CheckCircle,
                  accent: "#f59e0b",
                  delay: "fu-5",
                },
                {
                  label: "Platform Fees Paid",
                  value: loadingEarnings ? null : fmt(platformFee),
                  icon: Briefcase,
                  accent: "#a78bfa",
                  delay: "fu-6",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`stat-pill fu ${stat.delay} rounded-xl p-4 lg:p-5`}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-gray-400 text-xs leading-tight pr-1">{stat.label}</p>
                    <div
                      className="p-1.5 rounded-lg flex-shrink-0"
                      style={{ background: `${stat.accent}22` }}
                    >
                      <stat.icon className="w-3.5 h-3.5" style={{ color: stat.accent }} />
                    </div>
                  </div>
                  {stat.value === null ? (
                    <div className="h-7 skeleton rounded w-20" style={{ background: "rgba(255,255,255,0.07)" }} />
                  ) : (
                    <p className="d-mono text-lg lg:text-xl font-semibold text-white truncate">
                      {stat.value}
                    </p>
                  )}
                  {stat.badge && <div className="mt-2">{stat.badge}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Content ──────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">

            {/* ── Left Column (2/3) ──────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Earnings Chart */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6 fu fu-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                  <div>
                    <h2 className="d-serif text-xl font-bold text-gray-900 leading-tight">
                      Earnings Overview
                    </h2>
                    <p className="text-gray-400 text-xs mt-0.5 d-mono">
                      Last 6 months · Net vs Gross
                    </p>
                  </div>
                  <Link
                    href="/freelancer/earnings"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors d-mono"
                  >
                    Full Report <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <EarningsChart data={chartData} loading={loadingEarnings} />
              </div>

              {/* Related Projects */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6 fu fu-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-5">
                  <div>
                    <h2 className="d-serif text-xl font-bold text-gray-900 leading-tight">
                      Open Projects For You
                    </h2>
                    <p className="text-gray-400 text-xs mt-0.5">Matching your skills</p>
                  </div>
                  <Link
                    href="/freelancer/find-jobs"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors d-mono"
                  >
                    Browse All <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {loadingProjects ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="rounded-xl border border-gray-100 p-4">
                        <div className="skeleton h-4 w-3/4 rounded mb-3" />
                        <div className="skeleton h-3 w-1/2 rounded mb-3" />
                        <div className="flex gap-2">
                          <div className="skeleton h-5 w-16 rounded" />
                          <div className="skeleton h-5 w-14 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : relatedProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                      <Layers className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">No matching projects yet</p>
                    <Link
                      href="/freelancer/find-jobs"
                      className="text-xs text-gray-900 underline underline-offset-2 font-medium"
                    >
                      Browse all jobs →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {relatedProjects.slice(0, 5).map((project, index) => (
                      <div
                        key={project.id ?? index}
                        className="proj-card rounded-xl border border-gray-100 p-4 lg:p-5"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm leading-snug flex-1">
                            {project.title}
                          </h3>
                          <span
                            className="badge-glow flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: "#d1fae5",
                              color: "#065f46",
                            }}
                          >
                            Open
                          </span>
                        </div>

                        {project.description && (
                          <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                            {project.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {project.budget_min && project.budget_max && (
                            <span className="d-mono text-sm font-semibold text-gray-900">
                              ${Number(project.budget_min).toLocaleString("en-US")} – ${Number(project.budget_max).toLocaleString("en-US")}
                            </span>
                          )}
                          {project.rate_type && (
                            <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md capitalize">
                              {project.rate_type}
                            </span>
                          )}
                          {project.created_at && (
                            <span className="text-xs text-gray-400 d-mono">
                              {new Date(project.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>

                        {project.required_skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {project.required_skills.slice(0, 4).map((s, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-0.5 rounded-md"
                                style={{ background: "#f7f5f0", color: "#374151" }}
                              >
                                {s.name ?? s}
                              </span>
                            ))}
                            {project.required_skills.length > 4 && (
                              <span className="text-xs px-2 py-0.5 rounded-md text-gray-400" style={{ background: "#f7f5f0" }}>
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

            {/* ── Right Column (1/3) ─────────────────────────────────────── */}
            <div className="space-y-5">

              {/* This Month Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 fu fu-4">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <h3 className="d-serif text-lg font-bold text-gray-900">This Month</h3>
                </div>

                <div className="space-y-1">
                  {[
                    { label: "Net Earnings",   value: loadingEarnings ? null : fmt(thisMonthEarnings) },
                    { label: "Gross Earnings", value: loadingEarnings ? null : fmt(currentMonthData?.total_gross ?? null) },
                    { label: "Platform Fee",   value: loadingEarnings ? null : fmt(currentMonthData?.platform_fee ?? null) },
                    { label: "Proposals Sent", value: loadingEarnings ? null : "—" },
                    { label: "Jobs Won",       value: loadingEarnings ? null : "—" },
                    { label: "Client Rating",  value: loadingEarnings ? null : "—" },
                  ].map((item, i) => (
                    <div key={i} className="month-row flex justify-between items-center text-sm">
                      <span className="text-gray-400 text-xs">{item.label}</span>
                      {item.value === null ? (
                        <Skeleton w="w-14" h="h-3.5" />
                      ) : (
                        <span className="d-mono font-semibold text-gray-900 text-xs">{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>

                {!loadingEarnings && lastMonthEarnings !== null && (
                  <div
                    className="mt-4 pt-4"
                    style={{ borderTop: "1px dashed #e5e2db" }}
                  >
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1.5">
                      <span>Last Month (Net)</span>
                      <span className="d-mono font-semibold text-gray-700">{fmt(lastMonthEarnings)}</span>
                    </div>
                    {monthChange !== null && (
                      <div
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg d-mono ${
                          monthChangePositive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {monthChangePositive
                          ? <ArrowUpRight className="w-3 h-3" />
                          : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(monthChange)}% vs last month
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Total Breakdown */}
              {!loadingEarnings && earningsSummary && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 fu fu-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <h3 className="d-serif text-lg font-bold text-gray-900">Total Breakdown</h3>
                  </div>
                  <div className="space-y-1">
                    {[
                      { label: "Gross Earnings", value: fmt(totalGross),         color: "text-gray-900" },
                      { label: "Platform Fee",   value: `–${fmt(platformFee)}`,  color: "text-red-500"  },
                    ].map((row, i) => (
                      <div key={i} className="month-row flex justify-between items-center text-xs">
                        <span className="text-gray-400">{row.label}</span>
                        <span className={`d-mono font-semibold ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                    <div
                      className="flex justify-between items-center text-sm pt-3 mt-1"
                      style={{ borderTop: "1px dashed #e5e2db" }}
                    >
                      <span className="font-semibold text-gray-700 text-xs">Net Earnings</span>
                      <span className="d-mono font-bold text-emerald-600">{fmt(totalEarnings)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Strength */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 fu fu-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h3 className="d-serif text-lg font-bold text-gray-900">Profile Strength</h3>
                  </div>
                  <span className="d-mono text-xs font-semibold text-gray-400">
                    {profileStrength.percentage}%
                  </span>
                </div>

                {/* Radial + label */}
                <div className="flex items-center gap-3 mb-4 -mx-1">
                  <div className="flex-shrink-0">
                    <ProfileRadial percentage={profileStrength.percentage} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">
                      Almost there!
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {profileStrength.pending.length} step{profileStrength.pending.length !== 1 ? "s" : ""} left to complete
                    </p>

                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "#f3f0eb", width: "100px" }}>
                      <div
                        className="progress-bar-fill h-full rounded-full"
                        style={{
                          width: `${profileStrength.percentage}%`,
                          background: "linear-gradient(90deg, #0d1117, #374151)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {profileStrength.completed.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                  {profileStrength.pending.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="w-full py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "#0d1117",
                    color: "#fff",
                    border: "1px solid #0d1117",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#1f2937";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#0d1117";
                  }}
                >
                  Complete Profile
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
