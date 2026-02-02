'use client';
import { useEffect, useState } from 'react';
import { apiPrivate } from '@/lib/apiPrivate';

export default function AdminMeetingPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [meetingType, setMeetingType] = useState('');
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [showFilters, setShowFilters] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (meetingType) params.meeting_type = meetingType;
      if (search) params.search = search;
      if (ordering) params.ordering = ordering;
      
      const response = await apiPrivate.get('admin-meetings/', { params });
      const data = response.data;
      
      if (Array.isArray(data)) {
        setMeetings(data);
      } else if (Array.isArray(data?.results)) {
        setMeetings(data.results);
      } else {
        setMeetings([]);
      }
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [status, meetingType, search, ordering]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'no_show':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    total: meetings.length,
    scheduled: meetings.filter(m => m.status === 'scheduled').length,
    completed: meetings.filter(m => m.status === 'completed').length,
    ongoing: meetings.filter(m => m.status === 'ongoing').length,
    cancelled: meetings.filter(m => m.status === 'cancelled').length,
    noShow: meetings.filter(m => m.status === 'no_show').length,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const clearFilters = () => {
    setStatus('');
    setMeetingType('');
    setSearch('');
    setOrdering('-created_at');
  };

  const hasActiveFilters = status || meetingType || search || ordering !== '-created_at';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Meeting Management</h1>
              <p className="text-gray-600 mt-1">Manage and monitor all meetings</p>
            </div>
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                hasActiveFilters 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Clear Filters
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {hasActiveFilters && (
                  <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {[status, meetingType, search, ordering !== '-created_at'].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="sm:hidden bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-gray-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label>
                  <select 
                    value={meetingType} 
                    onChange={(e) => setMeetingType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="interview">Interview</option>
                    <option value="review">Review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select 
                    value={ordering} 
                    onChange={(e) => setOrdering(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="-created_at">Newest First</option>
                    <option value="created_at">Oldest First</option>
                    <option value="status">Sort by Status</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
                    <p className="text-gray-600 text-sm mt-1">Total</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold text-blue-600">{stats.scheduled}</h3>
                    <p className="text-gray-600 text-sm mt-1">Scheduled</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold text-green-600">{stats.completed}</h3>
                    <p className="text-gray-600 text-sm mt-1">Completed</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold text-yellow-600">{stats.ongoing}</h3>
                    <p className="text-gray-600 text-sm mt-1">Ongoing</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-red-600">{stats.cancelled}</h3>
                <p className="text-gray-600 text-sm mt-1">Cancelled</p>
              </div>
              <div className="bg-red-50 p-2 rounded-lg">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-600">{stats.noShow}</h3>
                <p className="text-gray-600 text-sm mt-1">No Show</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Filters */}
          <div className="hidden sm:block p-4 lg:p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>

                <select 
                  value={meetingType} 
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All Types</option>
                  <option value="interview">Interview</option>
                  <option value="review">Review</option>
                </select>

                <select 
                  value={ordering} 
                  onChange={(e) => setOrdering(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                Showing {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="p-8 lg:p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading meetings...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchMeetings}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && meetings.length === 0 && (
            <div className="p-8 lg:p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600">No meetings found.</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Meetings Table */}
          {!loading && meetings.length > 0 && (
            <>
              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {meetings.map((m) => (
                  <div key={m.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-medium text-gray-500">ID: #{m.id}</span>
                        <h3 className="text-sm font-semibold text-gray-900 mt-1">{m.project}</h3>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(m.status)}`}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium mr-2">Client:</span>
                        <span className="truncate">{m.client_email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium mr-2">Freelancer:</span>
                        <span className="truncate">{m.freelancer_email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium mr-2">Created:</span>
                        <span>{formatDate(m.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 capitalize">
                        {m.meeting_type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table - Responsive with horizontal scroll only when needed */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full border-collapse min-w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap min-w-[150px]">Project</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap min-w-[180px]">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap min-w-[180px]">Freelancer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap min-w-[150px]">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {meetings.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">#{m.id}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 truncate max-w-[150px]">{m.project}</td>
                        <td className="px-4 py-4 text-sm text-gray-600 truncate max-w-[180px]">{m.client_email}</td>
                        <td className="px-4 py-4 text-sm text-gray-600 truncate max-w-[180px]">{m.freelancer_email}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 capitalize">
                            {m.meeting_type}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(m.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                              m.status === 'completed' ? 'bg-green-600' : 
                              m.status === 'scheduled' ? 'bg-blue-600' : 
                              m.status === 'ongoing' ? 'bg-yellow-600' : 
                              'bg-gray-600'
                            }`}></span>
                            {m.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(m.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && meetings.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-600">
            <div>Showing {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}</div>
            <button onClick={fetchMeetings} className="mt-2 sm:mt-0 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}