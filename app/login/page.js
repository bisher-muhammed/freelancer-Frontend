"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, googleLogin, resetStatus } from "../store/slices/userSlice";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, error, successMessage, user } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [timezone, setTimezone] = useState("");

  // Detect browser timezone on mount
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);
  }, []);

  // Clear previous status on mount
  useEffect(() => {
    dispatch(resetStatus());
  }, [dispatch]);

  // Redirect after successful login
  useEffect(() => {
    if (user && successMessage && !loading) {
      if (user.role === "client") router.push("/client/dashboard");
      else if (user.role === "freelancer") router.push("/freelancer/dashboard");
      else if (user.role === "admin") router.push("/admin/dashboard");
      else router.push("/");
    }
  }, [user, successMessage, loading, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(resetStatus());
    dispatch(loginUser({ ...formData, timezone }));
  };

  const handleGoogleSuccess = (response) => {
    dispatch(resetStatus());
    dispatch(googleLogin({ token: response.credential, timezone }))
      .unwrap()
      .then((data) => {
        if (data.user?.role === "client") router.push("/client/dashboard");
        else if (data.user?.role === "freelancer") router.push("/freelancer/dashboard");
        else router.push("/admin/dashboard");
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Login to Your Account
        </h2>

        {error && (
          <div className="relative text-red-600 bg-red-100 text-center py-2 px-3 rounded-lg mb-4">
            <span className="block pr-8">{error}</span>
            <button
              onClick={() => dispatch(resetStatus())}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-red-800 hover:text-red-900 font-bold text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <p className="text-green-600 bg-green-100 text-center py-2 rounded-lg mb-4">
            {successMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
            />
            <div className="text-right mt-2">
              <span
                onClick={() => router.push("/forgot-password")}
                className="text-sm text-indigo-600 hover:underline cursor-pointer"
              >
                Forgot Password?
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-medium text-white ${
              loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            } transition duration-200`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6">
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-2 text-gray-500 text-sm">OR</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>
          <GoogleSignInButton onSuccess={handleGoogleSuccess} />
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-indigo-600 font-medium hover:underline cursor-pointer"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
