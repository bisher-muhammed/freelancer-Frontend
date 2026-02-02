import { useEffect, useRef, useState, useCallback } from "react";
import { apiPrivate } from "../apiPrivate";

export function useChat(chatId) {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const connectionAttemptRef = useRef(null);

  // Fetch initial messages from API
  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      const res = await apiPrivate.get(`chat/${chatId}/messages/`);

      const messagesData = Array.isArray(res.data.results)
        ? res.data.results.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender_id: msg.sender_id,
            sender_name: msg.sender_name,
            timestamp: msg.created_at,
            created_at: msg.created_at,
            is_read: msg.is_read,
          }))
        : [];

      setMessages(messagesData);
    } catch (err) {
      console.error("❌ Failed to fetch messages:", err);
      setMessages([]);
    }
  }, [chatId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // WebSocket connection
  useEffect(() => {
    if (!chatId) return;

    if (connectionAttemptRef.current) clearTimeout(connectionAttemptRef.current);
    if (socketRef.current) {
      socketRef.current.close(1000, "Reconnecting with new chatId");
      socketRef.current = null;
    }

    const accessToken = localStorage.getItem("access");
    if (!accessToken) return;

    connectionAttemptRef.current = setTimeout(() => {
      const socketUrl = `ws://localhost:9000/ws/chat/${chatId}/?token=${accessToken}`;
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;
      setIsConnected(false);

      socket.onopen = () => setIsConnected(true);

      socket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          
          const newMessage = {
            id: data.id || Date.now(),
            content: data.content || data.message,
            sender_id: data.sender_id,
            sender_name: data.sender_name,
            timestamp: data.timestamp || data.created_at || new Date().toISOString(),
            created_at: data.created_at || new Date().toISOString(),
            is_read: data.is_read || false,
          };
          
          setMessages((prev) => [...prev, newMessage]);
        } catch (err) {
          console.error("❌ Failed to parse WebSocket message:", err);
        }
      };

      socket.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
        setIsConnected(false);
      };

      socket.onclose = (e) => {
        console.warn("🔌 WebSocket closed:", e.code, e.reason);
        setIsConnected(false);

        // Reconnect if unexpected
        if (e.code !== 1000 && e.code !== 1001) {
          setTimeout(() => {
            if (chatId && accessToken) {
              const reconnectUrl = `ws://localhost:9000/ws/chat/${chatId}/?token=${accessToken}`;
              socketRef.current = new WebSocket(reconnectUrl);
            }
          }, 3000);
        }
      };
    }, 100);

    return () => {
      if (connectionAttemptRef.current) clearTimeout(connectionAttemptRef.current);
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounted");
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [chatId]);

  // Send a message
  const sendMessage = useCallback((content) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return false;
    try {
      socketRef.current.send(JSON.stringify({ content }));
      return true;
    } catch (err) {
      console.error("❌ Failed to send message:", err);
      return false;
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!chatId) return;
    try {
      await apiPrivate.post(`chat/${chatId}/mark-read/`);
    } catch (err) {
      console.error("❌ Failed to mark as read:", err);
    }
  }, [chatId]);

  return { messages, sendMessage, isConnected, fetchMessages, markAsRead };
}