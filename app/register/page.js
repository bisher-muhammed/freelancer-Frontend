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
  const [showPassword, setShowPassword] = useState(false); // Toggle state

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "username":
        if (!value.trim()) error = "Username is required";
        else if (value.length < 3) error = "At least 3 characters";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Enter a valid email";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8) error = "At least 8 characters";
        else if (!/(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value))
          error = "Needs uppercase, number & symbol";
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

  const validateForm = () => {
    const fields = ["username", "email", "password", "confirm_password"];
    let valid = true;
    const newErrors = {};
    fields.forEach((field) => {
      const isValid = validateField(field, formData[field]);
      if (!isValid) valid = false;
    });
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(sendOtp({ email: formData.email }))
      .unwrap()
      .then(() => {
        localStorage.setItem("pendingUser", JSON.stringify(formData));
        router.push("/otp");
      })
      .catch((err) => console.error("OTP failed:", err));
  };

  useEffect(() => {
    if (otpSent) router.push("/otp");
  }, [otpSent, router]);

  const getInputClass = (field) =>
    `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all text-slate-900 bg-white font-medium ${
      formErrors[field]
        ? "border-red-500 focus:ring-red-100"
        : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-slate-900 px-6 py-10 text-center">
          <h1 className="text-3xl font-extrabold text-white mb-2">Create Account</h1>
          <p className="text-emerald-400 font-medium">Verify email to get started</p>
        </div>

        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={(e) => validateField("username", e.target.value)}
                className={getInputClass("username")}
                placeholder="johndoe"
              />
              {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={(e) => validateField("email", e.target.value)}
                className={getInputClass("email")}
                placeholder="you@example.com"
              />
              {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
            </div>

            {/* Password Field with Toggle */}
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={(e) => validateField("password", e.target.value)}
                  className={getInputClass("password")}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 text-xs font-bold uppercase tracking-widest px-2"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {formErrors.password && <p className="text-red-500 text-[10px] mt-1">{formErrors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
              <input
                name="confirm_password"
                type={showPassword ? "text" : "password"}
                value={formData.confirm_password}
                onChange={handleChange}
                onBlur={(e) => validateField("confirm_password", e.target.value)}
                className={getInputClass("confirm_password")}
                placeholder="••••••••"
              />
              {formErrors.confirm_password && <p className="text-red-500 text-xs mt-1">{formErrors.confirm_password}</p>}
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {["client", "freelancer"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, role }))}
                  className={`p-3 border-2 rounded-xl transition-all capitalize font-bold ${
                    formData.role === role
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-inner"
                      : "border-gray-50 bg-gray-50 text-slate-400 hover:border-gray-200"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-lg font-bold text-lg hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-100 disabled:bg-slate-300"
            >
              {loading ? "Sending OTP..." : "Get Started"}
            </button>
          </form>

          {error && <p className="text-center text-red-600 mt-4 text-sm font-medium">{error?.message || "Error occurred"}</p>}
        </div>
      </div>
    </div>
  );
}