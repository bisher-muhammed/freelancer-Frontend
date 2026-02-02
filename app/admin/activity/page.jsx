'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { apiPrivate } from '@/lib/apiPrivate';
import { Search, RefreshCw, Filter, Download } from 'lucide-react';

const ACTION_COLORS = {
  SESSION_START: 'bg-green-100 text-green-800 border-green-200',
  SESSION_PAUSE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  SESSION_RESUME: 'bg-blue-100 text-blue-800 border-blue-200',
  SESSION_STOP: 'bg-red-100 text-red-800 border-red-200',
  SCREENSHOT: 'bg-purple-100 text-purple-800 border-purple-200',
  IDLE: 'bg-gray-100 text-gray-800 border-gray-200',
};

const ACTION_LABELS = {
  SESSION_START: 'Session Started',
  SESSION_PAUSE: 'Session Paused',
  SESSION_RESUME: 'Session Resumed',
  SESSION_STOP: 'Session Stopped',
  SCREENSHOT: 'Screenshot Captured',
  IDLE: 'Idle Time Added',
};

export default function AdminActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedFreelancer, setSelectedFreelancer] = useState('all');

  const fetchActivityLogs = async () => {
    setRefreshing(true);
    try {
      const response = await apiPrivate.get('admin/activity-logs/');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const freelancers = useMemo(() => {
    const unique = Array.from(new Set(logs.map(log => log.freelancer_name)));
    return unique.sort();
  }, [logs]);

  const actions = useMemo(() => {
    const unique = Array.from(new Set(logs.map(log => log.action)));
    return unique.sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (selectedAction !== 'all' && log.action !== selectedAction) return false;
      if (selectedFreelancer !== 'all' && log.freelancer_name !== selectedFreelancer) return false;
      
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          log.freelancer_name.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          JSON.stringify(log.metadata).toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [logs, selectedAction, selectedFreelancer, search]);

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

  const formatMetadata = (metadata) => {
    if (!metadata || Object.keys(metadata).length === 0) return 'No metadata';
    
    return Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedAction('all');
    setSelectedFreelancer('all');
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `activity-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Logs</h1>
          <p className="text-gray-600">Monitor all work session activities across the platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Total Logs</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{logs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Filtered Logs</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{filteredLogs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Unique Freelancers</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{freelancers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Export Data</p>
            <button
              onClick={exportLogs}
              className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <p className="text-sm text-gray-500">Filter activity logs by different criteria</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
              <button
                onClick={fetchActivityLogs}
                disabled={refreshing}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            {/* Action Filter */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All Actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>
                  {ACTION_LABELS[action] || action}
                </option>
              ))}
            </select>

            {/* Freelancer Filter */}
            <select
              value={selectedFreelancer}
              onChange={(e) => setSelectedFreelancer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All Freelancers</option>
              {freelancers.map((freelancer) => (
                <option key={freelancer} value={freelancer}>
                  {freelancer}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Activity Logs</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {filteredLogs.length} of {logs.length} logs
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mt-2 md:mt-0">
                Auto-refresh in 30s
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
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
                <p className="text-gray-500">
                  {selectedAction !== 'all' || selectedFreelancer !== 'all' || search
                    ? 'Try adjusting your filters to see more results.'
                    : 'No activity logs available at the moment.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Freelancer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Session ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Metadata
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {formatTimestamp(log.created_at)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {log.freelancer_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                            {ACTION_LABELS[log.action] || log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                            #{log.session_id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            <p className="truncate" title={formatMetadata(log.metadata)}>
                              {formatMetadata(log.metadata)}
                            </p>
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <details className="mt-1">
                                <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                                  View Details
                                </summary>
                                <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32 border border-gray-200">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}