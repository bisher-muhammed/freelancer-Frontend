"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import { apiPrivate } from "../apiPrivate";

const RECONNECT_DELAY = 3000;
const MAX_RETRIES = 5;

export function useChat(chatId) {

  const socketRef = useRef(null);

  const reconnectTimerRef = useRef(null);

  const retryCountRef = useRef(0);

  const [messages, setMessages] = useState([]);

  const [isConnected, setIsConnected] = useState(false);

  // ─────────────────────────────
  // Fetch initial messages
  // ─────────────────────────────
  const fetchMessages = useCallback(async () => {

    if (!chatId) return;

    try {

      const res = await apiPrivate.get(
        `chat/${chatId}/messages/`
      );

      const messagesData = Array.isArray(
        res.data.results
      )
        ? res.data.results.map((msg) => ({
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

      console.error(
        "❌ Failed to fetch messages:",
        err
      );

      setMessages([]);
    }

  }, [chatId]);

  // ─────────────────────────────
  // Fetch on mount/chat change
  // ─────────────────────────────
  useEffect(() => {

    fetchMessages();

  }, [fetchMessages]);

  // ─────────────────────────────
  // Cleanup socket
  // ─────────────────────────────
  const cleanupSocket = useCallback(() => {

    if (reconnectTimerRef.current) {

      clearTimeout(reconnectTimerRef.current);

      reconnectTimerRef.current = null;
    }

    if (socketRef.current) {

      socketRef.current.onclose = null;

      socketRef.current.close();

      socketRef.current = null;
    }

    setIsConnected(false);

  }, []);

  // ─────────────────────────────
  // Connect websocket
  // ─────────────────────────────
  const connectSocket = useCallback(() => {

    if (!chatId) return;

    if (
      socketRef.current &&
      socketRef.current.readyState !== WebSocket.CLOSED
    ) {
      return;
    }

    if (retryCountRef.current >= MAX_RETRIES) {

      console.warn(
        "❌ Max chat reconnect attempts reached"
      );

      return;
    }

    const wsBase =
      process.env.NEXT_PUBLIC_WS_URL;

    if (!wsBase) {

      console.error(
        "❌ NEXT_PUBLIC_WS_URL missing"
      );

      return;
    }

    const socketUrl =
      `${wsBase}/ws/chat/${chatId}/`;

    console.log(
      "🔌 Connecting chat websocket:",
      socketUrl
    );

    let socket;

    try {

      socket = new WebSocket(socketUrl);

    } catch (err) {

      console.error(
        "❌ WebSocket creation failed:",
        err
      );

      return;
    }

    socketRef.current = socket;

    // ─────────────────────────────
    // OPEN
    // ─────────────────────────────
    socket.onopen = () => {

      console.log(
        "✅ Chat websocket connected"
      );

      retryCountRef.current = 0;

      setIsConnected(true);
    };

    // ─────────────────────────────
    // MESSAGE
    // ─────────────────────────────
    socket.onmessage = (e) => {

      try {

        const data = JSON.parse(e.data);

        const newMessage = {
          id: data.id || Date.now(),
          content:
            data.content || data.message,
          sender_id: data.sender_id,
          sender_name: data.sender_name,
          timestamp:
            data.timestamp ||
            data.created_at ||
            new Date().toISOString(),
          created_at:
            data.created_at ||
            new Date().toISOString(),
          is_read: data.is_read || false,
        };

        setMessages((prev) => {

          const exists = prev.some(
            (msg) => msg.id === newMessage.id
          );

          if (exists) return prev;

          return [...prev, newMessage];
        });

      } catch (err) {

        console.error(
          "❌ Failed to parse WS message:",
          err
        );
      }
    };

    // ─────────────────────────────
    // ERROR
    // ─────────────────────────────
    socket.onerror = (err) => {

      console.error(
        "❌ Chat websocket error:",
        err
      );
    };

    // ─────────────────────────────
    // CLOSE
    // ─────────────────────────────
    socket.onclose = (e) => {

      console.warn(
        "🔌 Chat websocket closed:",
        e.code,
        e.reason
      );

      socketRef.current = null;

      setIsConnected(false);

      // Prevent reconnect if normal close
      if (
        e.code === 1000 ||
        e.code === 1001
      ) {
        return;
      }

      if (
        retryCountRef.current >= MAX_RETRIES
      ) {
        return;
      }

      retryCountRef.current += 1;

      reconnectTimerRef.current =
        setTimeout(() => {

          connectSocket();

        }, RECONNECT_DELAY);
    };

  }, [chatId]);

  // ─────────────────────────────
  // Lifecycle
  // ─────────────────────────────
  useEffect(() => {

    if (!chatId) {

      cleanupSocket();

      return;
    }

    retryCountRef.current = 0;

    connectSocket();

    return () => {

      cleanupSocket();
    };

  }, [
    chatId,
    connectSocket,
    cleanupSocket,
  ]);

  // ─────────────────────────────
  // Send message
  // ─────────────────────────────
  const sendMessage = useCallback(
    (content) => {

      if (
        !socketRef.current ||
        socketRef.current.readyState !==
          WebSocket.OPEN
      ) {

        console.warn(
          "❌ WebSocket not connected"
        );

        return false;
      }

      try {

        socketRef.current.send(
          JSON.stringify({ content })
        );

        return true;

      } catch (err) {

        console.error(
          "❌ Failed to send message:",
          err
        );

        return false;
      }
    },
    []
  );

  // ─────────────────────────────
  // Mark as read
  // ─────────────────────────────
  const markAsRead = useCallback(async () => {

    if (!chatId) return;

    try {

      await apiPrivate.post(
        `chat/${chatId}/mark-read/`
      );

    } catch (err) {

      console.error(
        "❌ Failed to mark read:",
        err
      );
    }

  }, [chatId]);

  return {
    messages,
    sendMessage,
    isConnected,
    fetchMessages,
    markAsRead,
  };
}
