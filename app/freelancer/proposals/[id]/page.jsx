"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import {
  ArrowLeft,
  Loader2,
  XCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  Briefcase,
  FileText,
  Video,
  AlertCircle,
  ExternalLink,
  User,
  Building,
} from "lucide-react";

export default function ProposalDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProposalDetails();
  }, [id]);

  const fetchProposalDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiPrivate.get(`/freelancer/my-proposals/${id}/`);
      console.log("Proposal data:", response.data); // For debugging
      setProposal(response.data);
    } catch (err) {
      console.error("Error fetching proposal details:", err);
      if (err.response?.status === 404) {
        setError("Proposal not found");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view this proposal");
      } else {
        setError("Failed to load proposal details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || "pending";
    const styles = {
      active: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Clock },
      interview: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: Video },
      accepted: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle },
      declined: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle },
      pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: Clock },
    };

    const style = styles[statusLower] || styles.pending;
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${style.bg} ${style.text} ${style.border}`}>
        <Icon className="w-4 h-4" />
        {status?.charAt(0).toUpperCase() + status?.slice(1) || "Pending"}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatDeliveryTime = (duration) => {
    if (!duration) return "Not specified";
    const map = {
      "1_3_months": "1-3 months",
      "3_6_months": "3-6 months",
      "6_months_plus": "6+ months",
    };
    return map[duration] || duration.replace("_", " ");
  };

  const getMeetingStatus = (meeting) => {
    if (!meeting?.start_time || !meeting?.end_time) {
      return { text: "Unknown", color: "gray" };
    }

    const now = new Date();
    const startTime = new Date(meeting.start_time);
    const endTime = new Date(meeting.end_time);

    if (now < startTime) return { text: "Upcoming", color: "blue" };
    if (now >= startTime && now <= endTime) return { text: "In Progress", color: "green" };
    return { text: "Completed", color: "gray" };
  };

  // Safe getter functions
  const getClientInfo = () => {
    const project = proposal?.project;
    if (!project) return { company: "Client", city: "", country: "" };

    const client = project.client || {};
    return {
      company: client.company_name || "Client",
      city: client.city || "",
      country: client.country || "",
    };
  };

  const getBudgetInfo = () => {
    const project = proposal?.project;
    if (!project) return { type: "", amount: "", min: "", max: "" };

    return {
      type: project.budget_type || "fixed",
      amount: project.fixed_budget || "",
      min: project.hourly_min_rate || "",
      max: project.hourly_max_rate || "",
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600 mb-4" />
        <p className="text-gray-600">Loading proposal details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => router.push("/freelancer/proposals")}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Proposals
          </button>
          <button
            onClick={fetchProposalDetails}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!proposal) return null;

  const project = proposal.project || {};
  const clientInfo = getClientInfo();
  const budgetInfo = getBudgetInfo();
  const meetings = proposal.meetings || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Proposals</span>
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                {project.title || "Project Title"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4" />
                  {clientInfo.company}
                </span>
                {(clientInfo.city || clientInfo.country) && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {[clientInfo.city, clientInfo.country].filter(Boolean).join(", ")}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  {budgetInfo.type === "fixed" ? "Fixed Price" : "Hourly Rate"}
                </span>
              </div>
            </div>
            <div>{getStatusBadge(proposal.status)}</div>
          </div>

          {/* Project Description */}
          {project.description && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Project Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          )}
        </div>

        {/* Proposal Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Proposal</h2>

          {/* Bid Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Your Bid</p>
                <p className="text-xl font-bold text-gray-900">
                  {proposal.bid_fixed_price
                    ? `$${parseFloat(proposal.bid_fixed_price).toLocaleString()}`
                    : proposal.bid_hourly_rate
                    ? `$${proposal.bid_hourly_rate}/hr`
                    : "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Project Duration</p>
                <p className="text-xl font-bold text-gray-900">
                  {project.duration ? formatDeliveryTime(project.duration) : "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Submitted</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(proposal.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Cover Letter</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {proposal.cover_letter || "No cover letter provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Project Budget Info */}
        {(budgetInfo.amount || (budgetInfo.min && budgetInfo.max)) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">Client's Budget</h3>
                <p className="text-sm text-blue-800">
                  {budgetInfo.type === "fixed"
                    ? `Fixed: $${parseFloat(budgetInfo.amount).toLocaleString()}`
                    : `Hourly: $${budgetInfo.min} - $${budgetInfo.max}/hr`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Meetings Section */}
        {meetings.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Video className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Scheduled Meetings</h2>
              <span className="ml-auto text-sm text-gray-500">
                {meetings.length} {meetings.length === 1 ? "meeting" : "meetings"}
              </span>
            </div>

            <div className="space-y-4">
              {meetings.map((meeting) => {
                const status = getMeetingStatus(meeting);
                return (
                  <div
                    key={meeting.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{meeting.title || "Untitled Meeting"}</h3>
                        {meeting.description && (
                          <p className="text-sm text-gray-600">{meeting.description}</p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          status.color === "blue"
                            ? "bg-blue-50 text-blue-700"
                            : status.color === "green"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            status.color === "blue"
                              ? "bg-blue-500"
                              : status.color === "green"
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }`}
                        />
                        {status.text}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {meeting.start_time
                            ? new Date(meeting.start_time).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "No date set"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {meeting.start_time
                            ? `${new Date(meeting.start_time).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })} - ${new Date(meeting.end_time).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`
                            : "No time set"}
                        </span>
                      </div>
                    </div>

                    {meeting.meeting_link && (
                      <a
                        href={meeting.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
          <button
            onClick={() => router.push("/freelancer/proposals")}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Back to All Proposals
          </button>
        </div>
      </div>
  );
}