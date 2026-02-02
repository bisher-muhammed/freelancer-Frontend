"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import { Clock, Calendar, Play, Pause, AlertCircle, Loader2, Timer, ChevronRight } from "lucide-react";

export default function FreelancerSessionTime() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchSessions() {
    setLoading(true);
    setError("");

    try {
      const response = await apiPrivate.get("freelancer-sessions/");
      const result = response.data;
      console.log("result",result)

      if (!Array.isArray(result)) {
        throw new Error("Invalid API response format");
      }

      setSessions(result);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
        err.message ||
        "Failed to load sessions"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  // Format date/time for better readability
  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format seconds to hours/minutes/seconds
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "0s";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
    }
    return `${remainingSeconds}s`;
  };

  // Get current active session (if any)
  const activeSession = sessions.find(session => !session.ended_at);

  // Calculate total time across all sessions
  const totalTime = sessions.reduce((acc, session) => acc + (session.total_seconds || 0), 0);

  // Handle session click
  const handleSessionClick = (sessionId) => {
    router.push(`/freelancer/tracking/${sessionId}`);
  };

  // ---- render logic ----
  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-xl p-8">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
        <p className="text-gray-600">Loading time sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6">
        <div className="flex flex-col items-center justify-center text-center p-8">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Load Sessions
          </h3>
          <p className="text-gray-600 max-w-md">{error}</p>
          <button
            onClick={fetchSessions}
            className="mt-6 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <Timer className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Time Sessions
        </h3>
        <p className="text-gray-600">
          You haven't recorded any work sessions yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Time Tracking</h2>
            <p className="text-gray-600 mt-1">
              Overview of your work sessions
            </p>
          </div>
          
          {/* Active session indicator */}
          {activeSession && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-700">Active Session</span>
            </div>
          )}
        </div>
      </div>

      {/* Current Session Stats */}
      <div className="p-6 border-b bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Timer className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">{sessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Time</p>
                <p className="text-2xl font-semibold text-gray-900">{formatDuration(totalTime)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                {activeSession ? (
                  <Play className="w-5 h-5 text-purple-600" />
                ) : (
                  <Pause className="w-5 h-5 text-purple-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <p className="text-lg font-semibold text-gray-900">
                  {activeSession ? "Working" : "Not Active"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session List */}
      <div className="divide-y divide-gray-100">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session History</h3>
        </div>
        
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => handleSessionClick(session.id)}
            className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Session Details */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    session.ended_at ? "bg-gray-100" : "bg-green-100"
                  }`}>
                    {session.ended_at ? (
                      <Pause className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Play className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDateTime(session.started_at)}
                        </span>
                      </div>
                      
                      <div className="hidden md:block text-gray-300">•</div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {session.ended_at ? formatDateTime(session.ended_at) : "In Progress"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Duration */}
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Duration:{" "}
                          <span className="font-medium text-gray-900">
                            {formatDuration(session.total_seconds)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side with status badge and arrow */}
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  session.ended_at 
                    ? "bg-gray-100 text-gray-700" 
                    : "bg-green-100 text-green-700"
                }`}>
                  {session.ended_at ? "Completed" : "Active"}
                </div>
                
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}