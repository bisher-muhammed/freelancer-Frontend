'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Check, Loader2, AlertCircle, Plus, Zap, Layers,
  Clock, Briefcase, Calendar, TrendingDown, History,
  ArrowRight, ChevronLeft, RefreshCw,
} from 'lucide-react';
import { apiPrivate } from '@/lib/apiPrivate';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const daysLeft = (endDate) => {
  const diff = Math.ceil((new Date(endDate) - new Date()) / 86400000);
  return diff > 0 ? diff : 0;
};

const fmtProjects = (n) => (n === -1 || n > 100 ? 'Unlimited' : `${n} projects`);
const fmtDuration = (days) => (days === 30 ? 'month' : days === 365 ? 'year' : `${days} days`);

/*
 * ✅ KEY FIX: Both PostProject and here must use the same usable-subscription filter.
 * API returns is_active: false / is_queued: true for queued subs.
 * A sub is usable when: not expired + has remaining slots + status is active or queued.
 */
const isUsable = (s) =>
  !s.is_expired &&
  s.remaining_projects > 0 &&
  (s.status === 'active' || s.status === 'queued');

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
      <div className={`w-10 h-10 ${accent} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const router = useRouter();

  const [plans, setPlans]                         = useState([]);
  const [usableSubs, setUsableSubs]               = useState([]); // queued + active, not expired
  const [allSubs, setAllSubs]                     = useState([]);  // raw from API (for display)
  const [totalProjectsCreated, setTotalProjectsCreated] = useState(0);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Plans  ── ✅ FIX: added trailing slash
      const { data: plansData } = await apiPrivate.get('/subscriptions/');
      const plansArr = plansData?.results ?? (Array.isArray(plansData) ? plansData : []);
      setPlans(plansArr);

      // 2. User subscriptions
      const { data: subData } = await apiPrivate.get('/user-subscription/');
      const raw = subData?.results ?? (Array.isArray(subData) ? subData : []);

      // Sort soonest-expiry first (same order PostProject uses)
      raw.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
      setAllSubs(raw);
      setUsableSubs(raw.filter(isUsable));

      // 3. Project count
      try {
        const { data: projData } = await apiPrivate.get('/projects/');
        const arr = projData?.results ?? (Array.isArray(projData) ? projData : []);
        setTotalProjectsCreated(arr.length);
      } catch { /* non-fatal */ }

    } catch (err) {
      setError('Failed to load subscription data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSubscribe = (planId) => router.push(`/client/checkout?planId=${planId}`);

  // Derived
  const currentSub    = usableSubs[0] ?? null;
  const totalRemaining = usableSubs.reduce((acc, s) => acc + s.remaining_projects, 0);
  // ✅ FIX: was `Object.keys(userSubscriptions).length` — array keys give wrong count
  const activePlanCount = new Set(usableSubs.map((s) => s.plan)).size;

  // Plan lookup
  const getPlan = (planId) => plans.find((p) => p.id === planId);

  // Group usable subs by plan id
  const byPlan = usableSubs.reduce((acc, s) => {
    (acc[s.plan] = acc[s.plan] || []).push(s);
    return acc;
  }, {});

  // Usage flow: all subs (usable + exhausted), sorted soonest first
  const usageFlow = allSubs.map((s, i) => {
    const plan = getPlan(s.plan);
    const total = plan?.max_projects ?? 0;
    return {
      id:       s.id,
      name:     plan?.name ?? 'Unknown Plan',
      total,
      remaining: s.remaining_projects,
      used:     Math.max(0, total - s.remaining_projects),
      usable:   isUsable(s),
      isCurrent: usableSubs[0]?.id === s.id,
      isQueued:  s.is_queued && !s.is_active,
      isExpired: s.is_expired,
      isExhausted: s.remaining_projects === 0 && !s.is_expired,
      expiresIn: daysLeft(s.end_date),
      // ✅ FIX: API has `purchased_at`, not `start_date`
      purchasedAt: s.purchased_at,
      endDate:     s.end_date,
      status:      s.status,
    };
  });

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#227C70] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading subscriptions…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center px-4">
        <div className="bg-white border border-red-100 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-700 mb-4">{error}</p>
          <button
            onClick={fetchAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#227C70] text-white text-sm font-semibold rounded-xl hover:bg-[#1a5f55] transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .sub-root { font-family: 'DM Sans', sans-serif; }
        .brand-font { font-family: 'Syne', sans-serif; }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .slide-up { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.1) both; }
      `}</style>

      <div className="sub-root min-h-screen bg-[#f8f9fb] p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* ── Header ── */}
          <div className="slide-up">
            <Link
              href="/client/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#227C70] transition-colors mb-4"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="brand-font text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Subscriptions
                </h1>
                <p className="text-sm text-slate-500 mt-1.5 font-medium">
                  Manage your plans and track project usage.
                </p>
              </div>
              <button
                onClick={fetchAll}
                className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          {usableSubs.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 slide-up" style={{ animationDelay: '0.05s' }}>
              <StatCard
                icon={Briefcase}
                label="Slots Available"
                value={totalRemaining}
                sub="Across all plans"
                accent="bg-[#227C70]/10 text-[#227C70]"
              />
              <StatCard
                icon={History}
                label="Projects Created"
                value={totalProjectsCreated}
                sub="All time"
                accent="bg-blue-50 text-blue-600"
              />
              <StatCard
                icon={Layers}
                label="Active Plans"
                // ✅ FIX: was Object.keys(array) which is wrong
                value={activePlanCount}
                sub="Distinct plan types"
                accent="bg-emerald-50 text-emerald-600"
              />
              <StatCard
                icon={Clock}
                label="Next Expiry"
                value={currentSub ? `${daysLeft(currentSub.end_date)}d` : '—'}
                sub={currentSub ? fmt(currentSub.end_date) : 'No active sub'}
                accent="bg-violet-50 text-violet-600"
              />
            </div>
          )}

          {/* ── Usage Flow ── */}
          {usageFlow.length > 0 && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
                <div className="w-9 h-9 bg-[#227C70]/10 rounded-xl flex items-center justify-center">
                  <TrendingDown className="h-4.5 w-4.5 text-[#227C70]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-none">Usage Flow</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Projects are consumed soonest-expiry first</p>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {usageFlow.map((u, i) => {
                  const pct = u.total > 0 ? Math.round((u.used / u.total) * 100) : 0;
                  const statusLabel = u.isCurrent ? 'In Use' : u.isExpired ? 'Expired' : u.isExhausted ? 'Exhausted' : 'Queued';
                  const statusCls   = u.isCurrent
                    ? 'bg-[#227C70]/10 text-[#227C70] border-[#227C70]/20'
                    : u.isExpired || u.isExhausted
                    ? 'bg-slate-100 text-slate-500 border-slate-200'
                    : 'bg-blue-50 text-blue-600 border-blue-200';
                  const barCls = u.isCurrent ? 'bg-[#227C70]' : u.isExpired || u.isExhausted ? 'bg-slate-300' : 'bg-blue-400';

                  return (
                    <div key={u.id} className="relative flex gap-4">
                      {/* Timeline spine */}
                      {i < usageFlow.length - 1 && (
                        <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-slate-100" />
                      )}

                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center z-10 shadow-sm ${
                        u.isCurrent ? 'bg-[#227C70] text-white' : u.isExpired || u.isExhausted ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {u.isCurrent ? <Zap className="h-4 w-4" /> : u.isExhausted ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 border rounded-xl p-4 transition-all ${
                        u.isCurrent ? 'border-[#227C70]/20 bg-[#227C70]/5' : 'border-slate-100 bg-slate-50/50'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-bold text-slate-900">{u.name}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${statusCls}`}>
                                {statusLabel}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              {/* ✅ FIX: purchasedAt instead of start_date */}
                              Purchased {fmt(u.purchasedAt)} · Expires {fmt(u.endDate)} ({u.expiresIn}d left)
                            </p>
                          </div>

                          {/* Progress */}
                          <div className="sm:w-56 shrink-0">
                            <div className="flex justify-between text-xs font-medium mb-1.5">
                              <span className="text-slate-600">{u.remaining} remaining</span>
                              <span className="text-slate-400">{u.used} used</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${barCls}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 text-right">{pct}% used</p>
                          </div>
                        </div>

                        {/* Next in line hint */}
                        {u.isCurrent && usageFlow[i + 1] && (
                          <div className="mt-3 pt-3 border-t border-[#227C70]/10 flex items-center gap-1.5 text-xs text-[#227C70] font-medium">
                            <ArrowRight className="h-3.5 w-3.5" />
                            Next: {usageFlow[i + 1].name} ({usageFlow[i + 1].remaining} slots)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No subscriptions placeholder */}
          {usableSubs.length === 0 && allSubs.length === 0 && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-12 text-center slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-base font-bold text-slate-700 mb-1">No subscriptions yet</p>
              <p className="text-sm text-slate-400 mb-6">Choose a plan below to start posting projects.</p>
            </div>
          )}

          {/* ── Available Plans ── */}
          <div className="slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="brand-font text-2xl font-extrabold text-slate-900 tracking-tight">
                Available Plans
              </h2>
              {usableSubs.length > 0 && (
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                  {totalRemaining} slots in your account
                </span>
              )}
            </div>

            {plans.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <p className="text-sm text-slate-500">No plans available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {plans.map((plan, i) => {
                  const planSubs    = byPlan[plan.id] ?? [];
                  const hasActive   = planSubs.length > 0;
                  const slotCount   = planSubs.reduce((a, s) => a + s.remaining_projects, 0);
                  const isPopular   = i === 1;

                  return (
                    <div
                      key={plan.id}
                      className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                        hasActive
                          ? 'border-[#227C70]'
                          : isPopular
                          ? 'border-slate-900'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Badge */}
                      {(hasActive || isPopular) && (
                        <div className={`absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          hasActive
                            ? 'bg-[#227C70]/10 text-[#227C70]'
                            : 'bg-slate-900 text-white'
                        }`}>
                          {hasActive ? `${planSubs.length} ACTIVE` : 'POPULAR'}
                        </div>
                      )}

                      {/* Header */}
                      <div className={`px-6 pt-6 pb-5 ${
                        hasActive ? 'bg-[#227C70]/5' : isPopular ? 'bg-slate-900' : 'bg-slate-50'
                      }`}>
                        <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${
                          isPopular && !hasActive ? 'text-slate-400' : 'text-slate-500'
                        }`}>{plan.name}</p>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-4xl font-extrabold ${
                            isPopular && !hasActive ? 'text-white' : 'text-slate-900'
                          }`}>
                            ₹{parseFloat(plan.price).toFixed(0)}
                          </span>
                          <span className={`text-sm ${isPopular && !hasActive ? 'text-slate-400' : 'text-slate-500'}`}>
                            / {fmtDuration(plan.duration_days)}
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="px-6 py-5 space-y-3">
                        {[
                          fmtProjects(plan.max_projects),
                          `${plan.duration_days}-day validity`,
                          'Full marketplace access',
                        ].map((feat) => (
                          <div key={feat} className="flex items-center gap-2.5 text-sm text-slate-600">
                            <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3 text-emerald-500" />
                            </div>
                            {feat}
                          </div>
                        ))}

                        {/* Active slots */}
                        {hasActive && (
                          <div className="flex items-center gap-2.5 text-sm font-semibold text-[#227C70]">
                            <div className="w-5 h-5 bg-[#227C70]/10 rounded-full flex items-center justify-center shrink-0">
                              <Zap className="h-3 w-3 text-[#227C70]" />
                            </div>
                            {slotCount} slots in your account
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="px-6 pb-6">
                        <button
                          onClick={() => handleSubscribe(plan.id)}
                          className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 ${
                            hasActive
                              ? 'bg-[#227C70] text-white hover:bg-[#1a5f55] shadow-sm shadow-[#227C70]/20'
                              : isPopular
                              ? 'bg-slate-900 text-white hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          {hasActive ? (
                            <><Plus className="h-4 w-4" /> Add More Slots</>
                          ) : (
                            'Subscribe Now'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── How it works ── */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-8 slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="brand-font text-xl font-extrabold text-slate-900 tracking-tight text-center mb-6">
              How Multiple Subscriptions Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: TrendingDown,
                  accent: 'bg-[#227C70]/10 text-[#227C70]',
                  title: 'Sequential Usage',
                  body: 'Projects are deducted from whichever subscription expires soonest. Credits never go to waste.',
                },
                {
                  icon: Layers,
                  accent: 'bg-blue-50 text-blue-600',
                  title: 'Plan Stacking',
                  body: 'Buy multiple plans of any type. Each purchase adds to your total slot pool.',
                },
                {
                  icon: Zap,
                  accent: 'bg-emerald-50 text-emerald-600',
                  title: 'Instant Activation',
                  body: 'Subscriptions activate automatically when your previous one is used up — no manual switching.',
                },
              ].map(({ icon: Icon, accent, title, body }) => (
                <div key={title} className="text-center">
                  <div className={`w-12 h-12 ${accent} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 mb-1">{title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}