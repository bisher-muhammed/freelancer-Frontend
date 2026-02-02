"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotificationContext } from "@/lib/providers/NotificationsProvider";

export default function NotificationBell() {
  const { notifications, markAsRead } = useNotificationContext();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-gray-100 rounded-lg"
      >
        <Bell className="h-5 w-5 text-gray-700" />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border shadow-lg rounded-lg z-50">
          <h3 className="p-3 font-bold border-b">
            Notifications
          </h3>

          {notifications.length === 0 ? (
            <p className="p-3 text-gray-500">No notifications</p>
          ) : (
            notifications.slice(0, 5).map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  n.is_read ? "bg-gray-100" : ""
                }`}
              >
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
