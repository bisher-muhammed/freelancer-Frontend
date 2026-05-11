"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiPrivate } from "@/lib/apiPrivate";
import {
  Users, Briefcase, UserCheck, Shield, Ban,
  CheckCircle, Eye, Search, Filter, X,
  ChevronLeft, ChevronRight, Loader2,
  User, Mail, Calendar
} from 'lucide-react';
import Link from "next/link";

// ─── Debounce defined OUTSIDE component so it is stable ──────────────────────
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const PRIMARY = '#227C70';
const PRIMARY_LIGHT = `${PRIMARY}15`;

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const map = {
    admin:      'bg-purple-100 text-purple-800',
    client:     'bg-blue-100   text-blue-800',
    freelancer: 'bg-green-100  text-green-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${map[role] ?? 'bg-gray-100 text-gray-800'}`}>
      {role}
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? 'bg-green-500' : 'bg-red-500'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

// ─── Toggle button ────────────────────────────────────────────────────────────
function ToggleButton({ user, loading, onToggle }) {
  return (
    <button
      onClick={() => onToggle(user.id, user.is_active)}
      disabled={loading}
      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
        ${user.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : user.is_active ? (
        <><Ban className="h-4 w-4 mr-1.5" />Block</>
      ) : (
        <><CheckCircle className="h-4 w-4 mr-1.5" />Unblock</>
      )}
    </button>
  );
}

// ─── Mobile user card ─────────────────────────────────────────────────────────
function UserCard({ user, toggling, onToggle }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        {/* Avatar + info */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: PRIMARY_LIGHT }}>
            <User className="h-5 w-5" style={{ color: PRIMARY }} />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{user.username || 'No username'}</p>
            <p className="text-xs text-gray-700 flex items-center gap-1 mt-0.5 truncate">
              <Mail className="h-3 w-3 shrink-0" />{user.email}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <RoleBadge role={user.role} />
              <StatusBadge active={user.is_active} />
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(user.date_joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          {user.role === 'freelancer' && (
            <Link
              href={`/admin/freelancers?user=${user.id}`}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ backgroundColor: PRIMARY_LIGHT, color: PRIMARY }}
            >
              <Eye className="h-3.5 w-3.5 mr-1" />Profile
            </Link>
          )}
          <ToggleButton user={user} loading={toggling === user.id} onToggle={onToggle} />
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-gray-100">ID: {user.id}</p>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  // Build visible page numbers (window of 5)
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="border-t border-gray-100 px-4 py-3 sm:px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-900 font-medium">Page {page} of {totalPages}</p>
        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => onChange(page - 1)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />Previous
          </button>

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onChange(p)}
              className="h-8 w-8 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: page === p ? PRIMARY : 'transparent',
                color: page === p ? '#fff' : '#374151',
              }}
            >
              {p}
            </button>
          ))}

          {totalPages > 5 && page < totalPages - 2 && (
            <>
              <span className="text-gray-600 px-1">…</span>
              <button
                onClick={() => onChange(totalPages)}
                className="h-8 w-8 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            disabled={page === totalPages}
            onClick={() => onChange(page + 1)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next<ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [togglingUserId, setTogglingUserId] = useState(null);
  const [error, setError]                 = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState({ role: '', isActive: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, count: 0, totalPages: 0 });

  // Stable debounced search handler (ref so it survives re-renders)
  const searchRef = useRef(
    debounce((value) => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500)
  );

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiPrivate.get('/users', {
        params: {
          role:      filters.role,
          is_active: filters.isActive,
          search:    filters.search,
          page:      pagination.page,
          page_size: 10,
        },
      });
      setUsers(data.results);
      setPagination((prev) => ({
        ...prev,
        count:      data.count,
        totalPages: Math.ceil(data.count / 10),
      }));
    } catch {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters.role, filters.isActive, filters.search, pagination.page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Toggle block/unblock ───────────────────────────────────────────────────
  const toggleUserStatus = async (userId) => {
    if (togglingUserId) return;
    setTogglingUserId(userId);
    setError('');
    try {
      const { data } = await apiPrivate.post('toggle_block/', { user_id: userId });
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, is_active: data.is_active } : u)
      );
      setSuccessMessage(data.message);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user status');
    } finally {
      setTogglingUserId(null);
    }
  };

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ role: '', isActive: '', search: '' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = filters.role || filters.isActive || filters.search;

  // ─── Stat cards — note: counts are for CURRENT PAGE only ──────────────────
  // Total comes from pagination.count (server-provided).
  // Role breakdown is current-page only; label accordingly.
  const stats = [
    { icon: Users,     label: 'Total Users', value: pagination.count,                              color: 'text-gray-900'   },
    { icon: Briefcase, label: 'Clients',      value: users.filter((u) => u.role === 'client').length,     color: 'text-blue-600'   },
    { icon: UserCheck, label: 'Freelancers',  value: users.filter((u) => u.role === 'freelancer').length, color: 'text-green-600'  },
    { icon: Shield,    label: 'Admins',       value: users.filter((u) => u.role === 'admin').length,      color: 'text-purple-600' },
  ];

  // ─── Range label ──────────────────────────────────────────────────────────
  const rangeStart = Math.min((pagination.page - 1) * 10 + 1, pagination.count);
  const rangeEnd   = Math.min(pagination.page * 10, pagination.count);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8" style={{ color: PRIMARY }} />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">User Management</h1>
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden p-2 rounded-lg bg-white border border-gray-200 shadow-sm"
            aria-label="Open filters"
          >
            <Filter className="h-5 w-5 text-gray-800" />
          </button>
        </div>
        <p className="text-gray-700 text-sm ml-11">Manage and monitor platform users</p>
      </div>

      {/* ── Toast messages ─────────────────────────────────────────────────── */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-800 text-sm">
          <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />{successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-800 text-sm">
          <Ban className="h-4 w-4 shrink-0 text-red-600" />{error}
        </div>
      )}

      {/* ── Mobile filter drawer ────────────────────────────────────────────── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2"
                    placeholder="Search users…"
                    value={filters.search}
                    onChange={(e) => {
                      setFilters((p) => ({ ...p, search: e.target.value }));
                      setPagination((p) => ({ ...p, page: 1 }));
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={filters.role}
                  onChange={(e) => { setFilter('role', e.target.value); setMobileFilterOpen(false); }}
                >
                  <option value="">All Roles</option>
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={filters.isActive}
                  onChange={(e) => { setFilter('isActive', e.target.value); setMobileFilterOpen(false); }}
                >
                  <option value="">All Users</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={() => { clearFilters(); setMobileFilterOpen(false); }}
                  className="w-full py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop filter bar ──────────────────────────────────────────────── */}
      <div className="hidden lg:block mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
              <input
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': PRIMARY }}
                placeholder="Search by email or username…"
                value={filters.search}
                onChange={(e) => searchRef.current(e.target.value)}
              />
            </div>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
              value={filters.role}
              onChange={(e) => setFilter('role', e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="client">Client</option>
              <option value="freelancer">Freelancer</option>
              <option value="admin">Admin</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
              value={filters.isActive}
              onChange={(e) => setFilter('isActive', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      {/*
        'Total Users' = server total (all pages).
        Role counts = current page only — add a tooltip/note if you want to be precise.
        Ideally your backend should return aggregated counts separately.
      */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${color}`}>{loading ? '—' : value}</div>
                <div className="text-xs sm:text-sm text-gray-700 mt-0.5">{label}</div>
              </div>
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: PRIMARY_LIGHT }}>
                <Icon className="h-5 w-5" style={{ color: PRIMARY }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Results count ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-600">
          {pagination.count > 0
            ? `Showing ${rangeStart}–${rangeEnd} of ${pagination.count} users`
            : 'No users found'}
        </p>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs font-medium text-gray-500 hover:text-gray-800 underline lg:hidden">
            Clear filters
          </button>
        )}
      </div>

      {/* ── Users table / cards ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User', 'Role', 'Status', 'Joined', 'Actions', 'Profile'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: PRIMARY }} />
                    <p className="text-gray-700 font-medium">Loading users…</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium mb-2">
                      {hasActiveFilters ? 'No users match your filters' : 'No users found'}
                    </p>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-sm font-medium hover:underline" style={{ color: PRIMARY }}>
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: PRIMARY_LIGHT }}>
                          <User className="h-4 w-4" style={{ color: PRIMARY }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user.username || 'No username'}</p>
                          <p className="text-sm text-gray-700 truncate">{user.email}</p>
                          <p className="text-xs text-gray-600">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                    {/* Status */}
                    <td className="px-6 py-4"><StatusBadge active={user.is_active} /></td>
                    {/* Joined */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(user.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <ToggleButton user={user} loading={togglingUserId === user.id} onToggle={toggleUserStatus} />
                    </td>
                    {/* Profile */}
                    <td className="px-6 py-4">
                      {user.role === 'freelancer' ? (
                        <Link
                          href={`/admin/freelancers?user=${user.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:shadow-sm"
                          style={{ backgroundColor: PRIMARY_LIGHT, color: PRIMARY }}
                        >
                          <Eye className="h-4 w-4 mr-1.5" />View
                        </Link>
                      ) : (
                        <span className="text-gray-600 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden">
          {loading ? (
            <div className="p-10 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: PRIMARY }} />
              <p className="text-gray-700 font-medium">Loading users…</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-700 font-medium mb-2">
                {hasActiveFilters ? 'No users match your filters' : 'No users found'}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm font-medium hover:underline" style={{ color: PRIMARY }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 sm:p-4">
              {users.map((user) => (
                <UserCard key={user.id} user={user} toggling={togglingUserId} onToggle={toggleUserStatus} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />
      </div>
    </div>
  );
}