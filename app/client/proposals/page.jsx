"use client";

import { useEffect, useState, useCallback } from "react";
import { apiPrivate } from "@/lib/apiPrivate";
import {
  Search, Filter, User, Mail, Briefcase, FileText, Clock,
  Calendar, CheckCircle, XCircle, MessageSquare, ChevronDown,
  ChevronUp, Eye, ArrowUpDown, AlertTriangle, Target, TrendingUp,
  Video, AlertCircle, Play, DollarSign, TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────
// Inline Dialog primitives — no shadcn / Radix needed
// ─────────────────────────────────────────────────────────────
function DialogOverlay({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    />
  );
}

function DialogBox({ children, maxWidth = "max-w-md" }) {
  return (
    <div className={`fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] ${maxWidth} bg-white rounded-2xl shadow-2xl p-6`}>
      {children}
    </div>
  );
}

function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Confirm", confirmVariant = "default", onConfirm }) {
  if (!open) return null;
  const isDanger = confirmVariant === "destructive";
  return (
    <>
      <DialogOverlay onClose={() => onOpenChange(false)} />
      <DialogBox>
        <div className="flex items-start gap-4 mb-5">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-amber-100 shrink-0">
            <TriangleAlert className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 leading-snug">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">{description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onOpenChange(false); onConfirm?.(); }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
              isDanger ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-black"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </DialogBox>
    </>
  );
}

function AlertDialog({ open, onOpenChange, title = "Error", description }) {
  if (!open) return null;
  return (
    <>
      <DialogOverlay onClose={() => onOpenChange(false)} />
      <DialogBox maxWidth="max-w-sm">
        <div className="flex items-start gap-4 mb-5">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-red-100 shrink-0">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 leading-snug">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">{description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="w-full px-4 py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white text-sm font-medium transition-colors"
        >
          OK
        </button>
      </DialogBox>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
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

  const [confirmDialog, setConfirmDialog] = useState({
    open: false, title: "", description: "",
    confirmLabel: "Confirm", confirmVariant: "default", onConfirm: null,
  });
  const [alertDialog, setAlertDialog] = useState({ open: false, title: "Error", description: "" });

  const openConfirm = useCallback(({ title, description, confirmLabel, confirmVariant = "default", onConfirm }) => {
    setConfirmDialog({ open: true, title, description, confirmLabel, confirmVariant, onConfirm });
  }, []);

  const showAlert = useCallback(({ title = "Error", description }) => {
    setAlertDialog({ open: true, title, description });
  }, []);

  useEffect(() => { fetchProposals(); fetchMeetings(); }, []);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await apiPrivate.get("proposals/");
      const data = res.data;
      const arr = Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : [];
      setProposals(arr);
      setFilteredProposals(arr);
    } catch (err) {
      console.error(err);
      setProposals([]); setFilteredProposals([]);
    } finally { setLoading(false); }
  };

  const fetchMeetings = async () => {
    try {
      const res = await apiPrivate.get("meetings/");
      const data = res.data;
      const arr = Array.isArray(data) ? data : data.results || [];
      const byProposal = {};
      arr.forEach((m) => {
        if (!byProposal[m.proposal]) byProposal[m.proposal] = [];
        byProposal[m.proposal].push(m);
      });
      setMeetings(byProposal);
    } catch (err) { console.error("Failed to fetch meetings:", err); }
  };

  useEffect(() => {
    let result = [...proposals];
    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.freelancer?.username?.toLowerCase().includes(q) ||
          p.freelancer?.email?.toLowerCase().includes(q) ||
          p.project?.title?.toLowerCase().includes(q) ||
          p.cover_letter?.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          if (a.status === "auto_rejected" && b.status !== "auto_rejected") return 1;
          if (b.status === "auto_rejected" && a.status !== "auto_rejected") return -1;
          if (a.final_score !== undefined && b.final_score !== undefined && b.final_score !== a.final_score)
            return b.final_score - a.final_score;
          return new Date(b.created_at) - new Date(a.created_at);
        case "newest": return new Date(b.created_at) - new Date(a.created_at);
        case "oldest": return new Date(a.created_at) - new Date(b.created_at);
        case "name":   return a.freelancer.username.localeCompare(b.freelancer.username);
        case "score":  return (b.final_score || 0) - (a.final_score || 0);
        case "status": return a.status.localeCompare(b.status);
        default:       return 0;
      }
    });
    setFilteredProposals(result);
  }, [proposals, searchQuery, statusFilter, sortBy]);

  const getStatusCounts = () => {
    const counts = { all: proposals.length, submitted: 0, shortlisted: 0, interviewing: 0, accepted: 0, rejected: 0, auto_rejected: 0, withdrawn: 0 };
    proposals.forEach((p) => { if (counts[p.status] !== undefined) counts[p.status]++; });
    return counts;
  };

  const updateStatus = async (proposalId, status) => {
    try {
      await apiPrivate.patch(`proposals/${proposalId}/status/`, { status });
      fetchProposals();
    } catch (err) {
      showAlert({
        title: "Status update failed",
        description: err.response?.data?.detail || err.response?.data?.status || "Something went wrong. Please try again.",
      });
    }
  };

  const handleCreateOffer = (proposalId) => router.push(`/client/create-offer?proposal=${proposalId}`);

  const getTimeAgo = (dateString) => {
    const diffH = Math.floor((new Date() - new Date(dateString)) / 3600000);
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    const diffW = Math.floor(diffD / 7);
    if (diffW < 4) return `${diffW}w ago`;
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDateTime = (d) =>
    new Date(d).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const getMeetingStatus = (meeting) => {
    const now = new Date(), start = new Date(meeting.start_time), end = new Date(meeting.end_time);
    if (["completed", "cancelled", "no_show", "ongoing"].includes(meeting.status)) return meeting.status;
    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "joinable";
    return "past";
  };

  const getProposalMeetings = (id) => meetings[id] || [];
  const counts = getStatusCounts();

  const STATUSES = ["all", "submitted", "shortlisted", "interviewing", "accepted", "rejected", "auto_rejected", "withdrawn"];

  const STAT_CARDS = [
    { key: "all",           label: "Total",        bg: "bg-white",      num: "text-gray-900", sub: "text-gray-500" },
    { key: "submitted",     label: "Submitted",    bg: "bg-blue-50",    num: "text-blue-600", sub: "text-blue-500" },
    { key: "shortlisted",   label: "Shortlisted",  bg: "bg-purple-50",  num: "text-purple-600", sub: "text-purple-500" },
    { key: "interviewing",  label: "Interviewing", bg: "bg-indigo-50",  num: "text-indigo-600", sub: "text-indigo-500" },
    { key: "accepted",      label: "Accepted",     bg: "bg-green-50",   num: "text-green-600", sub: "text-green-500" },
    { key: "rejected",      label: "Rejected",     bg: "bg-red-50",     num: "text-red-600", sub: "text-red-500" },
    { key: "auto_rejected", label: "Auto Rejected",bg: "bg-amber-50",   num: "text-amber-600", sub: "text-amber-500" },
    { key: "withdrawn",     label: "Withdrawn",    bg: "bg-gray-100",   num: "text-gray-600", sub: "text-gray-500" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4" />
          <p className="text-gray-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(v) => setConfirmDialog((d) => ({ ...d, open: v }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        confirmVariant={confirmDialog.confirmVariant}
        onConfirm={confirmDialog.onConfirm}
      />
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(v) => setAlertDialog((d) => ({ ...d, open: v }))}
        title={alertDialog.title}
        description={alertDialog.description}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Proposals</h1>
          <p className="text-sm text-gray-500">Review and manage project proposals from freelancers</p>
        </div>

        {/* Stats — 2 cols on mobile, 4 on sm, 8 on lg */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {STAT_CARDS.map(({ key, label, bg, num, sub }) => (
            <div key={key} className={`${bg} rounded-xl p-4 shadow-sm border border-white/60`}>
              <div className={`text-2xl font-bold ${num}`}>{counts[key]}</div>
              <div className={`text-xs font-medium mt-0.5 ${sub}`}>{label}</div>
            </div>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search freelancers, projects, or keywords…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700"
            >
              <Filter className="w-4 h-4" /> Filter & Sort
            </button>
            <div className="hidden sm:block relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none w-44 pl-4 pr-9 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="priority">Priority Order</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Freelancer Name</option>
                <option value="score">Match Score</option>
                <option value="status">Status</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {showMobileFilters && (
            <div className="sm:hidden mt-3 bg-white rounded-xl shadow-lg border border-gray-100 p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Filter by Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setStatusFilter(s); setShowMobileFilters(false); }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        statusFilter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop status tabs */}
        <div className="hidden sm:flex gap-2 mb-6 overflow-x-auto pb-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              <span className={`ml-1.5 text-xs ${statusFilter === s ? "text-gray-300" : "text-gray-400"}`}>
                {counts[s] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filteredProposals.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <FileText className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {searchQuery || statusFilter !== "all" ? "No matching proposals" : "No proposals yet"}
              </h3>
              <p className="text-sm text-gray-500">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Proposals from freelancers will appear here once they apply to your projects"}
              </p>
            </div>
          ) : (
            filteredProposals.map((proposal) => {
              const proposalMeetings = getProposalMeetings(proposal.id);
              const isExpanded = expandedProposal === proposal.id;

              return (
                <div
                  key={proposal.id}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
                    proposal.status === "auto_rejected" ? "opacity-60" : ""
                  }`}
                >
                  {/* Card header */}
                  <div
                    className="p-5 cursor-pointer select-none"
                    onClick={() => setExpandedProposal(isExpanded ? null : proposal.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900">{proposal.freelancer.username}</h3>
                              {proposal.final_score !== undefined && proposal.final_score > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                                  <Target className="w-3 h-3" />
                                  {proposal.final_score.toFixed(1)}% Match
                                </span>
                              )}
                              {proposal.auto_reject && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                                  <AlertTriangle className="w-3 h-3" /> Auto-Filtered
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{proposal.freelancer.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm pl-1">
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="font-medium text-gray-800 text-sm">{proposal.project.title}</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>{getTimeAgo(proposal.created_at)}</span>
                          </div>
                          {proposal.bid_hourly_rate && (
                            <><span className="text-gray-300">•</span><span className="text-xs font-medium text-gray-700">${proposal.bid_hourly_rate}/hr</span></>
                          )}
                          {proposal.bid_fixed_price && (
                            <><span className="text-gray-300">•</span><span className="text-xs font-medium text-gray-700">${proposal.bid_fixed_price} fixed</span></>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                        <StatusBadge status={proposal.status} />
                        <div className="flex items-center gap-1 ml-auto sm:ml-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Message"
                          >
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedProposal(isExpanded ? null : proposal.id); }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Meeting quick view */}
                    {proposal.status === "interviewing" && proposalMeetings.length > 0 && !isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {proposalMeetings.slice(0, 1).map((meeting) => {
                          const ms = getMeetingStatus(meeting);
                          return (
                            <div key={meeting.id} className="flex items-center gap-2.5">
                              <Video className="w-4 h-4 text-indigo-500 shrink-0" />
                              <span className="text-xs text-gray-600">
                                {ms === "upcoming"  && `Scheduled: ${formatDateTime(meeting.start_time)}`}
                                {ms === "joinable"  && "Interview is ready to join now"}
                                {ms === "ongoing"   && "Interview in progress"}
                                {ms === "completed" && "Interview completed"}
                              </span>
                              {ms === "joinable" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200 animate-pulse">
                                  <Play className="w-3 h-3" /> Join Now
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-5 space-y-5">

                      {/* Meetings */}
                      {proposal.status === "interviewing" && proposalMeetings.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Video className="w-4 h-4 text-indigo-600" /> Scheduled Meetings
                          </h4>
                          <div className="space-y-3">
                            {proposalMeetings.map((meeting) => {
                              const ms = getMeetingStatus(meeting);
                              return (
                                <div key={meeting.id} className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-indigo-900 capitalize">{meeting.meeting_type} Meeting</span>
                                        <MeetingStatusBadge status={ms} />
                                      </div>
                                      <div className="space-y-1.5 text-xs text-indigo-700">
                                        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /><span>Start: {formatDateTime(meeting.start_time)}</span></div>
                                        <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /><span>End: {formatDateTime(meeting.end_time)}</span></div>
                                        {ms === "ongoing" && meeting.actual_started_at && (
                                          <div className="flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5" /><span>Started: {formatDateTime(meeting.actual_started_at)}</span></div>
                                        )}
                                        {ms === "completed" && meeting.actual_ended_at && (
                                          <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5" /><span>Completed: {formatDateTime(meeting.actual_ended_at)}</span></div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                      {(ms === "joinable" || ms === "ongoing") && (
                                        <button onClick={() => router.push(`/meetings/${meeting.id}/join`)} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-xs font-medium transition-colors">
                                          <Video className="w-3.5 h-3.5" /> Join
                                        </button>
                                      )}
                                      <button onClick={() => router.push(`/meetings/${meeting.id}`)} className="px-3 py-2 bg-white hover:bg-gray-50 text-indigo-700 border border-indigo-200 rounded-lg flex items-center gap-2 text-xs font-medium transition-colors">
                                        <Eye className="w-3.5 h-3.5" /> Details
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Interview stage */}
                      {proposal.status === "interviewing" && proposal.interviewing_started_at && (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <h4 className="text-sm font-semibold text-purple-900">Interview Stage</h4>
                          </div>
                          <p className="text-xs text-purple-700">Started: {formatDateTime(proposal.interviewing_started_at)}</p>
                          {proposal.interviewing_duration_hours && (
                            <p className="text-xs text-purple-700 mt-1">
                              Duration: {Math.floor(proposal.interviewing_duration_hours / 24)}d {Math.floor(proposal.interviewing_duration_hours % 24)}h
                            </p>
                          )}
                        </div>
                      )}

                      {/* Match score */}
                      {proposal.final_score !== undefined && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" /> Match Score: {proposal.final_score.toFixed(1)}%
                            </h4>
                            {proposal.auto_reject && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                                <AlertTriangle className="w-3.5 h-3.5" /> Auto-filtered
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                proposal.final_score >= 70 ? "bg-green-500" :
                                proposal.final_score >= 50 ? "bg-yellow-500" : "bg-red-400"
                              }`}
                              style={{ width: `${Math.min(proposal.final_score, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Cover letter */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Cover Letter
                        </h4>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 max-h-64 overflow-y-auto">
                          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                            {proposal.cover_letter || "No cover letter provided."}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {proposal.status !== "auto_rejected" && proposal.status !== "withdrawn" && (
                          <>
                            <ActionButton
                              label="Shortlist"
                              icon={<CheckCircle className="w-4 h-4" />}
                              disabled={proposal.status !== "submitted"}
                              color="blue"
                              onClick={() => openConfirm({
                                title: "Shortlist this proposal?",
                                description: `${proposal.freelancer.username} will be moved to the shortlisted stage.`,
                                confirmLabel: "Shortlist",
                                onConfirm: () => updateStatus(proposal.id, "shortlisted"),
                              })}
                            />
                            <ActionButton
                              label="Interview"
                              icon={<MessageSquare className="w-4 h-4" />}
                              disabled={proposal.status !== "shortlisted"}
                              color="purple"
                              onClick={() => router.push(`/client/proposals/${proposal.id}/schedule-meeting`)}
                            />
                            <ActionButton
                              label="Accept"
                              icon={<CheckCircle className="w-4 h-4" />}
                              disabled={proposal.status !== "interviewing"}
                              color="green"
                              onClick={() => openConfirm({
                                title: "Accept this proposal?",
                                description: `You're about to accept ${proposal.freelancer.username}'s proposal.`,
                                confirmLabel: "Accept",
                                onConfirm: () => updateStatus(proposal.id, "accepted"),
                              })}
                            />
                            <ActionButton
                              label="Reject"
                              icon={<XCircle className="w-4 h-4" />}
                              disabled={proposal.status === "accepted" || proposal.status === "rejected"}
                              color="red"
                              onClick={() => openConfirm({
                                title: "Reject this proposal?",
                                description: `${proposal.freelancer.username}'s proposal will be marked as rejected. This cannot be undone.`,
                                confirmLabel: "Reject",
                                confirmVariant: "destructive",
                                onConfirm: () => updateStatus(proposal.id, "rejected"),
                              })}
                            />
                          </>
                        )}
                        {proposal.status === "accepted" && (
                          <ActionButton
                            label="Create Offer"
                            icon={<DollarSign className="w-4 h-4" />}
                            color="green"
                            onClick={() => handleCreateOffer(proposal.id)}
                          />
                        )}
                        <button
                          onClick={() => router.push(`/client/freelancer-profile/${proposal.freelancer.id}?proposal=${proposal.id}&status=${proposal.status}`)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" /> View Profile
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

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────
function MeetingStatusBadge({ status }) {
  const map = {
    upcoming:  { cls: "bg-blue-100 text-blue-800",            label: "Upcoming"    },
    joinable:  { cls: "bg-green-100 text-green-800 animate-pulse", label: "Join Now" },
    ongoing:   { cls: "bg-indigo-100 text-indigo-800",        label: "In Progress" },
    completed: { cls: "bg-gray-100 text-gray-700",            label: "Completed"   },
    cancelled: { cls: "bg-red-100 text-red-800",              label: "Cancelled"   },
    no_show:   { cls: "bg-amber-100 text-amber-800",          label: "No Show"     },
    past:      { cls: "bg-gray-100 text-gray-500",            label: "Past"        },
  };
  const { cls, label } = map[status] || map.past;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    submitted:    { cls: "bg-gray-100 text-gray-700",     icon: <Clock className="w-3 h-3" /> },
    shortlisted:  { cls: "bg-blue-100 text-blue-800",     icon: <CheckCircle className="w-3 h-3" /> },
    interviewing: { cls: "bg-purple-100 text-purple-800", icon: <MessageSquare className="w-3 h-3" /> },
    accepted:     { cls: "bg-green-100 text-green-800",   icon: <CheckCircle className="w-3 h-3" /> },
    rejected:     { cls: "bg-red-100 text-red-800",       icon: <XCircle className="w-3 h-3" /> },
    auto_rejected:{ cls: "bg-amber-100 text-amber-800",   icon: <AlertTriangle className="w-3 h-3" /> },
    withdrawn:    { cls: "bg-gray-100 text-gray-700",     icon: <XCircle className="w-3 h-3" /> },
  };
  const { cls, icon } = map[status] || { cls: "bg-gray-100 text-gray-700", icon: null };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
      {icon}
      {status.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
    </span>
  );
}

function ActionButton({ label, onClick, disabled, color = "black", icon }) {
  const colors = {
    blue:   "bg-blue-600 hover:bg-blue-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    green:  "bg-green-600 hover:bg-green-700",
    red:    "bg-red-600 hover:bg-red-700",
    black:  "bg-gray-900 hover:bg-black",
  };
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${colors[color]}`}
    >
      {icon}{label}
    </button>
  );
}

