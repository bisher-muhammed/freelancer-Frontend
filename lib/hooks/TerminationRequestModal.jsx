// components/freelancer/TerminationRequestModal.jsx
'use client';

import { useState } from 'react';
import { X, AlertTriangle, FileText, Send, Loader } from 'lucide-react';

export default function TerminationRequestModal({ 
  contractId, 
  contractTitle,
  onSubmit, 
  onClose, 
  isLoading = false 
}) {
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!reason.trim()) {
      newErrors.reason = 'Please provide a reason for termination';
    } else if (reason.trim().length < 20) {
      newErrors.reason = 'Reason must be at least 20 characters';
    } else if (reason.trim().length > 1000) {
      newErrors.reason = 'Reason must not exceed 1000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(reason.trim());
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    // Clear error when user starts typing
    if (errors.reason) {
      setErrors(prev => ({ ...prev, reason: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Request Contract Termination</h2>
              <p className="text-red-100 text-sm">This action requires client approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Warning Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">Important Information</h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Termination requests must be reviewed and approved by the Admin</li>
                  <li>• The contract will remain active until the request is approved</li>
                  <li>• You may need to serve the notice period specified in the contract</li>
                  <li>• Pending payments and deliverables must be settled before termination</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Contract to Terminate</p>
                <p className="font-semibold text-gray-900">{contractTitle || `Contract #${contractId}`}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reason Field */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Termination <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={handleReasonChange}
                placeholder="Please provide a detailed explanation for why you're requesting to terminate this contract. This will be shared with the client."
                rows={6}
                disabled={isSubmitting}
                className={`w-full px-4 py-3 border rounded-lg resize-none transition-all
                  text-gray-900 placeholder:text-gray-400
                  focus:ring-2 focus:ring-red-500 focus:border-transparent
                  ${
                    errors.reason 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 bg-white'
                  }
                  disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
                `}
              />

              <div className="flex items-center justify-between mt-2">
                <div>
                  {errors.reason && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.reason}
                    </p>
                  )}
                </div>
                <p className={`text-sm ${
                  reason.length < 20 
                    ? 'text-gray-500' 
                    : reason.length > 1000 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {reason.length} / 1000 characters
                  {reason.length > 0 && reason.length < 20 && (
                    <span className="text-red-600 ml-1">(minimum 20)</span>
                  )}
                </p>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">Tips for Writing Your Reason</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be professional and respectful</li>
                <li>• Clearly explain your reasons without being confrontational</li>
                <li>• Mention any attempts to resolve issues if applicable</li>
                <li>• Reference specific concerns or circumstances</li>
                <li>• Keep it factual and avoid emotional language</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reason.trim() || reason.trim().length < 20}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Termination Request
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              By submitting this request, you acknowledge that the contract termination is subject to client approval 
              and platform policies. You may be required to complete ongoing work or serve a notice period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}