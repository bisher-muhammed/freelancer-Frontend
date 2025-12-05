"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiPublic } from "@/lib/apiPublic";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [formData, setFormData] = useState({
    password: "",
    confirm: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  // Password validation rules
  const passwordRules = [
    { id: "length", text: "At least 8 characters", regex: /.{8,}/ },
    { id: "uppercase", text: "One uppercase letter", regex: /[A-Z]/ },
    { id: "lowercase", text: "One lowercase letter", regex: /[a-z]/ },
    { id: "number", text: "One number", regex: /[0-9]/ },
    { id: "special", text: "One special character", regex: /[!@#$%^&*(),.?":{}|<>]/ }
  ];

  // Validate password in real-time
  useEffect(() => {
    if (formData.password) {
      const errors = passwordRules.filter(rule => !rule.regex.test(formData.password));
      setPasswordErrors(errors.map(error => error.id));
    } else {
      setPasswordErrors([]);
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    // Frontend validation
    const activeErrors = passwordRules.filter(rule => !rule.regex.test(formData.password));
    if (activeErrors.length > 0) {
      setError("Please fix all password requirements");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await apiPublic.post("reset-password/", {
        email,
        new_password: formData.password,
        confirm_new_password: formData.confirm,
      });

      if (res.data.success) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.confirm_new_password?.[0] ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.email?.[0] ||
        "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = passwordErrors.length === 0 && formData.password.length > 0;
  const passwordsMatch = formData.password === formData.confirm && formData.confirm.length > 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-2 text-gray-800">
          Reset Password
        </h2>
        
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your new password for <span className="font-medium">{email}</span>
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

        <form onSubmit={handleReset} className="space-y-4">
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500 pr-10 text-black placeholder-gray-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9 9m13 11l-4-4m0 0l-4 4m4-4V5" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm"
                value={formData.confirm}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500 pr-10 text-black placeholder-gray-500 ${
                  formData.confirm ? (passwordsMatch ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
                }`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9 9m13 11l-4-4m0 0l-4 4m4-4V5" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {formData.confirm && !passwordsMatch && (
              <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
            )}
            {formData.confirm && passwordsMatch && (
              <p className="text-green-500 text-xs mt-1">Passwords match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid || !passwordsMatch}
            className={`w-full py-2 rounded-lg font-medium text-white transition duration-200 ${
              loading || !isPasswordValid || !passwordsMatch
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>

        {/* Password Requirements */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</h3>
          <ul className="space-y-2">
            {passwordRules.map((rule) => (
              <li key={rule.id} className="flex items-center text-sm">
                <svg
                  className={`h-4 w-4 mr-2 ${
                    passwordErrors.includes(rule.id) ? 'text-gray-400' : 'text-green-500'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {passwordErrors.includes(rule.id) ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  )}
                </svg>
                <span className={passwordErrors.includes(rule.id) ? "text-gray-500" : "text-green-600"}>
                  {rule.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
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
