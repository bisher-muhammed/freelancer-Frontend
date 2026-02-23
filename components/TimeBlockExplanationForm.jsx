"use client";
import React, { useState, useEffect } from "react";
import { apiPrivate } from "@/lib/apiPrivate";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  User
} from "lucide-react";

const TimeBlockExplanationForm = ({
  blockId,
  isOpen,
  onClose,
  onSubmitted,
  mode = "freelancer", // "freelancer" | "admin"
  initialFlag = false,
  initialReason = "",
  blockDetails = null // Pass block details for admin mode
}) => {
  const [text, setText] = useState("");
  const [flag, setFlag] = useState(initialFlag);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [adminStatus, setAdminStatus] = useState("PENDING");
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      setText(initialReason || "");
      setFlag(initialFlag || false);
      setError("");
      setSuccess(false);
      setAdminStatus("PENDING");
      setAdminNote("");
      
      // If block has existing explanation, prefill for admin
      if (mode === "admin" && blockDetails?.explanation) {
        setAdminStatus(blockDetails.explanation.admin_status || "PENDING");
        setAdminNote(blockDetails.explanation.admin_note || "");
        
        // Prefill text with existing flag reason if any
        if (!initialReason && blockDetails.flag_reason) {
          setText(blockDetails.flag_reason);
        }
      }
    }
  }, [isOpen, initialFlag, initialReason, mode, blockDetails]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    if (!seconds) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!blockId) {
      setError("Invalid time block");
      return;
    }

    if (mode === "admin" && !text.trim() && flag) {
      setError("Flag reason is required when flagging a block");
      return;
    }

    if (mode === "freelancer" && !text.trim()) {
      setError("Explanation is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (mode === "freelancer") {
        await apiPrivate.post("/time-blocks/explain/", {
          block_id: blockId,
          explanation: text.trim(),
        });
      } else {
        // For admin, we need to update both the flag and explanation review
        
        // 1. Update flag status and reason
        if (text.trim()) {
          await apiPrivate.patch(`/admin/time-blocks/${blockId}/flag/`, {
            is_flagged: flag,
            flag_reason: text.trim(),
          });
        } else {
          await apiPrivate.patch(`/admin/time-blocks/${blockId}/flag/`, {
            is_flagged: flag,
          });
        }
        
        // 2. If block has explanation, also update its status
        if (blockDetails?.explanation) {
          await apiPrivate.patch(`/admin/billing-units/${blockId}/explanation/review/`, {
            admin_status: adminStatus,
            admin_note: adminNote.trim(),
          });
        }
      }

      setSuccess(true);
      onSubmitted?.();

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[999999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              {mode === "admin" ? (
                <ShieldAlert className="w-5 h-5 text-red-600" />
              ) : (
                <MessageSquare className="w-5 h-5 text-blue-600" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {mode === "admin"
                  ? "Admin Review & Flag"
                  : "Explain Time Block"}
              </h3>
              <p className="text-sm text-gray-600">
                {mode === "admin"
                  ? "Flag or unflag based on screenshots and behavior"
                  : "Explain your activity during this time"}
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className="hover:bg-gray-100 rounded-lg p-1"
            >
              <XCircle className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Block Info for Admin */}
          {mode === "admin" && blockDetails && (
            <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-bold text-gray-700">Time Block Details</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium text-gray-700">
                      {formatTime(blockDetails.total_seconds || 0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 text-amber-500">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Idle Time</p>
                    <p className="font-medium text-amber-600">
                      {formatTime(blockDetails.idle_seconds || 0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 ${blockDetails.flag_source ? 'text-red-500' : 'text-gray-500'}`}>
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Flag Source</p>
                    <p className={`font-medium ${blockDetails.flag_source ? 'text-red-600' : 'text-gray-700'}`}>
                      {blockDetails.flag_source || 'Not flagged'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 text-blue-500">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">End Reason</p>
                    <p className="font-medium text-blue-600">
                      {blockDetails.end_reason || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Existing Freelancer Explanation (for Admin) */}
          {mode === "admin" && blockDetails?.explanation && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">Freelancer's Explanation</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100 mb-3">
                <p className="text-sm text-gray-800">{blockDetails.explanation.explanation}</p>
              </div>
              <p className="text-xs text-blue-600 text-right">
                Submitted: {blockDetails.explanation.created_at ? 
                  new Date(blockDetails.explanation.created_at).toLocaleString() : 
                  'Unknown'
                }
              </p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800">
                Saved successfully
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Admin flag toggle */}
            {mode === "admin" && (
              <div className="mb-4 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={flag}
                      onChange={(e) => setFlag(e.target.checked)}
                      className="w-5 h-5 accent-red-600"
                      id="flag-checkbox"
                    />
                    <label htmlFor="flag-checkbox" className="text-sm font-semibold text-gray-900">
                      Mark this time block as flagged
                    </label>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${flag ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {flag ? 'Will be flagged' : 'Will not be flagged'}
                  </span>
                </div>
                
                {/* Flag Reason Textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flag Reason (required if flagging)
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Why are you flagging this time block? (e.g., suspicious activity, low productivity, etc.)"
                    disabled={loading || success}
                    className="w-full h-32 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 resize-none"
                    maxLength={1000}
                  />
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    {text.length}/1000
                  </div>
                </div>
                
                {/* Existing Explanation Review */}
                {blockDetails?.explanation && (
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-bold text-amber-700">
                        Review Freelancer Explanation
                      </span>
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-amber-700 mb-2">
                        Admin Decision
                      </label>
                      <select
                        value={adminStatus}
                        onChange={(e) => setAdminStatus(e.target.value)}
                        className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="PENDING">Pending Review</option>
                        <option value="ACCEPTED">Accept Explanation</option>
                        <option value="REJECTED">Reject Explanation</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-amber-700 mb-2">
                        Admin Note (optional)
                      </label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Add notes about your decision..."
                        disabled={loading || success}
                        className="w-full h-24 border border-amber-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 resize-none"
                        maxLength={500}
                      />
                      <div className="mt-1 text-xs text-amber-500 text-right">
                        {adminNote.length}/500
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Freelancer Explanation Textarea */}
            {mode === "freelancer" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Explanation
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Explain what you were working on during this time block..."
                  disabled={loading || success}
                  className="w-full h-44 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 resize-none"
                  maxLength={2000}
                />
                <div className="mt-1 text-xs text-gray-500 text-right">
                  {text.length}/2000
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || (mode === "admin" && flag && !text.trim())}
                className={`flex-1 py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                  mode === "admin"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : mode === "admin" ? (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    Save Review
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    Submit Explanation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TimeBlockExplanationForm;