'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { apiPrivate } from '@/lib/apiPrivate';
import {
  Briefcase, Plus, X, Check, AlertCircle, Clock,
  Calendar, Zap, ChevronLeft, FileText, DollarSign,
  Users, Layers, CheckCircle, Save, Send,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── Inline Toast ─────────────────────────────────────────────────────────────
function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error:   'bg-red-50 border-red-200 text-red-800',
    info:    'bg-blue-50 border-blue-200 text-blue-800',
  };
  const icons = {
    success: <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />,
    error:   <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />,
    info:    <Zap className="h-4 w-4 text-blue-500 shrink-0" />,
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium max-w-sm animate-in slide-in-from-top-2 duration-300 ${styles[toast.type]}`}>
      {icons[toast.type]}
      {toast.message}
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-widest uppercase text-slate-500">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-red-500 text-xs font-medium">
          <AlertCircle className="h-3 w-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 bg-[#227C70]/10 rounded-xl flex items-center justify-center shrink-0">
          <Icon className="h-4.5 w-4.5 text-[#227C70]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-none">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-6 space-y-5">{children}</div>
    </div>
  );
}

const inputCls = (err) =>
  `w-full px-4 py-3 rounded-xl border text-sm text-slate-800 bg-white outline-none transition-all duration-200 placeholder:text-slate-300 ${
    err
      ? 'border-red-400 ring-2 ring-red-100'
      : 'border-slate-200 hover:border-slate-300 focus:border-[#227C70] focus:ring-2 focus:ring-[#227C70]/10'
  }`;

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PostProjectPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills_required: [],
    budget_type: 'fixed',
    fixed_budget: '',
    hourly_min_rate: '',
    hourly_max_rate: '',
    experience_level: '',
    duration: '',
    new_category: '',
    new_skill: '',
    new_skill_category: '',
  });

  const [errors, setErrors]               = useState({});
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [toast, setToast]                 = useState(null);

  const [categories, setCategories]       = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills]   = useState([]);
  const [loading, setLoading]             = useState(true);

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewSkill, setShowNewSkill]       = useState(false);
  const [addingCategory, setAddingCategory]   = useState(false);
  const [addingSkill, setAddingSkill]         = useState(false);

  // Subscription state
  const [userSubscriptions, setUserSubscriptions]   = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [totalRemaining, setTotalRemaining]           = useState(0);
  const [showSubModal, setShowSubModal]               = useState(false);
  const [subModalMessage, setSubModalMessage]         = useState('');

  const showToast = (message, type = 'info') => setToast({ message, type });

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchCategories = async () => {
    try {
      const { data } = await apiPrivate.get('/categories/');
      setCategories(data?.results ?? (Array.isArray(data) ? data : []));
    } catch { setCategories([]); }
  };

  const fetchSkills = async () => {
    try {
      const { data } = await apiPrivate.get('/skills/');
      setAvailableSkills(data?.results ?? (Array.isArray(data) ? data : []));
    } catch { setAvailableSkills([]); }
  };

  const fetchUserSubscriptions = useCallback(async () => {
    try {
      const { data } = await apiPrivate.get('/user-subscription/');
      const all = data?.results ?? (Array.isArray(data) ? data : []);

      /*
       * ✅ FIX: The API returns is_active: false / is_queued: true for ALL subs.
       * The backend activates them lazily when a project is posted.
       * We treat a sub as "usable" when:
       *   - it is NOT expired (is_expired: false)
       *   - it has remaining_projects > 0
       *   - status is "active" OR "queued"  (never "expired" / "cancelled")
       */
      const usable = all.filter(
        (s) =>
          !s.is_expired &&
          s.remaining_projects > 0 &&
          (s.status === 'active' || s.status === 'queued')
      );

      // Sort: soonest expiry first so we consume that one first
      usable.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));

      setUserSubscriptions(usable);
      setCurrentSubscription(usable[0] ?? null);
      setTotalRemaining(usable.reduce((acc, s) => acc + s.remaining_projects, 0));
    } catch {
      setUserSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchSkills(), fetchUserSubscriptions()]);
  }, [fetchUserSubscriptions]);

  // Restore draft once skills are loaded
  useEffect(() => {
    if (loading || availableSkills.length === 0) return;
    try {
      const raw = localStorage.getItem('projectDraft');
      if (!raw) return;
      const draft = JSON.parse(raw);
      setFormData(draft);
      if (draft.skills_required?.length) {
        setSelectedSkills(
          availableSkills.filter((s) => draft.skills_required.includes(s.id))
        );
      }
    } catch { /* malformed draft — ignore */ }
  }, [loading, availableSkills]);

  // ── Subscription check ────────────────────────────────────────────────────

  const checkSub = () => {
    if (!currentSubscription) {
      return { ok: false, message: 'You need an active subscription to post projects.' };
    }
    if (new Date(currentSubscription.end_date) < new Date()) {
      return { ok: false, message: 'Your subscription has expired. Please buy a new one.' };
    }
    return { ok: true };
  };

  // ── Form helpers ──────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'budget_type') {
        if (value === 'fixed') { next.hourly_min_rate = ''; next.hourly_max_rate = ''; }
        else next.fixed_budget = '';
      }
      return next;
    });
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSkillSelect = (skillId) => {
    const id = parseInt(skillId);
    if (!id) return;
    const skill = availableSkills.find((s) => s.id === id);
    if (!skill || selectedSkills.find((s) => s.id === id)) return;
    setSelectedSkills((p) => [...p, skill]);
    setFormData((p) => ({ ...p, skills_required: [...p.skills_required, id] }));
    if (errors.skills_required) setErrors((p) => ({ ...p, skills_required: '' }));
  };

  const handleSkillRemove = (skillId) => {
    setSelectedSkills((p) => p.filter((s) => s.id !== skillId));
    setFormData((p) => ({ ...p, skills_required: p.skills_required.filter((id) => id !== skillId) }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    else if (formData.title.trim().length < 5) e.title = 'At least 5 characters';

    if (!formData.description.trim()) e.description = 'Description is required';
    else if (formData.description.trim().length < 20) e.description = 'At least 20 characters';

    if (!formData.category) e.category = 'Select a category';
    if (!formData.skills_required.length) e.skills_required = 'Add at least one skill';

    if (formData.budget_type === 'fixed') {
      if (!formData.fixed_budget) e.fixed_budget = 'Budget is required';
      else if (parseFloat(formData.fixed_budget) <= 0) e.fixed_budget = 'Must be greater than 0';
    } else {
      const min = parseFloat(formData.hourly_min_rate);
      const max = parseFloat(formData.hourly_max_rate);
      if (!formData.hourly_min_rate) e.hourly_min_rate = 'Min rate required';
      else if (!formData.hourly_max_rate) e.hourly_max_rate = 'Max rate required';
      else if (min <= 0 || max <= 0) e.hourly = 'Rates must be positive';
      else if (min >= max) e.hourly = 'Min must be less than max';
    }

    if (!formData.duration) e.duration = 'Select a duration';
    if (!formData.experience_level) e.experience_level = 'Select experience level';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddCategory = async () => {
    if (!formData.new_category.trim()) {
      setErrors((p) => ({ ...p, new_category: 'Category name is required' }));
      return;
    }
    setAddingCategory(true);
    try {
      const { data, status } = await apiPrivate.post('/categories/', { name: formData.new_category });
      if (status === 201) {
        setCategories((p) => [...p, data]);
        setFormData((p) => ({ ...p, category: data.id, new_category: '' }));
        setShowNewCategory(false);
        setErrors((p) => ({ ...p, new_category: '', category: '' }));
        showToast('Category added and selected.', 'success');
      }
    } catch (err) {
      setErrors((p) => ({ ...p, new_category: err.response?.data?.name?.[0] ?? 'Failed to add category' }));
    } finally { setAddingCategory(false); }
  };

  const handleAddSkill = async () => {
    if (!formData.new_skill.trim()) {
      setErrors((p) => ({ ...p, new_skill: 'Skill name is required' })); return;
    }
    if (!formData.new_skill_category) {
      setErrors((p) => ({ ...p, new_skill_category: 'Select a category' })); return;
    }
    setAddingSkill(true);
    try {
      const { data, status } = await apiPrivate.post('/skills/', {
        name: formData.new_skill,
        category: parseInt(formData.new_skill_category),
      });
      if (status === 201) {
        setAvailableSkills((p) => [...p, data]);
        setSelectedSkills((p) => [...p, data]);
        setFormData((p) => ({
          ...p, skills_required: [...p.skills_required, data.id],
          new_skill: '', new_skill_category: '',
        }));
        setShowNewSkill(false);
        setErrors((p) => ({ ...p, new_skill: '', new_skill_category: '', skills_required: '' }));
        showToast('Skill added and selected.', 'success');
      }
    } catch (err) {
      const be = err.response?.data ?? {};
      setErrors((p) => ({
        ...p,
        new_skill: be.name?.[0] ?? '',
        new_skill_category: be.category?.[0] ?? (!be.name ? 'Failed to add skill' : ''),
      }));
    } finally { setAddingSkill(false); }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('projectDraft', JSON.stringify(formData));
    showToast('Draft saved.', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const subCheck = checkSub();
    if (!subCheck.ok) {
      setSubModalMessage(subCheck.message);
      setShowSubModal(true);
      return;
    }

    if (!validateForm()) {
      // Scroll to first error
      document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title:            formData.title.trim(),
        description:      formData.description.trim(),
        category:         parseInt(formData.category),
        skills_required:  formData.skills_required,
        budget_type:      formData.budget_type,
        experience_level: formData.experience_level,
        duration:         formData.duration,
        fixed_budget:     formData.budget_type === 'fixed'   ? parseFloat(formData.fixed_budget)   : null,
        hourly_min_rate:  formData.budget_type === 'hourly'  ? parseFloat(formData.hourly_min_rate) : null,
        hourly_max_rate:  formData.budget_type === 'hourly'  ? parseFloat(formData.hourly_max_rate) : null,
      };

      const { status } = await apiPrivate.post('/projects/', payload);
      if (status === 201) {
        localStorage.removeItem('projectDraft');
        await fetchUserSubscriptions();
        showToast('Project posted successfully!', 'success');
        setTimeout(() => router.push('/client/my-projects'), 1200);
      }
    } catch (err) {
      const be = err.response?.data;
      if (be?.detail) {
        setSubModalMessage(be.detail);
        setShowSubModal(true);
      } else if (be) {
        const formatted = {};
        Object.keys(be).forEach((k) => {
          formatted[k] = Array.isArray(be[k]) ? be[k].join(', ') : be[k];
        });
        setErrors(formatted);
        showToast('Please fix the errors below.', 'error');
      } else {
        showToast('Something went wrong. Please try again.', 'error');
      }
    } finally { setIsSubmitting(false); }
  };

  // ── Formatting helpers ────────────────────────────────────────────────────

  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const daysLeft = (d) => {
    const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
    return diff > 0 ? diff : 0;
  };

  // ── Loading screen ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#227C70] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  const canPost = !!currentSubscription;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .post-root { font-family: 'DM Sans', sans-serif; }
        .brand-font { font-family: 'Syne', sans-serif; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-up { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.1) both; }
      `}</style>

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* ── Subscription modal ── */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl slide-up">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="h-7 w-7 text-amber-500" />
            </div>
            <h2 className="brand-font text-2xl font-extrabold text-slate-900 text-center mb-2">
              Subscription Required
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">{subModalMessage}</p>

            {/* Queue summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total projects available</span>
                <span className="font-bold text-slate-900">{totalRemaining}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subscriptions in queue</span>
                <span className="font-bold text-slate-900">{userSubscriptions.length}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Continue Editing
              </button>
              <button
                onClick={() => router.push('/client/subscriptions')}
                className="flex-1 py-3 rounded-xl bg-[#227C70] text-white text-sm font-semibold hover:bg-[#1a5f55] transition-colors"
              >
                Buy Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="post-root min-h-screen bg-[#f8f9fb] p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* ── Header ── */}
          <div className="slide-up">
            <Link
              href="/client/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#227C70] transition-colors mb-4"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <h1 className="brand-font text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Post a Project
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">
              Describe your needs and start receiving proposals.
            </p>
          </div>

          {/* ── Subscription banner ── */}
          <div className="slide-up" style={{ animationDelay: '0.05s' }}>
            {canPost ? (
              <div className="bg-[#227C70] rounded-2xl p-5 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-0.5">
                        {currentSubscription.status === 'queued' ? 'Queued Subscription' : 'Active Subscription'}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                          {currentSubscription.remaining_projects} project{currentSubscription.remaining_projects !== 1 ? 's' : ''} remaining
                        </span>
                        <span className="flex items-center gap-1.5 text-white/80">
                          <Calendar className="h-3.5 w-3.5" />
                          Expires in {daysLeft(currentSubscription.end_date)} days ({fmt(currentSubscription.end_date)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Queue pill */}
                  {userSubscriptions.length > 1 && (
                    <div className="bg-white/20 rounded-xl px-4 py-2.5 text-xs shrink-0">
                      <p className="text-white/70 mb-0.5">Next in queue</p>
                      <p className="font-bold">
                        {userSubscriptions[1].remaining_projects} projects · expires {fmt(userSubscriptions[1].end_date)}
                      </p>
                    </div>
                  )}
                </div>

                {/* All subscriptions bar */}
                {userSubscriptions.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-xs text-white/60 mb-2 uppercase tracking-widest font-semibold">
                      {userSubscriptions.length} subscriptions · {totalRemaining} total projects
                    </p>
                    <div className="flex gap-1.5">
                      {userSubscriptions.map((s, i) => (
                        <div
                          key={s.id}
                          title={`${s.remaining_projects} projects · expires ${fmt(s.end_date)}`}
                          className={`h-1.5 flex-1 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/30'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-900">No Subscription Available</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Buy a subscription to start posting projects.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/client/subscriptions')}
                  className="px-4 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-colors whitespace-nowrap self-start sm:self-auto"
                >
                  Buy Subscription
                </button>
              </div>
            )}
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Project Details */}
            <div className="slide-up" style={{ animationDelay: '0.1s' }}>
              <Section icon={FileText} title="Project Details" subtitle="Basic information about your project">

                <Field label="Project Title" required error={errors.title}
                  hint={`${formData.title.length} / 5 min`}>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Build a responsive e-commerce website"
                    className={inputCls(errors.title)}
                  />
                </Field>

                <Field label="Description" required error={errors.description}
                  hint={`${formData.description.length} / 20 min`}>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Describe your project in detail — requirements, goals, deliverables…"
                    className={`${inputCls(errors.description)} resize-y`}
                  />
                </Field>

                <Field label="Category" required error={errors.category}>
                  {!showNewCategory ? (
                    <div className="flex gap-2">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`${inputCls(errors.category)} flex-1`}
                      >
                        <option value="">Select a category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewCategory(true)}
                        className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> New
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          name="new_category"
                          value={formData.new_category}
                          onChange={handleInputChange}
                          placeholder="New category name"
                          className={`${inputCls(errors.new_category)} flex-1`}
                        />
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          disabled={addingCategory || !formData.new_category.trim()}
                          className="px-4 py-2.5 bg-[#227C70] text-white rounded-xl text-sm font-semibold hover:bg-[#1a5f55] disabled:opacity-40 transition-colors"
                        >
                          {addingCategory ? '…' : 'Add'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowNewCategory(false); setFormData((p) => ({ ...p, new_category: '' })); }}
                          className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {errors.new_category && (
                        <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />{errors.new_category}
                        </p>
                      )}
                    </div>
                  )}
                </Field>
              </Section>
            </div>

            {/* Skills */}
            <div className="slide-up" style={{ animationDelay: '0.15s' }}>
              <Section icon={Layers} title="Skills Required" subtitle="Freelancers must have these skills">
                <Field label="Add Skills" required error={errors.skills_required}>
                  {!showNewSkill ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <select
                          value=""
                          onChange={(e) => handleSkillSelect(e.target.value)}
                          className={`${inputCls(errors.skills_required)} flex-1`}
                        >
                          <option value="">Select a skill</option>
                          {availableSkills
                            .filter((s) => !selectedSkills.find((x) => x.id === s.id))
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}{s.category?.name ? ` — ${s.category.name}` : ''}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowNewSkill(true)}
                          className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> New
                        </button>
                      </div>
                      {selectedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedSkills.map((skill) => (
                            <span
                              key={skill.id}
                              className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-[#227C70]/10 text-[#227C70] border border-[#227C70]/20 rounded-full text-xs font-semibold"
                            >
                              {skill.name}
                              <button
                                type="button"
                                onClick={() => handleSkillRemove(skill.id)}
                                className="w-4 h-4 rounded-full bg-[#227C70]/20 hover:bg-[#227C70]/40 flex items-center justify-center transition-colors"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <input
                            name="new_skill"
                            value={formData.new_skill}
                            onChange={handleInputChange}
                            placeholder="e.g., Next.js, Figma"
                            className={inputCls(errors.new_skill)}
                          />
                          {errors.new_skill && <p className="text-red-500 text-xs mt-1">{errors.new_skill}</p>}
                        </div>
                        <div>
                          <select
                            name="new_skill_category"
                            value={formData.new_skill_category}
                            onChange={handleInputChange}
                            className={inputCls(errors.new_skill_category)}
                          >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          {errors.new_skill_category && <p className="text-red-500 text-xs mt-1">{errors.new_skill_category}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          disabled={addingSkill || !formData.new_skill.trim() || !formData.new_skill_category}
                          className="px-4 py-2.5 bg-[#227C70] text-white rounded-xl text-sm font-semibold hover:bg-[#1a5f55] disabled:opacity-40 transition-colors"
                        >
                          {addingSkill ? 'Adding…' : 'Add Skill'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewSkill(false);
                            setFormData((p) => ({ ...p, new_skill: '', new_skill_category: '' }));
                          }}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </Field>
              </Section>
            </div>

            {/* Budget & Timeline */}
            <div className="slide-up" style={{ animationDelay: '0.2s' }}>
              <Section icon={DollarSign} title="Budget & Timeline" subtitle="Set your budget and project duration">

                {/* Budget type */}
                <Field label="Budget Type" required>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'fixed',  label: 'Fixed Price',  sub: 'Pay a flat amount' },
                      { value: 'hourly', label: 'Hourly Rate',  sub: 'Pay per hour worked' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          formData.budget_type === opt.value
                            ? 'border-[#227C70] bg-[#227C70]/5'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="budget_type"
                          value={opt.value}
                          checked={formData.budget_type === opt.value}
                          onChange={handleInputChange}
                          className="mt-0.5 accent-[#227C70]"
                        />
                        <div>
                          <p className={`text-sm font-bold ${formData.budget_type === opt.value ? 'text-[#227C70]' : 'text-slate-800'}`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{opt.sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </Field>

                {/* Fixed budget */}
                {formData.budget_type === 'fixed' && (
                  <Field label="Project Budget" required error={errors.fixed_budget}>
                    <div className="relative max-w-xs">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                      <input
                        type="number"
                        name="fixed_budget"
                        value={formData.fixed_budget}
                        onChange={handleInputChange}
                        placeholder="5000"
                        min="0.01" step="0.01"
                        className={`${inputCls(errors.fixed_budget)} pl-8`}
                      />
                    </div>
                  </Field>
                )}

                {/* Hourly range */}
                {formData.budget_type === 'hourly' && (
                  <Field label="Hourly Rate Range" required error={errors.hourly}>
                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                      <div>
                        <p className="text-xs text-slate-500 mb-1.5 font-medium">Min / hr</p>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                          <input
                            type="number"
                            name="hourly_min_rate"
                            value={formData.hourly_min_rate}
                            onChange={handleInputChange}
                            placeholder="25"
                            min="0.01" step="0.01"
                            className={`${inputCls(errors.hourly_min_rate)} pl-7`}
                          />
                        </div>
                        {errors.hourly_min_rate && <p className="text-red-500 text-xs mt-1">{errors.hourly_min_rate}</p>}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1.5 font-medium">Max / hr</p>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                          <input
                            type="number"
                            name="hourly_max_rate"
                            value={formData.hourly_max_rate}
                            onChange={handleInputChange}
                            placeholder="80"
                            min="0.01" step="0.01"
                            className={`${inputCls(errors.hourly_max_rate)} pl-7`}
                          />
                        </div>
                        {errors.hourly_max_rate && <p className="text-red-500 text-xs mt-1">{errors.hourly_max_rate}</p>}
                      </div>
                    </div>
                  </Field>
                )}

                {/* Duration */}
                <Field label="Project Duration" required error={errors.duration}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'less_than_1_month', label: '< 1 month' },
                      { value: '1_3_months',        label: '1–3 months' },
                      { value: '3_6_months',        label: '3–6 months' },
                      { value: 'more_than_6_months',label: '> 6 months' },
                    ].map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => {
                          setFormData((p) => ({ ...p, duration: d.value }));
                          setErrors((p) => ({ ...p, duration: '' }));
                        }}
                        className={`py-2.5 px-3 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                          formData.duration === d.value
                            ? 'border-[#227C70] bg-[#227C70]/5 text-[#227C70]'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </Field>
              </Section>
            </div>

            {/* Experience Level */}
            <div className="slide-up" style={{ animationDelay: '0.25s' }}>
              <Section icon={Users} title="Experience Level" subtitle="What level of expertise do you need?">
                <div className="space-y-2.5">
                  {[
                    { value: 'entry',        label: 'Entry Level',   sub: 'New to the field, budget-friendly' },
                    { value: 'intermediate', label: 'Intermediate',  sub: 'Solid experience, reliable output' },
                    { value: 'expert',       label: 'Expert',        sub: 'Deep expertise, complex projects' },
                  ].map((lvl) => (
                    <label
                      key={lvl.value}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.experience_level === lvl.value
                          ? 'border-[#227C70] bg-[#227C70]/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="experience_level"
                        value={lvl.value}
                        checked={formData.experience_level === lvl.value}
                        onChange={handleInputChange}
                        className="accent-[#227C70]"
                      />
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${formData.experience_level === lvl.value ? 'text-[#227C70]' : 'text-slate-800'}`}>
                          {lvl.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{lvl.sub}</p>
                      </div>
                      {formData.experience_level === lvl.value && (
                        <CheckCircle className="h-4 w-4 text-[#227C70] shrink-0" />
                      )}
                    </label>
                  ))}
                </div>
                {errors.experience_level && (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />{errors.experience_level}
                  </p>
                )}
              </Section>
            </div>

            {/* Actions */}
            <div className="slide-up flex flex-col sm:flex-row gap-3 pb-8" style={{ animationDelay: '0.3s' }}>
              <button
                type="submit"
                disabled={isSubmitting || !canPost}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#227C70] text-white text-sm font-bold rounded-xl hover:bg-[#1a5f55] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#227C70]/20"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Posting…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {canPost
                      ? `Post Project · ${currentSubscription.remaining_projects} slot${currentSubscription.remaining_projects !== 1 ? 's' : ''} left`
                      : 'No Subscription'}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-200 disabled:opacity-40"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
