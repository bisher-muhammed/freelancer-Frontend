"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiPublic } from "@/lib/apiPublic";

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const router = useRouter();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    
    try {
      const res = await apiPublic.post("verify-reset-otp/", {
        email,
        otp,
        purpose: "password_reset",
      });
      setMessage("OTP verified successfully! Redirecting...");
      setTimeout(() => router.push(`/reset-password?email=${email}`), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setMessage("");
    setError("");
    
    try {
      const res = await apiPublic.post("forgot-password/", { email });
      setMessage("New OTP sent to your email!");
      setCanResend(false);
      setCountdown(30);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-2 text-gray-800">
          Verify OTP
        </h2>
        
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter the OTP sent to <span className="font-medium">{email}</span>
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

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              One-Time Password
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500 text-center text-lg font-semibold tracking-widest"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              pattern="\d{6}"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-medium text-white ${
              loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            } transition duration-200`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Resend OTP Section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the OTP?
            </p>
            <button
              onClick={handleResendOtp}
              disabled={!canResend || resendLoading}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                canResend && !resendLoading
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } transition duration-200`}
            >
              {resendLoading ? "Sending..." : 
               canResend ? "Resend OTP" : 
               `Resend OTP in ${countdown}s`}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Want to use a different email?{" "}
          <span
            onClick={() => router.push("/forgot-password")}
            className="text-indigo-600 font-medium hover:underline cursor-pointer"
          >
            Go Back
          </span>
        </p>
      </div>
    </div>
  );
}
