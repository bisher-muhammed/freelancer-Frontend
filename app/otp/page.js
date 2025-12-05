"use client";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { verifyOtpAndRegister, sendOtp } from "../store/slices/userSlice";
import { useRouter } from "next/navigation";

export default function OtpPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const pendingUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("pendingUser")) : null;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  // ⏲️ Countdown timer
  useEffect(() => {
    if (!pendingUser) {
      alert("No pending user found. Please register first.");
      router.push("/register");
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🧩 Handle OTP input
  const handleChange = (index, value) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);
      setError("");

      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // 🔙 Handle key events
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && index === 5 && otp.every((d) => d !== "")) {
      handleVerifyOtp(e);
    }
  };

  // 📋 Handle paste OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasteData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    setError("");

    const nextEmptyIndex = newOtp.findIndex((d) => d === "");
    inputRefs.current[nextEmptyIndex === -1 ? 5 : nextEmptyIndex]?.focus();
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = { ...pendingUser, otp: otpString };
      const result = await dispatch(verifyOtpAndRegister(payload)).unwrap();

      if (result) {
        localStorage.removeItem("pendingUser");
        router.push("/login"); // redirect after success
      }
    } catch (err) {
      setError(err?.otp || "Invalid OTP. Please check and try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // 🔁 Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;

    setCanResend(false);
    setTimer(60);
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setIsLoading(true);

    try {
      await dispatch(sendOtp({ email: pendingUser.email })).unwrap();

      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">We sent a 6-digit code to</p>
          <p className="text-lg font-semibold text-blue-600 mt-1">{pendingUser?.email}</p>
        </div>

        {/* OTP Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Enter verification code
              </label>

              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 md:w-14 md:h-14 border-2 border-gray-300 rounded-lg text-2xl font-bold text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    disabled={isLoading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center justify-center space-x-2 text-red-600 bg-red-50 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isOtpComplete}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify & Continue"
              )}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 mb-3">Didn’t receive the code?</p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || isLoading}
                className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  canResend && !isLoading
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{canResend ? "Resend Code" : `Resend in ${timer}s`}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Having trouble? Check your spam folder or{" "}
            <button
              onClick={() => router.push("/support")}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

