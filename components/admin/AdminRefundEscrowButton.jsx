// components/admin/AdminRefundEscrowButton.jsx
'use client';

import { useState } from 'react';
import { apiPrivate } from '@/lib/apiPrivate';
import { RefreshCw, Loader, AlertCircle } from 'lucide-react';

export default function AdminRefundEscrowButton({
  contractId,
  disabled,
  onSuccess,
  className = ''
}) {
  const [loading, setLoading] = useState(false);

  const handleRefund = async () => {
    if (!confirm('Are you sure you want to refund the escrow amount to the client? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await apiPrivate.post(`/admin/contracts/${contractId}/refund-escrow/`);
      alert('Escrow refunded successfully! Funds have been returned to the client.');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error refunding escrow:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to refund escrow. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefund}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          Refunding...
        </>
      ) : (
        <>
          <RefreshCw className="w-5 h-5" />
          Refund Escrow
        </>
      )}
    </button>
  );
}