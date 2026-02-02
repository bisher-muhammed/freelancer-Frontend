import { useState } from "react";
import { Send } from "lucide-react";
import { useChat } from "@/lib/hooks/useChat";

export default function ContractMessages({ contract }) {
  // 🚨 Hard requirement
  const chatRoomId = contract?.chat_room_id;

  if (!chatRoomId) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Chat not available for this contract.
      </div>
    );
  }

  const { messages, sendMessage, isConnected } = useChat(chatRoomId);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const ok = sendMessage(trimmed);
    if (ok) setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 🔒 This assumes backend exposes current user id
  const currentUserId = contract.current_user_id;

  return (
    <div className="bg-white border rounded-xl p-6 flex flex-col h-[500px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Contract Chat
        </h3>
        <span
          className={`text-xs ${
            isConnected ? "text-green-600" : "text-red-500"
          }`}
        >
          {isConnected ? "Live" : "Disconnected"}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-10">
            No messages yet
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-lg ${
                    isMe
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  <div
                    className={`text-[10px] mt-1 ${
                      isMe ? "text-indigo-200" : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="border-t pt-3">
        <div className="flex gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Type a message…"
            className="flex-1 resize-none text-black p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || !isConnected}
            className={`px-4 rounded-lg flex items-center gap-2 text-sm ${
              message.trim() && isConnected
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-shadow-black cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
