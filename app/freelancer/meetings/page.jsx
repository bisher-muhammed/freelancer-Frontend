'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPrivate } from '@/lib/apiPrivate';

export default function FreelancerMeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await apiPrivate.get('/meetings/');
      setMeetings(res.data.results || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700 font-medium">Loading meetings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Meetings</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchMeetings}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!meetings.length) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-6 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Meetings Assigned</h3>
          <p className="text-gray-600 mb-6">You don't have any meetings scheduled at the moment.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Meetings</h1>
        <p className="text-gray-600 mt-2">
          You have {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} scheduled
        </p>
      </div>

      {/* Meetings Grid */}
      <div className="grid gap-4 md:gap-6">
        {meetings.map((meeting) => {
          const start = new Date(meeting.start_time);
          const end = new Date(meeting.end_time);
          const isLive = meeting.can_join;
          const isUpcoming = new Date(meeting.start_time) > new Date() && !isLive;
          const isPast = new Date(meeting.end_time) < new Date();

          const getStatusColor = () => {
            if (meeting.status === 'scheduled') return 'bg-blue-100 text-blue-800';
            if (meeting.status === 'ongoing') return 'bg-green-100 text-green-800';
            if (meeting.status === 'completed') return 'bg-gray-100 text-gray-800';
            if (meeting.status === 'cancelled') return 'bg-red-100 text-red-800';
            return 'bg-gray-100 text-gray-800';
          };

          const getTimeLabel = () => {
            if (isLive) return { text: 'LIVE NOW', color: 'bg-red-100 text-red-700' };
            if (isUpcoming) return { text: 'UPCOMING', color: 'bg-yellow-100 text-yellow-700' };
            if (isPast) return { text: 'ENDED', color: 'bg-gray-100 text-gray-700' };
            return { text: 'SCHEDULED', color: 'bg-blue-100 text-blue-700' };
          };

          const timeLabel = getTimeLabel();

          return (
            <div
              key={meeting.id}
              className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                {/* Left Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-indigo-50 text-indigo-700">
                      {meeting.meeting_type.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${timeLabel.color}`}>
                      {timeLabel.text}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor()}`}>
                      {meeting.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Meeting Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Meeting Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Start Time</p>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-900 font-medium">
                              {start.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <p className="text-gray-900 ml-6">
                            {start.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">End Time</p>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-900 font-medium">
                              {end.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <p className="text-gray-900 ml-6">
                            {end.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Duration</p>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-900">
                          {Math.round((end - start) / (1000 * 60))} minutes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="lg:w-48 flex flex-col gap-3">
                  {isLive ? (
                    <button
                      onClick={() => router.push(`/freelancer/meetings/${meeting.id}/room`)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join Meeting
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-500 font-medium py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Not Available
                    </button>
                  )}

                  <button
                    onClick={() => router.push(`/meetings/${meeting.id}`)}
                    className="w-full text-gray-700 hover:text-gray-900 font-medium py-2.5 px-4 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors text-sm"
                  >
                    View Meeting Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      {meetings.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              All times are displayed in your local timezone
            </p>
            <button
              onClick={fetchMeetings}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Meetings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}