'use client';
import React, { use, useState } from 'react';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PaymentFailedPage() {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryPayment = () => {
    setIsRetrying(true);
    setTimeout(() => {
      router.push('/client/subscriptions');
    }, 1000);
  };

  const handleGoBack = () => {
    router.push('/client/subscriptions');
  };

  const handleContactSupport = () => {
    router.push('/support');
  };

  const commonReasons = [
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: 'Insufficient Funds',
      description: 'Your card may not have enough balance'
    },
    {
      icon: <XCircle className="w-5 h-5" />,
      title: 'Card Declined',
      description: 'Your bank declined the transaction'
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      title: 'Incorrect Details',
      description: 'Card number or CVV may be incorrect'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-red-900/30 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Failed Card */}
        <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 overflow-hidden shadow-2xl">
          {/* Failed Header */}
          <div className="relative bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-white/5"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Payment Failed
              </h1>
              <p className="text-red-50 text-lg">
                We couldn't process your payment
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Error Message */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                What happened?
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Your payment could not be completed at this time. This may be due to insufficient funds, 
                an issue with your payment method, or a declined transaction by your bank.
              </p>
            </div>

            {/* Common Reasons */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Common Reasons for Payment Failure
              </h3>
              <div className="space-y-3">
                {commonReasons.map((reason, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 bg-slate-800/30 rounded-xl p-4 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 flex-shrink-0">
                      {reason.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        {reason.title}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What You Can Do */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                What You Can Do
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">1.</span>
                  <span>Check your payment details and try again</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">2.</span>
                  <span>Ensure you have sufficient funds in your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">3.</span>
                  <span>Contact your bank to authorize the transaction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">4.</span>
                  <span>Try using a different payment method</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleRetryPayment}
                disabled={isRetrying}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </>
                )}
              </button>

              <button
                onClick={handleGoBack}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Plans
              </button>
            </div>

            {/* Support Button */}
            <button
              onClick={handleContactSupport}
              className="w-full flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 border border-gray-700/50"
            >
              <HelpCircle className="w-5 h-5" />
              Contact Support
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Need immediate assistance?{' '}
            <a href="mailto:support@freelancerhub.com" className="text-blue-400 hover:underline">
              Email us
            </a>
            {' '}or call{' '}
            <a href="tel:+1234567890" className="text-blue-400 hover:underline">
              +1 (234) 567-890
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}