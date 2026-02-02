"use client";

import { createContext, useContext } from "react";
import { useNotifications } from "@/lib/hooks/useNotifications";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const notif = useNotifications(); 

  return (
    <NotificationsContext.Provider value={notif}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationsContext);

  if (!ctx) {
    throw new Error(
      "useNotificationContext must be used inside NotificationsProvider"
    );
  }

  return ctx;
}
