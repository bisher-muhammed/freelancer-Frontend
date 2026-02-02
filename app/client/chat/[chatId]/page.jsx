"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useChat } from "@/lib/hooks/useChat";
import { 
  ArrowLeft, Send, Paperclip, Smile, Check, CheckCheck,
  Users, Mic, Phone, Video, Info,
  Pin, Download, Reply, Trash2, Copy, MoreHorizontal,
  Calendar, X, Maximize2, Hash, PhoneOff
} from "lucide-react";
import ZegoCall from "@/lib/hooks/ZegoCall";

export default function ChatRoomPage() {
  const { chatId } = useParams();
  const router = useRouter();
  
  // Get current user from Redux store
  const currentUser = useSelector((state) => state.user.user);
  const currentUserId = currentUser?.id;
  
  const { 
    messages = [], 
    sendMessage, 
    isConnected, 
    markAsRead, 
    participants = [], 
    chatTitle 
  } = useChat(chatId);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isAudioCallActive, setIsAudioCallActive] = useState(false);
  const [callType, setCallType] = useState(null);

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Debug: Log current user info
  useEffect(() => {
    console.log("Current User from Redux:", currentUser);
    console.log("Current User ID:", currentUserId);
    console.log("Raw messages from useChat hook:", messages);
  }, [currentUser, currentUserId, messages]);

  // --- Logic: Improved Scroll Management ---
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceToBottom < 100);
  };

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (isAtBottom) scrollToBottom();
  }, [messages, isAtBottom]);

  // Mark messages as read
  useEffect(() => {
    if (messages.length && markAsRead) {
      markAsRead();
    }
  }, [messages, markAsRead]);

  // --- Logic: Typing & Sending ---
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!isTyping) setIsTyping(true);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
  };

  const onSend = async () => {
    if (!input.trim() && selectedImages.length === 0) return;
    setIsSending(true);
    
    // Send just the content string to match your WebSocket format
    const success = await sendMessage(input.trim());
    
    if (success) {
      setInput("");
      setSelectedImages([]);
      setReplyTo(null);
      scrollToBottom();
    }
    setIsSending(false);
  };

  // --- Video/Audio Call Functions ---
  const startVideoCall = () => {
    setCallType('video');
    setIsVideoCallActive(true);
    setIsAudioCallActive(false);
  };

  const startAudioCall = () => {
    setCallType('audio');
    setIsAudioCallActive(true);
    setIsVideoCallActive(false);
  };

  const endCall = () => {
    setIsVideoCallActive(false);
    setIsAudioCallActive(false);
    setCallType(null);
  };

  // Helper function to check if message is from current user
  const isMessageFromCurrentUser = (msg) => {
    if (currentUserId === null || currentUserId === undefined) {
      return false;
    }
    
    // Check if using sender_id field (from API)
    if (msg.sender_id !== undefined && msg.sender_id !== null) {
      const currentUserIdNum = Number(currentUserId);
      const senderIdNum = Number(msg.sender_id);
      return currentUserIdNum === senderIdNum;
    }
    
    return false;
  };

  // --- UI Helpers ---
  const groupedMessages = useMemo(() => {
    if (!Array.isArray(messages)) return [];
    
    return messages.reduce((acc, msg, i) => {
      const prevMsg = messages[i - 1];
      const isNewDay = !prevMsg || 
        new Date(msg.timestamp || msg.created_at).toDateString() !== new Date(prevMsg.timestamp || prevMsg.created_at).toDateString();
      
      // Check if same sender using sender_id
      const isSameSender = prevMsg && 
        prevMsg.sender_id === msg.sender_id && 
        !isNewDay;
      
      if (isNewDay) acc.push({ type: 'date', date: msg.timestamp || msg.created_at, id: `date-${msg.id || i}` });
      acc.push({ ...msg, isContinuation: isSameSender });
      return acc;
    }, []);
  }, [messages]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!currentUser && typeof window !== 'undefined') {
      console.warn("No user found in Redux, redirecting to login...");
      // Uncomment the line below to enable auto-redirect
      // router.push('/login');
    }
  }, [currentUser, router]);

  return (
    <div className="flex h-screen bg-[#F0F2F5] dark:bg-gray-900 font-sans text-gray-900">
      {/* Video/Audio Call Overlay */}
      {(isVideoCallActive || isAudioCallActive) && (
        <ZegoCall 
          chatRoomId={chatId} 
          callType={callType}
          onEndCall={endCall}
          userRole={currentUser?.role} // Make sure your user object has a 'role' field
          chatId={chatId}
        />
      )}

      {/* Main Chat Interface */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 ${
        (isVideoCallActive || isAudioCallActive) ? 'blur-sm opacity-50' : ''
      }`}>
        
        {/* Modern Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                {chatTitle?.charAt(0) || <Hash className="w-5 h-5" />}
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
            <div>
              <h1 className="font-semibold text-sm md:text-base leading-none">{chatTitle || "Group Chat"}</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-green-600 font-medium">
                  {isConnected ? 'Online' : 'Connecting...'}
                </p>
                <span className="text-xs text-gray-500">• {participants.length} members</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-3">
            <button 
              onClick={startAudioCall}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors ${
                isAudioCallActive ? 'text-green-600 bg-green-50' : ''
              }`}
            >
              <Phone className="w-5 h-5" />
            </button>
            <button 
              onClick={startVideoCall}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors ${
                isVideoCallActive ? 'text-green-600 bg-green-50' : ''
              }`}
            >
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <Info className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Message Area */}
        <main 
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#E5DDD5] dark:bg-gray-950 scroll-smooth"
          style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')`, backgroundOpacity: 0.05 }}
        >
          {groupedMessages.map((msg, idx) => (
            <MessageItem 
              key={msg.id || idx} 
              msg={msg} 
              isMe={isMessageFromCurrentUser(msg)}
              currentUser={currentUser}
              onReply={setReplyTo}
            />
          ))}
          <div ref={messagesEndRef} className="h-4" />
        </main>

        {/* Dynamic Footer / Input */}
        <footer className="bg-white dark:bg-gray-800 p-3 border-t dark:border-gray-700">
          {replyTo && (
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 px-4 rounded-t-lg border-l-4 border-blue-500 mb-2">
              <div className="text-xs">
                <p className="font-bold text-blue-600">Replying to {replyTo.sender_name || 'User'}</p>
                <p className="text-gray-500 truncate">{replyTo.content}</p>
              </div>
              <button onClick={() => setReplyTo(null)}><X className="w-4 h-4" /></button>
            </div>
          )}

          <div className="flex items-end gap-2 max-w-6xl mx-auto">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-2xl flex-1 px-3 min-h-[48px]">
              <button className="p-2 text-gray-500 hover:text-blue-500"><Smile className="w-6 h-6" /></button>
              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-blue-500">
                <Paperclip className="w-6 h-6" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                onChange={(e) => setSelectedImages([...e.target.files])} 
              />
              
              <textarea
                value={input}
                onChange={handleInputChange}
                rows={1}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 resize-none max-h-32 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
              />
            </div>

            <button 
              onClick={onSend}
              disabled={!input.trim() && selectedImages.length === 0}
              className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full transition-all shadow-md active:scale-90"
            >
              {isSending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Sub-component for Message Bubbles
function MessageItem({ msg, isMe, currentUser, onReply }) {
  if (msg.type === 'date') {
    return (
      <div className="flex justify-center my-4">
        <span className="bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-gray-400 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {new Date(msg.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${msg.isContinuation ? 'mt-0.5' : 'mt-4'}`}>
      <div className={`group relative max-w-[85%] md:max-w-[70%] flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar - Only show on first message of group */}
        {!isMe && !msg.isContinuation ? (
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
            {msg.sender_name?.charAt(0) || 'U'}
          </div>
        ) : !isMe && <div className="w-8" />}

        <div className={`relative px-3 py-2 rounded-2xl shadow-sm text-sm ${
          isMe 
            ? 'bg-blue-600 text-white rounded-tr-none' 
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none'
        }`}>
          {!isMe && !msg.isContinuation && (
            <p className="text-[11px] font-bold text-indigo-500 mb-1 leading-none">{msg.sender_name || 'User'}</p>
          )}
          
          {msg.content}

          <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
            <span className="text-[10px]">
              {new Date(msg.timestamp || msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isMe && (
              msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
            )}
          </div>

          {/* Context Actions (Hover) */}
          <button 
            onClick={() => onReply(msg)}
            className={`absolute top-0 ${isMe ? '-left-8' : '-right-8'} p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-700 rounded-full shadow-sm hover:text-blue-500`}
          >
            <Reply className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}