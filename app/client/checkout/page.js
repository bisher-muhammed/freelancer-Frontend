"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import { Loader2, AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId"); // Now matches the subscription page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!planId) {
      setError("No plan selected. Please go back and select a subscription plan.");
      setLoading(false);
      return;
    }

    const createCheckoutSession = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await apiPrivate.post(
          "/create-checkout-session/",
          { plan_id: planId } // This matches your backend expectation
        );
        
        console.log("Checkout session response:", res);

        if (res?.data?.checkout_url) {
          // Redirect to the payment gateway
          window.location.href = res.data.checkout_url;
        } else {
          setError("Invalid response from server. Please try again.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Checkout error:", err);
        setError(
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Failed to create checkout session. Please try again."
        );
        setLoading(false);
      }
    };

    createCheckoutSession();
  }, [planId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Redirecting to payment gateway...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we prepare your checkout session</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900 flex items-center justify-center px-4">
        <div className="text-center bg-slate-800/50 backdrop-blur-sm border border-red-500/50 rounded-xl p-8 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Go Back
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
