"use client";

import { useEffect, useRef } from "react";

export default function GoogleSignInButton({ onSuccess }) {
  const containerRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent re-initialization
    if (isInitialized.current) return;

    const initGoogle = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      // Validation checks
      if (!clientId) {
        console.error("❌ Google Client ID missing");
        return;
      }

      if (typeof window === "undefined" || !window.google) {
        setTimeout(initGoogle, 100);
        return;
      }

      if (!containerRef.current) {
        setTimeout(initGoogle, 100);
        return;
      }

      try {
        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: onSuccess,
          cancel_on_tap_outside: false,
        });

        // Render the button
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          width: 384, // Fixed width prevents re-renders
          text: "signin_with",
        });

        isInitialized.current = true;
        console.log("✅ Google Sign-In initialized");
      } catch (error) {
        console.error("❌ Google Sign-In error:", error);
      }
    };

    // Start initialization
    const timer = setTimeout(initGoogle, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      // Don't try to clean up Google's DOM - let it manage itself
    };
  }, [onSuccess]);

  return (
    <div
      ref={containerRef}
      style={{ minHeight: "40px", width: "100%" }}
      suppressHydrationWarning
    />
  );
}