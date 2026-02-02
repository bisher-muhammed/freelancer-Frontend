"use client";
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import { addMinutes, isAfter, format } from "date-fns";
import { apiPrivate } from "@/lib/apiPrivate";
import "react-datepicker/dist/react-datepicker.css";
import { 
  X, Calendar, Clock, Video, AlertCircle, 
  CheckCircle, Loader2, Info, Briefcase, MessageSquare 
} from "lucide-react";

export default function MeetingModal({ isOpen, onClose, freelancerId, proposalId }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [chatRoom, setChatRoom] = useState(null);
  const [freelancerInfo, setFreelancerInfo] = useState(null);
  const fetchedRef = useRef(false);

  const [formData, setFormData] = useState({
    meeting_type: 'interview',
    start_time: null,
    end_time: null,
    notes: ''
  });

  const primaryColor = '#227C70';
  const accentColor = '#2F9D92';
  const lightBg = '#F0F9F8';
  const borderColor = '#D1ECEA';

  useEffect(() => {
    if (isOpen && freelancerId && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchChatRoom();
      fetchFreelancerInfo();
    } else if (!isOpen) {
      fetchedRef.current = false;
      setChatRoom(null);
      setFreelancerInfo(null);
      setError(null);
      setSuccess(null);
      setFormData({
        meeting_type: 'interview',
        start_time: null,
        end_time: null,
        notes: ''
      });
    }
  }, [isOpen, freelancerId]);

  const fetchFreelancerInfo = async () => {
    try {
      const response = await apiPrivate.get(`freelancer-profile/${freelancerId}/`);
      setFreelancerInfo(response.data);
    } catch (err) {
      console.error('Error fetching freelancer info:', err);
    }
  };

  const fetchChatRoom = async () => {
    try {
      setLoading(true);
      if (proposalId) {
        const chatResponse = await apiPrivate.post("chat-rooms/get-or-create/", { proposal: proposalId });
        const chatId = chatResponse.data.chat_id || chatResponse.data.id;
        if (chatId) {
          setChatRoom({ id: chatId, project_title: chatResponse.data.project_title || 'Project Discussion' });
          return;
        }
      }
      const response = await apiPrivate.get('chat-rooms/client/');
      const chatRooms = response.data?.results || response.data || [];
      if (chatRooms.length > 0) {
        const selectedRoom = chatRooms.find(room => room.freelancer?.id === parseInt(freelancerId)) || chatRooms[0];
        setChatRoom(selectedRoom);
      }
    } catch (err) {
      console.error('Error in fetchChatRoom:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.start_time || !formData.end_time) {
      setError('Please select both start and end times');
      return false;
    }
    if (!isAfter(formData.start_time, new Date())) {
      setError('Start time must be in the future');
      return false;
    }
    if (!isAfter(formData.end_time, formData.start_time)) {
      setError('End time must be after start time');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        meeting_type: formData.meeting_type,
        start_time: formData.start_time.toISOString(),
        end_time: formData.end_time.toISOString(),
        notes: formData.notes.trim(),
        freelancer: parseInt(freelancerId),
        chat_room: chatRoom?.id,
        proposal: proposalId ? parseInt(proposalId) : undefined
      };

      await apiPrivate.post('meetings/', payload);
      setSuccess('Meeting scheduled successfully!');
      
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to schedule meeting.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDuration = () => {
    if (!formData.start_time || !formData.end_time) return null;
    const diffMs = formData.end_time - formData.start_time;
    if (diffMs <= 0) return null;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 overflow-y-auto mt-10">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={onClose} />

        {/* Custom Styling to match Screenshot UI */}
        <style jsx global>{`
          .react-datepicker-wrapper { width: 100%; }
          .date-input-custom {
            width: 100%;
            padding: 0.75rem 1rem;
            border-radius: 0.75rem;
            border: 2px solid #E5E7EB;
            font-size: 0.875rem;
            outline: none;
            transition: all 0.2s;
            background-color: white;
          }
          .date-input-custom:focus {
            border-color: ${primaryColor};
            ring: 2px solid ${primaryColor}33;
          }
          .react-datepicker {
            font-family: inherit;
            border-radius: 1rem;
            border: 1px solid #E5E7EB;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
          .react-datepicker__header {
            background-color: white;
            border-bottom: 1px solid #F3F4F6;
            border-top-left-radius: 1rem;
            border-top-right-radius: 1rem;
          }
          .react-datepicker__day--selected {
            background-color: ${primaryColor} !important;
            border-radius: 0.5rem;
          }
        `}</style>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full relative">
          {/* Header */}
          <div className="px-6 pt-6 pb-4" style={{ backgroundColor: lightBg, borderBottom: `2px solid ${borderColor}` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-md"
                     style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Schedule Meeting</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Set up a video call with the freelancer</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="px-6 py-5 bg-white">
            {success && <div className="mb-5 p-4 rounded-xl bg-green-50 border-2 border-green-200 text-green-700 font-semibold">{success}</div>}
            {error && <div className="mb-5 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 font-semibold">{error}</div>}

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: primaryColor }} />
                <p className="text-gray-600">Setting up meeting...</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Meeting Type */}
                <div className="grid grid-cols-2 gap-3">
                  {['interview', 'review'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, meeting_type: type }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${formData.meeting_type === type ? 'border-teal-600 bg-teal-50' : 'border-gray-200'}`}
                    >
                      <p className="font-bold capitalize">{type}</p>
                      <p className="text-xs text-gray-500">{type === 'interview' ? 'Screening' : 'Feedback'}</p>
                    </button>
                  ))}
                </div>

                {/* Date and Time Pickers (12 Hour Format) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1.5">
                      <Calendar className="w-4 h-4 text-teal-600" /> Start Time
                    </label>
                    <DatePicker
                      selected={formData.start_time}
                      onChange={(date) => setFormData(p => ({ ...p, start_time: date }))}
                      showTimeSelect
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      placeholderText="Select start"
                      className="date-input-custom"
                      minDate={new Date()}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1.5">
                      <Clock className="w-4 h-4 text-teal-600" /> End Time
                    </label>
                    <DatePicker
                      selected={formData.end_time}
                      onChange={(date) => setFormData(p => ({ ...p, end_time: date }))}
                      showTimeSelect
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      placeholderText="Select end"
                      className="date-input-custom"
                      minDate={formData.start_time || new Date()}
                    />
                  </div>
                </div>

                {calculateDuration() && (
                  <div className="p-3 rounded-xl bg-sky-50 border-2 border-sky-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Duration</span>
                    <span className="font-bold text-teal-700">{calculateDuration()}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-600 outline-none resize-none h-24"
                    placeholder="Agenda details..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex flex-col-reverse sm:flex-row gap-3">
            <button onClick={onClose} className="px-5 py-3 rounded-xl border-2 border-gray-300 bg-white font-semibold">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="flex-1 px-5 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
              Schedule Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}