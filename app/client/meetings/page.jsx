'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPrivate } from '@/lib/apiPrivate';

function formatStatus(status) {
  return status.replace('_', ' ').toUpperCase();
}

function getTimeLabel(meeting) {
  if (meeting.can_join) return 'LIVE';
  if (meeting.is_upcoming) return 'UPCOMING';
  return 'ENDED';
}

export default function ClientMeetingsPage() {
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
      setMeetings(res.data.results);
    } catch (err) {
      console.error(err);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-gray-700">Loading meetings…</p>;
  if (error) return <p className="text-red-600 font-medium">{error}</p>;
  if (!meetings.length) return <p className="text-gray-700">No meetings scheduled.</p>;

  return (
    <div className="space-y-6 p-4 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Meetings</h1>
        <p className="text-gray-600 mt-1">View and join your scheduled meetings</p>
      </div>

      <div className="grid gap-4">
        {meetings.map(meeting => {
          const timeLabel = getTimeLabel(meeting);
          
          return (
            <div
              key={meeting.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="px-3 py-1 bg-blue-50 rounded-full">
                      <p className="text-blue-700 font-semibold text-sm">
                        {meeting.meeting_type.toUpperCase()} MEETING
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full ${
                      timeLabel === 'LIVE' ? 'bg-red-50' : 
                      timeLabel === 'UPCOMING' ? 'bg-yellow-50' : 'bg-gray-100'
                    }`}>
                      <span className={`font-semibold text-sm ${
                        timeLabel === 'LIVE' ? 'text-red-700' :
                        timeLabel === 'UPCOMING' ? 'text-yellow-700' : 'text-gray-700'
                      }`}>
                        {timeLabel}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Meeting Time</p>
                      <div className="flex items-center gap-4 text-gray-900">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">
                            {new Date(meeting.start_time).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">
                            {new Date(meeting.end_time).toLocaleString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            meeting.status === 'scheduled' ? 'bg-blue-500' :
                            meeting.status === 'ongoing' ? 'bg-green-500' :
                            meeting.status === 'completed' ? 'bg-gray-500' : 'bg-purple-500'
                          }`} />
                          <span className="font-semibold text-gray-900">
                            {formatStatus(meeting.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:w-48 flex flex-col gap-3">
                  {meeting.can_join ? (
                    <button
                      onClick={() => router.push(`/client/meetings/${meeting.id}/room`)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join Meeting
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-500 font-medium py-3 px-6 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Join Unavailable
                    </button>
                  )}
                  
                  <button
                    onClick={() => router.push(`/meetings/${meeting.id}`)}
                    className="w-full text-gray-700 hover:text-gray-900 font-medium py-2 px-6 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}