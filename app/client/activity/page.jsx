"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, MessageSquare, CreditCard, CheckCircle,
  Award, AlertCircle, Clock, Activity, ChevronLeft,
  Filter, Search, X, RefreshCw, Download,
} from "lucide-react";
import Link from "next/link";
import { apiPrivate } from "@/lib/apiPrivate";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTIVITY_META = {
  PROJECT_CREATED:    { icon: FileText,      bg: "bg-blue-500",    ring: "ring-blue-100",    label: "Project Created",    badge: "bg-blue-50 text-blue-700 border-blue-200"    },
  OFFER_RECEIVED:     { icon: MessageSquare, bg: "bg-violet-500",  ring: "ring-violet-100",  label: "Offer Received",     badge: "bg-violet-50 text-violet-700 border-violet-200"  },
  ESCROW_FUNDED:      { icon: CreditCard,    bg: "bg-emerald-500", ring: "ring-emerald-100", label: "Escrow Funded",      badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ESCROW_RELEASED:    { icon: CheckCircle,   bg: "bg-teal-500",    ring: "ring-teal-100",    label: "Escrow Released",    badge: "bg-teal-50 text-teal-700 border-teal-200"    },
  ESCROW_REFUNDED:    { icon: CreditCard,    bg: "bg-orange-500",  ring: "ring-orange-100",  label: "Escrow Refunded",    badge: "bg-orange-50 text-orange-700 border-orange-200"  },
  CONTRACT_COMPLETED: { icon: Award,         bg: "bg-indigo-500",  ring: "ring-indigo-100",  label: "Contract Completed", badge: "bg-indigo-50 text-indigo-700 border-indigo-200"  },
  DISPUTE_OPENED:     { icon: AlertCircle,   bg: "bg-red-500",     ring: "ring-red-100",     label: "Dispute Opened",     badge: "bg-red-50 text-red-700 border-red-200"       },
};

const ALL_TYPES = Object.keys(ACTIVITY_META);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now  = new Date();
  const diff = now - date; // ms
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  <  1) return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  <  7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatFullDate = (dateString) =>
  new Date(dateString).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });

// Group activities by calendar date
const groupByDate = (items) => {
  const groups = {};
  items.forEach((item) => {
    const d = new Date(item.created_at);
    const key = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {Array(6).fill(null).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 animate-pulse">
          <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/4" />
          </div>
          <div className="h-6 w-24 bg-slate-100 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Single activity row ──────────────────────────────────────────────────────

function ActivityRow({ activity, style }) {
  const meta = ACTIVITY_META[activity.activity_type] || {
    icon: Clock, bg: "bg-slate-400", ring: "ring-slate-100",
    label: activity.activity_type, badge: "bg-slate-50 text-slate-600 border-slate-200",
  };
  const Icon = meta.icon;

  return (
    <div
      className="group flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md hover:shadow-slate-100/80 transition-all duration-200 cursor-default"
      style={style}
      title={activity.created_at ? formatFullDate(activity.created_at) : ""}
    >
      {/* Icon */}
      <div className={`w-10 h-10 ${meta.bg} ring-4 ${meta.ring} rounded-xl shrink-0 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200`}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 leading-snug">
          {activity.description}
        </p>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {activity.time_ago || formatDate(activity.created_at)}
        </p>
      </div>

      {/* Badge */}
      <span className={`hidden sm:inline-flex items-center shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full border ${meta.badge}`}>
        {meta.label}
      </span>
    </div>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip({ type, active, onClick }) {
  const meta = ACTIVITY_META[type];
  if (!meta) return null;
  return (
    <button
      onClick={() => onClick(type)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
        active
          ? `${meta.badge} shadow-sm`
          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
      }`}
    >
      <meta.icon className="h-3 w-3" />
      {meta.label}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClientActivityPage() {
  const [activities, setActivities]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState("");
  const [activeFilters, setActiveFilters] = useState([]); // empty = all
  const [showFilters, setShowFilters]   = useState(false);
  const [page, setPage]                 = useState(1);
  const [hasMore, setHasMore]           = useState(false);
  const [totalCount, setTotalCount]     = useState(0);
  const PAGE_SIZE = 20;

  const fetchActivity = useCallback(async (pageNum = 1, replace = true) => {
    try {
      replace ? setLoading(true) : setRefreshing(true);
      setError(null);

      const params = new URLSearchParams({ page: pageNum, page_size: PAGE_SIZE });
      if (activeFilters.length) params.set("type", activeFilters.join(","));

      const { data } = await apiPrivate.get(`/client/activity/?${params}`);

      // Support both paginated { results, count } and plain array responses
      const results = Array.isArray(data) ? data : (data?.results ?? []);
      const count   = data?.count ?? results.length;

      setActivities((prev) => (replace ? results : [...prev, ...results]));
      setTotalCount(count);
      setHasMore(results.length === PAGE_SIZE && (pageNum * PAGE_SIZE) < count);
      setPage(pageNum);
    } catch (err) {
      console.error("Activity fetch error:", err);
      setError("Failed to load activity. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilters]);

  // Refetch when filters change
  useEffect(() => { fetchActivity(1, true); }, [activeFilters]);

  const toggleFilter = (type) => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => setActiveFilters([]);

  // Client-side search filter
  const filtered = activities.filter((a) => {
    if (!search.trim()) return true;
    return a.description?.toLowerCase().includes(search.toLowerCase());
  });

  const grouped = groupByDate(filtered);
  const groupKeys = Object.keys(grouped);

  const loadMore = () => fetchActivity(page + 1, false);

  const handleRefresh = () => fetchActivity(1, true);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .activity-root { font-family: 'DM Sans', sans-serif; }
        .brand-font { font-family: 'Syne', sans-serif; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-up {
          animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.1) both;
        }
      `}</style>

      <div className="activity-root min-h-screen bg-[#f8f9fb] p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 slide-up">
            <div>
              <Link
                href="/client/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#227C70] transition-colors mb-3"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back to Dashboard
              </Link>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 bg-[#227C70] rounded-xl flex items-center justify-center shadow-sm shadow-[#227C70]/20">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h1 className="brand-font text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Activity Log
                </h1>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                {loading ? "Loading…" : `${totalCount} total event${totalCount !== 1 ? "s" : ""} across all your projects`}
              </p>
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97] transition-all disabled:opacity-40"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* ── Search + filter bar ── */}
          <div className="space-y-3 slide-up" style={{ animationDelay: "0.05s" }}>
            <div className="flex gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search activity…"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#227C70] focus:ring-2 focus:ring-[#227C70]/10 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters((s) => !s)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 border text-sm font-semibold rounded-xl transition-all ${
                  activeFilters.length
                    ? "bg-[#227C70] text-white border-[#227C70] shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                <Filter className="h-4 w-4" />
                Filter
                {activeFilters.length > 0 && (
                  <span className="bg-white text-[#227C70] text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {activeFilters.length}
                  </span>
                )}
              </button>
            </div>

            {/* Filter chips */}
            {showFilters && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Filter by type</p>
                  {activeFilters.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALL_TYPES.map((type) => (
                    <FilterChip
                      key={type}
                      type={type}
                      active={activeFilters.includes(type)}
                      onClick={toggleFilter}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Content ── */}
          {loading ? (
            <ActivitySkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-red-100">
              <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
              <p className="text-sm font-semibold text-slate-700 mb-1">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-[#227C70] text-white text-sm font-semibold rounded-xl hover:bg-[#1a5f55] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-100">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-base font-bold text-slate-700 mb-1">
                {search || activeFilters.length ? "No matching activity" : "No activity yet"}
              </p>
              <p className="text-sm text-slate-400 max-w-xs">
                {search || activeFilters.length
                  ? "Try adjusting your search or filters."
                  : "Events from your projects will appear here as they happen."}
              </p>
              {(search || activeFilters.length > 0) && (
                <button
                  onClick={() => { setSearch(""); clearFilters(); }}
                  className="mt-5 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {groupKeys.map((dateKey, groupIndex) => (
                <div key={dateKey} className="space-y-2">
                  {/* Date separator */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {dateKey}
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  {/* Activity rows */}
                  <div className="space-y-2">
                    {grouped[dateKey].map((activity, i) => (
                      <div
                        key={activity.id || `${groupIndex}-${i}`}
                        className="slide-up"
                        style={{ animationDelay: `${(groupIndex * 3 + i) * 30}ms` }}
                      >
                        <ActivityRow activity={activity} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Load more */}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={loadMore}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97] transition-all disabled:opacity-40"
                  >
                    {refreshing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading…
                      </>
                    ) : (
                      "Load more"
                    )}
                  </button>
                </div>
              )}

              {/* End of list */}
              {!hasMore && filtered.length > 0 && (
                <p className="text-center text-xs text-slate-400 font-medium py-2">
                  You've reached the end · {filtered.length} event{filtered.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
