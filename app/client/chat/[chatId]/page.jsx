"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useChat } from "@/lib/hooks/useChat";
import { 
  ArrowLeft, Send, Paperclip, Smile, Check, CheckCheck,
  Users, Mic, Phone, Video, Info,
  Pin, Download, Reply, Trash2, Copy, MoreHorizontal,
  Calendar, X, Maximize2, Hash, PhoneOff, Image as ImageIcon
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

  // Remove selected image
  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex h-screen bg-white font-sans">
      {/* Video/Audio Call Overlay */}
      {(isVideoCallActive || isAudioCallActive) && (
        <ZegoCall 
          chatRoomId={chatId} 
          callType={callType}
          onEndCall={endCall}
          userRole={currentUser?.role}
          chatId={chatId}
        />
      )}

      {/* Main Chat Interface */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white shadow-xl transition-all duration-300 ${
        (isVideoCallActive || isAudioCallActive) ? 'blur-sm opacity-50' : ''
      }`}>
        
        {/* Enhanced Header with Better Contrast */}
        <header className="h-18 flex items-center justify-between px-6 border-b-2 border-gray-200 bg-white z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-blue-300">
                  {chatTitle?.charAt(0)?.toUpperCase() || <Hash className="w-6 h-6" />}
                </div>
                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full shadow-sm ${
                  isConnected ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
              
              <div>
                <h1 className="font-bold text-lg text-gray-900 leading-tight">
                  {chatTitle || "Chat Room"}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className={`text-sm font-semibold ${
                    isConnected ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {isConnected ? 'Online' : 'Connecting...'}
                  </p>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600 font-medium">
                    {participants.length} {participants.length === 1 ? 'member' : 'members'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={startAudioCall}
              className={`p-3 hover:bg-gray-100 rounded-full transition-colors ${
                isAudioCallActive ? 'bg-green-50 text-green-600' : 'text-gray-700'
              }`}
              title="Audio Call"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button 
              onClick={startVideoCall}
              className={`p-3 hover:bg-gray-100 rounded-full transition-colors ${
                isVideoCallActive ? 'bg-green-50 text-green-600' : 'text-gray-700'
              }`}
              title="Video Call"
            >
              <Video className="w-5 h-5" />
            </button>
            <button 
              className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
              title="Chat Info"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Message Area with White Background */}
        <main 
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-2 bg-gray-50"
        >
          {groupedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-gray-200">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600 max-w-md">
                Start the conversation by sending a message below
              </p>
            </div>
          ) : (
            groupedMessages.map((msg, idx) => (
              <MessageItem 
                key={msg.id || idx} 
                msg={msg} 
                isMe={isMessageFromCurrentUser(msg)}
                currentUser={currentUser}
                onReply={setReplyTo}
              />
            ))
          )}
          <div ref={messagesEndRef} className="h-4" />
        </main>

        {/* Enhanced Footer / Input Area */}
        <footer className="bg-white p-4 border-t-2 border-gray-200 shadow-lg">
          {/* Reply Preview */}
          {replyTo && (
            <div className="flex items-center justify-between bg-blue-50 p-3 px-4 rounded-lg border-l-4 border-blue-600 mb-3 mx-2">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-blue-700 mb-0.5">
                  Replying to {replyTo.sender_name || 'User'}
                </p>
                <p className="text-sm text-gray-700 truncate">{replyTo.content}</p>
              </div>
              <button 
                onClick={() => setReplyTo(null)}
                className="p-1.5 hover:bg-blue-100 rounded-full ml-2 flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}

          {/* Image Preview */}
          {selectedImages.length > 0 && (
            <div className="flex gap-2 mb-3 mx-2 overflow-x-auto pb-2">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative flex-shrink-0">
                  <img 
                    src={URL.createObjectURL(img)} 
                    alt={`Selected ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="flex items-end gap-3 max-w-6xl mx-auto">
            <div className="flex items-center bg-gray-100 border-2 border-gray-200 rounded-2xl flex-1 px-2 min-h-[52px] focus-within:border-blue-500 transition-colors">
              <button 
                className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Emoji"
              >
                <Smile className="w-6 h-6" />
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Attach files"
              >
                <Paperclip className="w-6 h-6" />
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept="image/*"
                onChange={(e) => setSelectedImages([...e.target.files])} 
              />
              
              <textarea
                value={input}
                onChange={handleInputChange}
                rows={1}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-base py-3.5 px-2 resize-none max-h-32 outline-none text-gray-900 placeholder-gray-500 font-medium"
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
              disabled={(!input.trim() && selectedImages.length === 0) || isSending}
              className="w-14 h-14 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-all shadow-md active:scale-95 disabled:active:scale-100"
              title="Send message"
            >
              {isSending ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Typing Indicator */}
          {isTyping && (
            <div className="text-sm text-gray-600 mt-2 ml-2 font-medium">
              Someone is typing...
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}

// Enhanced Message Bubble Component
function MessageItem({ msg, isMe, currentUser, onReply }) {
  if (msg.type === 'date') {
    return (
      <div className="flex justify-center my-6">
        <span className="bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide shadow-sm">
          {new Date(msg.date).toLocaleDateString(undefined, { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${
      msg.isContinuation ? 'mt-1' : 'mt-4'
    }`}>
      <div className={`group relative max-w-[85%] md:max-w-[65%] flex gap-2.5 ${
        isMe ? 'flex-row-reverse' : 'flex-row'
      }`}>
        
        {/* Avatar - Only show on first message of group */}
        {!isMe && !msg.isContinuation ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-md border-2 border-blue-300">
            {msg.sender_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        ) : !isMe && <div className="w-10" />}

        <div className="flex flex-col gap-1">
          {/* Sender Name (only for others' first message in group) */}
          {!isMe && !msg.isContinuation && (
            <p className="text-xs font-bold text-gray-700 ml-3">
              {msg.sender_name || 'User'}
            </p>
          )}
          
          {/* Message Bubble */}
          <div className={`relative px-4 py-2.5 rounded-2xl shadow-md text-base font-medium ${
            isMe 
              ? 'bg-blue-600 text-white rounded-tr-sm' 
              : 'bg-white text-gray-900 rounded-tl-sm border-2 border-gray-200'
          } ${msg.isContinuation ? '' : 'rounded-tl-2xl rounded-tr-2xl'}`}>
            
            <p className="break-words leading-relaxed">{msg.content}</p>

            {/* Timestamp and Read Status */}
            <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${
              isMe ? 'opacity-80' : 'opacity-60'
            }`}>
              <span className="text-[11px] font-semibold">
                {new Date(msg.timestamp || msg.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              {isMe && (
                msg.is_read 
                  ? <CheckCheck className="w-4 h-4" /> 
                  : <Check className="w-4 h-4" />
              )}
            </div>

            {/* Reply Button (Hover) */}
            <button 
              onClick={() => onReply(msg)}
              className={`absolute top-1/2 -translate-y-1/2 ${
                isMe ? '-left-10' : '-right-10'
              } p-2 opacity-0 group-hover:opacity-100 transition-all bg-white border-2 border-gray-200 rounded-full shadow-md hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-gray-600`}
              title="Reply"
            >
              <Reply className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}