// components/admin/AdminSettleContractButton.jsx
'use client';

import { useState } from 'react';
import { apiPrivate } from '@/lib/apiPrivate';
import { CheckCircle, Loader, DollarSign } from 'lucide-react';

export default function AdminSettleContractButton({
  contractId,
  disabled,
  onSuccess,
  className = ''
}) {
  const [loading, setLoading] = useState(false);

  const handleSettle = async () => {
    if (!confirm('Are you sure you want to settle this terminated contract? This will update ledger entries and mark the contract as financially settled.')) {
      return;
    }

    try {
      setLoading(true);
      await apiPrivate.post(`/admin/contracts/${contractId}/settle/`);
      alert('Contract settled successfully! Ledger entries have been updated.');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error settling contract:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to settle contract. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSettle}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          Settling...
        </>
      ) : (
        <>
          <DollarSign className="w-5 h-5" />
          Settle Contract
        </>
      )}
    </button>
  );
}