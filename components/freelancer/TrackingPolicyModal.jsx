// components/freelancer/TrackingPolicyModal.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Shield, CheckCircle, XCircle, AlertTriangle, FileText, Clock } from 'lucide-react';

export default function TrackingPolicyModal({
  contractId,
  onAccept,
  onReject,
  onClose,
  apiPrivate
}) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchActivePolicy();
  }, []);

  const fetchActivePolicy = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetail(null);

      // apiPrivate is axios.create() so .get() is correct.
      // baseURL ends with '/' so no leading slash needed on path.
      const res = await apiPrivate.get('tracking-policies/active/');
      console.log('✅ Policy fetched:', res.data);
      setPolicy(res.data);

      setTimeout(() => {
        if (contentRef.current) {
          const { scrollHeight, clientHeight } = contentRef.current;
          if (scrollHeight <= clientHeight) {
            setHasScrolled(true);
          }
        }
      }, 150);

    } catch (err) {
      const status = err?.response?.status;
      const serverMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Unknown error';

      console.error('❌ Policy fetch failed:', { status, serverMsg, url: `${apiPrivate?.defaults?.baseURL}tracking-policies/active/` });

      setErrorDetail(`HTTP ${status ?? 'network error'} — ${serverMsg}`);

      if (status === 404) {
        setError('No active tracking policy found. Ask your administrator to create and activate one.');
      } else if (status === 401) {
        setError('Session expired. Please refresh the page and log in again.');
      } else if (status === 403) {
        setError('You do not have permission to view this policy.');
      } else {
        setError('Failed to load tracking policy.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setHasScrolled(true);
    }
  };

  const handleAccept = async () => {
    if (!hasScrolled) {
      alert('Please read the entire policy before accepting.');
      return;
    }

    if (!confirm('By accepting this policy, you consent to work tracking as described. Do you want to proceed?')) {
      return;
    }

    setAccepting(true);
    try {
      await apiPrivate.post('tracking/policy/accept/', {
        contract_id: contractId
      });

      if (onAccept) onAccept();
      alert('Tracking policy accepted successfully!');
      onClose();
    } catch (err) {
      console.error('❌ Policy accept failed:', err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        'Failed to accept policy. Please try again.';
      alert(errorMsg);
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = () => {
    if (!confirm('Are you sure you want to reject the tracking policy? This may affect your ability to work on this contract.')) {
      return;
    }
    if (onReject) onReject();
    onClose();
  };

  const getPolicyContent = () => {
    if (!policy?.content) {
      return `Work Tracking Policy — Version ${policy?.version || '1.0'}

1. INTRODUCTION
This Work Tracking Policy outlines the terms and conditions for work tracking on the FreelancerHub platform. By accepting this policy, you agree to the tracking mechanisms described herein.

2. TRACKING METHODS
We use the following methods to track work:
  - Time Tracking: Automated time tracking for hourly contracts
  - Activity Monitoring: Periodic screenshots (when applicable)
  - Productivity Metrics: Measurement of active work time
  - Deliverable Submission: Tracking of submitted work items

3. DATA COLLECTION
We collect:
  - Work hours and patterns
  - Application usage during work hours
  - Mouse and keyboard activity (for verification)
  - Screenshots (blurred for privacy)
  - Deliverable submission timestamps

4. PRIVACY PROTECTION
Your privacy is important:
  - Screenshots are blurred to protect sensitive information
  - Personal data is never stored or shared with third parties
  - Tracking only occurs during contracted work hours
  - You can pause tracking at any time for breaks

5. PURPOSE OF TRACKING
Tracking helps ensure:
  - Accurate billing for clients
  - Fair payment for freelancers
  - Dispute resolution support
  - Quality assurance

6. YOUR RIGHTS
You have the right to:
  - Review your tracking data at any time
  - Request data correction
  - Pause tracking for personal breaks
  - Opt-out of certain tracking features (may limit functionality)

7. ACCEPTANCE
By accepting this policy, you acknowledge that you have read and understood these terms and agree to enable work tracking for this contract.

8. POLICY UPDATES
This policy may be updated periodically. You will be notified of significant changes and may need to re-accept the updated policy.

────────────────────────────────────────
Version: ${policy?.version || '1.0'}
Effective: ${policy?.created_at
  ? new Date(policy.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  : 'January 10, 2026'}`;
    }
    return policy.content;
  };

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-center text-gray-600 mt-4">Loading tracking policy...</p>
        </div>
      </div>
    );
  }

  // ─── ERROR ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-8">
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Unable to Load Policy</h3>
          </div>

          <p className="text-gray-700 mb-3">{error}</p>

          {/* Exact error detail for debugging */}
          {errorDetail && (
            <div className="bg-gray-100 rounded-lg p-3 mb-6 space-y-1">
              <p className="text-xs font-mono text-red-700 break-all">{errorDetail}</p>
              <p className="text-xs text-gray-500">
                URL:{' '}
                <span className="font-mono">
                  {apiPrivate?.defaults?.baseURL}tracking-policies/active/
                </span>
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={fetchActivePolicy}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN MODAL ───────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {policy?.title || 'Work Tracking Policy'}
              </h2>
              <p className="text-sm text-gray-500">Version {policy?.version || '1.0'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6"
          onScroll={handleScroll}
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Important Notice</h3>
                <p className="text-sm text-blue-700">
                  Please read this tracking policy carefully before accepting.
                  By accepting, you consent to the tracking requirements outlined below.
                </p>
              </div>
            </div>
          </div>

          <div className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">
            {getPolicyContent()}
          </div>

          {!hasScrolled && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  Please scroll to the bottom to read the entire policy
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>
                Policy created on{' '}
                {new Date(policy?.created_at || new Date()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50 rounded-b-xl flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={handleReject}
              disabled={accepting}
              className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-5 h-5" />
              Reject Policy
            </button>
            <button
              onClick={handleAccept}
              disabled={accepting || !hasScrolled}
              className={`px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-white ${
                accepting || !hasScrolled
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {accepting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Accept &amp; Enable Tracking
                </>
              )}
            </button>
          </div>

          {!hasScrolled && (
            <p className="text-xs text-gray-500 text-center mt-3">
              The accept button will be enabled once you have read the entire policy
            </p>
          )}
        </div>
      </div>
    </div>
  );
}