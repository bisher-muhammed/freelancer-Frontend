"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  Eye,
  FileText,
  IndianRupee,
  Lock,
  Receipt,
  RefreshCw,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { apiPrivate } from "@/lib/apiPrivate";
import { cn } from "@/lib/utils";

// Mirrors BillingUnit.STATUS_CHOICES in the backend (apps/billing/models.py).
const STATUS_CONFIG = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800", icon: AlertCircle },
  approved: { label: "Approved", className: "bg-blue-100 text-blue-800", icon: CheckCircle },
  rejected: { label: "Rejected", className: "bg-rose-100 text-rose-800", icon: XCircle },
  locked: { label: "Locked", className: "bg-purple-100 text-purple-800", icon: Lock },
  paid: { label: "Paid", className: "bg-emerald-100 text-emerald-800", icon: CreditCard },
};

const UNKNOWN_STATUS = { className: "bg-gray-100 text-gray-800", icon: AlertCircle };

const SORTERS = {
  created_at: (a, b) => new Date(a.created_at) - new Date(b.created_at),
  gross_amount: (a, b) => toNumber(a.gross_amount) - toNumber(b.gross_amount),
};

const STAT_TONES = {
  blue: { card: "from-blue-50 border-blue-100", icon: "text-blue-600" },
  amber: { card: "from-amber-50 border-amber-100", icon: "text-amber-600" },
  emerald: { card: "from-emerald-50 border-emerald-100", icon: "text-emerald-600" },
  purple: { card: "from-purple-50 border-purple-100", icon: "text-purple-600" },
};

const TH_CLASS = "px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider";

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "INR" });
const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" });

// Decimal fields arrive from DRF as strings ("1250.00").
function toNumber(value) {
  return Number.parseFloat(value) || 0;
}


const formatCurrency = (amount) => currencyFormatter.format(toNumber(amount));
const toHours = (seconds = 0) => Math.round((seconds / 3600) * 100) / 100;

// Matches the labels shown in the table, so "session 51" or "#51" finds "Session #51".
function matchesSearch(unit, query) {
  if (!query) return true;
  const haystack = [
    unit.id,
    `session ${unit.session}`,
    `freelancer ${unit.freelancer}`,
    `contract ${unit.contract}`,
    unit.gross_amount,
    STATUS_CONFIG[unit.status]?.label ?? unit.status,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function getErrorMessage(error) {
  return error.response?.data?.detail || "Failed to load billing units. Please try again.";
}

export default function AdminBillingPage() {
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState({ key: "created_at", direction: "desc" });

  const loadUnits = useCallback(async (signal) => {
    try {
      const { data } = await apiPrivate.get("admin/billing-units/", { signal });
      setUnits(Array.isArray(data) ? data : data?.results ?? []);
      setError(null);
    } catch (err) {
      if (!signal?.aborted) setError(getErrorMessage(err));
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadUnits(controller.signal);
    return () => controller.abort();
  }, [loadUnits]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadUnits();
  };

  const handleSort = (key) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredUnits = useMemo(() => {
    const query = searchTerm.trim().toLowerCase().replaceAll("#", "");
    return units.filter(
      (unit) =>
        (statusFilter === "all" || unit.status === statusFilter) && matchesSearch(unit, query)
    );
  }, [units, searchTerm, statusFilter]);

  const sortedUnits = useMemo(() => {
    const direction = sort.direction === "asc" ? 1 : -1;
    return [...filteredUnits].sort((a, b) => SORTERS[sort.key](a, b) * direction);
  }, [filteredUnits, sort]);

  const summary = useMemo(() => {
    const countByStatus = {};
    let totalAmount = 0;
    let billableSeconds = 0;
    for (const unit of filteredUnits) {
      totalAmount += toNumber(unit.gross_amount);
      billableSeconds += unit.billable_seconds ?? 0;
      countByStatus[unit.status] = (countByStatus[unit.status] ?? 0) + 1;
    }
    return {
      totalAmount,
      totalHours: toHours(billableSeconds),
      pendingCount: countByStatus.pending ?? 0,
      approvedCount: countByStatus.approved ?? 0,
    };
  }, [filteredUnits]);

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Billing Management</h1>
            <p className="text-gray-600 mt-2">Manage and review all billing units and payments</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 font-medium rounded-xl transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="font-medium underline underline-offset-2 hover:text-rose-900 disabled:opacity-60"
            >
              Try again
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Billing"
            value={formatCurrency(summary.totalAmount)}
            hint={`${filteredUnits.length} billing units`}
            icon={IndianRupee}
            tone="blue"
          />
          <StatCard
            label="Pending Review"
            value={summary.pendingCount}
            hint="Awaiting approval"
            icon={AlertCircle}
            tone="amber"
          />
          <StatCard
            label="Approved"
            value={summary.approvedCount}
            hint="Ready for payment"
            icon={CheckCircle}
            tone="emerald"
          />
          <StatCard
            label="Total Hours"
            value={summary.totalHours}
            hint="Billable hours"
            icon={Clock}
            tone="purple"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="search"
                aria-label="Search billing units"
                placeholder="Search by ID, session, freelancer, amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="relative w-full lg:w-48">
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="all">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <SortableHeader label="Created" sortKey="created_at" sort={sort} onSort={handleSort} />
                  <th scope="col" className={TH_CLASS}>Session</th>
                  <th scope="col" className={TH_CLASS}>Freelancer</th>
                  <SortableHeader label="Amount" sortKey="gross_amount" sort={sort} onSort={handleSort} />
                  <th scope="col" className={TH_CLASS}>Hours</th>
                  <th scope="col" className={TH_CLASS}>Status</th>
                  <th scope="col" className={TH_CLASS}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedUnits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Receipt className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">No billing units found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {error
                            ? "Billing data could not be loaded"
                            : hasActiveFilters
                              ? "Try adjusting your filters"
                              : "No billing data available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedUnits.map((unit) => <BillingRow key={unit.id} unit={unit} />)
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600">
          <div>
            Showing <span className="font-medium">{filteredUnits.length}</span> of{" "}
            <span className="font-medium">{units.length}</span> billing units
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Pending: {summary.pendingCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Approved: {summary.approvedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingRow({ unit }) {
  const createdAt = new Date(unit.created_at);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{dateFormatter.format(createdAt)}</span>
          <span className="text-xs text-gray-500">{timeFormatter.format(createdAt)}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">Session #{unit.session}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">Freelancer #{unit.freelancer}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">{formatCurrency(unit.gross_amount)}</span>
          <span className="text-xs text-gray-500">{formatCurrency(unit.hourly_rate)}/hr</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{toHours(unit.billable_seconds)}h</span>
          <span className="text-xs text-gray-500">{Math.round((unit.idle_seconds ?? 0) / 60)}m idle</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={unit.status} />
      </td>
      <td className="px-6 py-4">
        <Link
          href={`/admin/billing/${unit.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </Link>
      </td>
    </tr>
  );
}

function SortableHeader({ label, sortKey, sort, onSort }) {
  const isActive = sort.key === sortKey;
  const isAscending = sort.direction === "asc";
  const Arrow = isAscending ? ArrowUp : ArrowDown;

  return (
    <th
      scope="col"
      aria-sort={isActive ? (isAscending ? "ascending" : "descending") : "none"}
      className="px-6 py-4 text-left"
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
      >
        {label}
        {isActive && <Arrow className="w-3 h-3" />}
      </button>
    </th>
  );
}

function StatusBadge({ status }) {
  const { label, className, icon: Icon } =
    STATUS_CONFIG[status] ?? { ...UNKNOWN_STATUS, label: status ?? "Unknown" };

  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium", className)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function StatCard({ label, value, hint, icon: Icon, tone }) {
  const styles = STAT_TONES[tone];

  return (
    <div className={cn("bg-gradient-to-br to-white p-5 rounded-2xl border", styles.card)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm">
          <Icon className={cn("w-5 h-5", styles.icon)} />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{hint}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
          <Activity className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Billing Data</h3>
        <p className="text-gray-600">Please wait while we fetch billing information...</p>
      </div>
    </div>
  );
}
