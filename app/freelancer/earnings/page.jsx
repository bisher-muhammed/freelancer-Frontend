"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { apiPrivate } from "@/lib/apiPrivate";
import Link from "next/link";
import {
  Wallet, TrendingUp, TrendingDown, BadgePercent,
  Receipt, ArrowUpRight, ArrowDownRight,
  BarChart2, Activity, Calendar,
} from "lucide-react";

// ── ApexCharts: SSR-safe dynamic import ────────────────────────────────────
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v, digits = 2) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("en-IN", {
        style: "currency", currency: "INR", maximumFractionDigits: digits,
      }).format(v);

const fmtShort = (v) => {
  if (v == null) return "—";
  if (v >= 100_000) return `₹${(v / 100_000).toFixed(1)}L`;
  if (v >= 1_000)   return `₹${(v / 1_000).toFixed(1)}K`;
  return `₹${Number(v).toFixed(2)}`;
};

const fmtMonth = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }) : "";

const pct = (a, b) =>
  b ? (((a - b) / Math.abs(b || 1)) * 100).toFixed(1) : null;

const Sk = ({ className = "" }) => (
  <div className={`bg-gray-100 animate-pulse rounded-lg ${className}`} />
);

// ── Shared ApexCharts defaults ───────────────────────────────────────────────
const FONT   = "'DM Mono', monospace";
const GRID   = "#f1f5f9";
const MUTED  = "#475569";
const TT     = { theme: "light", style: { fontSize: "12px", fontFamily: FONT } };

// ══ CHART COMPONENTS ══════════════════════════════════════════════════════════

function AreaChart({ data, loading }) {
  const opts = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: FONT, background: "transparent", animations: { speed: 700 } },
    stroke: { curve: "smooth", width: [2.5, 1.5] },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.02, stops: [0, 90, 100] } },
    colors: ["#0f172a", "#94a3b8"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((d) => fmtMonth(d.month)),
      labels: { style: { colors: MUTED, fontSize: "11px" } },
      axisBorder: { show: false }, axisTicks: { show: false },
    },
    yaxis: { min: 0, labels: { style: { colors: MUTED, fontSize: "11px", fontWeight: '600' }, formatter: fmtShort } },
    grid: { borderColor: GRID, strokeDashArray: 4 },
    tooltip: { ...TT, y: { formatter: (v) => fmt(v) } },
    legend: { position: "top", horizontalAlign: "right", labels: { colors: "#334155" }, fontSize: "12px", fontWeight: 600 },
  };
  const series = [
    { name: "Net Earnings",   data: data.map((d) => +((d.total_net   ?? 0).toFixed(2))) },
    { name: "Gross Earnings", data: data.map((d) => +((d.total_gross ?? 0).toFixed(2))) },
  ];
  if (loading) return <Sk className="h-56 w-full" />;
  return <ReactApexChart options={opts} series={series} type="area" height={220} />;
}

function GroupedBarChart({ data, loading }) {
  const opts = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: FONT, background: "transparent", animations: { speed: 500 } },
    plotOptions: { bar: { columnWidth: "65%", borderRadius: 4, borderRadiusApplication: "end" } },
    colors: ["#94a3b8", "#fca5a5", "#0f172a"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((d) => fmtMonth(d.month)),
      labels: { style: { colors: MUTED, fontSize: "11px" } },
      axisBorder: { show: false }, axisTicks: { show: false },
    },
    yaxis: { min: 0, labels: { style: { colors: MUTED, fontSize: "11px", fontWeight: '600' }, formatter: fmtShort } },
    grid: { borderColor: GRID, strokeDashArray: 4 },
    tooltip: { ...TT, y: { formatter: (v) => fmt(v) } },
    legend: { position: "top", horizontalAlign: "right", labels: { colors: "#334155" }, fontSize: "12px", fontWeight: 600 },
  };
  const series = [
    { name: "Gross",        data: data.map((d) => +((d.total_gross   ?? 0).toFixed(2))) },
    { name: "Platform Fee", data: data.map((d) => +((d.platform_fee  ?? 0).toFixed(2))) },
    { name: "Net",          data: data.map((d) => +((d.total_net     ?? 0).toFixed(2))) },
  ];
  if (loading) return <Sk className="h-56 w-full" />;
  return <ReactApexChart options={opts} series={series} type="bar" height={220} />;
}

function RadialBarChart({ net, gross, loading }) {
  const netPct = gross > 0 ? Math.round((net  / gross) * 100) : 0;
  const feePct = gross > 0 ? Math.round(((gross - net) / gross) * 100) : 0;
  const opts = {
    chart: { type: "radialBar", fontFamily: FONT, background: "transparent" },
    plotOptions: {
      radialBar: {
        startAngle: -135, endAngle: 135,
        hollow: { size: "55%", margin: 5 },
        dataLabels: {
          name:  { fontSize: "12px", color: "#64748b", offsetY: 20 },
          value: { fontSize: "24px", fontWeight: "700", color: "#0f172a", offsetY: -16, formatter: (v) => `${v}%` },
          total: { show: true, label: "Net Kept", color: "#64748b", fontSize: "11px", formatter: () => `${netPct}%` },
        },
        track: { background: "#f1f5f9", strokeWidth: "100%" },
      },
    },
    colors: ["#0f172a", "#fca5a5"],
    labels: ["Net Earnings", "Platform Fee"],
    legend: { show: true, position: "bottom", labels: { colors: "#64748b" }, fontSize: "12px" },
    tooltip: { enabled: false },
  };
  if (loading) return <Sk className="h-64 w-full rounded-2xl" />;
  return <ReactApexChart options={opts} series={[netPct, feePct]} type="radialBar" height={260} />;
}

function DonutChart({ data, loading }) {
  const slices = data.slice(-6);
  const opts = {
    chart: { type: "donut", fontFamily: FONT, background: "transparent" },
    labels: slices.map((d) => fmtMonth(d.month)),
    colors: ["#0f172a","#334155","#64748b","#94a3b8","#cbd5e1","#e2e8f0"],
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: { show: true, label: "Total Net", color: "#64748b", fontSize: "11px", formatter: (w) => fmtShort(w.globals.seriesTotals.reduce((a, b) => a + b, 0)) },
            value: { fontSize: "18px", fontWeight: "700", color: "#0f172a", formatter: (v) => fmtShort(+v) },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { position: "bottom", labels: { colors: "#64748b" }, fontSize: "11px" },
    tooltip: { ...TT, y: { formatter: (v) => fmt(v) } },
  };
  if (loading) return <Sk className="h-64 w-full rounded-2xl" />;
  if (!slices.length) return <div className="h-40 flex items-center justify-center text-gray-300 text-sm">No data</div>;
  return <ReactApexChart options={opts} series={slices.map((d) => +((d.total_net ?? 0).toFixed(2)))} type="donut" height={260} />;
}

function CandlestickChart({ data, loading }) {
  const series = [{
    data: data.map((d) => ({
      x: fmtMonth(d.month),
      y: [
        +((d.platform_fee ?? 0).toFixed(2)),
        +((d.total_gross  ?? 0).toFixed(2)),
        +(((d.total_gross + d.total_net) / 2 || 0).toFixed(2)),
        +((d.total_net    ?? 0).toFixed(2)),
      ],
    })),
  }];
  const opts = {
    chart: { type: "candlestick", toolbar: { show: false }, fontFamily: FONT, background: "transparent" },
    plotOptions: { candlestick: { colors: { upward: "#0f172a", downward: "#fca5a5" }, wick: { useFillColor: true } } },
    xaxis: {
      type: "category",
      labels: { style: { colors: MUTED, fontSize: "11px" } },
      axisBorder: { show: false }, axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: MUTED, fontSize: "11px", fontWeight: '600' }, formatter: fmtShort }, tooltip: { enabled: true } },
    grid: { borderColor: GRID, strokeDashArray: 4 },
    tooltip: {
      ...TT,
      custom: ({ seriesIndex: si, dataPointIndex: di, w }) => {
        const o = w.globals.seriesCandleO[si][di];
        const h = w.globals.seriesCandleH[si][di];
        const l = w.globals.seriesCandleL[si][di];
        const c = w.globals.seriesCandleC[si][di];
        return `<div style="padding:10px 14px;font-family:${FONT};font-size:12px;line-height:2">
          <b>${w.globals.labels[di]}</b><br/>
          High (Gross): <b>${fmt(h)}</b><br/>
          Close (Net): <b>${fmt(c)}</b><br/>
          Open (Avg): ${fmt(o)}<br/>
          <span style="color:#f87171">Low (Fee): ${fmt(l)}</span>
        </div>`;
      },
    },
  };
  if (loading) return <Sk className="h-56 w-full" />;
  if (!data.length) return <div className="h-36 flex items-center justify-center text-gray-300 text-sm">No data</div>;
  return <ReactApexChart options={opts} series={series} type="candlestick" height={220} />;
}

function HeatmapChart({ data, loading }) {
  const byYear = {};
  data.forEach((d) => {
    if (!d.month) return;
    const dt = new Date(d.month);
    const yr = dt.getFullYear();
    const mo = dt.getMonth();
    if (!byYear[yr]) byYear[yr] = Array(12).fill(0);
    byYear[yr][mo] = +((d.total_net ?? 0).toFixed(2));
  });
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const series = Object.entries(byYear).map(([yr, vals]) => ({
    name: yr, data: MONTHS.map((m, i) => ({ x: m, y: vals[i] })),
  }));
  const opts = {
    chart: { type: "heatmap", toolbar: { show: false }, fontFamily: FONT, background: "transparent" },
    dataLabels: { enabled: false },
    colors: ["#0f172a"],
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.65, radius: 4, useFillColorAsStroke: false,
        colorScale: {
          ranges: [
            { from: 0, to: 0.001, color: "#f8fafc", name: "None" },
            { from: 0.001, to: 1, color: "#cbd5e1", name: "Low" },
            { from: 1, to: 3, color: "#64748b", name: "Mid" },
            { from: 3, to: 999999, color: "#0f172a", name: "High" },
          ],
        },
      },
    },
    xaxis: { labels: { style: { colors: MUTED, fontSize: "11px" } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: MUTED, fontSize: "11px" } } },
    tooltip: { ...TT, y: { formatter: (v) => fmt(v) } },
  };
  if (loading) return <Sk className="h-36 w-full" />;
  if (!series.length) return <div className="h-20 flex items-center justify-center text-gray-300 text-sm">No data</div>;
  return <ReactApexChart options={opts} series={series} type="heatmap" height={series.length > 1 ? 160 : 100} />;
}

function GrowthLineChart({ data, loading }) {
  const growth = data.slice(1).map((d, i) => {
    const prev = data[i].total_net || 0;
    const curr = d.total_net || 0;
    return { x: fmtMonth(d.month), y: prev > 0 ? +((((curr - prev) / prev) * 100).toFixed(1)) : 0 };
  });
  const opts = {
    chart: { type: "line", toolbar: { show: false }, fontFamily: FONT, background: "transparent", animations: { speed: 600 } },
    stroke: { curve: "smooth", width: 2.5 },
    colors: ["#0f172a"],
    markers: { size: 4, colors: ["#0f172a"], strokeWidth: 0, hover: { size: 6 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: growth.map((g) => g.x),
      labels: { style: { colors: MUTED, fontSize: "11px" } },
      axisBorder: { show: false }, axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: MUTED, fontSize: "11px", fontWeight: '600' }, formatter: (v) => `${v > 0 ? "+" : ""}${v}%` } },
    grid: { borderColor: GRID, strokeDashArray: 4 },
    annotations: { yaxis: [{ y: 0, borderColor: "#e2e8f0", borderWidth: 1.5, strokeDashArray: 4 }] },
    tooltip: { ...TT, y: { formatter: (v) => `${v > 0 ? "+" : ""}${v}%` } },
  };
  if (loading) return <Sk className="h-48 w-full" />;
  if (growth.length < 2) return <div className="h-24 flex items-center justify-center text-gray-300 text-sm">Need more months for growth data</div>;
  return <ReactApexChart options={opts} series={[{ name: "MoM Growth", data: growth.map((g) => g.y) }]} type="line" height={200} />;
}

// ══ PAGE ══════════════════════════════════════════════════════════════════════
export default function FreelancerEarningsPage() {
  const [mounted,  setMounted]  = useState(false);
  const [summary,  setSummary]  = useState(null);
  const [monthly,  setMonthly]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [tab,      setTab]      = useState("overview");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [sRes, mRes] = await Promise.all([
          apiPrivate.get("freelancer/earnings/summary/"),
          apiPrivate.get("freelancer/earnings/monthly/"),
        ]);
        setSummary(sRes.data);
        setMonthly(Array.isArray(mRes.data) ? mRes.data : []);
      } catch { setError("Failed to load earnings data."); }
      finally   { setLoading(false); }
    })();
  }, []);

  if (!mounted) return null;

  // derived
  const totalNet   = summary?.total_net    ?? null;
  const totalGross = summary?.total_gross  ?? null;
  const totalFee   = summary?.platform_fee ?? null;
  const invoices   = summary?.invoice_count ?? null;
  const feeRate    = totalGross > 0 ? ((totalFee / totalGross) * 100).toFixed(1) : null;

  const cur     = monthly[monthly.length - 1] ?? null;
  const prev    = monthly[monthly.length - 2] ?? null;
  const change  = pct(cur?.total_net, prev?.total_net);
  const changeP = change !== null && parseFloat(change) >= 0;

  const avgMonthly = monthly.length > 0
    ? monthly.reduce((s, d) => s + (d.total_net ?? 0), 0) / monthly.length : null;

  const best = monthly.reduce((b, d) => ((d.total_net ?? 0) > (b?.total_net ?? 0) ? d : b), null);

  const KPIS = [
    {
      label: "Total Net Earned", value: loading ? null : fmt(totalNet, 2),
      sub: loading ? null : `Gross: ${fmt(totalGross, 0)}`, icon: Wallet, dark: true,
    },
    {
      label: "This Month", value: loading ? null : fmt(cur?.total_net, 2),
      sub: change !== null ? `${changeP ? "+" : ""}${change}% vs last month` : null,
      icon: changeP ? TrendingUp : TrendingDown,
      subColor: changeP ? "text-emerald-500" : "text-red-400",
    },
    {
      label: "Platform Fee", value: loading ? null : fmt(totalFee, 2),
      sub: feeRate ? `${feeRate}% of gross` : null,
      icon: BadgePercent, subColor: "text-red-400",
    },
    {
      label: "Invoices", value: loading ? null : (invoices ?? "—"),
      sub: avgMonthly ? `Avg ${fmtShort(avgMonthly)}/mo` : null,
      icon: Receipt,
    },
  ];

  const TABS = [
    { id: "overview", label: "Overview",      icon: Activity  },
    { id: "charts",   label: "Analytics",     icon: BarChart2 },
    { id: "monthly",  label: "Monthly Table", icon: Calendar  },
  ];

  return (
    <div className="lg:ml-0 pt-16 w-full min-h-screen bg-slate-50">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Serif+Display&display=swap');`}</style>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-10" style={{ fontFamily: FONT }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between py-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Link href="/freelancer/dashboard" className="hover:text-slate-700 transition-colors">Dashboard</Link>
                <span>/</span>
                <span className="text-slate-700 font-medium">Earnings</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight"
                style={{ fontFamily: "'DM Serif Display', serif" }}>
                Earnings Analytics
              </h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex -mb-px">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
                  tab === t.id
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}>
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5" style={{ fontFamily: FONT }}>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-xs">{error}</div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {KPIS.map((k, i) => (
            <div key={i}
              className={`rounded-2xl p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                k.dark ? "bg-slate-900 text-white" : "bg-white border border-slate-200"
              }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-medium uppercase tracking-widest ${k.dark ? "text-slate-400" : "text-slate-400"}`}>
                  {k.label}
                </span>
                <div className={`p-1.5 rounded-lg ${k.dark ? "bg-white/10" : "bg-slate-100"}`}>
                  <k.icon className={`w-3.5 h-3.5 ${k.dark ? "text-slate-300" : "text-slate-500"}`} />
                </div>
              </div>
              {k.value === null
                ? <Sk className={`h-8 w-28 ${k.dark ? "bg-white/10" : ""}`} />
                : <p className={`text-xl lg:text-2xl font-bold tracking-tight ${k.dark ? "text-white" : "text-slate-900"}`}>{k.value}</p>
              }
              {k.sub === null && loading
                ? <Sk className={`h-3 w-20 ${k.dark ? "bg-white/10" : ""}`} />
                : k.sub
                  ? <p className={`text-[11px] font-medium ${k.subColor ?? (k.dark ? "text-slate-400" : "text-slate-400")}`}>{k.sub}</p>
                  : null
              }
            </div>
          ))}
        </div>

        {/* ══ OVERVIEW ══════════════════════════════════════════════════ */}
        {tab === "overview" && (
          <div className="space-y-4">

            {/* Area + Radial */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h2 className="font-semibold text-slate-900 text-sm">Net vs Gross Over Time</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Area chart — all recorded months</p>
                  </div>
                  {!loading && change !== null && (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg ${changeP ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                      {changeP ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(change)}% MoM
                    </span>
                  )}
                </div>
                <AreaChart data={monthly} loading={loading} />
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h2 className="font-semibold text-slate-900 text-sm mb-0.5">Earnings Split</h2>
                <p className="text-[11px] text-slate-400">Net vs Platform Fee</p>
                <RadialBarChart net={totalNet ?? 0} gross={totalGross ?? 0} loading={loading} />
              </div>
            </div>

            {/* Donut + Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h2 className="font-semibold text-slate-900 text-sm mb-0.5">Net by Month (Last 6)</h2>
                <p className="text-[11px] text-slate-400 mb-1">Donut — share per month</p>
                <DonutChart data={monthly} loading={loading} />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h2 className="font-semibold text-slate-900 text-sm mb-0.5">Month-over-Month Growth</h2>
                <p className="text-[11px] text-slate-400 mb-1">% change in net earnings</p>
                <GrowthLineChart data={monthly} loading={loading} />
              </div>
            </div>

            {/* Heatmap */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h2 className="font-semibold text-slate-900 text-sm mb-0.5">Earnings Heatmap</h2>
              <p className="text-[11px] text-slate-400 mb-3">Intensity by month across years (darker = more earnings)</p>
              <HeatmapChart data={monthly} loading={loading} />
            </div>

            {/* Stat highlights */}
            {!loading && monthly.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Best Month",      val: fmt(best?.total_net, 2), note: fmtMonth(best?.month),                  cls: "bg-emerald-50 border-emerald-100 text-emerald-700" },
                  { label: "Monthly Average", val: fmt(avgMonthly, 2),      note: `${monthly.length} months recorded`,     cls: "bg-blue-50 border-blue-100 text-blue-700" },
                  { label: "Avg Fee Rate",    val: feeRate ? `${feeRate}%` : "—", note: "Of gross per invoice",           cls: "bg-orange-50 border-orange-100 text-orange-700" },
                ].map((s, i) => (
                  <div key={i} className={`border rounded-2xl px-5 py-4 ${s.cls}`}>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
                    <p className="text-xl font-bold">{s.val}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{s.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ ANALYTICS ═════════════════════════════════════════════════ */}
        {tab === "charts" && (
          <div className="space-y-4">

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h2 className="font-semibold text-slate-900 text-sm mb-0.5">Grouped Bar — Gross / Fee / Net</h2>
              <p className="text-[11px] text-slate-400 mb-1">Side-by-side comparison per month</p>
              <GroupedBarChart data={monthly.slice(-8)} loading={loading} />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <div>
                  <h2 className="font-semibold text-slate-900 text-sm">Candlestick View</h2>
                  <p className="text-[11px] text-slate-400">High=Gross · Close=Net · Open=Avg · Low=Fee</p>
                </div>
                <div className="flex gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-900 rounded-sm inline-block" /> Net ≥ Avg</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-200 rounded-sm inline-block" /> Net &lt; Avg</span>
                </div>
              </div>
              <CandlestickChart data={monthly} loading={loading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h2 className="font-semibold text-slate-900 text-sm mb-0.5">Growth Rate Trend</h2>
                <p className="text-[11px] text-slate-400 mb-1">MoM % change in net earnings</p>
                <GrowthLineChart data={monthly} loading={loading} />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h2 className="font-semibold text-slate-900 text-sm mb-0.5">Net Share — Last 6 Months</h2>
                <p className="text-[11px] text-slate-400 mb-1">Donut breakdown</p>
                <DonutChart data={monthly} loading={loading} />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h2 className="font-semibold text-slate-900 text-sm mb-0.5">Calendar Heatmap</h2>
              <p className="text-[11px] text-slate-400 mb-3">Net earnings by month and year</p>
              <HeatmapChart data={monthly} loading={loading} />
            </div>
          </div>
        )}

        {/* ══ MONTHLY TABLE ══════════════════════════════════════════════ */}
        {tab === "monthly" && (
          <div className="space-y-4">

            {!loading && summary && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Gross", val: fmt(totalGross, 2), color: "text-slate-700" },
                  { label: "Total Fee",   val: fmt(totalFee, 2),   color: "text-red-500" },
                  { label: "Total Net",   val: fmt(totalNet, 2),   color: "text-emerald-600" },
                ].map((r, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl px-5 py-4 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">{r.label}</p>
                    <p className={`text-lg font-bold ${r.color}`}>{r.val}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 text-sm">All Monthly Records</h2>
                <span className="text-[11px] text-slate-400">{monthly.length} months</span>
              </div>

              {loading ? (
                <div className="p-5 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      {[20, 24, 20, 16, 24, 14, 20].map((w, j) => <Sk key={j} className={`h-4 w-${w}`} />)}
                    </div>
                  ))}
                </div>
              ) : monthly.length === 0 ? (
                <div className="py-16 text-center text-slate-300 text-sm">No earnings data recorded yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50">
                        {["Month","Gross","Fee","Fee %","Net","vs Prev","Fee Bar"].map((h) => (
                          <th key={h} className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-left whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[...monthly].reverse().map((row, i, arr) => {
                        const prevRow = arr[i + 1];
                        const diff    = prevRow ? pct(row.total_net, prevRow.total_net) : null;
                        const diffPos = diff !== null && parseFloat(diff) >= 0;
                        const rf      = row.total_gross > 0
                          ? ((row.platform_fee / row.total_gross) * 100).toFixed(1) : null;
                        return (
                          <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">{fmtMonth(row.month)}</td>
                            <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{fmt(row.total_gross)}</td>
                            <td className="px-5 py-3.5 text-red-400 whitespace-nowrap">{fmt(row.platform_fee)}</td>
                            <td className="px-5 py-3.5 text-slate-400">{rf ? `${rf}%` : "—"}</td>
                            <td className="px-5 py-3.5 font-semibold text-slate-900 whitespace-nowrap">{fmt(row.total_net)}</td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {diff === null
                                ? <span className="text-slate-200">—</span>
                                : <span className={`inline-flex items-center gap-0.5 font-semibold ${diffPos ? "text-emerald-500" : "text-red-400"}`}>
                                    {diffPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {Math.abs(diff)}%
                                  </span>
                              }
                            </td>
                            <td className="px-5 py-3.5">
                              {rf
                                ? <div className="w-20 bg-slate-100 rounded-full h-1.5"><div className="bg-red-300 h-1.5 rounded-full" style={{ width: `${Math.min(rf, 100)}%` }} /></div>
                                : "—"
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-900 text-white">
                        <td className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wide">Total</td>
                        <td className="px-5 py-3.5 font-semibold">{fmt(totalGross, 2)}</td>
                        <td className="px-5 py-3.5 font-semibold text-red-300">{fmt(totalFee, 2)}</td>
                        <td className="px-5 py-3.5 text-slate-400">{feeRate ? `${feeRate}%` : "—"}</td>
                        <td className="px-5 py-3.5 font-bold text-emerald-300">{fmt(totalNet, 2)}</td>
                        <td className="px-5 py-3.5 text-slate-500">—</td>
                        <td className="px-5 py-3.5">
                          {feeRate
                            ? <div className="w-20 bg-slate-700 rounded-full h-1.5"><div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${Math.min(feeRate, 100)}%` }} /></div>
                            : "—"
                          }
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}