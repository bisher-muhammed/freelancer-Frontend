"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useNotifications } from "@/lib/hooks/useNotifications";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const pathname = usePathname();
  const access = useSelector((state) => state.user?.access);

  const publicRoutes = ["/login", "/register", "/signup"];
  const isPublic = publicRoutes.some((r) =>
    pathname.startsWith(r)
  );

  const enabled = Boolean(access && !isPublic);

  const notif = useNotifications({ enabled });

  return (
    <NotificationsContext.Provider value={notif}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("Notification context missing");
  }
  return ctx;
}
