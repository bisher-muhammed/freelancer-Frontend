import { useEffect, useRef, useState, useCallback } from "react";
import { apiPrivate } from "@/lib/apiPrivate";

export function useNotifications() {
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // -------------------------------
  // Fetch initial notifications
  // -------------------------------
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiPrivate.get("/notifications/");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];

      setNotifications(data);
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err);
    }
  }, []);

  // -------------------------------
  // WebSocket Connect Function
  // -------------------------------
  const connectSocket = useCallback(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    const socketUrl = `ws://localhost:9000/ws/notifications/?token=${token}`;
    const socket = new WebSocket(socketUrl);

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ Notifications WebSocket connected");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        console.log("🔔 New Notification:", data);

        // Add new notification at top
        setNotifications((prev) => [data, ...prev]);
      } catch (err) {
        console.error("❌ Notification parse error:", err);
      }
    };

    socket.onclose = () => {
      console.warn("🔌 Notifications socket closed");
      setIsConnected(false);

      reconnectTimerRef.current = setTimeout(() => {
        connectSocket();
      }, 3000);
    };
  }, []);

  // -------------------------------
  // Start once
  // -------------------------------
  useEffect(() => {
    fetchNotifications();
    connectSocket();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);

      if (socketRef.current) socketRef.current.close();
    };
  }, [fetchNotifications, connectSocket]);

  // -------------------------------
  // Mark as Read
  // -------------------------------
  const markAsRead = useCallback(async (notifId) => {
    try {
      await apiPrivate.post(`/notifications/${notifId}/read/`);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notifId ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error("❌ Failed to mark read:", err);
    }
  }, []);

  return {
    notifications,
    isConnected,
    markAsRead,
  };
}
