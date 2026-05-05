"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useNotifications } from "@/lib/hooks/useNotifications";

const NotificationsContext = createContext(null);

const PUBLIC_ROUTES = ["/login", "/register", "/signup"];

export function NotificationsProvider({ children }) {
  const pathname = usePathname();

  // ✅ FIX: old code read `state.user?.access` but the slice stores the token
  //    inside `state.user.user.token` OR `state.user.access` depending on your
  //    userSlice shape. Reading the same key used in useNotifications is critical.
  //    Update this selector to match your actual Redux slice shape.
  const access = useSelector(
    (state) => state.user?.access ?? state.user?.user?.token ?? null
  );

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const enabled  = Boolean(access && !isPublic);

  const notif = useNotifications({ enabled });

  return (
    <NotificationsContext.Provider value={notif}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotificationContext must be used inside <NotificationsProvider>");
  return ctx;
}