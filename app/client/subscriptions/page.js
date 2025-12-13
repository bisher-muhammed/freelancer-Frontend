'use client';
import React, { useState, useEffect } from 'react';
import { Check, Loader2, AlertCircle, Plus, Zap, Layers, Clock, Briefcase, Calendar, TrendingDown, History, ArrowRight } from 'lucide-react';
import { apiPrivate } from '@/lib/apiPrivate';
import { useRouter } from 'next/navigation';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [projectUsage, setProjectUsage] = useState([]);
  const [totalUsedProjects, setTotalUsedProjects] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plans
        const plansResponse = await apiPrivate.get('/subscriptions');
        const data = plansResponse.data.results || plansResponse.data;
        const plansArray = Array.isArray(data) ? data : [];
        setPlans(plansArray);

        // Fetch user's subscription status
        try {
          const subscriptionResponse = await apiPrivate.get('/user-subscription/');
          const subscriptions = subscriptionResponse.data.results || subscriptionResponse.data;
          const subscriptionsArray = Array.isArray(subscriptions) ? subscriptions : [];
          
          // Get all active subscriptions sorted by expiry date
          const activeSubscriptions = subscriptionsArray.filter(sub => sub.is_active === true);
          const sortedSubscriptions = activeSubscriptions.sort((a, b) => 
            new Date(a.end_date) - new Date(b.end_date)
          );
          setUserSubscriptions(sortedSubscriptions || []);
        } catch (subErr) {
          console.log('No active subscription found:', subErr);
          setUserSubscriptions([]);
        }

        // Fetch project usage history
        try {
          const projectsResponse = await apiPrivate.get('/projects/');
          const projects = projectsResponse.data.results || projectsResponse.data;
          const projectsArray = Array.isArray(projects) ? projects : [];
          
          // Calculate total used projects
          setTotalUsedProjects(projectsArray.length);
          
          // Simulate project usage by subscription (this would come from backend)
          // For now, we'll simulate based on subscription order
          const usage = [];
          let remainingToAssign = projectsArray.length;
          
          userSubscriptions.forEach((sub, index) => {
            const subProjects = Math.min(
              remainingToAssign,
              sub.plan?.max_projects - sub.remaining_projects || 0
            );
            if (subProjects > 0) {
              usage.push({
                subscriptionId: sub.id,
                planName: getPlanName(sub.plan),
                projectsUsed: subProjects,
                remaining: sub.remaining_projects,
                isCurrent: index === 0 && sub.remaining_projects > 0
              });
              remainingToAssign -= subProjects;
            }
          });
          
          setProjectUsage(usage);
        } catch (projectsErr) {
          console.log('Error fetching projects:', projectsErr);
        }
      } catch (err) {
        setError('Failed to load subscription plans.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubscribe = (planId) => {
    router.push(`/client/checkout?planId=${planId}`);
  };

  const getColorClasses = (index) => {
    const colors = [
      {
        bg: 'from-red-500 to-orange-500',
        button: 'bg-red-500 hover:bg-red-600',
        glow: 'hover:shadow-red-500/30',
        text: 'text-red-400',
        light: 'bg-red-500/10',
        progress: 'bg-red-500'
      },
      {
        bg: 'from-cyan-500 to-teal-400',
        button: 'bg-cyan-500 hover:bg-cyan-600',
        glow: 'hover:shadow-cyan-500/30',
        text: 'text-cyan-400',
        light: 'bg-cyan-500/10',
        progress: 'bg-cyan-500'
      },
      {
        bg: 'from-blue-600 to-blue-500',
        button: 'bg-blue-600 hover:bg-blue-700',
        glow: 'hover:shadow-blue-500/30',
        text: 'text-blue-400',
        light: 'bg-blue-500/10',
        progress: 'bg-blue-500'
      }
    ];
    return colors[index % colors.length];
  };

  const formatProjectLimit = (maxProjects) => {
    if (maxProjects === -1 || maxProjects > 100) {
      return 'Unlimited projects';
    }
    return `${maxProjects} projects`;
  };

  const formatDuration = (days) => {
    if (days === 30) return 'month';
    if (days === 365) return 'year';
    return `${days} days`;
  };

  const getPlanName = (planId) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.name : 'Unknown Plan';
  };

  const getPlanDetails = (planId) => {
    return plans.find(p => p.id === planId);
  };

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if user has an active subscription for a specific plan
  const hasActiveSubscriptionForPlan = (planId) => {
    return userSubscriptions.some(sub => sub.plan === planId && sub.is_active);
  };

  // Get total remaining projects across all active subscriptions
  const getTotalRemainingProjects = () => {
    return userSubscriptions.reduce((total, sub) => {
      return total + (sub.remaining_projects > 0 ? sub.remaining_projects : 0);
    }, 0);
  };

  // Group subscriptions by plan type
  const getSubscriptionsByPlan = () => {
    const grouped = {};
    userSubscriptions.forEach(sub => {
      const planId = sub.plan;
      if (!grouped[planId]) {
        grouped[planId] = [];
      }
      grouped[planId].push(sub);
    });
    return grouped;
  };

  // Get usage flow visualization
  const getUsageFlow = () => {
    const flow = [];
    userSubscriptions.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
    
    userSubscriptions.forEach((sub, index) => {
      const plan = getPlanDetails(sub.plan);
      const originalProjects = plan?.max_projects || 0;
      const used = originalProjects - sub.remaining_projects;
      const isCurrent = index === 0 && sub.remaining_projects > 0;
      
      flow.push({
        id: sub.id,
        planName: plan?.name || 'Unknown Plan',
        originalProjects,
        remaining: sub.remaining_projects,
        used,
        isCurrent,
        expiresIn: calculateDaysRemaining(sub.end_date),
        isExhausted: sub.remaining_projects === 0,
        isExpired: !sub.is_active
      });
    });
    
    return flow;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-cyan-400 animate-spin mx-auto mb-3 md:mb-4" />
          <p className="text-white text-base md:text-lg">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900 flex items-center justify-center px-4">
        <div className="text-center bg-slate-800/50 backdrop-blur-sm border border-red-500/50 rounded-xl md:rounded-2xl p-6 md:p-8 max-w-md w-full">
          <AlertCircle className="w-8 h-8 md:w-12 md:h-12 text-red-400 mx-auto mb-3 md:mb-4" />
          <p className="text-red-400 text-base md:text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 md:px-6 md:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm md:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const groupedSubscriptions = getSubscriptionsByPlan();
  const usageFlow = getUsageFlow();
  const currentSubscription = userSubscriptions.length > 0 ? userSubscriptions[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16 px-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">
            Subscription Plans
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Manage and optimize your subscription portfolio
          </p>
        </div>

        {/* Active Subscriptions Section */}
        {userSubscriptions.length > 0 && (
          <div className="mb-12 md:mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Layers className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Your Subscription Portfolio
              </h2>
            </div>

            {/* Current Usage Section */}
            <div className="mb-8">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingDown className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-white">Current Usage Flow</h3>
                </div>
                
                <div className="space-y-4">
                  {usageFlow.map((usage, index) => (
                    <div key={usage.id} className="relative">
                      {/* Connection Line */}
                      {index < usageFlow.length - 1 && (
                        <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-700 z-0"></div>
                      )}
                      
                      <div className="relative z-10">
                        <div className={`flex items-center gap-4 p-4 rounded-lg ${
                          usage.isCurrent 
                            ? 'bg-cyan-500/10 border border-cyan-500/30' 
                            : usage.isExhausted
                            ? 'bg-gray-800/50 border border-gray-700/50'
                            : 'bg-slate-700/30 border border-gray-700/30'
                        }`}>
                          {/* Status Indicator */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            usage.isCurrent 
                              ? 'bg-cyan-500' 
                              : usage.isExhausted
                              ? 'bg-gray-600'
                              : 'bg-blue-500'
                          }`}>
                            {usage.isCurrent ? (
                              <Zap className="w-4 h-4 text-white" />
                            ) : usage.isExhausted ? (
                              <Check className="w-4 h-4 text-white" />
                            ) : (
                              <Clock className="w-4 h-4 text-white" />
                            )}
                          </div>
                          
                          {/* Plan Info */}
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h4 className="font-semibold text-white">
                                  {usage.planName}
                                  {usage.isCurrent && (
                                    <span className="ml-2 text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                                      CURRENTLY IN USE
                                    </span>
                                  )}
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Expires in {usage.expiresIn} days
                                </p>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="w-full sm:w-64">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-300">
                                    {usage.remaining} / {usage.originalProjects} remaining
                                  </span>
                                  <span className={`${
                                    usage.isExhausted ? 'text-gray-400' : 'text-cyan-400'
                                  }`}>
                                    {usage.used} used
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      usage.isCurrent ? 'bg-cyan-500' : 
                                      usage.isExhausted ? 'bg-gray-600' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${(usage.used / usage.originalProjects) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Usage Pattern */}
                            {usage.isCurrent && (
                              <div className="mt-3 flex items-center gap-2 text-sm text-cyan-300">
                                <ArrowRight className="w-4 h-4" />
                                <span>Next {usageFlow[index + 1]?.planName || 'No more subscriptions'} after this expires</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Available</p>
                      <p className="text-3xl font-bold text-white">{getTotalRemainingProjects()}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Projects across all plans</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <History className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Projects Used</p>
                      <p className="text-3xl font-bold text-white">{totalUsedProjects}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Total projects created</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Layers className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Active Plans</p>
                      <p className="text-3xl font-bold text-white">
                        {Object.keys(groupedSubscriptions).length}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Different plan types</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Next Expiry</p>
                      <p className="text-2xl font-bold text-white">
                        {currentSubscription && calculateDaysRemaining(currentSubscription.end_date)} days
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {currentSubscription && formatDate(currentSubscription.end_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Subscription List */}
            <div className="bg-slate-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Subscription Details
              </h3>
              
              {Object.entries(groupedSubscriptions).map(([planId, subscriptions], index) => {
                const planDetails = getPlanDetails(parseInt(planId));
                const colors = getColorClasses(index);
                
                return (
                  <div key={planId} className="mb-6 last:mb-0">
                    {/* Plan Header */}
                    <div className={`${colors.light} rounded-lg p-4 mb-3`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-bold text-white">{planDetails?.name || 'Unknown Plan'}</h4>
                          <p className="text-gray-300 text-sm">
                            {planDetails ? formatProjectLimit(planDetails.max_projects) : ''} • 
                            {planDetails ? ` ${formatDuration(planDetails.duration_days)}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                            {subscriptions.length} active subscription{subscriptions.length > 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={() => handleSubscribe(planId)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add More
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Individual Subscriptions for this plan */}
                    <div className="space-y-3">
                      {subscriptions.map((subscription, subIndex) => {
                        const isCurrentInUse = currentSubscription?.id === subscription.id;
                        const totalProjects = planDetails?.max_projects || 0;
                        const usedProjects = totalProjects - subscription.remaining_projects;
                        
                        return (
                          <div key={subscription.id} className="bg-slate-700/30 rounded-lg p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                              <div className="space-y-2">
                                <p className="text-gray-400 text-xs">Subscription #{subIndex + 1}</p>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    isCurrentInUse ? 'bg-green-500 animate-pulse' : 
                                    subscription.remaining_projects === 0 ? 'bg-gray-500' : 'bg-blue-500'
                                  }`} />
                                  <p className="text-white text-sm font-medium">
                                    {isCurrentInUse ? 'Currently in use' : 
                                     subscription.remaining_projects === 0 ? 'Exhausted' : 'Queued'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <p className="text-gray-400 text-xs">Projects</p>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-white text-lg font-bold">
                                    {subscription.remaining_projects}
                                  </span>
                                  <span className="text-gray-400 text-sm">
                                    / {totalProjects} remaining
                                  </span>
                                </div>
                                <p className="text-gray-500 text-xs">
                                  {usedProjects} projects used
                                </p>
                              </div>
                              
                              <div className="space-y-1">
                                <p className="text-gray-400 text-xs">Started</p>
                                <p className="text-white text-sm">
                                  {formatDate(subscription.start_date)}
                                </p>
                              </div>
                              
                              <div className="space-y-1">
                                <p className="text-gray-400 text-xs">Expires</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-white text-sm">
                                    {formatDate(subscription.end_date)}
                                  </p>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    calculateDaysRemaining(subscription.end_date) < 7 
                                      ? 'bg-red-500/20 text-red-300' 
                                      : calculateDaysRemaining(subscription.end_date) < 30
                                      ? 'bg-yellow-500/20 text-yellow-300'
                                      : 'bg-green-500/20 text-green-300'
                                  }`}>
                                    {calculateDaysRemaining(subscription.end_date)} days
                                  </span>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <p className="text-gray-400 text-xs">Status</p>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    subscription.is_active ? 'bg-green-500' : 'bg-red-500'
                                  }`} />
                                  <span className={`text-sm ${
                                    subscription.is_active ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {subscription.is_active ? 'Active' : 'Expired'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Plans Section - Same as before but with improved context */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            Available Subscription Plans
          </h2>
          
          {plans.length === 0 ? (
            <div className="text-center py-12 md:py-16">
              <p className="text-gray-400 text-base md:text-lg">No subscription plans available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {plans.map((plan, index) => {
                const colors = getColorClasses(index);
                const isRecommended = index === 1;
                const hasActivePlan = hasActiveSubscriptionForPlan(plan.id);
                const planSubscriptions = groupedSubscriptions[plan.id] || [];
                
                return (
                  <div
                    key={plan.id}
                    className={`relative bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border ${
                      hasActivePlan ? 'border-green-500/50' : 'border-gray-700/50'
                    } overflow-hidden transition-all duration-300 hover:scale-[1.02] ${colors.glow}`}
                    style={{
                      boxShadow: isRecommended 
                        ? '0 10px 40px rgba(6, 182, 212, 0.3)' 
                        : '0 5px 20px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {/* Plan Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      {hasActivePlan && (
                        <div className="flex items-center gap-1 bg-green-500/20 border border-green-500/50 text-green-300 text-xs font-bold px-3 py-1 rounded-full">
                          <Check className="w-3 h-3" />
                          <span>ACTIVE</span>
                          {planSubscriptions.length > 1 && (
                            <span className="ml-1">({planSubscriptions.length})</span>
                          )}
                        </div>
                      )}
                      {isRecommended && !hasActivePlan && (
                        <div className="bg-gradient-to-r from-cyan-500 to-teal-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                          POPULAR
                        </div>
                      )}
                    </div>

                    {/* Plan Header */}
                    <div className={`p-6 bg-gradient-to-r ${colors.bg}`}>
                      <h3 className="text-white text-xl font-bold mb-2">{plan.name}</h3>
                      <div className="text-white">
                        <span className="text-4xl font-bold">₹{parseFloat(plan.price).toFixed(0)}</span>
                        <span className="text-white/80 ml-2">
                          / {formatDuration(plan.duration_days)}
                        </span>
                      </div>
                    </div>

                    {/* Plan Features */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-green-400" />
                          </div>
                          <span className="text-gray-300">
                            {formatProjectLimit(plan.max_projects)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-green-400" />
                          </div>
                          <span className="text-gray-300">
                            {plan.duration_days} days access
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-green-400" />
                          </div>
                          <span className="text-gray-300">
                            Full marketplace access
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleSubscribe(plan.id)}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 mt-6 flex items-center justify-center gap-2 ${
                          hasActivePlan 
                            ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600' 
                            : `bg-gradient-to-r ${colors.bg} hover:opacity-90`
                        }`}
                      >
                        {hasActivePlan ? (
                          <>
                            <Plus className="w-4 h-4" />
                            Add More Projects
                          </>
                        ) : (
                          'Subscribe Now'
                        )}
                      </button>

                      {/* Plan Stats */}
                      {hasActivePlan && planSubscriptions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700/50">
                          <div className="grid grid-cols-2 gap-3 text-center">
                            <div>
                              <p className="text-gray-400 text-xs">Active</p>
                              <p className="text-green-400 font-bold">{planSubscriptions.length}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Total Projects</p>
                              <p className="text-white font-bold">
                                {planSubscriptions.reduce((sum, sub) => sum + sub.remaining_projects, 0)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              How Multiple Subscriptions Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Sequential Usage</h3>
                <p className="text-gray-400 text-sm">
                  Projects are automatically deducted from subscriptions expiring soonest first.
                  This prevents credits from expiring unused.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Plan Stacking</h3>
                <p className="text-gray-400 text-sm">
                  Mix different plans to create custom solutions. Each purchase adds to your project pool.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Real-time Updates</h3>
                <p className="text-gray-400 text-sm">
                  See exactly which subscription is being used and how many projects remain in each.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
