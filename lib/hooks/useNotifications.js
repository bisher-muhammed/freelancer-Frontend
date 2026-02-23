"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { apiPrivate } from "../apiPrivate";

const MAX_RETRIES = 5;
const RECONNECT_DELAY = 3000;

export function useNotifications({ enabled }) {
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const retryCountRef = useRef(0);

  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // -------------------------------
  // Fetch Notifications
  // -------------------------------
  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;

    try {
      const res = await apiPrivate.get("/notifications/");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];

      setNotifications(data);
    } catch (err) {
      if (err.response?.status === 401) {
        shutdown();
      } else {
        console.error("❌ Fetch notifications failed:", err);
      }
    }
  }, [enabled]);

  // -------------------------------
  // Shutdown (hard stop)
  // -------------------------------
  const shutdown = useCallback(() => {
    retryCountRef.current = 0;
    setIsConnected(false);

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  // -------------------------------
  // WebSocket Connect
  // -------------------------------
  const connectSocket = useCallback(() => {
    if (!enabled) return;
    if (socketRef.current) return;
    if (retryCountRef.current >= MAX_RETRIES) return;

    const token = localStorage.getItem("access");
    if (!token) return;

    const socket = new WebSocket(
      `ws://localhost:9000/ws/notifications/?token=${token}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      retryCountRef.current = 0;
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setNotifications((prev) => [data, ...prev]);
      } catch {
        console.error("❌ Invalid WS payload");
      }
    };

    socket.onerror = () => {
      socket.close();
    };

    socket.onclose = () => {
      socketRef.current = null;
      setIsConnected(false);

      if (!enabled) return;

      retryCountRef.current += 1;
      reconnectTimerRef.current = setTimeout(
        connectSocket,
        RECONNECT_DELAY
      );
    };
  }, [enabled]);

  // -------------------------------
  // Lifecycle
  // -------------------------------
  useEffect(() => {
    if (!enabled) {
      shutdown();
      return;
    }

    fetchNotifications();
    connectSocket();

    return shutdown;
  }, [enabled, fetchNotifications, connectSocket, shutdown]);

  // -------------------------------
  // Mark as Read
  // -------------------------------
  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    try {
      await apiPrivate.post(`/notifications/${id}/read/`);
    } catch {
      // rollback on failure
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: false } : n
        )
      );
    }
  }, []);

  return {
    notifications,
    isConnected,
    markAsRead,
  };
}
