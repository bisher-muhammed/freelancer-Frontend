'use client';
import { useState, useEffect } from "react";
import { apiPrivate } from "@/lib/apiPrivate";
import Link from "next/link";
import {
  Eye, Search, Filter, DollarSign, User, Clock,
  FileText, RefreshCw, X, Package, CheckCircle,
  AlertCircle, TrendingUp, ChevronDown,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusStyle(status) {
  switch (status?.toLowerCase()) {
    case 'open':
    case 'active':    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'closed':
    case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'pending':   return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
    default:          return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function getBudgetStyle(type) {
  return type === 'fixed'
    ? 'bg-violet-50 text-violet-700 border-violet-200'
    : 'bg-orange-50 text-orange-700 border-orange-200';
}

function StatusIcon({ status }) {
  const cls = "h-3 w-3 mr-1 shrink-0";
  switch (status?.toLowerCase()) {
    case 'open':
    case 'active':    return <CheckCircle className={cls} />;
    case 'closed':
    case 'completed': return <Package     className={cls} />;
    case 'pending':   return <Clock       className={cls} />;
    case 'cancelled': return <X           className={cls} />;
    default:          return <AlertCircle className={cls} />;
  }
}

function formatDate(d) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(d));
}

function formatBudget(project) {
  if (project.budget_type === 'fixed')
    return `$${Number(project.fixed_budget).toLocaleString()}`;
  return `$${Number(project.hourly_min_rate).toLocaleString()}–$${Number(project.hourly_max_rate).toLocaleString()}/hr`;
}

/**
 * FIX: Was always returning fixed_budget regardless of `side` for fixed
 * projects, making budget_high and budget_low sorts identical for fixed.
 * Now returns the correct boundary value for each budget type.
 */
function getBudgetValue(project, side) {
  if (project.budget_type === 'fixed') return Number(project.fixed_budget) || 0;
  return side === 'high'
    ? Number(project.hourly_max_rate) || 0
    : Number(project.hourly_min_rate) || 0;
}

function capitalize(str) {
  if (!str) return 'N/A';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Stat card ────────────────────────────────────────────────────────────────
const ACCENTS = {
  blue:   { bg: 'bg-blue-50',    icon: 'text-blue-500',    val: 'text-blue-700',    bar: 'bg-blue-500'    },
  green:  { bg: 'bg-emerald-50', icon: 'text-emerald-500', val: 'text-emerald-700', bar: 'bg-emerald-500' },
  sky:    { bg: 'bg-sky-50',     icon: 'text-sky-500',     val: 'text-sky-700',     bar: 'bg-sky-500'     },
  violet: { bg: 'bg-violet-50',  icon: 'text-violet-500',  val: 'text-violet-700',  bar: 'bg-violet-500'  },
  amber:  { bg: 'bg-amber-50',   icon: 'text-amber-500',   val: 'text-amber-700',   bar: 'bg-amber-500'   },
  red:    { bg: 'bg-red-50',     icon: 'text-red-500',     val: 'text-red-700',     bar: 'bg-red-500'     },
};

function StatCard({ icon: Icon, label, value, accent, loading }) {
  const a = ACCENTS[accent] ?? ACCENTS.blue;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className={`h-1 ${a.bar}`} />
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-xl sm:text-2xl font-bold ${a.val}`}>
              {loading
                ? <span className="inline-block w-8 h-6 bg-gray-100 rounded animate-pulse" />
                : value}
            </p>
            <p className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wide leading-tight">{label}</p>
          </div>
          <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${a.bg}`}>
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${a.icon}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile project card ──────────────────────────────────────────────────────
function ProjectCard({ project }) {
  return (
    <div className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="min-w-0 flex-1 pr-2">
          <span className="text-[10px] font-bold text-gray-400 tracking-wider">#{project.id}</span>
          <h3 className="text-sm font-semibold text-gray-900 truncate">{project.title}</h3>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${getStatusStyle(project.status)}`}>
          <StatusIcon status={project.status} />
          {capitalize(project.status)}
        </span>
      </div>
      <div className="space-y-1 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-gray-300 shrink-0" />
          <span className="truncate">{project.client_email}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-gray-300 shrink-0" />
          <span className="font-semibold text-gray-700">{formatBudget(project)}</span>
        </div>
        <span className="text-gray-300">{formatDate(project.created_at)}</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getBudgetStyle(project.budget_type)}`}>
          {capitalize(project.budget_type)}
        </span>
        <Link
          href={`/admin/projects/${project.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-100 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />View
        </Link>
      </div>
    </div>
  );
}

// ─── FilterSelect ─────────────────────────────────────────────────────────────
function FilterSelect({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none pl-3 pr-7 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium cursor-pointer hover:border-gray-300 transition-colors"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
    </div>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────
const COLUMNS = [
  { label: 'ID',      width: '5%'  },
  { label: 'Project', width: '22%' },
  { label: 'Client',  width: '22%' },
  { label: 'Status',  width: '12%' },
  { label: 'Budget',  width: '14%' },
  { label: 'Type',    width: '10%' },
  { label: 'Date',    width: '10%' },
  { label: '',        width: '5%'  },
];

// ─── Filter option definitions ────────────────────────────────────────────────
const STATUS_OPTS  = [['','All Status'],['open','Open'],['active','Active'],['closed','Closed'],['pending','Pending'],['completed','Completed'],['cancelled','Cancelled']];
const BUDGET_OPTS  = [['','All Types'],['fixed','Fixed'],['hourly','Hourly']];
const SORT_OPTS    = [['newest','Newest'],['oldest','Oldest'],['budget_high','Budget ↓'],['budget_low','Budget ↑']];

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminProjectsPage() {
  const [projects, setProjects]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [sortBy, setSortBy]             = useState('newest');
  const [showFilters, setShowFilters]   = useState(false);

  const fetchProjects = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await apiPrivate.get('admin-projects/');
      setProjects(Array.isArray(data?.results) ? data.results : []);
    } catch {
      setError('Failed to fetch projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const filteredProjects = projects
    .filter((p) => {
      if (search &&
        !p.title?.toLowerCase().includes(search.toLowerCase()) &&
        !p.client_email?.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (budgetFilter && p.budget_type !== budgetFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':      return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':      return new Date(a.created_at) - new Date(b.created_at);
        case 'budget_high': return getBudgetValue(b, 'high') - getBudgetValue(a, 'high');
        case 'budget_low':  return getBudgetValue(a, 'low')  - getBudgetValue(b, 'low');
        default:            return 0;
      }
    });

  const clearFilters = () => {
    setSearch(''); setStatusFilter(''); setBudgetFilter(''); setSortBy('newest');
  };

  // FIX: compute active filter count without a boolean-in-array hack
  const activeFilterCount = (
    (search            ? 1 : 0) +
    (statusFilter      ? 1 : 0) +
    (budgetFilter      ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0)
  );
  const hasActiveFilters = activeFilterCount > 0;

  const stats = [
    { icon: FileText,    label: 'Total',     value: projects.length,                                                                        accent: 'blue'   },
    { icon: TrendingUp,  label: 'Active',    value: projects.filter(p => ['open','active'].includes(p.status?.toLowerCase())).length,        accent: 'green'  },
    { icon: CheckCircle, label: 'Completed', value: projects.filter(p => ['completed','closed'].includes(p.status?.toLowerCase())).length,   accent: 'sky'    },
    { icon: DollarSign,  label: 'Fixed',     value: projects.filter(p => p.budget_type === 'fixed').length,                                  accent: 'violet' },
    { icon: Clock,       label: 'Pending',   value: projects.filter(p => p.status?.toLowerCase() === 'pending').length,                     accent: 'amber'  },
    { icon: X,           label: 'Cancelled', value: projects.filter(p => p.status?.toLowerCase() === 'cancelled').length,                   accent: 'red'    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/80 p-3 sm:p-4 space-y-4">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-sm shadow-blue-200 shrink-0">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight">Project Management</h1>
            <p className="text-gray-400 text-xs mt-0.5 hidden sm:block">Monitor and manage all platform projects</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop refresh */}
          <button
            onClick={fetchProjects}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
          >
            <RefreshCw className="h-4 w-4" /><span>Refresh</span>
          </button>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className="sm:hidden relative p-2 rounded-lg bg-white border border-gray-200 shadow-sm"
            aria-label="Toggle filters"
          >
            <Filter className="h-5 w-5 text-gray-600" />
            {hasActiveFilters && (
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      {/* FIX: was grid-cols-3 on mobile — 6 cards in 3 cols is too cramped.
               Now 2 cols on mobile → 3 on sm → 6 on lg. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {stats.map((s) => <StatCard key={s.label} {...s} loading={loading} />)}
      </div>

      {/* ── Search + filters ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or client email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-800"
            />
          </div>

          {/* Desktop filter controls */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUS_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </FilterSelect>
            <FilterSelect value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)}>
              {BUDGET_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </FilterSelect>
            <FilterSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </FilterSelect>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="h-3.5 w-3.5" />Clear
              </button>
            )}
          </div>
        </div>

        {/* Mobile filter panel */}
        {showFilters && (
          <div className="sm:hidden mt-3 pt-3 border-t border-gray-100 space-y-2">
            {/* FIX: use stable keys (filter names) instead of array index */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              >
                {STATUS_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <div className="relative">
              <select
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              >
                {BUDGET_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              >
                {SORT_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="h-3.5 w-3.5" />Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Table / cards ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <p className="text-sm text-gray-500">
            {loading ? 'Loading…' : (
              <><span className="font-semibold text-gray-800">{filteredProjects.length}</span> project{filteredProjects.length !== 1 ? 's' : ''}</>
            )}
          </p>
          <button
            onClick={fetchProjects}
            className="sm:hidden flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />Refresh
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="p-5 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-100 rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <p className="text-gray-800 font-semibold mb-1">Something went wrong</p>
            <p className="text-gray-400 text-sm mb-5">{error}</p>
            <button
              onClick={fetchProjects}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-4">
              <FileText className="h-7 w-7 text-gray-400" />
            </div>
            <p className="text-gray-700 font-semibold mb-1">No projects found</p>
            <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm font-semibold text-blue-600 hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredProjects.length > 0 && (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden">
              {filteredProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>

            {/* Desktop table
                FIX: wrapped in overflow-x-auto so it scrolls horizontally
                on mid-range viewports (640px–1024px) instead of overflowing. */}
            <div className="hidden sm:block w-full overflow-x-auto">
              <table className="w-full min-w-[680px] table-fixed border-collapse text-sm">
                <colgroup>{COLUMNS.map((c) => <col key={c.label} style={{ width: c.width }} />)}</colgroup>
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    {COLUMNS.map((c) => (
                      <th
                        key={c.label}
                        className="px-3 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider"
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project, idx) => (
                    <tr
                      key={project.id}
                      className={`border-b border-gray-100 last:border-0 hover:bg-blue-50/30 transition-colors ${idx % 2 !== 0 ? 'bg-gray-50/20' : ''}`}
                    >
                      {/* ID */}
                      <td className="px-3 py-3.5">
                        <span className="text-xs font-bold text-gray-400">#{project.id}</span>
                      </td>

                      {/* Project */}
                      <td className="px-3 py-3.5 overflow-hidden">
                        <p className="font-semibold text-gray-900 truncate text-sm">{project.title}</p>
                      </td>

                      {/* Client */}
                      <td className="px-3 py-3.5 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <User className="h-2.5 w-2.5 text-blue-500" />
                          </div>
                          <span className="text-gray-600 text-xs truncate">{project.client_email}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusStyle(project.status)}`}>
                          <StatusIcon status={project.status} />
                          {capitalize(project.status)}
                        </span>
                      </td>

                      {/* Budget */}
                      <td className="px-3 py-3.5 overflow-hidden">
                        <span className="font-semibold text-gray-800 text-xs truncate block">{formatBudget(project)}</span>
                      </td>

                      {/* Type */}
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getBudgetStyle(project.budget_type)}`}>
                          {capitalize(project.budget_type)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3.5 overflow-hidden">
                        <span className="text-xs text-gray-400 truncate block">{formatDate(project.created_at)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3.5">
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-100 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
