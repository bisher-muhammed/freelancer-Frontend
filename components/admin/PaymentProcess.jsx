"use client";

import React, { useState } from "react";
import { apiPrivate } from "@/lib/apiPrivate";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  ChevronRight,
  Users,
  Wallet,
  Receipt,
  ExternalLink,
  RefreshCw,
  XCircle,
  Loader2
} from "lucide-react";

const PaymentProcess = ({ freelancerId, billingData, onPaymentComplete }) => {
  const [loading, setLoading] = useState(false);
  const [payoutPreview, setPayoutPreview] = useState(null);
  const [error, setError] = useState(null);
  const [processingStep, setProcessingStep] = useState(null); // 'preview', 'confirm', 'processing'
  const [payoutResult, setPayoutResult] = useState(null);

  // Step 1: Preview Payout
  const handlePreviewPayout = async () => {
    try {
      setLoading(true);
      setError(null);
      setProcessingStep('preview');
      
      // First, get available billing units for this freelancer
      const response = await apiPrivate.post('admin/payouts/preview/', {
        freelancer_id: freelancerId,
        platform_fee_percent: 10.0 // Default 10% platform fee
      });
      
      setPayoutPreview(response.data);
    } catch (err) {
      console.error("Error previewing payout:", err);
      setError(err.response?.data?.detail || "Failed to preview payout");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm and Process Payout
  const handleConfirmPayout = async () => {
    try {
      setLoading(true);
      setError(null);
      setProcessingStep('confirm');
      
      const response = await apiPrivate.post('/admin/payouts/confirm/', {
        freelancer_id: freelancerId,
        platform_fee_percent: 10.0,
        billing_unit_ids: payoutPreview?.billing_unit_ids || []
      });
      
      setPayoutResult(response.data);
      setProcessingStep('processing');
      
      // Call callback if provided
      if (onPaymentComplete) {
        onPaymentComplete(response.data);
      }
      
      // Reset after success
      setTimeout(() => {
        setPayoutPreview(null);
        setPayoutResult(null);
        setProcessingStep(null);
      }, 3000);
      
    } catch (err) {
      console.error("Error confirming payout:", err);
      setError(err.response?.data?.detail || "Failed to process payout");
      setProcessingStep(null);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format seconds to hours
  const formatHours = (seconds) => {
    return (seconds / 3600).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Payment Process Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white p-3 rounded-xl shadow-sm">
            <CreditCard className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">Payment Process</h3>
            <p className="text-gray-600">Process payout for approved billing units</p>
          </div>
          {billingData?.freelancer && (
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200">
              <Users className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Freelancer</p>
                <p className="font-medium text-gray-900">
                  {billingData.freelancer_name || `ID: ${billingData.freelancer}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`text-center ${processingStep ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${processingStep ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
              1
            </div>
            <p className="text-sm font-medium">Preview</p>
          </div>
          <div className={`text-center ${processingStep === 'confirm' || processingStep === 'processing' ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${processingStep === 'confirm' || processingStep === 'processing' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
              2
            </div>
            <p className="text-sm font-medium">Confirm</p>
          </div>
          <div className={`text-center ${processingStep === 'processing' ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${processingStep === 'processing' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
              3
            </div>
            <p className="text-sm font-medium">Processing</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-rose-800">Error</p>
              <p className="text-sm text-rose-600">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-700"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Preview Payout */}
      {!payoutPreview && !payoutResult && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl mb-4">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Start Payment Process
            </h4>
            <p className="text-gray-600 mb-6">
              Preview available billing units and calculate payout amount
            </p>
            <button
              onClick={handlePreviewPayout}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && processingStep === 'preview' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Preview Payout
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Payout Preview */}
      {payoutPreview && !payoutResult && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <Receipt className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Payout Preview</h4>
                  <p className="text-sm text-gray-600">
                    {payoutPreview.billing_unit_ids?.length || 0} billing units selected
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                Preview
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Amount Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white p-2 rounded-lg">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Gross</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(payoutPreview.total_gross)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white p-2 rounded-lg">
                    <Shield className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Platform Fee (10%)</p>
                    <p className="text-xl font-bold text-amber-600">
                      {formatCurrency(payoutPreview.platform_fee)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white p-2 rounded-lg">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Payout</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {formatCurrency(payoutPreview.total_net)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Units Summary */}
            <div className="mb-6">
              <h5 className="font-semibold text-gray-900 mb-3">Billing Units Included</h5>
              <div className="space-y-2">
                {payoutPreview.billing_units_summary?.map((unit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Unit #{unit.id}</p>
                        <p className="text-sm text-gray-600">
                          {formatHours(unit.billable_seconds)} hours
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(unit.gross_amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {unit.hourly_rate}/hr
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-gray-500 py-4">
                    Loading billing units...
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleConfirmPayout}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-medium rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && processingStep === 'confirm' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Confirm & Process Payout
              </button>
              
              <button
                onClick={() => {
                  setPayoutPreview(null);
                  setError(null);
                }}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Processing/Result */}
      {payoutResult && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Payout Initiated</h4>
                  <p className="text-sm text-gray-600">
                    Payout batch #{payoutResult.payout_batch_id}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                Processing
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h5 className="text-lg font-semibold text-gray-900 mb-2">
                Payout Successfully Initiated
              </h5>
              <p className="text-gray-600">
                The payout has been sent to Stripe for processing
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600">Payout Batch ID</p>
                  <p className="font-medium text-gray-900">
                    #{payoutResult.payout_batch_id}
                  </p>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(payoutResult.total_net)}
                  </p>
                </div>
                <Wallet className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {payoutResult.status}
                  </p>
                </div>
                <div className="animate-spin">
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setPayoutResult(null);
                  setPayoutPreview(null);
                  setProcessingStep(null);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl transition-all duration-200 shadow-sm"
              >
                Process Another Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4">
                <Loader2 className="w-8 h-8 text-blue-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {processingStep === 'preview' && 'Previewing Payout...'}
                {processingStep === 'confirm' && 'Processing Payment...'}
                {processingStep === 'processing' && 'Finalizing...'}
              </h4>
              <p className="text-gray-600">
                Please wait while we process your request
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentProcess;