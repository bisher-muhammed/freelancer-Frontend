'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { apiPrivate } from '@/lib/apiPrivate';
import { Search, RefreshCw, Filter, Download, User, Calendar, Clock, ChevronDown, ChevronUp, X, Activity, Zap, Image as ImageIcon, Pause, Play, StopCircle } from 'lucide-react';

const ACTION_CONFIG = {
  SESSION_START: {
    label: 'Session Started',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: Play,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-500'
  },
  SESSION_PAUSE: {
    label: 'Session Paused',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Pause,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-500'
  },
  SESSION_RESUME: {
    label: 'Session Resumed',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Play,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-500'
  },
  SESSION_STOP: {
    label: 'Session Stopped',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: StopCircle,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-500'
  },
  SCREENSHOT: {
    label: 'Screenshot Captured',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: ImageIcon,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-500'
  },
  IDLE: {
    label: 'Idle Time',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: Clock,
    iconColor: 'text-gray-600',
    bgColor: 'bg-gray-500'
  },
};

export default function FreelancerActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [userProfile, setUserProfile] = useState(null);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'compact'

  const fetchActivityLogs = async () => {
    setRefreshing(true);
    try {
      const response = await apiPrivate.get('freelancer-activity-logs/');
      setLogs(response.data.logs || response.data);
      
      if (response.data.user_profile) {
        setUserProfile(response.data.user_profile);
      }
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

  const actions = useMemo(() => {
    const unique = Array.from(new Set(logs.map(log => log.action)));
    return unique.sort();
  }, [logs]);

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const totalSessions = logs.filter(log => log.action.includes('SESSION')).length;
    const todaySessions = logs.filter(log => {
      const logDate = new Date(log.created_at);
      return log.action.includes('SESSION') && logDate >= today;
    }).length;
    
    return {
      total: logs.length,
      today: logs.filter(log => new Date(log.created_at) >= today).length,
      yesterday: logs.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= yesterday && logDate < today;
      }).length,
      sessions: totalSessions,
      todaySessions,
      screenshots: logs.filter(log => log.action === 'SCREENSHOT').length,
    };
  }, [logs]);

  // Filter logs based on date range
  const filterByDateRange = (log) => {
    const logDate = new Date(log.created_at);
    const now = new Date();
    
    switch(dateRange) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return logDate >= today;
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999);
        return logDate >= yesterday && logDate <= endOfYesterday;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return logDate >= monthAgo;
      default:
        return true;
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (selectedAction !== 'all' && log.action !== selectedAction) return false;
      if (!filterByDateRange(log)) return false;
      
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          log.action.toLowerCase().includes(searchLower) ||
          JSON.stringify(log.metadata).toLowerCase().includes(searchLower) ||
          (log.session_id && log.session_id.toString().includes(searchLower))
        );
      }
      
      return true;
    });
  }, [logs, selectedAction, dateRange, search]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    let relativeTime = '';
    if (diffMins < 1) {
      relativeTime = 'Just now';
    } else if (diffMins < 60) {
      relativeTime = `${diffMins}m ago`;
    } else if (diffHours < 24) {
      relativeTime = `${diffHours}h ago`;
    } else if (diffDays < 7) {
      relativeTime = `${diffDays}d ago`;
    } else {
      relativeTime = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return (
      <div className="flex flex-col items-end">
        <span className="text-sm font-semibold text-gray-900">
          {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-xs text-gray-600">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span className="text-xs text-gray-500 mt-1">{relativeTime}</span>
      </div>
    );
  };

  const toggleLogExpansion = (logId) => {
    setExpandedLogs(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedAction('all');
    setDateRange('all');
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

  const calculateWorkTime = () => {
    const sessionStarts = logs.filter(log => log.action === 'SESSION_START');
    const sessionStops = logs.filter(log => log.action === 'SESSION_STOP');
    
    let totalSeconds = 0;
    sessionStarts.forEach(start => {
      const stop = sessionStops.find(s => s.session_id === start.session_id);
      if (stop && stop.metadata?.total_seconds) {
        totalSeconds += stop.metadata.total_seconds;
      }
    });
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return { hours, minutes };
  };

  const workTime = calculateWorkTime();

  const getActionConfig = (action) => {
    return ACTION_CONFIG[action] || {
      label: action,
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: Activity,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-500'
    };
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Logs</h1>
              <p className="text-gray-700">Track and manage your work activities and sessions</p>
            </div>
            
            {userProfile && (
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{userProfile.name || 'Freelancer'}</p>
                  <p className="text-sm text-gray-600">{userProfile.email || 'Your Account'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Activities</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.today}</p>
              </div>
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-gray-500">Yesterday:</span>
              <span className="font-medium text-gray-900">{stats.yesterday}</span>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Work Sessions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.sessions}</p>
              </div>
              <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-gray-900 font-medium">{workTime.hours}h {workTime.minutes}m</span>
              <span className="text-gray-500 ml-2">total time</span>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Screenshots</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.screenshots}</p>
              </div>
              <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Captured images</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <button
              onClick={exportLogs}
              className="mt-3 flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Clear Filters
              </button>
              <button
                onClick={fetchActivityLogs}
                disabled={refreshing}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Activity Type</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedAction('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                    selectedAction === 'all'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All Activities
                </button>
                {actions.map((action) => {
                  const config = getActionConfig(action);
                  return (
                    <button
                      key={action}
                      onClick={() => setSelectedAction(action)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border flex items-center gap-2 ${
                        selectedAction === action
                          ? `${config.color.replace('50', '100')} border-current`
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <config.icon className={`h-4 w-4 ${config.iconColor}`} />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Date Range</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All Time' },
                  { value: 'today', label: 'Today' },
                  { value: 'yesterday', label: 'Yesterday' },
                  { value: 'week', label: 'Last 7 Days' },
                  { value: 'month', label: 'Last 30 Days' }
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setDateRange(range.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                      dateRange === range.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity List Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Activity History</h2>
            <p className="text-gray-600 mt-1">
              Showing <span className="font-semibold text-gray-900">{filteredLogs.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{logs.length}</span> activities
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Detailed
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  viewMode === 'compact' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Compact
              </button>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600 mb-6">
                {selectedAction !== 'all' || dateRange !== 'all' || search
                  ? 'Try adjusting your filters to see more results.'
                  : 'No activities recorded yet. Start working to see your activity log!'}
              </p>
              {(selectedAction !== 'all' || dateRange !== 'all' || search) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                const config = getActionConfig(log.action);
                const Icon = config.icon;
                const isExpanded = expandedLogs[log.id];
                
                return (
                  <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className={`h-12 w-12 rounded-xl ${config.color} border flex items-center justify-center`}>
                          <Icon className={`h-6 w-6 ${config.iconColor}`} />
                        </div>
                      </div>
                      
                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">
                              {config.label}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Session #{log.session_id}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {formatTimestamp(log.created_at)}
                          </div>
                        </div>
                        
                        {/* Metadata */}
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="mt-4">
                            <button
                              onClick={() => toggleLogExpansion(log.id)}
                              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Hide Details
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Show Details
                                </>
                              )}
                            </button>
                            
                            {isExpanded && (
                              <div className="mt-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {Object.entries(log.metadata).map(([key, value]) => (
                                    <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
                                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{key}</p>
                                      <p className="text-sm font-semibold text-gray-900 mt-1">{value}</p>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Raw JSON */}
                                {viewMode === 'list' && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <details className="group">
                                      <summary className="flex items-center gap-2 text-sm font-medium text-black cursor-pointer list-none">
                                        <span>View Raw Data</span>
                                        <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
                                      </summary>
                                      <div className="mt-3">
                                        <pre className="text-black bg-white p-3 rounded-lg border border-gray-300 overflow-auto max-h-48">
                                          {JSON.stringify(log.metadata, null, 2)}
                                        </pre>
                                      </div>
                                    </details>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Footer */}
          {filteredLogs.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {filteredLogs.length} activities
                </p>
                <button
                  onClick={exportLogs}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}