'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Download, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      router.push('/client/dashboard');
    }
  }, [countdown, router]);

  const handleGoToDashboard = () => {
    router.push('/client/dashboard');
  };

  const handleViewInvoice = () => {
    alert('Invoice download will be implemented');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 overflow-hidden shadow-2xl">
          <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 animate-bounce">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Payment Successful!
              </h1>
              <p className="text-green-50 text-lg">
                Your subscription has been activated
              </p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-slate-800/30 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">
                Payment Details
              </h2>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                <span className="text-gray-400">Transaction ID</span>
                <span className="text-white font-mono text-sm">
                  #TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                <span className="text-gray-400">Plan</span>
                <span className="text-white font-semibold">Premium Plan</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                <span className="text-gray-400">Amount Paid</span>
                <span className="text-green-400 font-bold text-xl">$39.00</span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-gray-400">Payment Date</span>
                <span className="text-white">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                What's Next?
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>A confirmation email has been sent to your inbox</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Your subscription is now active and ready to use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Access all premium features from your dashboard</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGoToDashboard}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={handleViewInvoice}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300"
              >
                <Download className="w-5 h-5" />
                Download Invoice
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Redirecting to dashboard in{' '}
                <span className="text-blue-400 font-bold">{countdown}</span> seconds...
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Need help?{' '}
            <a href="/support" className="text-blue-400 hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
