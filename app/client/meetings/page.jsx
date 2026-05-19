'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiPrivate } from '@/lib/apiPrivate';
import Link from 'next/link';
import {
  Video, Clock, ChevronLeft, RefreshCw, Calendar,
  AlertCircle, Lock, Radio, CheckCircle, ChevronRight,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const durationMins = (start, end) =>
  Math.round((new Date(end) - new Date(start)) / 60000);

const timeUntil = (d) => {
  const diff = new Date(d) - new Date();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `in ${Math.floor(h / 24)}d`;
  if (h > 0)  return `in ${h}h ${m}m`;
  return `in ${m}m`;
};

const STATUS_META = {
  scheduled: { label: 'Scheduled', dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-200'   },
  ongoing:   { label: 'Ongoing',   dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  completed: { label: 'Completed', dot: 'bg-slate-400',  badge: 'bg-slate-50 text-slate-600 border-slate-200' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-400',    badge: 'bg-red-50 text-red-700 border-red-200'       },
};

const TYPE_LABELS = {
  video: 'Video Call',
  audio: 'Audio Call',
  interview: 'Interview',
};

// ─── Meeting card ─────────────────────────────────────────────────────────────

function MeetingCard({ meeting, onJoin }) {
  const router   = useRouter();
  const isLive   = meeting.can_join;
  const isUpcoming = meeting.is_upcoming && !isLive;
  const statusM  = STATUS_META[meeting.status] ?? STATUS_META.scheduled;
  const until    = isUpcoming ? timeUntil(meeting.start_time) : null;
  const duration = durationMins(meeting.start_time, meeting.end_time);

  return (
    <div className={`group bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
      isLive
        ? 'border-emerald-300 shadow-md shadow-emerald-100/60'
        : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100'
    }`}>
      {/* Live pulse bar */}
      {isLive && (
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 animate-pulse" />
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">

          {/* Left — icon */}
          <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center shadow-sm ${
            isLive ? 'bg-emerald-500' : 'bg-slate-100'
          }`}>
            <Video className={`h-5 w-5 ${isLive ? 'text-white' : 'text-slate-500'}`} />
          </div>

          {/* Centre — info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {/* Type badge */}
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {TYPE_LABELS[meeting.meeting_type] ?? meeting.meeting_type}
              </span>

              {/* Status badge */}
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusM.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusM.dot} ${isLive ? 'animate-pulse' : ''}`} />
                {isLive ? 'Live Now' : statusM.label}
              </span>

              {/* Countdown for upcoming */}
              {until && (
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  {until}
                </span>
              )}
            </div>

            {/* Date/time row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {fmtDate(meeting.start_time)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {fmtTime(meeting.start_time)} → {fmtTime(meeting.end_time)}
                <span className="text-slate-400 text-xs">({duration} min)</span>
              </span>
            </div>

            {/* Meeting ID */}
            <p className="text-xs text-slate-400 font-mono">Meeting #{meeting.id}</p>
          </div>

          {/* Right — actions */}
          <div className="flex flex-row sm:flex-col gap-2 sm:w-40 shrink-0">
            {isLive ? (
              <button
                onClick={() => onJoin(meeting.id)}
                className="flex-1 sm:w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-sm font-bold rounded-xl transition-all duration-150 shadow-sm shadow-emerald-200"
              >
                <Radio className="h-4 w-4" />
                Join Now
              </button>
            ) : (
              <button
                disabled
                className="flex-1 sm:w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 text-slate-400 text-sm font-semibold rounded-xl cursor-not-allowed"
              >
                <Lock className="h-4 w-4" />
                {isUpcoming ? 'Not Yet Open' : 'Unavailable'}
              </button>
            )}
            <button
              onClick={() => router.push(`/client/meetings/${meeting.id}/room`)}
              className="flex-1 sm:w-full flex items-center justify-center gap-1.5 py-2.5 px-4 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              Details
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MeetingSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 animate-pulse">
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2.5 pt-1">
          <div className="flex gap-2">
            <div className="h-5 w-24 bg-slate-100 rounded-full" />
            <div className="h-5 w-20 bg-slate-100 rounded-full" />
          </div>
          <div className="h-4 bg-slate-100 rounded w-2/3" />
          <div className="h-3 bg-slate-100 rounded w-1/4" />
        </div>
        <div className="w-36 space-y-2 shrink-0">
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ClientMeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState(null);

  const fetchMeetings = useCallback(async (silent = false) => {
    try {
      silent ? setRefreshing(true) : setLoading(true);
      setError(null);
      const { data } = await apiPrivate.get('/meetings/');
      // Handle both paginated and plain array responses
      setMeetings(data?.results ?? (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error(err);
      setError('Failed to load meetings. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  const handleJoin = (id) => router.push(`/client/meetings/${id}/room`);

  // Split into sections
  const live     = meetings.filter((m) => m.can_join);
  const upcoming = meetings.filter((m) => m.is_upcoming && !m.can_join);
  const past     = meetings.filter((m) => !m.is_upcoming && !m.can_join);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .meetings-root { font-family: 'DM Sans', sans-serif; }
        .brand-font    { font-family: 'Syne', sans-serif; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-up { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.1) both; }
      `}</style>

      <div className="meetings-root min-h-screen bg-[#f8f9fb] p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* ── Header ── */}
          <div className="slide-up">
            <Link
              href="/client/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#227C70] transition-colors mb-4"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="brand-font text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                  My Meetings
                </h1>
                <p className="text-sm text-slate-500 mt-1.5 font-medium">
                  {loading ? 'Loading…' : `${meetings.length} meeting${meetings.length !== 1 ? 's' : ''} total`}
                </p>
              </div>
              <button
                onClick={() => fetchMeetings(true)}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div className="space-y-4">
              {Array(3).fill(null).map((_, i) => <MeetingSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="bg-white border border-red-100 rounded-2xl p-12 text-center shadow-sm">
              <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 mb-4">{error}</p>
              <button
                onClick={() => fetchMeetings()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#227C70] text-white text-sm font-semibold rounded-xl hover:bg-[#1a5f55] transition-colors"
              >
                <RefreshCw className="h-4 w-4" /> Try Again
              </button>
            </div>
          ) : meetings.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm slide-up">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-base font-bold text-slate-700 mb-1">No meetings scheduled</p>
              <p className="text-sm text-slate-400">
                Meetings will appear here once a freelancer or client schedules one.
              </p>
            </div>
          ) : (
            <div className="space-y-8">

              {/* Live */}
              {live.length > 0 && (
                <section className="slide-up">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">Live Now</h2>
                  </div>
                  <div className="space-y-3">
                    {live.map((m) => <MeetingCard key={m.id} meeting={m} onJoin={handleJoin} />)}
                  </div>
                </section>
              )}

              {/* Upcoming */}
              {upcoming.length > 0 && (
                <section className="slide-up" style={{ animationDelay: '0.05s' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600">Upcoming</h2>
                  </div>
                  <div className="space-y-3">
                    {upcoming.map((m) => <MeetingCard key={m.id} meeting={m} onJoin={handleJoin} />)}
                  </div>
                </section>
              )}

              {/* Past */}
              {past.length > 0 && (
                <section className="slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-3.5 w-3.5 text-slate-400" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Past</h2>
                  </div>
                  <div className="space-y-3 opacity-80">
                    {past.map((m) => <MeetingCard key={m.id} meeting={m} onJoin={handleJoin} />)}
                  </div>
                </section>
              )}

            </div>
          )}
        </div>
      </div>
    </>
  );
}