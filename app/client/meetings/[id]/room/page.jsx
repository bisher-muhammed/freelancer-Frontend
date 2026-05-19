"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import ZegoMeeting from "@/lib/hooks/ZegoMeeting";
import Link from "next/link";
import {
  Video, Clock, Calendar, ChevronLeft, RefreshCw,
  AlertCircle, Lock, Users, ArrowLeft,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const durationMins = (start, end) =>
  Math.round((new Date(end) - new Date(start)) / 60000);

const timeUntil = (d) => {
  const diff = new Date(d) - new Date();
  if (diff <= 0) return "Starting now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

// ─── Countdown ticker ─────────────────────────────────────────────────────────

function Countdown({ startTime }) {
  const [label, setLabel] = useState(timeUntil(startTime));

  useEffect(() => {
    const t = setInterval(() => setLabel(timeUntil(startTime)), 1000);
    return () => clearInterval(t);
  }, [startTime]);

  return <span>{label}</span>;
}

// ─── Pre-meeting screen (meeting exists but can't join yet) ───────────────────

function PreMeetingScreen({ meeting, domainRole, onBack }) {
  const isUpcoming  = meeting.is_upcoming;
  const isCompleted = meeting.status === "completed";
  const isCancelled = meeting.status === "cancelled";
  const duration    = durationMins(meeting.start_time, meeting.end_time);

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#227C70] transition-colors mb-6"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Meetings
        </button>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          {/* Status band */}
          <div className={`h-1.5 w-full ${
            isCompleted ? 'bg-slate-300' :
            isCancelled ? 'bg-red-400' :
            'bg-amber-400'
          }`} />

          <div className="p-8 text-center">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
              isCompleted ? 'bg-slate-100' :
              isCancelled ? 'bg-red-50' :
              'bg-amber-50'
            }`}>
              {isCancelled ? (
                <AlertCircle className="h-8 w-8 text-red-400" />
              ) : isCompleted ? (
                <Video className="h-8 w-8 text-slate-400" />
              ) : (
                <Lock className="h-8 w-8 text-amber-500" />
              )}
            </div>

            {/* State message */}
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {isCancelled ? 'Meeting Cancelled' :
               isCompleted ? 'Meeting Ended' :
               'Meeting Not Open Yet'}
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {isCancelled
                ? 'This meeting has been cancelled.'
                : isCompleted
                ? 'This meeting has already concluded.'
                : 'The meeting room will open shortly before the scheduled start time.'}
            </p>

            {/* Meeting details */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-left space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                  <p className="text-sm font-semibold text-slate-800">{fmtDate(meeting.start_time)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Time</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {fmtTime(meeting.start_time)} → {fmtTime(meeting.end_time)}
                    <span className="text-slate-400 font-normal ml-1.5">({duration} min)</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Your Role</p>
                  <p className="text-sm font-semibold text-slate-800 capitalize">{domainRole}</p>
                </div>
              </div>
            </div>

            {/* Countdown for upcoming */}
            {isUpcoming && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 text-center">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-1">Starts in</p>
                <p className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
                  <Countdown startTime={meeting.start_time} />
                </p>
              </div>
            )}

            <button
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Meetings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main room ────────────────────────────────────────────────────────────────

export default function ClientMeetingRoom() {
  const { id }  = useParams();
  const router  = useRouter();

  const [meeting,  setMeeting]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchMeeting = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiPrivate.get(`/meetings/${id}/`);
      setMeeting(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.status === 404
          ? "Meeting not found."
          : "Failed to load meeting. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchMeeting(); }, [fetchMeeting]);

  const handleBack = () => router.push("/client/meetings");

  const handleMeetingEnd = () => router.replace("/client/meetings");

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#227C70] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading meeting room…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-4">
        <div className="bg-white border border-red-100 rounded-2xl p-10 max-w-sm w-full text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-700 mb-5">{error}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={fetchMeeting}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#227C70] text-white text-sm font-semibold hover:bg-[#1a5f55] transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </button>
            <button
              onClick={handleBack}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Meetings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Meeting not joinable ─────────────────────────────────────────────────
  if (!meeting?.can_join) {
    const domainRole =
      meeting?.current_user_id === meeting?.client_id ? "client" : "freelancer";
    return (
      <PreMeetingScreen
        meeting={meeting}
        domainRole={domainRole}
        onBack={handleBack}
      />
    );
  }

  // ── Meeting room ─────────────────────────────────────────────────────────
  const domainRole =
    meeting.current_user_id === meeting.client_id ? "client" : "freelancer";

  return (
    <ZegoMeeting
      meetingId={meeting.id}
      userId={meeting.current_user_id}
      userRole={domainRole}
      onMeetingEnd={handleMeetingEnd}
    />
  );
}
