'use client';
import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { apiPrivate } from '@/lib/apiPrivate';
import { useRouter } from 'next/navigation';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [showActiveModal, setShowActiveModal] = useState(false);
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
          
          // Find active subscription
          const activeSubscription = subscriptionsArray.find(sub => sub.is_active === true);
          setUserSubscription(activeSubscription || null);
        } catch (subErr) {
          console.log('No active subscription found:', subErr);
          setUserSubscription(null);
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
    // Check if user already has an active subscription
    if (userSubscription && userSubscription.is_active) {
      setShowActiveModal(true);
      return;
    }
    
    // Redirect to checkout page with planId as parameter
    router.push(`/client/checkout?planId=${planId}`);
  };

  const getColorClasses = (index) => {
    const colors = [
      {
        bg: 'from-red-500 to-orange-500',
        button: 'bg-red-500 hover:bg-red-600',
        glow: 'hover:shadow-red-500/30'
      },
      {
        bg: 'from-cyan-500 to-teal-400',
        button: 'bg-cyan-500 hover:bg-cyan-600',
        glow: 'hover:shadow-cyan-500/30'
      },
      {
        bg: 'from-blue-600 to-blue-500',
        button: 'bg-blue-600 hover:bg-blue-700',
        glow: 'hover:shadow-blue-500/30'
      }
    ];
    return colors[index % colors.length];
  };

  const formatProjectLimit = (maxProjects) => {
    if (maxProjects === -1 || maxProjects > 100) {
      return 'Unlimited projects';
    }
    return `Up to ${maxProjects} projects`;
  };

  const formatDuration = (days) => {
    if (days === 30) return 'month';
    if (days === 365) return 'year';
    return `${days} days`;
  };

  const getPlanName = (planId) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.name : 'your current plan';
  };

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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

  return (
    <div className="min-h-screen bg-linear-to-br bg-white">
      {/* Active Subscription Modal */}
      {showActiveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="bg-slate-800 border border-cyan-500/50 rounded-2xl p-6 md:p-8 max-w-md w-full">
            <CheckCircle className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-white text-2xl font-bold mb-2 text-center">Already Subscribed</h2>
            <p className="text-gray-300 text-center mb-4">
              You already have an active <span className="text-cyan-400 font-semibold">{getPlanName(userSubscription?.plan)}</span> subscription.
            </p>
            {userSubscription?.end_date && (
              <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                <p className="text-gray-300 text-sm text-center">
                  <span className="font-semibold text-cyan-400">
                    {calculateDaysRemaining(userSubscription.end_date)} days
                  </span> remaining in your subscription
                </p>
              </div>
            )}
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <p className="text-gray-300 text-sm text-center">
                You can manage your existing subscription from your dashboard.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowActiveModal(false)}
                className="flex-1 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => router.push('/client/dashboard')}
                className="flex-1 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16 px-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">
            Subscription Plans
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Choose the perfect plan for your project needs
          </p>
          
          {/* Active Subscription Banner */}
          {userSubscription && userSubscription.is_active && (
            <div className="mt-6 inline-block bg-cyan-500/10 border border-cyan-500/50 rounded-xl px-6 py-3">
              <p className="text-cyan-400 text-sm">
                ✓ Active Subscription: <span className="font-semibold">{getPlanName(userSubscription.plan)}</span>
                {userSubscription.end_date && (
                  <span className="ml-2">
                    ({calculateDaysRemaining(userSubscription.end_date)} days remaining)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        {plans.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <p className="text-gray-400 text-base md:text-lg">No subscription plans available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const colors = getColorClasses(index);
              const isRecommended = index === 1;
              const isCurrentPlan = userSubscription?.plan === plan.id;
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-linear-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl lg:rounded-3xl border ${
                    isCurrentPlan ? 'border-cyan-500' : 'border-gray-700/50'
                  } overflow-hidden hover:border-gray-600 transition-all duration-300 hover:scale-105 ${colors.glow} w-full`}
                  style={{
                    boxShadow: isRecommended 
                      ? '0 10px 40px rgba(6, 182, 212, 0.3)' 
                      : '0 5px 20px rgba(0, 0, 0, 0.3)',
                    transform: 'translateZ(0)'
                  }}
                >
                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <div className="absolute top-0 right-0 bg-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                      ACTIVE
                    </div>
                  )}

                  {/* Recommended Badge */}
                  {isRecommended && !isCurrentPlan && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-teal-400"></div>
                  )}

                  {/* Price Badge */}
                  <div className="relative pt-8 md:pt-10 lg:pt-12 pb-6 md:pb-7 lg:pb-8 px-4 sm:px-6 lg:px-8">
                    <div className={`inline-block bg-gradient-to-r ${colors.bg} rounded-xl lg:rounded-2xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 shadow-xl transform -rotate-2 w-full max-w-xs mx-auto`}>
                      <div className="text-white text-lg sm:text-xl lg:text-2xl font-bold mb-1 text-center">
                        {plan.name}
                      </div>
                      <div className="text-white text-center">
                        <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">₹{parseFloat(plan.price).toFixed(0)}</span>
                        <span className="text-sm sm:text-base lg:text-lg ml-1 sm:ml-2 opacity-80 block sm:inline mt-1 sm:mt-0">
                          Per {formatDuration(plan.duration_days)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="px-4 sm:px-6 lg:px-8 pb-6 md:pb-7 lg:pb-8 space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-2 h-2 sm:w-3 sm:h-3 text-green-400" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        {formatProjectLimit(plan.max_projects)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-2 h-2 sm:w-3 sm:h-3 text-green-400" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        {plan.duration_days} days access
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-2 h-2 sm:w-3 sm:h-3 text-green-400" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        Browse freelancers
                      </span>
                    </div>
                  </div>

                  {/* Buy Button */}
                  <div className="px-4 sm:px-6 lg:px-8 pb-6 md:pb-7 lg:pb-8">
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isCurrentPlan}
                      className={`w-full py-3 sm:py-4 rounded-lg lg:rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base ${
                        isCurrentPlan 
                          ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                          : `${colors.button}`
                      }`}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center mt-8 md:mt-12 lg:mt-16 px-4">
          <p className="text-gray-400 text-sm sm:text-base mb-2">
            All plans include access to our freelancer marketplace
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Need a custom plan? <a href="#" className="text-cyan-400 hover:underline transition-colors">Contact our team</a>
          </p>
        </div>
      </main>
    </div>
  );
}
