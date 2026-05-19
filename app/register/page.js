"use client";

import { useDispatch, useSelector } from "react-redux";
import { sendOtp } from "../store/slices/userSlice";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/* ─── Password strength helper ─────────────────────────────────── */
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;
  if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
  if (score <= 3) return { score, label: "Fair", color: "#f59e0b" };
  if (score === 4) return { score, label: "Good", color: "#10b981" };
  return { score, label: "Strong", color: "#059669" };
}

/* ─── Input component ──────────────────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold tracking-widest uppercase text-slate-500">
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-red-500 text-xs font-medium">
          <span className="inline-block w-3.5 h-3.5 rounded-full bg-red-100 text-red-500 text-center leading-3.5 shrink-0">!</span>
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "client",
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const passwordStrength = getPasswordStrength(formData.password);

  /* ── Validation ─────────────────────────────────────────────── */
  const validateField = (name, value) => {
    let err = "";
    switch (name) {
      case "username":
        if (!value.trim()) err = "Username is required";
        else if (value.length < 3) err = "At least 3 characters";
        break;
      case "email":
        if (!value.trim()) err = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          err = "Enter a valid email address";
        break;
      case "password":
        if (!value) err = "Password is required";
        else if (value.length < 8) err = "At least 8 characters";
        else if (!/(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value))
          err = "Needs uppercase, number & special character";
        break;
      case "confirm_password":
        if (value !== formData.password) err = "Passwords do not match";
        break;
      default:
        break;
    }
    setFormErrors((prev) => ({ ...prev, [name]: err }));
    return !err;
  };

  const validateForm = () => {
    const fields = ["username", "email", "password", "confirm_password"];
    return fields.map((f) => validateField(f, formData[f])).every(Boolean);
  };

  /* ── Handlers ───────────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validateForm()) return;

    dispatch(sendOtp({ email: formData.email }))
      .unwrap()
      .then(() => {
        localStorage.setItem("pendingUser", JSON.stringify(formData));
        router.push("/otp");
      })
      .catch((err) => console.error("OTP failed:", err));
  };

  /* ── Input class helper ─────────────────────────────────────── */
  const inputCls = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-slate-800 bg-white outline-none transition-all duration-200 placeholder:text-slate-300 ${
      formErrors[field]
        ? "border-red-400 ring-2 ring-red-100"
        : "border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
    }`;

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .register-root { font-family: 'DM Sans', sans-serif; }
        .brand-font    { font-family: 'Syne', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.55s cubic-bezier(.22,.68,0,1.2) both; }
        .fade-up-1 { animation-delay: .05s; }
        .fade-up-2 { animation-delay: .12s; }
        .fade-up-3 { animation-delay: .19s; }
        .fade-up-4 { animation-delay: .26s; }
        .fade-up-5 { animation-delay: .33s; }
        .fade-up-6 { animation-delay: .40s; }

        /* Decorative blob on left panel */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: .22;
        }
      `}</style>

      <div className="register-root min-h-screen flex bg-slate-50">

        {/* ── Left brand panel (hidden on mobile) ─────────────── */}
        <aside className="hidden lg:flex lg:w-[42%] xl:w-[38%] relative bg-slate-950 flex-col justify-between p-12 overflow-hidden shrink-0">
          {/* Decorative blobs */}
          <div className="blob w-80 h-80 bg-emerald-500 top-[-80px] left-[-60px]" />
          <div className="blob w-64 h-64 bg-teal-400  bottom-[-40px] right-[-30px]" />
          <div className="blob w-48 h-48 bg-cyan-600   top-[45%] left-[30%]" />

          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                  <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                </svg>
              </div>
              <span className="brand-font text-xl text-white font-bold tracking-tight">
                FreelanceHub
              </span>
            </div>
          </div>

          {/* Centre copy */}
          <div className="relative z-10 space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-4">
                Step 1 of 2 — Account Setup
              </p>
              <h2 className="brand-font text-4xl xl:text-5xl font-extrabold text-white leading-[1.1]">
                Your next<br />
                opportunity<br />
                <span className="text-emerald-400">starts here.</span>
              </h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Join thousands of professionals connecting, collaborating, and growing on FreelanceHub.
            </p>

            {/* Social proof pills */}
            <div className="flex flex-col gap-3 pt-2">
              {[
                { icon: "🔒", text: "Secure escrow payments" },
                { icon: "⚡", text: "Match within 24 hours" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-slate-400 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom link */}
          <div className="relative z-10 text-slate-500 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-emerald-400 font-semibold hover:underline">
              Sign in
            </a>
          </div>
        </aside>

        {/* ── Right form panel ─────────────────────────────────── */}
        <main className="flex-1 flex items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-md">

            {/* Mobile header */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2">
                    <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                  </svg>
                </div>
                <span className="brand-font text-lg font-bold text-slate-900">FreelanceHub</span>
              </div>
              <h1 className="brand-font text-2xl font-extrabold text-slate-900">Create your account</h1>
              <p className="text-slate-500 text-sm mt-1">Step 1 of 2 — we'll verify your email next</p>
            </div>

            {/* Desktop heading */}
            <div className="hidden lg:block mb-8 fade-up">
              <h1 className="brand-font text-3xl font-extrabold text-slate-900 mb-1">
                Create your account
              </h1>
              <p className="text-slate-500 text-sm">
                We'll send a verification code to your email.
              </p>
            </div>

            {/* Role selector — first, since it changes context */}
            <div className="fade-up fade-up-1 mb-6">
              <p className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-3">
                I am joining as
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: "client",
                    label: "Client",
                    sub: "Hire talent",
                    emoji: "🏢",
                  },
                  {
                    id: "freelancer",
                    label: "Freelancer",
                    sub: "Find work",
                    emoji: "💼",
                  },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, role: r.id }))}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      formData.role === r.id
                        ? "border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-100"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl">{r.emoji}</span>
                    <div>
                      <p className={`text-sm font-bold ${formData.role === r.id ? "text-emerald-700" : "text-slate-700"}`}>
                        {r.label}
                      </p>
                      <p className={`text-xs ${formData.role === r.id ? "text-emerald-500" : "text-slate-400"}`}>
                        {r.sub}
                      </p>
                    </div>
                    {formData.role === r.id && (
                      <svg className="ml-auto w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Username */}
              <div className="fade-up fade-up-2">
                <Field label="Username" error={formErrors.username}>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={(e) => validateField("username", e.target.value)}
                    className={inputCls("username")}
                    placeholder="johndoe"
                    autoComplete="username"
                  />
                </Field>
              </div>

              {/* Email */}
              <div className="fade-up fade-up-3">
                <Field label="Email" error={formErrors.email}>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={(e) => validateField("email", e.target.value)}
                    className={inputCls("email")}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </Field>
              </div>

              {/* Password */}
              <div className="fade-up fade-up-4">
                <Field label="Password" error={formErrors.password}>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={(e) => validateField("password", e.target.value)}
                      className={`${inputCls("password")} pr-16`}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-widest uppercase text-slate-400 hover:text-emerald-600 transition-colors px-1"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div
                            key={n}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor:
                                n <= passwordStrength.score
                                  ? passwordStrength.color
                                  : "#e2e8f0",
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs font-semibold" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </Field>
              </div>

              {/* Confirm Password */}
              <div className="fade-up fade-up-5">
                <Field label="Confirm Password" error={formErrors.confirm_password}>
                  <input
                    name="confirm_password"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={handleChange}
                    onBlur={(e) => validateField("confirm_password", e.target.value)}
                    className={inputCls("confirm_password")}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />
                </Field>
              </div>

              {/* Submit */}
              <div className="fade-up fade-up-6 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-100"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                      Sending verification code…
                    </>
                  ) : (
                    <>
                      Continue
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </>
                  )}
                </button>

                {/* API error */}
                {error && (
                  <p className="mt-3 text-center text-sm text-red-600 font-medium bg-red-50 border border-red-100 rounded-lg py-2 px-3">
                    {error?.message || "Something went wrong. Please try again."}
                  </p>
                )}
              </div>
            </form>

            {/* Mobile sign-in link */}
            <p className="lg:hidden mt-6 text-center text-slate-500 text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-emerald-600 font-semibold hover:underline">
                Sign in
              </a>
            </p>

            {/* Terms */}
            <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed">
              By continuing, you agree to our{" "}
              <a href="/terms" className="underline hover:text-slate-600">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" className="underline hover:text-slate-600">Privacy Policy</a>.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
