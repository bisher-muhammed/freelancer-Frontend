'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { apiPrivate } from '@/lib/apiPrivate';
import {
  Search, RefreshCw, Filter, Download, DollarSign,
  User, FileText, Calendar, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Layers, ChevronLeft, ChevronRight
} from 'lucide-react';

// ── Entry types matched to actual API values ──────────────────────────────────
const ENTRY_TYPES = {
  escrow_deposit:          { label: 'Escrow Deposit',    color: 'bg-blue-100 text-blue-800 border-blue-200',     dot: 'bg-blue-500' },
  escrow_refundable:       { label: 'Escrow Refundable', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
  freelancer_payout:       { label: 'Freelancer Payout', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  freelancer_gross_earned: { label: 'Gross Earned',      color: 'bg-green-100 text-green-800 border-green-200',  dot: 'bg-green-500' },
  client_refund_executed:  { label: 'Client Refund',     color: 'bg-red-100 text-red-800 border-red-200',        dot: 'bg-red-500' },
  platform_fee:            { label: 'Platform Fee',      color: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
  subscription:            { label: 'Subscription',      color: 'bg-indigo-100 text-indigo-800 border-indigo-200', dot: 'bg-indigo-500' },
};

// Types considered as "income / positive" for colour-coding amount column
const POSITIVE_TYPES = new Set([
  'escrow_deposit',
  'freelancer_payout',
  'freelancer_gross_earned',
  'subscription',
]);

const PAGE_SIZE = 20;

export default function LedgerAdminPage() {
  const [entries, setEntries]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [search, setSearch]             = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange]       = useState('all');
  const [sortBy, setSortBy]             = useState('-created_at');
  const [users, setUsers]               = useState([]);
  const [selectedUser, setSelectedUser] = useState('all');
  const [pagination, setPagination]     = useState({ count: 0, next: null, previous: null });
  const [page, setPage]                 = useState(1);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchLedgerEntries = async (pageNum = 1) => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('entry_type', selectedType);
      if (selectedUser !== 'all') params.append('user', selectedUser);
      params.append('ordering', sortBy);
      params.append('page', pageNum.toString());

      const response = await apiPrivate.get(`admin/ledger/?${params.toString()}`);
      const raw = response.data;

      if (raw.results) {
        setEntries(raw.results);
        setPagination({ count: raw.count || 0, next: raw.next, previous: raw.previous });
      } else {
        setEntries(raw);
        setPagination({ count: raw.length, next: null, previous: null });
      }

      // ── Deduplicate users via Map (fixes duplicate-key warning) ──────────
      const data = raw.results || raw;
      const userMap = new Map();
      data
        .filter(e => e.user && e.user_email)
        .forEach(e => {
          if (!userMap.has(e.user)) {
            userMap.set(e.user, { id: e.user, email: e.user_email });
          }
        });
      setUsers(Array.from(userMap.values()));
    } catch (err) {
      console.error('Error fetching ledger entries:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchLedgerEntries(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, selectedUser, sortBy]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchLedgerEntries(newPage);
  };

  // ── Stats (current page) ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    let totalPositive = 0;
    let totalNegative = 0;
    const entryCounts = {};

    entries.forEach(entry => {
      const amount = parseFloat(entry.amount);
      if (POSITIVE_TYPES.has(entry.entry_type)) totalPositive += amount;
      else totalNegative += amount;
      entryCounts[entry.entry_type] = (entryCounts[entry.entry_type] || 0) + 1;
    });

    return {
      totalPositive: totalPositive.toFixed(2),
      totalNegative: totalNegative.toFixed(2),
      netBalance: (totalPositive - totalNegative).toFixed(2),
      totalEntries: pagination.count,
      entryCounts,
    };
  }, [entries, pagination.count]);

  // ── Client-side date / search filter ─────────────────────────────────────
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.created_at);

      if (dateRange !== 'all') {
        const now = new Date();
        if (dateRange === 'today') {
          const start = new Date(now); start.setHours(0, 0, 0, 0);
          if (entryDate < start) return false;
        } else if (dateRange === 'yesterday') {
          const start = new Date(now); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0);
          const end   = new Date(start); end.setHours(23, 59, 59, 999);
          if (entryDate < start || entryDate > end) return false;
        } else if (dateRange === 'week') {
          const start = new Date(now); start.setDate(start.getDate() - 7);
          if (entryDate < start) return false;
        } else if (dateRange === 'month') {
          const start = new Date(now); start.setMonth(start.getMonth() - 1);
          if (entryDate < start) return false;
        }
      }

      if (search) {
        const q = search.toLowerCase();
        return (
          entry.user_email?.toLowerCase().includes(q) ||
          entry.reference_id?.toLowerCase().includes(q) ||
          entry.amount?.toString().includes(q) ||
          entry.entry_type?.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [entries, dateRange, search]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);

  const fmtDate = (ts) =>
    new Date(ts).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getTypeInfo  = (type) => ENTRY_TYPES[type] ?? { label: type, color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' };

  const clearFilters = () => {
    setSearch(''); setSelectedType('all'); setSelectedUser('all');
    setDateRange('all'); setSortBy('-created_at'); setPage(1);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `ledger-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(pagination.count / PAGE_SIZE);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Ledger Administration</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor all financial transactions across the platform</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportData}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </button>
            <button
              onClick={() => fetchLedgerEntries(page)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#227C70] rounded-lg hover:bg-[#1a5f55] disabled:opacity-60 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total In */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total In</span>
              <div className="h-9 w-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{fmt(stats.totalPositive)}</div>
            <p className="text-xs text-gray-400 mt-1">Deposits, payouts & earned</p>
          </div>

          {/* Total Out */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Out</span>
              <div className="h-9 w-9 bg-red-50 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-500">{fmt(stats.totalNegative)}</div>
            <p className="text-xs text-gray-400 mt-1">Fees, refunds & deductions</p>
          </div>

          {/* Net Balance */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Net Balance</span>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${parseFloat(stats.netBalance) >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                <DollarSign className={`h-5 w-5 ${parseFloat(stats.netBalance) >= 0 ? 'text-blue-600' : 'text-orange-500'}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${parseFloat(stats.netBalance) >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
              {fmt(stats.netBalance)}
            </div>
            <p className="text-xs text-gray-400 mt-1">{pagination.count} total entries</p>
          </div>

          {/* Unique Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Users</span>
              <div className="h-9 w-9 bg-purple-50 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">{users.length}</div>
            <p className="text-xs text-gray-400 mt-1">Unique accounts on page</p>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              Filters
            </h2>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search email, reference, amount…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70] focus:border-transparent text-gray-900"
              />
            </div>

            {/* Entry Type */}
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70] focus:border-transparent text-gray-900 bg-white"
            >
              <option value="all">All Types</option>
              {Object.entries(ENTRY_TYPES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* User Filter — keys are now unique thanks to Map dedup */}
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70] focus:border-transparent text-gray-900 bg-white"
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.email}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70] focus:border-transparent text-gray-900 bg-white"
            >
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="-amount">Highest Amount</option>
              <option value="amount">Lowest Amount</option>
            </select>
          </div>

          {/* Date Range Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 mr-1">Date range:</span>
            {[
              { key: 'all',       label: 'All Time'  },
              { key: 'today',     label: 'Today'     },
              { key: 'yesterday', label: 'Yesterday' },
              { key: 'week',      label: 'Last 7 days' },
              { key: 'month',     label: 'Last 30 days' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDateRange(key)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  dateRange === key
                    ? 'bg-[#227C70] text-white border-[#227C70]'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table header bar */}
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Ledger Entries</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Showing {filteredEntries.length} of {pagination.count} entries · Page {page} of {totalPages || 1}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              <Layers className="h-3 w-3" />
              Admin View
            </span>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-16">
                <Filter className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">No entries found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['Date & Time', 'User', 'Type', 'Amount', 'Contract', 'Reference'].map(col => (
                          <th key={col} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredEntries.map(entry => {
                        const typeInfo  = getTypeInfo(entry.entry_type);
                        const isPositive = POSITIVE_TYPES.has(entry.entry_type);
                        return (
                          <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                            {/* Date */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{fmtDate(entry.created_at)}</div>
                                </div>
                              </div>
                            </td>

                            {/* User */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {entry.user ? (
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-[#e8f4f2] flex items-center justify-center flex-shrink-0">
                                    <User className="h-3.5 w-3.5 text-[#227C70]" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 max-w-[160px] truncate">
                                      {entry.user_email || `User #${entry.user}`}
                                    </div>
                                    <div className="text-xs text-gray-400">ID: {entry.user}</div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">System</span>
                              )}
                            </td>

                            {/* Type badge */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${typeInfo.color}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${typeInfo.dot}`} />
                                {typeInfo.label}
                              </span>
                            </td>

                            {/* Amount */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className={`inline-flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                                {isPositive
                                  ? <ArrowUpRight className="h-3.5 w-3.5" />
                                  : <ArrowDownRight className="h-3.5 w-3.5" />
                                }
                                {fmt(entry.amount)}
                              </div>
                            </td>

                            {/* Contract */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {entry.contract ? (
                                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                  <FileText className="h-3.5 w-3.5 text-gray-400" />
                                  <span className="font-mono">#{entry.contract}</span>
                                </div>
                              ) : (
                                <span className="text-gray-300 text-sm">—</span>
                              )}
                            </td>

                            {/* Reference */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {entry.reference_id ? (
                                <span className="inline-block bg-gray-100 text-gray-700 text-xs font-mono px-2 py-1 rounded">
                                  {entry.reference_id}
                                </span>
                              ) : (
                                <span className="text-gray-300 text-sm">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.count > PAGE_SIZE && (
                  <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm text-gray-500">
                      Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.count)} of {pagination.count} entries
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                      </button>
                      <span className="text-sm text-gray-600 px-2">
                        {page} / {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!pagination.next}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Entry type breakdown ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Entry Type Breakdown (current page)</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(ENTRY_TYPES).map(([key, { label, color, dot }]) => {
              const count = stats.entryCounts[key] || 0;
              if (count === 0) return null;
              return (
                <div key={key} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${color}`}>
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  {label}
                  <span className="font-bold">{count}</span>
                </div>
              );
            })}
            {Object.values(stats.entryCounts).every(c => c === 0) && (
              <span className="text-xs text-gray-400 italic">No entries on this page</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}