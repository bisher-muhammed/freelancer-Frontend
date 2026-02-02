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
  PlusCircle,
  AlertCircle,
  Bell,
  Mail
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
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Connection Error</h3>
        <p className="text-gray-500 max-w-xs">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen bg-gray-50/50">
      {/* Header Section with Unread Count */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Messages</h1>
            <p className="text-gray-500 text-sm">Manage your project communications</p>
          </div>
          
          {/* Unread Count Badge - Always visible */}
          {!loading && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {totalUnreadCount} unread
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by project or freelancer name..."
          className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-sm shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute inset-y-0 right-3 flex items-center">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {!loading && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{filteredRooms.length}</span> 
              {searchQuery ? ` of ${rooms.length}` : ''} 
              {filteredRooms.length === 1 ? ' conversation' : ' conversations'}
            </div>
            
            {/* Unread Count in Filtered Results */}
            {filteredUnreadCount > 0 && (
              <div className="flex items-center gap-2 px-2.5 py-1 bg-red-50 border border-red-100 rounded-lg">
                <Bell className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-medium text-red-700">
                  {filteredUnreadCount} unread in results
                </span>
              </div>
            )}
          </div>
          
          {searchQuery && filteredRooms.length === 0 && rooms.length > 0 && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Chat List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3].map((n) => <SkeletonRow key={n} />)}
          </div>
        ) : filteredRooms.length > 0 ? (
          <>
            <div className="divide-y divide-gray-100">
              {filteredRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/client/chat/${room.id}`}
                  className="group flex items-center p-4 hover:bg-blue-50/50 transition-all cursor-pointer"
                >
                  {/* Avatar / Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                      <User className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
                    </div>
                    {room.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold border-2 border-white rounded-full flex items-center justify-center">
                        {room.unread_count > 99 ? '99+' : room.unread_count}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {room.project_title || "Untitled Project"}
                        </h3>
                        {room.unread_count > 0 && (
                          <span className="text-xs font-medium px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                            {room.unread_count}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatLastSeen(room.last_message?.created_at || room.last_message?.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate max-w-[250px] md:max-w-md">
                        <span className="font-medium text-gray-700">
                          {room.freelancer?.name || "Freelancer"}
                        </span>
                        {room.last_message && (
                          <span className="mx-1.5 opacity-50">•</span>
                        )}
                        {room.last_message?.content || "No messages yet"}
                      </p>
                      <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Summary Footer */}
            <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Total unread in all conversations:
                </span>
                <span className="font-bold text-gray-900 text-base">
                  {totalUnreadCount}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No chats found</h3>
            <p className="text-gray-500 text-sm mt-1">
              {searchQuery ? "Try adjusting your search terms." : "Start a conversation by hiring a freelancer."}
            </p>
            
            {/* Show unread count even when no chats exist */}
            {totalUnreadCount > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg inline-flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-700">
                    {totalUnreadCount} unread message{totalUnreadCount > 1 ? 's' : ''} pending
                  </p>
                  <p className="text-xs text-blue-500">
                    Messages will appear when you start a conversation
                  </p>
                </div>
              </div>
            )}
            
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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
    <div className="p-4 flex items-center animate-pulse">
      <div className="w-12 h-12 bg-gray-100 rounded-xl" />
      <div className="ml-4 flex-1">
        <div className="flex justify-between items-center mb-2">
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-3 bg-gray-50 rounded w-12" />
        </div>
        <div className="h-3 bg-gray-50 rounded w-1/2" />
      </div>
    </div>
  );
}