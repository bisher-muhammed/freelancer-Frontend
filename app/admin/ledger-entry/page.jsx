'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { apiPrivate } from '@/lib/apiPrivate';
import { Search, RefreshCw, Filter, Download, DollarSign, User, FileText, Calendar } from 'lucide-react';

const ENTRY_TYPES = {
  'CREDIT': { label: 'Credit', color: 'bg-green-100 text-green-800 border-green-200' },
  'DEBIT': { label: 'Debit', color: 'bg-red-100 text-red-800 border-red-200' },
  'PAYOUT': { label: 'Payout', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'REFUND': { label: 'Refund', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'FEE': { label: 'Fee', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  'ADJUSTMENT': { label: 'Adjustment', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

export default function LedgerAdminPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('-created_at');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('all');
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [page, setPage] = useState(1);

  const fetchLedgerEntries = async (pageNum = 1) => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('entry_type', selectedType);
      if (selectedUser !== 'all') params.append('user', selectedUser);
      params.append('ordering', sortBy);
      params.append('page', pageNum.toString());
      
      const response = await apiPrivate.get(`admin/ledger/?${params.toString()}`);
      
      // Handle both array and paginated responses
      if (response.data.results) {
        // Paginated response
        setEntries(response.data.results);
        setPagination({
          count: response.data.count || 0,
          next: response.data.next,
          previous: response.data.previous,
        });
      } else {
        // Array response
        setEntries(response.data);
        setPagination({
          count: response.data.length,
          next: null,
          previous: null,
        });
      }
      
      // Extract unique users for filter
      const data = response.data.results || response.data;
      const uniqueUsers = Array.from(new Set(data
        .filter(entry => entry.user && entry.user_email)
        .map(entry => ({
          id: entry.user,
          email: entry.user_email
        }))
      ));
      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Error fetching ledger entries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchLedgerEntries(1);
  }, [selectedType, selectedUser, sortBy]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchLedgerEntries(newPage);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    let totalCredit = 0;
    let totalDebit = 0;
    let netBalance = 0;
    const entryCounts = {};
    
    entries.forEach(entry => {
      const amount = parseFloat(entry.amount);
      if (entry.entry_type === 'CREDIT' || entry.entry_type === 'PAYOUT') {
        totalCredit += amount;
      } else {
        totalDebit += amount;
      }
      
      entryCounts[entry.entry_type] = (entryCounts[entry.entry_type] || 0) + 1;
    });
    
    netBalance = totalCredit - totalDebit;
    
    return {
      totalCredit: totalCredit.toFixed(2),
      totalDebit: totalDebit.toFixed(2),
      netBalance: netBalance.toFixed(2),
      totalEntries: pagination.count,
      entryCounts,
    };
  }, [entries, pagination.count]);

  // Filter entries based on date range and search
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Filter by date range
      const entryDate = new Date(entry.created_at);
      const now = new Date();
      
      switch(dateRange) {
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return entryDate >= today;
        case 'yesterday':
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);
          const endOfYesterday = new Date(yesterday);
          endOfYesterday.setHours(23, 59, 59, 999);
          return entryDate >= yesterday && entryDate <= endOfYesterday;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return entryDate >= weekAgo;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return entryDate >= monthAgo;
        default:
          // All time - no date filter
      }
      
      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          entry.user_email?.toLowerCase().includes(searchLower) ||
          entry.reference_id?.toLowerCase().includes(searchLower) ||
          entry.amount?.toString().includes(searchLower) ||
          entry.entry_type?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [entries, dateRange, search]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedUser('all');
    setDateRange('all');
    setSortBy('-created_at');
    setPage(1);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ledger-entries-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getEntryTypeLabel = (type) => {
    return ENTRY_TYPES[type]?.label || type;
  };

  const getEntryTypeColor = (type) => {
    return ENTRY_TYPES[type]?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const pageSize = 20; // Assuming default page size
  const totalPages = Math.ceil(pagination.count / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ledger Administration</h1>
          <p className="text-gray-600">Monitor all financial transactions across the platform</p>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {formatCurrency(stats.totalCredit)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.entryCounts.CREDIT || 0} credit entries
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Debits</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {formatCurrency(stats.totalDebit)}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.entryCounts.DEBIT || 0} debit entries
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Balance</p>
                <p className={`text-3xl font-bold mt-2 ${
                  parseFloat(stats.netBalance) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(stats.netBalance)}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                parseFloat(stats.netBalance) >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <DollarSign className={`h-6 w-6 ${
                  parseFloat(stats.netBalance) >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {pagination.count} total entries
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col items-center">
              <p className="text-sm font-medium text-gray-600">Export Data</p>
              <button
                onClick={exportData}
                className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 w-full justify-center"
              >
                <Download className="h-4 w-4" />
                Export JSON
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Filter Entries</h2>
              <p className="text-sm text-gray-500">Filter ledger entries by different criteria</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
              <button
                onClick={() => fetchLedgerEntries(page)}
                disabled={refreshing}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by email, reference, amount..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            {/* Entry Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="all">All Types</option>
                {Object.keys(ENTRY_TYPES).map((type) => (
                  <option key={type} value={type}>
                    {ENTRY_TYPES[type].label}
                  </option>
                ))}
              </select>
            </div>

            {/* User Filter */}
            <div>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="all">All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="-amount">Highest Amount</option>
                <option value="amount">Lowest Amount</option>
              </select>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="mt-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Date Range:</span>
              <div className="flex flex-wrap gap-2">
                {['all', 'today', 'yesterday', 'week', 'month'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1 text-sm rounded-full capitalize ${
                      dateRange === range
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {range === 'all' ? 'All Time' : range}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Ledger Entries</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {entries.length} of {pagination.count} entries (Page {page})
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mt-2 md:mt-0">
                Admin View Only
              </span>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
                <p className="text-gray-500">
                  {selectedType !== 'all' || selectedUser !== 'all' || search
                    ? 'Try adjusting your filters to see more results.'
                    : 'No ledger entries available.'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                          Contract
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                          Reference
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {formatTimestamp(entry.created_at)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(entry.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {entry.user_email || `User #${entry.user}`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {entry.user}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEntryTypeColor(entry.entry_type)}`}>
                              {getEntryTypeLabel(entry.entry_type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-bold ${
                              entry.entry_type === 'CREDIT' || entry.entry_type === 'PAYOUT'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {entry.entry_type === 'CREDIT' || entry.entry_type === 'PAYOUT' ? '+' : '-'}
                              {formatCurrency(entry.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-gray-400 mr-2" />
                              <div className="text-sm text-gray-900">
                                {entry.contract ? (
                                  <span className="font-mono">Contract #{entry.contract}</span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-mono">
                              {entry.reference_id ? (
                                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                  {entry.reference_id}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.count > entries.length && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, pagination.count)} of {pagination.count} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={!pagination.previous || page === 1}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                          !pagination.previous || page === 1
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!pagination.next}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                          !pagination.next
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Page</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {entries.length} entries
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {users.length} users
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Range</p>
                <p className="text-lg font-bold text-gray-900 mt-1 capitalize">
                  {dateRange === 'all' ? 'All Time' : dateRange}
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}