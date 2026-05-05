"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { apiPrivate } from "../apiPrivate";

const MAX_RETRIES     = 5;
const RECONNECT_DELAY = 3000;

export function useNotifications({ enabled }) {
  const socketRef         = useRef(null);
  const reconnectTimerRef = useRef(null);
  const retryCountRef     = useRef(0);
  const enabledRef        = useRef(enabled);

  // ✅ FIX 1: Read token from Redux store — same source apiPrivate relies on.
  //    Old code used localStorage.getItem("access") which can be stale / missing.
  const accessToken = useSelector((state) => state.user?.access);

  const [notifications, setNotifications] = useState([]);
  const [isConnected,   setIsConnected]   = useState(false);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  // ── Hard stop ─────────────────────────────────────────────────────────────
  const shutdown = useCallback(() => {
    retryCountRef.current = MAX_RETRIES; // stop any pending retry
    setIsConnected(false);

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.onclose = null; // prevent retry loop on intentional close
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  // ── Fetch existing notifications via REST ─────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;
    try {
      const res  = await apiPrivate.get("/notifications/");
      // ✅ FIX 2: handle both plain-array and paginated { results:[] } response shapes
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];
      setNotifications(data);
    } catch (err) {
      if (err.response?.status === 401) shutdown();
      else console.error("Fetch notifications failed:", err);
    }
  }, [enabled, shutdown]);

  // ── WebSocket connect ─────────────────────────────────────────────────────
  const connectSocket = useCallback(() => {
    if (!enabledRef.current)                   return;
    if (socketRef.current)                     return; // already open
    if (retryCountRef.current >= MAX_RETRIES)  return;

    // ✅ FIX 3: prefer Redux token; fall back to localStorage as safety net
    const token = accessToken || localStorage.getItem("access");
    if (!token) {
      console.warn("No access token — skipping WebSocket connection");
      return;
    }

    // ✅ FIX 4: URL must match Django ASGI routing exactly: ws/notifications/
    const wsUrl = `ws://localhost:9000/ws/notifications/?token=${token}`;

    let socket;
    try {
      socket = new WebSocket(wsUrl);
    } catch (err) {
      console.error("WebSocket construction failed:", err);
      return;
    }
    socketRef.current = socket;

    socket.onopen = () => {
      retryCountRef.current = 0;
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // ✅ FIX 5: guard against ping/pong frames or empty payloads
        if (!data?.id) return;
        setNotifications((prev) => {
          // Deduplicate: skip if we already have this notification
          if (prev.some((n) => n.id === data.id)) return prev;
          return [{ ...data, is_read: false }, ...prev];
        });
      } catch {
        console.error("Invalid WebSocket payload");
      }
    };

    socket.onerror = () => { socket.close(); };

    socket.onclose = () => {
      socketRef.current = null;
      setIsConnected(false);
      if (!enabledRef.current)                  return;
      if (retryCountRef.current >= MAX_RETRIES) return;
      retryCountRef.current += 1;
      reconnectTimerRef.current = setTimeout(connectSocket, RECONNECT_DELAY);
    };
  }, [accessToken]); // re-create only when token changes

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) { shutdown(); return; }

    retryCountRef.current = 0; // reset on fresh enable
    fetchNotifications();
    connectSocket();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // ── Mark one as read (optimistic) ─────────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await apiPrivate.post(`/notifications/${id}/read/`);
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
      );
    }
  }, []);

  // ── Mark all as read ──────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (!unreadIds.length) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await Promise.all(unreadIds.map((id) => apiPrivate.post(`/notifications/${id}/read/`)));
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (unreadIds.includes(n.id) ? { ...n, is_read: false } : n))
      );
    }
  }, [notifications]);

  return { notifications, isConnected, markAsRead, markAllAsRead };
}