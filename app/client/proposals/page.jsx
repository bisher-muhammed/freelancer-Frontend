"use client";

import { useEffect, useState } from "react";
import { apiPrivate } from "@/lib/apiPrivate";
import {
  Search,
  Filter,
  User,
  Mail,
  Briefcase,
  FileText,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Eye,
  ArrowUpDown,
  AlertTriangle,
  Target,
  TrendingUp,
  Video,
  AlertCircle,
  Play,
  DollarSign
} from 'lucide-react';
import { useRouter } from "next/navigation"; 

export default function ClientProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [meetings, setMeetings] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [expandedProposal, setExpandedProposal] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProposals();
    fetchMeetings();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await apiPrivate.get("proposals/");
      const data = res.data;

      let proposalsArray = [];
      if (Array.isArray(data)) {
        proposalsArray = data;
      } else if (Array.isArray(data.results)) {
        proposalsArray = data.results;
      } else {
        console.error("Invalid proposals response", data);
      }

      setProposals(proposalsArray);
      setFilteredProposals(proposalsArray);
    } catch (err) {
      console.error(err);
      setProposals([]);
      setFilteredProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      const res = await apiPrivate.get("meetings/");
      const meetingsData = res.data;
      
      // Organize meetings by proposal ID
      const meetingsByProposal = {};
      const meetingsArray = Array.isArray(meetingsData) ? meetingsData : meetingsData.results || [];
      
      meetingsArray.forEach(meeting => {
        if (!meetingsByProposal[meeting.proposal]) {
          meetingsByProposal[meeting.proposal] = [];
        }
        meetingsByProposal[meeting.proposal].push(meeting);
      });
      
      setMeetings(meetingsByProposal);
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
    }
  };

  // Filter and sort proposals
  useEffect(() => {
    let result = [...proposals];

    if (statusFilter !== "all") {
      result = result.filter(p => p.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.freelancer?.username?.toLowerCase().includes(query) ||
        p.freelancer?.email?.toLowerCase().includes(query) ||
        p.project?.title?.toLowerCase().includes(query) ||
        p.cover_letter?.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          if (a.status === 'auto_rejected' && b.status !== 'auto_rejected') return 1;
          if (b.status === 'auto_rejected' && a.status !== 'auto_rejected') return -1;
          
          if (a.final_score !== undefined && b.final_score !== undefined) {
            if (b.final_score !== a.final_score) {
              return b.final_score - a.final_score;
            }
          }
          
          return new Date(b.created_at) - new Date(a.created_at);
          
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "name":
          return a.freelancer.username.localeCompare(b.freelancer.username);
        case "score":
          return (b.final_score || 0) - (a.final_score || 0);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredProposals(result);
  }, [proposals, searchQuery, statusFilter, sortBy]);

  const getStatusCounts = () => {
    const counts = {
      all: proposals.length,
      submitted: 0,
      shortlisted: 0,
      interviewing: 0,
      accepted: 0,
      rejected: 0,
      auto_rejected: 0,
      withdrawn: 0
    };

    proposals.forEach(p => {
      if (counts[p.status] !== undefined) {
        counts[p.status]++;
      }
    });

    return counts;
  };

  const updateStatus = async (proposalId, status) => {
    if (!window.confirm(`Are you sure you want to change status to ${status}?`)) {
      return;
    }

    try {
      await apiPrivate.patch(`proposals/${proposalId}/status/`, { status });
      fetchProposals();
    } catch (err) {
      alert(
        err.response?.data?.detail ||
        err.response?.data?.status ||
        "Status update failed. Please try again."
      );
    }
  };

  const handleCreateOffer = (proposalId) => {
    // Redirect to your existing CreateOfferPage with the proposal ID
    router.push(`/client/create-offer?proposal=${proposalId}`);
    // OR if you prefer a nested route:
    // router.push(`/client/proposals/${proposalId}/create-offer`);
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const start = new Date(meeting.start_time);
    const end = new Date(meeting.end_time);

    if (meeting.status === 'completed') return 'completed';
    if (meeting.status === 'cancelled') return 'cancelled';
    if (meeting.status === 'no_show') return 'no_show';
    if (meeting.status === 'ongoing') return 'ongoing';
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'joinable';
    return 'past';
  };

  const getProposalMeetings = (proposalId) => {
    return meetings[proposalId] || [];
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Proposals</h1>
          <p className="text-gray-600">Review and manage project proposals from freelancers</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-8 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{counts.all}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{counts.submitted}</div>
            <div className="text-sm text-blue-600">Submitted</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{counts.shortlisted}</div>
            <div className="text-sm text-purple-600">Shortlisted</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">{counts.interviewing}</div>
            <div className="text-sm text-indigo-600">Interviewing</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{counts.accepted}</div>
            <div className="text-sm text-green-600">Accepted</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
            <div className="text-sm text-red-600">Rejected</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-amber-600">{counts.auto_rejected}</div>
            <div className="text-sm text-amber-600">Auto Rejected</div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-600">{counts.withdrawn}</div>
            <div className="text-sm text-gray-600">Withdrawn</div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search freelancers, projects, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700"
            >
              <Filter className="w-4 h-4" />
              Filter & Sort
            </button>

            <div className="hidden sm:block relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none w-full sm:w-48 pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="priority">Priority Order</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Freelancer Name</option>
                <option value="score">Match Score</option>
                <option value="status">Status</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {showMobileFilters && (
            <div className="sm:hidden mt-4 bg-white rounded-lg shadow-lg p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="priority">Priority Order</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Freelancer Name</option>
                  <option value="score">Match Score</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {["all", "submitted", "shortlisted", "interviewing", "accepted", "rejected", "auto_rejected", "withdrawn"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowMobileFilters(false);
                      }}
                      className={`px-3 py-2 rounded text-sm font-medium ${
                        statusFilter === status
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Status Filter Tabs */}
        <div className="hidden sm:flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "submitted", "shortlisted", "interviewing", "accepted", "rejected", "auto_rejected", "withdrawn"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ({counts[status] || 0})
            </button>
          ))}
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {filteredProposals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery || statusFilter !== "all" ? "No matching proposals" : "No proposals yet"}
              </h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Proposals from freelancers will appear here once they apply to your projects"}
              </p>
            </div>
          ) : (
            filteredProposals.map((proposal) => {
              const proposalMeetings = getProposalMeetings(proposal.id);
              
              return (
                <div
                  key={proposal.id}
                  className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
                    proposal.status === 'auto_rejected' ? 'opacity-70' : ''
                  }`}
                >
                  {/* Proposal Header */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedProposal(expandedProposal === proposal.id ? null : proposal.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Freelancer Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {proposal.freelancer.username}
                              </h3>
                              {proposal.final_score !== undefined && proposal.final_score > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                                  <Target className="w-3 h-3" />
                                  {proposal.final_score.toFixed(1)}% Match
                                </span>
                              )}
                              {proposal.auto_reject && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                                  <AlertTriangle className="w-3 h-3" />
                                  Auto-Filtered
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Mail className="w-3 h-3" />
                              {proposal.freelancer.email}
                            </div>
                          </div>
                        </div>

                        {/* Project Info */}
                        <div className="ml-13">
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{proposal.project.title}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="capitalize">{proposal.project.assignment_type} project</span>
                            <span>•</span>
                            <Clock className="w-3 h-3 inline" />
                            <span>Submitted {getTimeAgo(proposal.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex flex-col sm:items-end gap-3">
                        <StatusBadge status={proposal.status} />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle message action
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Message"
                          >
                            <MessageSquare className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedProposal(expandedProposal === proposal.id ? null : proposal.id);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {expandedProposal === proposal.id ? (
                              <ChevronUp className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Meeting Quick Info (when not expanded) */}
                    {proposal.status === 'interviewing' && proposalMeetings.length > 0 && expandedProposal !== proposal.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {proposalMeetings.slice(0, 1).map(meeting => {
                          const meetingStatus = getMeetingStatus(meeting);
                          return (
                            <div key={meeting.id} className="flex items-center gap-3 text-sm">
                              <Video className="w-4 h-4 text-indigo-600" />
                              <span className="text-gray-700">
                                {meetingStatus === 'upcoming' && `Interview scheduled for ${formatDateTime(meeting.start_time)}`}
                                {meetingStatus === 'joinable' && 'Interview is ready to join now'}
                                {meetingStatus === 'ongoing' && 'Interview in progress'}
                                {meetingStatus === 'completed' && 'Interview completed'}
                              </span>
                              {meetingStatus === 'joinable' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full animate-pulse">
                                  <Play className="w-3 h-3" />
                                  Join Now
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {expandedProposal === proposal.id && (
                    <div className="border-t border-gray-200 px-6 py-6">
                      {/* Meeting Details Section */}
                      {proposal.status === 'interviewing' && proposalMeetings.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Video className="w-5 h-5 text-indigo-600" />
                            Scheduled Meetings
                          </h4>
                          <div className="space-y-3">
                            {proposalMeetings.map(meeting => {
                              const meetingStatus = getMeetingStatus(meeting);
                              return (
                                <div key={meeting.id} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium text-indigo-900 capitalize">
                                          {meeting.meeting_type} Meeting
                                        </span>
                                        <MeetingStatusBadge status={meetingStatus} />
                                      </div>
                                      
                                      <div className="space-y-1.5 text-sm text-indigo-700">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-4 h-4" />
                                          <span>Start: {formatDateTime(meeting.start_time)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Clock className="w-4 h-4" />
                                          <span>End: {formatDateTime(meeting.end_time)}</span>
                                        </div>
                                        {meeting.status === 'ongoing' && meeting.actual_started_at && (
                                          <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>Started: {formatDateTime(meeting.actual_started_at)}</span>
                                          </div>
                                        )}
                                        {meeting.status === 'completed' && meeting.actual_ended_at && (
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Completed: {formatDateTime(meeting.actual_ended_at)}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex gap-2">
                                      {(meetingStatus === 'joinable' || meetingStatus === 'ongoing') && (
                                        <button
                                          onClick={() => router.push(`/meetings/${meeting.id}/join`)}
                                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                                        >
                                          <Video className="w-4 h-4" />
                                          Join Meeting
                                        </button>
                                      )}
                                      <button
                                        onClick={() => router.push(`/meetings/${meeting.id}`)}
                                        className="px-4 py-2 bg-white hover:bg-gray-50 text-indigo-700 border border-indigo-300 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                                      >
                                        <Eye className="w-4 h-4" />
                                        Details
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Interview Timing Info */}
                      {proposal.status === 'interviewing' && proposal.interviewing_started_at && (
                        <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <h4 className="font-semibold text-purple-900">Interview Stage</h4>
                          </div>
                          <p className="text-sm text-purple-700">
                            Started: {formatDateTime(proposal.interviewing_started_at)}
                          </p>
                          {proposal.interviewing_duration_hours && (
                            <p className="text-sm text-purple-700 mt-1">
                              Duration: {Math.floor(proposal.interviewing_duration_hours / 24)}d {Math.floor(proposal.interviewing_duration_hours % 24)}h
                            </p>
                          )}
                        </div>
                      )}

                      {/* Match Score Info */}
                      {proposal.final_score !== undefined && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Match Score: {proposal.final_score.toFixed(1)}%
                            </h4>
                            {proposal.auto_reject && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                                <AlertTriangle className="w-4 h-4" />
                                Auto-filtered due to low score
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                proposal.final_score >= 70 ? 'bg-green-500' :
                                proposal.final_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(proposal.final_score, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Cover Letter */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Cover Letter
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-line">
                            {proposal.cover_letter || "No cover letter provided."}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                        {proposal.status !== 'auto_rejected' && proposal.status !== 'withdrawn' && (
                          <>
                            <ActionButton
                              label="Shortlist"
                              icon={<CheckCircle className="w-4 h-4" />}
                              disabled={proposal.status !== "submitted"}
                              onClick={() => updateStatus(proposal.id, "shortlisted")}
                              color="blue"
                            />
                            <ActionButton
                              label="Interview"
                              icon={<MessageSquare className="w-4 h-4" />}
                              disabled={proposal.status !== "shortlisted"}
                              onClick={() => router.push(`/client/proposals/${proposal.id}/schedule-meeting`)}
                              color="purple"
                            />
                            <ActionButton
                              label="Accept"
                              icon={<CheckCircle className="w-4 h-4" />}
                              disabled={proposal.status !== "interviewing"}
                              onClick={() => {
                                if (window.confirm("Are you sure you want to accept this proposal?")) {
                                  updateStatus(proposal.id, "accepted");
                                }
                              }}
                              color="green"
                            />
                            <ActionButton
                              label="Reject"
                              icon={<XCircle className="w-4 h-4" />}
                              disabled={proposal.status === "accepted" || proposal.status === "rejected"}
                              onClick={() => {
                                if (window.confirm("Are you sure you want to reject this proposal?")) {
                                  updateStatus(proposal.id, "rejected");
                                }
                              }}
                              color="red"
                            />
                          </>
                        )}
                        
                        {/* Create Offer Button (only for accepted proposals) */}
                        {proposal.status === 'accepted' && (
                          <ActionButton
                            label="Create Offer"
                            icon={<DollarSign className="w-4 h-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateOffer(proposal.id);
                            }}
                            color="green"
                          />
                        )}

                        <button
                          onClick={() => {
                            router.push(
                              `/client/freelancer-profile/${proposal.freelancer.id}?proposal=${proposal.id}`
                            );
                          }}
                          className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View Profile
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Meeting Status Badge Component
function MeetingStatusBadge({ status }) {
  const styles = {
    upcoming: "bg-blue-100 text-blue-800",
    joinable: "bg-green-100 text-green-800 animate-pulse",
    ongoing: "bg-indigo-100 text-indigo-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
    no_show: "bg-amber-100 text-amber-800",
    past: "bg-gray-100 text-gray-600"
  };

  const labels = {
    upcoming: "Upcoming",
    joinable: "Join Now",
    ongoing: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No Show",
    past: "Past"
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// Enhanced StatusBadge Component
function StatusBadge({ status }) {
  const styles = {
    submitted: "bg-gray-100 text-gray-800",
    shortlisted: "bg-blue-100 text-blue-800",
    interviewing: "bg-purple-100 text-purple-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    auto_rejected: "bg-amber-100 text-amber-800",
    withdrawn: "bg-gray-100 text-gray-800",
  };

  const icons = {
    submitted: <Clock className="w-3 h-3" />,
    shortlisted: <CheckCircle className="w-3 h-3" />,
    interviewing: <MessageSquare className="w-3 h-3" />,
    accepted: <CheckCircle className="w-3 h-3" />,
    rejected: <XCircle className="w-3 h-3" />,
    auto_rejected: <AlertTriangle className="w-3 h-3" />,
    withdrawn: <XCircle className="w-3 h-3" />,
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${styles[status]}`}>
      {icons[status]}
      <span>{status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
    </div>
  );
}

// Enhanced ActionButton Component
function ActionButton({ label, onClick, disabled, color = "black", icon }) {
  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
    black: "bg-gray-900 hover:bg-black",
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 text-sm w-full disabled:opacity-40 disabled:cursor-not-allowed ${colorClasses[color]}`}
    >
      {icon}
      {label}
    </button>
  );
}