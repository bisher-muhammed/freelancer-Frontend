"use client";

import { useDispatch, useSelector } from "react-redux";
import { sendOtp } from "../store/slices/userSlice";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, successMessage, otpSent } = useSelector(
    (state) => state.user
  );

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "client",
  });

  const [formErrors, setFormErrors] = useState({});

  // ✅ Validate individual field
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "username":
        if (!value.trim()) error = "Username is required";
        else if (value.length < 3) error = "Must be at least 3 characters";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Enter a valid email address";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8) error = "Must be at least 8 characters";
        else if (!/(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value))
          error = "Include uppercase, number & special character";
        break;
      case "confirm_password":
        if (value !== formData.password) error = "Passwords do not match";
        break;
      default:
        break;
    }
    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  // ✅ Validate all fields before submit
  const validateForm = () => {
    const fields = ["username", "email", "password", "confirm_password"];
    let valid = true;
    const newErrors = {};
    for (let field of fields) {
      const isValid = validateField(field, formData[field]);
      if (!isValid) valid = false;
      newErrors[field] = formErrors[field];
    }
    setFormErrors(newErrors);
    return valid;
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Handle role selection
  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  // ✅ Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(sendOtp({ email: formData.email }))
      .unwrap()
      .then(() => {
        // Store pending user data for next step (OTP verification)
        localStorage.setItem("pendingUser", JSON.stringify(formData));
        router.push("/otp");
      })
      .catch((err) => {
        console.error("OTP send failed:", err);
      });
  };

  // ✅ Auto redirect if OTP already sent
  useEffect(() => {
    if (otpSent) router.push("/otp");
  }, [otpSent, router]);

  const getInputClass = (field) =>
    `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 ${
      formErrors[field]
        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
          <p className="text-blue-100">We’ll send an OTP to verify your email</p>
        </div>

        {/* Form */}
        <div className="px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={(e) => validateField("username", e.target.value)}
                className={getInputClass("username")}
                placeholder="Enter your username"
              />
              {formErrors.username && (
                <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={(e) => validateField("email", e.target.value)}
                className={getInputClass("email")}
                placeholder="Enter your email"
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={(e) => validateField("password", e.target.value)}
                className={getInputClass("password")}
                placeholder="Create password"
              />
              {formErrors.password && (
                <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleChange}
                onBlur={(e) =>
                  validateField("confirm_password", e.target.value)
                }
                className={getInputClass("confirm_password")}
                placeholder="Re-enter password"
              />
              {formErrors.confirm_password && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.confirm_password}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Register as *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {["client", "freelancer"].map((role) => (
                  <div
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`p-4 border-2 rounded-xl cursor-pointer ${
                      formData.role === role
                        ? role === "client"
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-green-500 bg-green-50 shadow-md"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800 capitalize">
                      {role}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {role === "client"
                        ? "Hire freelancers"
                        : "Offer your services"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>

          {/* Status messages */}
          {error && (
            <p className="text-center text-red-600 mt-4">
              {error?.message || "Something went wrong"}
            </p>
          )}
          {successMessage && (
            <p className="text-center text-green-600 mt-4">{successMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}

