"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { apiPrivate } from "@/lib/apiPrivate";
import { 
  Search, 
  MessageSquare, 
  User, 
  Clock, 
  ChevronRight, 
  Filter,
  AlertCircle,
  Bell,
  Mail,
  Inbox
} from "lucide-react";

export default function ClientChatList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await apiPrivate.get("chat-rooms/client/");
        const data = res.data;
        setRooms(Array.isArray(data?.results) ? data.results : []);
      } catch (err) {
        console.error(err);
        setError("Failed to sync your conversations.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // --- Search Logic ---
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const title = room.project_title?.toLowerCase() || "";
      const freelancer = room.freelancer?.name?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return title.includes(query) || freelancer.includes(query);
    });
  }, [rooms, searchQuery]);

  // Calculate total unread count
  const totalUnreadCount = useMemo(() => {
    return rooms.reduce((total, room) => total + (room.unread_count || 0), 0);
  }, [rooms]);

  // Calculate filtered unread count
  const filteredUnreadCount = useMemo(() => {
    return filteredRooms.reduce((total, room) => total + (room.unread_count || 0), 0);
  }, [filteredRooms]);

  // --- Helper: Format Time ---
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-white">
        <div className="bg-red-50 rounded-full p-4 mb-4">
          <AlertCircle className="w-12 h-12 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h3>
        <p className="text-gray-600 max-w-md mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-screen bg-white">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Messages</h1>
            <p className="text-gray-600">Manage your project communications</p>
          </div>
          
          {/* Unread Count Badge */}
          {!loading && totalUnreadCount > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm">
              <Mail className="w-5 h-5" />
              <span className="font-semibold">
                {totalUnreadCount} unread message{totalUnreadCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by project or freelancer name..."
            className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-900 placeholder-gray-500 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <span className="text-sm font-medium">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      {!loading && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700">
              Showing <span className="text-gray-900 font-bold">{filteredRooms.length}</span>
              {searchQuery && rooms.length !== filteredRooms.length ? ` of ${rooms.length}` : ''} 
              {' '}{filteredRooms.length === 1 ? 'conversation' : 'conversations'}
            </div>
            
            {/* Filtered Unread Count */}
            {searchQuery && filteredUnreadCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                <Bell className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-700">
                  {filteredUnreadCount} unread
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat List Container */}
      <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4].map((n) => <SkeletonRow key={n} />)}
          </div>
        ) : filteredRooms.length > 0 ? (
          <>
            <div className="divide-y divide-gray-200">
              {filteredRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/client/chat/${room.id}`}
                  className="group flex items-center p-5 hover:bg-blue-50 transition-all cursor-pointer relative"
                >
                  {/* Unread Indicator Bar */}
                  {room.unread_count > 0 && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                  )}

                  {/* Avatar */}
                  <div className="relative flex-shrink-0 ml-2">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center border-2 border-blue-300 group-hover:border-blue-400 transition-all">
                      <User className="w-7 h-7 text-blue-700" />
                    </div>
                    {room.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 bg-red-600 text-white text-xs font-bold border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                        {room.unread_count > 99 ? '99+' : room.unread_count}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`font-bold text-base truncate group-hover:text-blue-600 transition-colors ${
                        room.unread_count > 0 ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {room.project_title || "Untitled Project"}
                      </h3>
                      <span className="text-xs font-medium text-gray-500 whitespace-nowrap ml-3 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {formatLastSeen(room.last_message?.created_at || room.last_message?.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold ${
                        room.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {room.freelancer?.name || "Freelancer"}
                      </span>
                      {room.unread_count > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-sm truncate max-w-[90%] ${
                      room.unread_count > 0 ? 'text-gray-700 font-medium' : 'text-gray-600'
                    }`}>
                      {room.last_message?.content || "No messages yet"}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ml-2" />
                </Link>
              ))}
            </div>
            
            {/* Summary Footer */}
            {totalUnreadCount > 0 && (
              <div className="border-t-2 border-gray-200 bg-gray-50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Total unread messages across all conversations:
                  </span>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg">
                    <Mail className="w-4 h-4" />
                    <span className="font-bold text-lg">
                      {totalUnreadCount}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-gray-200">
              {searchQuery ? (
                <Search className="w-10 h-10 text-gray-400" />
              ) : (
                <Inbox className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? "No matching conversations" : "No conversations yet"}
            </h3>
            <p className="text-gray-600 text-base max-w-md mx-auto mb-6">
              {searchQuery 
                ? "Try adjusting your search terms or clear the search to see all conversations." 
                : "Start a conversation by hiring a freelancer for your project."}
            </p>
            
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Loading State Component ---
function SkeletonRow() {
  return (
    <div className="p-5 flex items-center animate-pulse">
      <div className="w-14 h-14 bg-gray-200 rounded-full ml-2" />
      <div className="ml-4 flex-1">
        <div className="flex justify-between items-center mb-3">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-16" />
        </div>
        <div className="h-4 bg-gray-100 rounded w-1/4 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}