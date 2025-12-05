"use client";
import { useState } from "react";
import { apiPublic } from "@/lib/apiPublic";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    
    try {
      const res = await apiPublic.post("forgot-password/", { email });
      setMessage("OTP sent to your email! Redirecting...");
      setTimeout(() => router.push(`/verify-otp?email=${email}`), 1200);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.email?.[0] || "Failed to send OTP";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Forgot Password
        </h2>
        
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your email address and we'll send you an OTP to reset your password.
        </p>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 bg-red-100 text-center py-2 rounded-lg mb-4">
            {error}
          </p>
        )}

        {/* Success Message */}
        {message && (
          <p className="text-green-600 bg-green-100 text-center py-2 rounded-lg mb-4">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500 text-black placeholder-gray-500"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-medium text-white ${
              loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            } transition duration-200`}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Remember your password?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-indigo-600 font-medium hover:underline cursor-pointer"
          >
            Back to Login
          </span>
        </p>
      </div>
    </div>
  );
}
