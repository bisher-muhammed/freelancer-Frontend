'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClientProfile,
  updateClientProfile,
  createClientProfile,
} from '../../store/slices/clientProfileSlice';
import {
  Loader2, Camera, Building, Phone, MapPin, X,
  Star, DollarSign, ShieldCheck, Calendar, Mail,
  Edit2, CheckCircle, AlertCircle, Save, UserCircle2,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

// ─── Validation rules — mirrors backend serializer exactly ────────────────────

const VALIDATORS = {
  // At least company_name OR bio — cross-field; handled in validateAll
  company_name: (v) => null, // optional alone; cross-validated below

  contact_number: (v) => {
    if (!v) return null; // optional
    if (!/^\+?1?\d{9,15}$/.test(v))
      return 'Enter a valid number with country code (e.g., +911234567890).';
    return null;
  },

  country: (v) => {
    if (!v) return null; // optional
    if (!/^[a-zA-Z\s]+$/.test(v))
      return 'Country must contain only letters and spaces.';
    return null;
  },

  city: () => null, // no backend constraint

  bio: (v) => {
    if (v && v.length > 500) return 'Bio must not exceed 500 characters.';
    return null;
  },

  profile_picture: (file) => {
    if (!file) return null;
    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
    if (!allowed.includes(ext))
      return `Unsupported file type "${ext}". Allowed: ${allowed.join(', ')}.`;
    if (file.size > 5 * 1024 * 1024)
      return 'Image must be smaller than 5 MB.';
    return null;
  },
};

// Cross-field: at least company_name or bio must be non-empty
const crossValidate = (formData) => {
  const name = (formData.company_name || '').trim();
  const bio  = (formData.bio || '').trim();
  if (!name && !bio)
    return 'Please provide at least a company name or a bio.';
  return null;
};

// Run all validators; returns { fieldErrors, crossError }
const validateAll = (formData) => {
  const fieldErrors = {};
  Object.keys(VALIDATORS).forEach((key) => {
    const err = VALIDATORS[key](formData[key]);
    if (err) fieldErrors[key] = err;
  });
  const crossError = crossValidate(formData);
  return { fieldErrors, crossError };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, error, touched, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold tracking-widest uppercase text-slate-500">
        {label}
      </label>
      {children}
      {touched && error && (
        <p className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function StatRow({ icon: Icon, iconCls, label, value, badge }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2.5 text-sm text-slate-600">
        <Icon className={`h-4 w-4 ${iconCls}`} />
        {label}
      </div>
      {badge ? (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>{value}</span>
      ) : (
        <span className="text-sm font-bold text-slate-900">{value}</span>
      )}
    </div>
  );
}

const inputCls = (err, touched, disabled) =>
  `w-full px-4 py-3 rounded-xl border text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-300 ${
    disabled
      ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed'
      : err && touched
      ? 'border-red-400 ring-2 ring-red-100 bg-white'
      : 'border-slate-200 bg-white hover:border-slate-300 focus:border-[#227C70] focus:ring-2 focus:ring-[#227C70]/10'
  }`;

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ClientProfilePage() {
  const dispatch = useDispatch();
  const { data: profileData, loading, creating, error: reduxError, successMessage } =
    useSelector((s) => s.clientProfile);
  const user = useSelector((s) => s.user.user);

  const profile = profileData?.results?.[0] ?? null;

  const emptyForm = {
    company_name:    '',
    contact_number:  '',
    bio:             '',
    country:         '',
    city:            '',
    profile_picture: null,
  };

  const [formData, setFormData]     = useState(emptyForm);
  const [preview,  setPreview]      = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [isEditing, setIsEditing]   = useState(false);

  // Per-field errors + which fields have been interacted with
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched]         = useState({});
  const [crossError, setCrossError]   = useState(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Toast
  const [toast, setToast] = useState(null); // { msg, type }
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => { dispatch(fetchClientProfile()); }, [dispatch]);

  // ── Sync form when profile arrives ─────────────────────────────────────────
  const syncForm = useCallback((p) => {
    setFormData({
      company_name:    p.company_name    || '',
      contact_number:  p.contact_number  || '',
      bio:             p.bio             || '',
      country:         p.country         || '',
      city:            p.city            || '',
      profile_picture: null,
    });
    setPreview(p.profile_picture || null);
    setFieldErrors({});
    setTouched({});
    setCrossError(null);
    setSubmitAttempted(false);
  }, []);

  useEffect(() => {
    if (profile)              { syncForm(profile); setIsEditing(false); }
    else if (!loading)        { setIsEditing(true); }
  }, [profile, loading, syncForm]);

  // ── Redix success/error → toast ────────────────────────────────────────────
  useEffect(() => {
    if (successMessage) setToast({ msg: successMessage, type: 'success' });
  }, [successMessage]);

  useEffect(() => {
    if (reduxError) setToast({ msg: typeof reduxError === 'string' ? reduxError : 'An error occurred.', type: 'error' });
  }, [reduxError]);

  // ── Field change handler ───────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      const err  = VALIDATORS.profile_picture(file);
      setFieldErrors((p) => ({ ...p, profile_picture: err }));
      setTouched((p) => ({ ...p, profile_picture: true }));
      if (!err) {
        setFormData((p) => ({ ...p, profile_picture: file }));
        setImageLoading(true);
        const reader = new FileReader();
        reader.onloadend = () => { setPreview(reader.result); setImageLoading(false); };
        reader.readAsDataURL(file);
      }
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));

    // Live validate the changed field
    const err = VALIDATORS[name]?.(value) ?? null;
    setFieldErrors((p) => ({ ...p, [name]: err }));

    // Re-evaluate cross-field when company_name or bio changes
    if (name === 'company_name' || name === 'bio') {
      const next = { ...formData, [name]: value };
      setCrossError(crossValidate(next));
    }
  };

  // ── Blur handler: mark field as touched ───────────────────────────────────
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    const err = VALIDATORS[name]?.(formData[name]) ?? null;
    setFieldErrors((p) => ({ ...p, [name]: err }));
  };

  const handleRemoveImage = () => {
    setFormData((p) => ({ ...p, profile_picture: null }));
    setPreview(profile?.profile_picture || null);
    setFieldErrors((p) => ({ ...p, profile_picture: null }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // Mark all fields touched
    setTouched(Object.fromEntries(Object.keys(VALIDATORS).map((k) => [k, true])));

    const { fieldErrors: fe, crossError: ce } = validateAll(formData);
    setFieldErrors(fe);
    setCrossError(ce);

    const hasErrors = Object.values(fe).some(Boolean) || !!ce;
    if (hasErrors) return;

    // Build FormData — only include changed fields for updates
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      if (key === 'profile_picture') { form.append(key, value); return; }
      if (!profile || String(value) !== String(profile[key] ?? '')) {
        form.append(key, value);
      }
    });

    try {
      if (profile) {
        await dispatch(updateClientProfile(form)).unwrap();
      } else {
        await dispatch(createClientProfile(form)).unwrap();
      }
      await dispatch(fetchClientProfile());
      setIsEditing(false);
      setToast({ msg: profile ? 'Profile updated successfully.' : 'Profile created!', type: 'success' });
    } catch (err) {
      console.error('Submit error:', err);
      // Backend field errors arrive as an object
      if (err && typeof err === 'object') {
        const be = {};
        Object.keys(err).forEach((k) => {
          be[k] = Array.isArray(err[k]) ? err[k].join(' ') : err[k];
        });
        setFieldErrors((p) => ({ ...p, ...be }));
        setTouched((p) => ({ ...p, ...Object.fromEntries(Object.keys(be).map((k) => [k, true])) }));
      }
    }
  };

  const handleCancel = () => {
    if (profile) { syncForm(profile); }
    setIsEditing(false);
  };

  // ── Error count for submit button hint ────────────────────────────────────
  const visibleErrors = submitAttempted
    ? Object.values(fieldErrors).filter(Boolean).length + (crossError ? 1 : 0)
    : 0;

  const isBusy = loading || creating;
  const isReadOnly = !isEditing && !!profile;

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#227C70] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .profile-root { font-family: 'DM Sans', sans-serif; }
        .brand-font   { font-family: 'Syne', sans-serif; }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .slide-up { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.1) both; }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .toast-in { animation: slideDown 0.3s ease both; }
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast-in fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium max-w-sm ${
          toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            : <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-auto opacity-60 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="profile-root min-h-screen bg-[#f8f9fb] p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ── Page header ── */}
          <div className="slide-up">
            <Link
              href="/client/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#227C70] transition-colors mb-4"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="brand-font text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {profile ? 'My Profile' : 'Create Profile'}
                </h1>
                <p className="text-sm text-slate-500 mt-1.5 font-medium">
                  {profile
                    ? isEditing ? 'Editing your profile information.' : 'View and manage your profile.'
                    : 'Set up your company profile to start posting projects.'}
                </p>
              </div>
              {profile && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-700 active:scale-[0.98] transition-all"
                >
                  <Edit2 className="h-4 w-4" /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* ── Cross-field error banner (only shown after submit attempt) ── */}
          {submitAttempted && crossError && (
            <div className="slide-up bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-3 text-sm text-red-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              {crossError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 slide-up" style={{ animationDelay: '0.05s' }}>

            {/* ── Left sidebar ── */}
            <div className="lg:col-span-1 space-y-5">

              {/* Avatar card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 text-center">
                <div className="relative inline-block mb-4">
                  {/* Avatar */}
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile"
                      className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl object-cover shadow-md border-4 border-white"
                      onError={() => setPreview(null)}
                    />
                  ) : (
                    <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-gradient-to-br from-[#227C70] to-[#1a5f55] flex items-center justify-center text-white text-3xl font-bold shadow-md border-4 border-white">
                      {(profile?.username?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </div>
                  )}

                  {imageLoading && (
                    <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                    </div>
                  )}

                  {/* Remove button */}
                  {isEditing && preview && (
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}

                  {/* Camera button */}
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-slate-50 transition-colors">
                      <Camera className="h-4 w-4 text-slate-600" />
                      <input
                        type="file"
                        name="profile_picture"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Image error */}
                {touched.profile_picture && fieldErrors.profile_picture && (
                  <p className="text-xs text-red-500 flex items-center justify-center gap-1 mb-2">
                    <AlertCircle className="h-3 w-3" />{fieldErrors.profile_picture}
                  </p>
                )}

                <h2 className="text-base font-bold text-slate-900">
                  {profile?.username || user?.username || 'Your Name'}
                </h2>
                {profile?.email && (
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />{profile.email}
                  </p>
                )}
                {profile?.company_name && (
                  <p className="text-sm text-slate-500 mt-1">{profile.company_name}</p>
                )}
              </div>

              {/* Stats card */}
              {profile && (
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                    Account Stats
                  </p>
                  <StatRow
                    icon={Building} iconCls="text-blue-500"
                    label="Projects Posted"
                    value={profile.total_projects_posted ?? 0}
                  />
                  <StatRow
                    icon={Star} iconCls="text-amber-400"
                    label="Rating"
                    value={`${Number(profile.rating || 0).toFixed(1)} / 5`}
                  />
                  <StatRow
                    icon={DollarSign} iconCls="text-emerald-500"
                    label="Total Spent"
                    value={`₹${profile.total_spent ?? 0}`}
                  />
                  <StatRow
                    icon={ShieldCheck}
                    iconCls={profile.verified ? 'text-emerald-500' : 'text-slate-400'}
                    label="Verification"
                    value={profile.verified ? 'Verified' : 'Pending'}
                    badge={profile.verified
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'}
                  />
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> Joined {fmt(profile.created_at)}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> Updated {fmt(profile.updated_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right form ── */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-none">
                      {isEditing ? (profile ? 'Edit Information' : 'Profile Information') : 'Profile Information'}
                    </h2>
                    {isEditing && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Fields marked with * require at least one of them to be filled.
                      </p>
                    )}
                  </div>
                  {isEditing && profile && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-[#227C70]/10 text-[#227C70] rounded-full">
                      Editing
                    </span>
                  )}
                </div>

                <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">

                  {/* Company Name */}
                  <Field
                    label="Company Name *"
                    error={fieldErrors.company_name}
                    touched={touched.company_name}
                  >
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isReadOnly}
                        placeholder="e.g., Acme Corp"
                        className={`${inputCls(fieldErrors.company_name, touched.company_name, isReadOnly)} pl-10`}
                      />
                    </div>
                  </Field>

                  {/* Contact Number */}
                  <Field
                    label="Contact Number"
                    error={fieldErrors.contact_number}
                    touched={touched.contact_number}
                  >
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isReadOnly}
                        placeholder="+911234567890"
                        className={`${inputCls(fieldErrors.contact_number, touched.contact_number, isReadOnly)} pl-10`}
                      />
                    </div>
                    {!isReadOnly && (
                      <p className="text-[11px] text-slate-400">
                        Include country code, e.g. +91 for India, +1 for US.
                      </p>
                    )}
                  </Field>

                  {/* Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Country"
                      error={fieldErrors.country}
                      touched={touched.country}
                    >
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={isReadOnly}
                          placeholder="India"
                          className={`${inputCls(fieldErrors.country, touched.country, isReadOnly)} pl-10`}
                        />
                      </div>
                    </Field>
                    <Field label="City" error={null} touched={false}>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isReadOnly}
                        placeholder="Mumbai"
                        className={inputCls(null, false, isReadOnly)}
                      />
                    </Field>
                  </div>

                  {/* Bio */}
                  <Field
                    label="Company Bio *"
                    error={fieldErrors.bio}
                    touched={touched.bio}
                  >
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isReadOnly}
                      rows={4}
                      maxLength={500}
                      placeholder="Tell freelancers about your company, what you do, and what you're looking for…"
                      className={`${inputCls(fieldErrors.bio, touched.bio, isReadOnly)} resize-y`}
                    />
                    <div className="flex justify-between items-center">
                      {/* Cross-field hint */}
                      {!isReadOnly && (
                        <p className="text-[11px] text-slate-400">
                          At least company name or bio is required.
                        </p>
                      )}
                      <span className={`text-xs ml-auto ${formData.bio.length > 450 ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                        {formData.bio.length} / 500
                      </span>
                    </div>
                  </Field>

                  {/* Actions */}
                  {(isEditing || !profile) && (
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
                      {/* Error count hint */}
                      {visibleErrors > 0 && (
                        <p className="self-center text-xs text-red-500 font-medium mr-auto flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {visibleErrors} error{visibleErrors > 1 ? 's' : ''} to fix
                        </p>
                      )}

                      {profile && (
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={isBusy}
                          className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={isBusy}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#227C70] text-white text-sm font-bold rounded-xl hover:bg-[#1a5f55] active:scale-[0.98] disabled:opacity-40 transition-all shadow-sm shadow-[#227C70]/20"
                      >
                        {isBusy ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {profile ? 'Saving…' : 'Creating…'}
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            {profile ? 'Save Changes' : 'Create Profile'}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
