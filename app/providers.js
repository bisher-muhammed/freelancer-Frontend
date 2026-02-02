"use client";

import { useEffect, useRef } from "react";
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";
import { logout } from "../app/store/slices/userSlice";
import { jwtDecode } from "jwt-decode";
import { useRouter, usePathname } from "next/navigation";

import { NotificationsProvider } from "@/lib/providers/NotificationsProvider";

// -------------------------------
// Token Validation
// -------------------------------
function validateTokenAndLogout() {
  if (typeof window === "undefined") return false;

  const access = localStorage.getItem("access");
  if (!access) return false;

  try {
    const { exp } = jwtDecode(access);

    if (Date.now() >= exp * 1000) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return true;
    }

    return false;
  } catch {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    return true;
  }
}

// -------------------------------
// AppInitializer (ONLY Token Logic)
// -------------------------------
function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const hasChecked = useRef(false);

  // -------------------------------
  // Initial token check
  // -------------------------------
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const publicRoutes = ["/login", "/register", "/signup", "/", "/about"];
    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    if (validateTokenAndLogout() && !isPublicRoute) {
      dispatch(logout());
      router.push("/login");
    }
  }, [dispatch, router, pathname]);

  return children;
}

// -------------------------------
// Providers Wrapper
// -------------------------------
export function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        {/* ✅ Notifications start ONCE here */}
        <NotificationsProvider>
          <AppInitializer>{children}</AppInitializer>
        </NotificationsProvider>
      </PersistGate>
    </Provider>
  );
}
