"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { apiPrivate } from "../apiPrivate";

const MAX_RETRIES = 5;
const RECONNECT_DELAY = 3000;

export function useNotifications({ enabled }) {

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const retryCountRef = useRef(0);
  const enabledRef = useRef(enabled);

  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // ─────────────────────────────
  // Shutdown socket completely
  // ─────────────────────────────
  const shutdown = useCallback(() => {

    retryCountRef.current = MAX_RETRIES;

    setIsConnected(false);

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.onclose = null;
      socketRef.current.close();
      socketRef.current = null;
    }

  }, []);

  // ─────────────────────────────
  // Fetch notifications
  // ─────────────────────────────
  const fetchNotifications = useCallback(async () => {

    if (!enabled) return;

    try {

      const res = await apiPrivate.get("/notifications/");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];

      setNotifications(data);

    } catch (err) {

      console.error("Notification fetch failed", err);

      if (err.response?.status === 401) {
        shutdown();
      }
    }

  }, [enabled, shutdown]);

  // ─────────────────────────────
  // Connect websocket
  // ─────────────────────────────
  const connectSocket = useCallback(() => {

    if (!enabledRef.current) return;

    if (
      socketRef.current &&
      socketRef.current.readyState !== WebSocket.CLOSED
    ) {
      return;
    }

    if (retryCountRef.current >= MAX_RETRIES) {
      return;
    }

    const protocol =
      window.location.protocol === "https:"
        ? "wss"
        : "ws";

    const wsBase =
      process.env.NEXT_PUBLIC_WS_URL ||
      `${protocol}://${window.location.host}`;

    // NO TOKEN IN URL
    const wsUrl = `${wsBase}/ws/notifications/`;

    let socket;

    try {

      socket = new WebSocket(wsUrl);

    } catch (err) {

      console.error("WebSocket creation failed", err);
      return;
    }

    socketRef.current = socket;

    socket.onopen = () => {

      retryCountRef.current = 0;
      setIsConnected(true);

      console.log("Notifications websocket connected");
    };

    socket.onmessage = (event) => {

      try {

        const data = JSON.parse(event.data);

        if (!data?.id) return;

        setNotifications((prev) => {

          if (prev.some((n) => n.id === data.id)) {
            return prev;
          }

          return [{ ...data, is_read: false }, ...prev];
        });

      } catch (err) {

        console.error("Invalid websocket payload", err);
      }
    };

    socket.onerror = () => {
      socket.close();
    };

    socket.onclose = () => {

      socketRef.current = null;

      setIsConnected(false);

      if (!enabledRef.current) return;

      if (retryCountRef.current >= MAX_RETRIES) return;

      retryCountRef.current += 1;

      reconnectTimerRef.current = setTimeout(
        connectSocket,
        RECONNECT_DELAY
      );
    };

  }, []);

  // ─────────────────────────────
  // Lifecycle
  // ─────────────────────────────
  useEffect(() => {

    if (!enabled) {

      shutdown();
      return;
    }

    retryCountRef.current = 0;

    fetchNotifications();

    connectSocket();

    return () => {

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
        socketRef.current = null;
      }
    };

  }, [enabled]);

  // ─────────────────────────────
  // Mark one read
  // ─────────────────────────────
  const markAsRead = useCallback(async (id) => {

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, is_read: true }
          : n
      )
    );

    try {

      await apiPrivate.post(`/notifications/${id}/read/`);

    } catch {

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, is_read: false }
            : n
        )
      );
    }

  }, []);

  // ─────────────────────────────
  // Mark all read
  // ─────────────────────────────
  const markAllAsRead = useCallback(async () => {

    const unreadIds = notifications
      .filter((n) => !n.is_read)
      .map((n) => n.id);

    if (!unreadIds.length) return;

    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        is_read: true,
      }))
    );

    try {

      await Promise.all(
        unreadIds.map((id) =>
          apiPrivate.post(`/notifications/${id}/read/`)
        )
      );

    } catch {

      setNotifications((prev) =>
        prev.map((n) =>
          unreadIds.includes(n.id)
            ? { ...n, is_read: false }
            : n
        )
      );
    }

  }, [notifications]);

  return {
    notifications,
    isConnected,
    markAsRead,
    markAllAsRead,
  };
}
