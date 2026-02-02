"use client";

import { useState } from "react";
import { apiPrivate } from "@/lib/apiPrivate";

export default function StripeOnboardButton() {
  const [loading, setLoading] = useState(false);

  const startStripeOnboarding = async () => {
    setLoading(true);
    try {
      const res = await apiPrivate.post("freelancer/stripe/onboard/", {});

      const url = res?.data?.onboarding_url;
      if (!url) {
        console.error("Stripe onboarding URL missing in response:", res.data);
        throw new Error("No onboarding URL returned from server");
      }

      // Redirect to Stripe-hosted onboarding page
      window.location.href = url;
    } catch (err) {
      console.error("Stripe onboarding failed:", err);
      
      // Optional: differentiate error types
      if (err.response?.data?.detail) {
        alert(`Error: ${err.response.data.detail}`);
      } else {
        alert("Failed to start Stripe onboarding. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={startStripeOnboarding}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {loading ? "Redirecting..." : "Connect Stripe / Setup Bank"}
    </button>
  );
}
