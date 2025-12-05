"use client";

import { useEffect, useRef } from "react";
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";
import { logout } from "../app/store/slices/userSlice";
import { jwtDecode } from "jwt-decode";
import { useRouter, usePathname } from "next/navigation";

// Centralized token validation and logout
function validateTokenAndLogout() {
  if (typeof window === "undefined") return false;
  
  const access = localStorage.getItem("access");
  if (!access) return false;

  try {
    const { exp } = jwtDecode(access);
    const isExpired = Date.now() >= exp * 1000;
    
    if (isExpired) {
      // Clear tokens
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return true; // Token expired
    }
    return false; // Token valid
  } catch (error) {
    console.error("Token decode error:", error);
    // Invalid token
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    return true; // Token invalid
  }
}

function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Prevent multiple checks
    if (hasChecked.current) return;
    hasChecked.current = true;

    // Public routes that don't require authentication
    const publicRoutes = ["/login", "/register", "/signup", "/", "/about"];
    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname.startsWith(route + "/")
    );

    // Check token validity
    const shouldLogout = validateTokenAndLogout();

    if (shouldLogout && !isPublicRoute) {
      console.log("Token expired or invalid - logging out");
      dispatch(logout());
      
      // Use setTimeout to ensure dispatch completes before redirect
      setTimeout(() => {
        router.push("/login");
      }, 100);
    }
  }, [dispatch, router, pathname]);

  // Set up periodic token check (every 5 minutes)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const publicRoutes = ["/login", "/register", "/signup", "/", "/about"];
      const isPublicRoute = publicRoutes.some(route => 
        pathname === route || pathname.startsWith(route + "/")
      );

      const shouldLogout = validateTokenAndLogout();

      if (shouldLogout && !isPublicRoute) {
        console.log("Token expired - logging out");
        dispatch(logout());
        clearInterval(intervalId);
        
        setTimeout(() => {
          router.push("/login");
        }, 100);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(intervalId);
  }, [dispatch, router, pathname]);

  return children;
}

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#227C70]"></div>
          </div>
        }
        persistor={persistor}
      >
        <AppInitializer>{children}</AppInitializer>
      </PersistGate>
    </Provider>
  );
}