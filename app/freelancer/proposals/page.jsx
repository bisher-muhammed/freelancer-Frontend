"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import {
  Search,
  DollarSign,
  Clock,
  Calendar,
  MoreVertical,
  Loader2,
  FileText,
  XCircle,
  Filter
} from 'lucide-react';

export default function MyProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const response = await apiPrivate.get('/my-proposals/');
      setProposals(response.data.results || response.data || []);
      setFilteredProposals(response.data.results || response.data || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load proposals');
    }
    setLoading(false);
  };

  useEffect(() => {
    filterProposals();
  }, [searchQuery, activeFilter, proposals]);

  const filterProposals = () => {
    let filtered = [...proposals];

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(p => p.status.toLowerCase() === activeFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.project?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cover_letter?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProposals(filtered);
  };

  const getStatusCounts = () => {
    return {
      all: proposals.length,
      active: proposals.filter(p => p.status.toLowerCase() === 'active').length,
      interview: proposals.filter(p => p.status.toLowerCase() === 'interview').length,
      accepted: proposals.filter(p => p.status.toLowerCase() === 'accepted').length,
      declined: proposals.filter(p => p.status.toLowerCase() === 'declined').length,
    };
  };

  const getStatusBadge = (status) => {
    const statusLower = status.toLowerCase();
    const styles = {
      active: 'bg-blue-50 text-blue-700 border-blue-200',
      interview: 'bg-purple-50 text-purple-700 border-purple-200',
      accepted: 'bg-green-50 text-green-700 border-green-200',
      declined: 'bg-red-50 text-red-700 border-red-200',
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    };

    return (
      <span className={`px-3 py-1 rounded text-xs font-medium border ${styles[statusLower] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    
    return posted.toLocaleDateString();
  };

  const formatDeliveryTime = (duration) => {
    const map = {
      '1_3_months': '1-3 months',
      '3_6_months': '3-6 months',
      '6_months_plus': '6+ months'
    };
    return map[duration] || duration;
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin h-12 w-12 text-blue-600 mb-4" />
          <p className="text-gray-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Proposals</h1>
          <p className="text-gray-600">Track all your submitted proposals</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="sm:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700"
          >
            <Filter className="w-4 h-4" />
            Filter ({counts[activeFilter] || counts.all})
          </button>
        </div>

        {/* Filter Tabs */}
        <div className={`${showMobileFilters ? 'block' : 'hidden'} sm:flex mb-6 gap-2 overflow-x-auto pb-2`}>
          <button
            onClick={() => {
              setActiveFilter('all');
              setShowMobileFilters(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors w-full sm:w-auto ${
              activeFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => {
              setActiveFilter('active');
              setShowMobileFilters(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors w-full sm:w-auto ${
              activeFilter === 'active'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Active ({counts.active})
          </button>
          <button
            onClick={() => {
              setActiveFilter('interview');
              setShowMobileFilters(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors w-full sm:w-auto ${
              activeFilter === 'interview'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Interview ({counts.interview})
          </button>
          <button
            onClick={() => {
              setActiveFilter('accepted');
              setShowMobileFilters(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors w-full sm:w-auto ${
              activeFilter === 'accepted'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Accepted ({counts.accepted})
          </button>
          <button
            onClick={() => {
              setActiveFilter('declined');
              setShowMobileFilters(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors w-full sm:w-auto ${
              activeFilter === 'declined'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Declined ({counts.declined})
          </button>
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {filteredProposals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No proposals found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Start applying to projects to see your proposals here'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => router.push('/freelancer/find-jobs')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Jobs
                </button>
              )}
            </div>
          ) : (
            filteredProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/projects/${proposal.project?.id}`)}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                      {proposal.project?.title || 'Untitled Project'}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-gray-600">
                      {getStatusBadge(proposal.status)}
                      <span className="hidden sm:inline">•</span>
                      <span>Client: {proposal.project?.client?.company_name || 'Unknown'}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle menu actions
                    }}
                    className="self-end sm:self-start p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Cover Letter Preview */}
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {proposal.cover_letter || 'No cover letter provided'}
                </p>

                {/* Proposal Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Bid Amount</p>
                      <p className="font-semibold text-gray-900">
                        {proposal.bid_fixed_price 
                          ? `$${parseFloat(proposal.bid_fixed_price).toLocaleString()}`
                          : proposal.bid_hourly_rate 
                          ? `$${proposal.bid_hourly_rate}/hr`
                          : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Delivery</p>
                      <p className="font-semibold text-gray-900">
                        {proposal.project?.duration 
                          ? formatDeliveryTime(proposal.project.duration)
                          : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Submitted</p>
                      <p className="font-semibold text-gray-900">
                        {getTimeAgo(proposal.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}