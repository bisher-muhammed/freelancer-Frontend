"use client";

import { useState } from "react";
import { apiPrivate } from "@/lib/apiPrivate";

export default function EscrowPaymentButton({ offerId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startEscrowPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiPrivate.post("client/create-checkout-payment/", {
        offer_id: offerId,
      });

      // Axios gives data directly
      const { checkout_url } = res.data;

      if (!checkout_url) {
        throw new Error("Stripe checkout URL missing");
      }

      // 🔥 Redirect to Stripe
      window.location.href = checkout_url;
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Payment initiation failed"
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={startEscrowPayment}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded"
      >
        {loading ? "Redirecting…" : "Pay & Start Contract"}
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
