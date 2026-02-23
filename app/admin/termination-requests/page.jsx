'use client';

import { apiPrivate } from '@/lib/apiPrivate';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle, CheckCircle, XCircle, Clock, User, DollarSign,
  FileText, Calendar, Filter, Search, ChevronDown, ChevronUp,
  Shield, AlertCircle, Loader, RefreshCw, Info, Check, Ban, X,
  TrendingUp, Percent, ArrowLeftRight, CreditCard
} from 'lucide-react';


// ─────────────────────────────────────────────────────────────────────────────
// Result Modal — replaces all alert() calls
// ─────────────────────────────────────────────────────────────────────────────
function ResultModal({ result, onClose }) {
  if (!result) return null;

  const isSettle = result.type === 'settle';
  const isRefund = result.type === 'refund';
  const isError  = result.type === 'error';

  const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${
          isError  ? 'bg-red-50 border-b border-red-100' :
          isSettle ? 'bg-blue-50 border-b border-blue-100' :
                     'bg-green-50 border-b border-green-100'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {isError
                ? <XCircle className="w-8 h-8 text-red-500" />
                : <CheckCircle className={`w-8 h-8 ${isSettle ? 'text-blue-600' : 'text-green-600'}`} />}
              <div>
                <h2 className={`text-lg font-bold ${
                  isError ? 'text-red-800' : isSettle ? 'text-blue-900' : 'text-green-900'
                }`}>
                  {isError  ? 'Action Failed'               :
                   isSettle ? (result.data.already_settled ? 'Already Settled' : 'Settlement Complete') :
                              (result.data.already_refunded ? 'Already Refunded' : 'Refund Processed')}
                </h2>
                <p className={`text-sm mt-0.5 ${
                  isError ? 'text-red-600' : isSettle ? 'text-blue-700' : 'text-green-700'
                }`}>
                  {result.data.detail}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Settlement breakdown */}
          {isSettle && !isError && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Settlement Breakdown
              </h3>

              <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                <Row icon={<DollarSign className="w-4 h-4 text-gray-400"/>}
                     label="Total Escrow Budget"
                     value={fmt(result.data.total_budget)}
                     valueClass="text-gray-900 font-semibold" />
                <Row icon={<TrendingUp className="w-4 h-4 text-blue-500"/>}
                     label="Earned by Freelancer"
                     value={fmt(result.data.earned)}
                     valueClass="text-blue-700 font-medium" />
                <Row icon={<Percent className="w-4 h-4 text-purple-500"/>}
                     label="Platform Fee"
                     value={fmt(result.data.platform_fee)}
                     valueClass="text-purple-700 font-medium" />
                <Row icon={<CheckCircle className="w-4 h-4 text-green-500"/>}
                     label="Freelancer Net Payout"
                     value={fmt(result.data.freelancer_net)}
                     valueClass="text-green-700 font-bold" />
                <Row icon={<ArrowLeftRight className="w-4 h-4 text-orange-500"/>}
                     label="Refundable to Client"
                     value={fmt(result.data.refunded_amount)}
                     valueClass="text-orange-700 font-bold" />
              </div>

              {result.data.billing_units_paid > 0 && (
                <p className="text-xs text-gray-500 text-center">
                  {result.data.billing_units_paid} billing unit{result.data.billing_units_paid !== 1 ? 's' : ''} marked as paid
                </p>
              )}

              {result.data.refunded_amount && Number(result.data.refunded_amount) > 0 && !result.data.already_settled && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                  <strong>Next step:</strong> Click "Refund Escrow" to send {fmt(result.data.refunded_amount)} back to the client.
                </div>
              )}
            </div>
          )}

          {/* Refund breakdown */}
          {isRefund && !isError && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Refund Details
              </h3>

              <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                <Row icon={<DollarSign className="w-4 h-4 text-gray-400"/>}
                     label="Total Escrow"
                     value={fmt(result.data.total_budget)}
                     valueClass="text-gray-900 font-semibold" />
                <Row icon={<CreditCard className="w-4 h-4 text-green-500"/>}
                     label="Amount Refunded to Client"
                     value={fmt(result.data.refunded_amount)}
                     valueClass="text-green-700 font-bold" />
                <Row icon={<TrendingUp className="w-4 h-4 text-blue-500"/>}
                     label="Released to Freelancer"
                     value={fmt(result.data.released_amount)}
                     valueClass="text-blue-700 font-medium" />
              </div>

              {result.data.refunded_at && (
                <p className="text-xs text-gray-500 text-center">
                  Refunded at {new Date(result.data.refunded_at).toLocaleString('en-IN')}
                </p>
              )}

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                Settlement complete. Both freelancer payout and client refund have been processed.
              </div>
            </div>
          )}

          {/* Error detail */}
          {isError && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-sm text-red-700">{result.data.detail}</p>
              {result.data.escrow_status && (
                <p className="text-xs text-red-500 mt-2">
                  Current escrow status: <span className="font-mono font-semibold">{result.data.escrow_status}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
              isError
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-900 hover:bg-gray-800 text-white'
            }`}
          >
            {isError ? 'Dismiss' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value, valueClass }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {icon}
        {label}
      </div>
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Settle Contract Button
// ─────────────────────────────────────────────────────────────────────────────
function AdminSettleContractButton({ contractId, disabled, onSuccess, onResult }) {
  const [loading, setLoading] = useState(false);

  const handleSettle = async () => {
    setLoading(true);
    try {
      const res = await apiPrivate.post(`/admin/contracts/${contractId}/settle/`);
      onResult({ type: 'settle', data: res.data });
      onSuccess?.();
    } catch (err) {
      onResult({
        type: 'error',
        data: {
          detail: err.response?.data?.detail || err.response?.data?.message || 'Failed to settle contract.',
          escrow_status: err.response?.data?.escrow_status,
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSettle}
      disabled={disabled || loading}
      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading
        ? <><Loader className="w-5 h-5 animate-spin" /> Settling...</>
        : <><CheckCircle className="w-5 h-5" /> Settle Contract</>}
    </button>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Refund Escrow Button
// ─────────────────────────────────────────────────────────────────────────────
function AdminRefundEscrowButton({ contractId, disabled, onSuccess, onResult }) {
  const [loading, setLoading] = useState(false);

  const handleRefund = async () => {
    setLoading(true);
    try {
      const res = await apiPrivate.post(`/admin/contracts/${contractId}/refund/`);
      onResult({ type: 'refund', data: res.data });
      onSuccess?.();
    } catch (err) {
      onResult({
        type: 'error',
        data: {
          detail: err.response?.data?.detail || err.response?.data?.message || 'Failed to process refund.',
          escrow_status: err.response?.data?.escrow_status,
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefund}
      disabled={disabled || loading}
      className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading
        ? <><Loader className="w-5 h-5 animate-spin" /> Processing...</>
        : <><DollarSign className="w-5 h-5" /> Refund Escrow</>}
    </button>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminTerminationRequestsPage() {
  const router = useRouter();

  const [terminationRequests, setTerminationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [currentView, setCurrentView] = useState('pending');
  const [modalResult, setModalResult] = useState(null); // drives the ResultModal

  useEffect(() => { fetchTerminationRequests(); }, []);

  const fetchTerminationRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiPrivate.get('/admin/contracts/termination-requests/');
      setTerminationRequests(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load termination requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!confirm('Approve this termination request?\n\nThis will terminate the contract.')) return;
    setActionLoading(requestId);
    try {
      await apiPrivate.post(`/admin/termination-requests/${requestId}/approve/`);
      await fetchTerminationRequests();
    } catch (err) {
      setModalResult({
        type: 'error',
        data: { detail: err.response?.data?.detail || 'Failed to approve termination request.' }
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!confirm('Reject this termination request?\n\nThe contract will remain active.')) return;
    setActionLoading(requestId);
    try {
      await apiPrivate.post(`/admin/termination-requests/${requestId}/reject/`);
      await fetchTerminationRequests();
    } catch (err) {
      setModalResult({
        type: 'error',
        data: { detail: err.response?.data?.detail || 'Failed to reject termination request.' }
      });
    } finally {
      setActionLoading(null);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatDate = (d) => {
    if (!d) return 'Not specified';
    try {
      return new Date(d).toLocaleString('en-IN', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    } catch { return 'Invalid date'; }
  };

  const formatMoney = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

  const getDaysAgo = (d) => {
    if (!d) return '';
    const days = Math.ceil(Math.abs(new Date() - new Date(d)) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const getContractDuration = (startedAt) => {
    if (!startedAt) return 'Not started';
    const days = Math.ceil(Math.abs(new Date() - new Date(startedAt)) / 86400000);
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const getEscrowStatus = (r) => r.contract?.offer?.payment?.status || null;
  const isSettled  = (r) => ['settled', 'refund_processing', 'refunded'].includes(getEscrowStatus(r));
  const isRefunded = (r) => ['refunded', 'refund_processing'].includes(getEscrowStatus(r));

  const escrowStatusBadge = (r) => {
    const s = getEscrowStatus(r);
    if (!s) return null;
    const map = {
      funded:            'bg-blue-100 text-blue-700',
      paid:              'bg-blue-100 text-blue-700',
      settled:           'bg-purple-100 text-purple-700',
      refund_processing: 'bg-yellow-100 text-yellow-800',
      refunded:          'bg-green-100 text-green-700',
      failed:            'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${map[s] || 'bg-gray-100 text-gray-700'}`}>
        Escrow: {s.replace(/_/g, ' ')}
      </span>
    );
  };

  const getStatusBadge = (status) => ({
    pending:  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Pending Review</span>,
    approved: <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Approved</span>,
    rejected: <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Rejected</span>,
  }[status] || null);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = terminationRequests.filter((r) => {
    if (currentView !== 'all' && r.status !== currentView) return false;
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      r.contract?.client?.name?.toLowerCase().includes(s) ||
      r.contract?.freelancer?.name?.toLowerCase().includes(s) ||
      r.requested_by?.name?.toLowerCase().includes(s) ||
      r.reason?.toLowerCase().includes(s)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const vals = {
      created_at: (x) => new Date(x.created_at),
      budget:     (x) => parseFloat(x.contract?.offer?.total_budget || 0),
      client:     (x) => x.contract?.client?.name || '',
      status:     (x) => x.status || '',
    };
    const fn = vals[sortBy] || (() => 0);
    const [av, bv] = [fn(a), fn(b)];
    return sortOrder === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const toggleSort = (f) => {
    if (sortBy === f) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(f); setSortOrder('desc'); }
  };

  const SortIcon = ({ field }) => sortBy !== field
    ? <ChevronDown className="w-4 h-4 text-gray-400" />
    : sortOrder === 'asc'
      ? <ChevronUp className="w-4 h-4 text-indigo-600" />
      : <ChevronDown className="w-4 h-4 text-indigo-600" />;

  const counts = {
    pending:  terminationRequests.filter(r => r.status === 'pending').length,
    approved: terminationRequests.filter(r => r.status === 'approved').length,
    rejected: terminationRequests.filter(r => r.status === 'rejected').length,
    all:      terminationRequests.length,
  };

  // ── Loading / error ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-800">Error Loading Termination Requests</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <div className="flex gap-3">
          <button onClick={fetchTerminationRequests} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <button onClick={() => router.push('/admin/dashboard')} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Result modal */}
      <ResultModal result={modalResult} onClose={() => setModalResult(null)} />

      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <AlertTriangle className="w-7 h-7 text-orange-600" />
                Termination Requests
              </h1>
              <p className="text-gray-600 mt-1">Review and manage contract termination requests</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                {[
                  { key:'pending',  label:'Pending',  icon:AlertTriangle, color:'text-orange-700' },
                  { key:'approved', label:'Approved', icon:Check,         color:'text-green-700'  },
                  { key:'rejected', label:'Rejected', icon:Ban,           color:'text-red-700'    },
                  { key:'all',      label:'All',      icon:Filter,        color:'text-indigo-700' },
                ].map(({ key, label, icon: Icon, color }) => (
                  <button key={key} onClick={() => setCurrentView(key)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === key ? `bg-white ${color} shadow-sm` : 'text-gray-600 hover:text-gray-900'
                    }`}>
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-4 h-4" />
                      {label} ({counts[key]})
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={fetchTerminationRequests} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">

        {/* Search + sort */}
        <div className="bg-white rounded-xl border p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search by client, freelancer, or reason..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { f:'created_at', label:'Date',   Icon:Calendar   },
              { f:'budget',     label:'Budget', Icon:DollarSign },
              { f:'status',     label:'Status', Icon:Filter     },
            ].map(({ f, label, Icon }) => (
              <button key={f} onClick={() => toggleSort(f)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  sortBy === f ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                <Icon className="w-4 h-4" />{label}<SortIcon field={f} />
              </button>
            ))}
          </div>
        </div>

        {/* Empty */}
        {sorted.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? 'No Matching Requests' : `No ${currentView === 'all' ? '' : currentView} Requests`}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : `No ${currentView} termination requests found`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((request) => (
              <div key={request.id} className="bg-white rounded-xl border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">

                      {/* Title */}
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">Contract #{request.contract.id}</h3>
                        {getStatusBadge(request.status)}
                        {escrowStatusBadge(request)}
                      </div>

                      {/* People + budget */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { label:'Client',     name:request.contract.client.name,     color:'blue'   },
                          { label:'Freelancer', name:request.contract.freelancer.name, color:'green'  },
                        ].map(({ label, name, color }) => (
                          <div key={label} className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-${color}-100 rounded-full flex items-center justify-center shrink-0`}>
                              <User className={`w-5 h-5 text-${color}-600`} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">{label}</p>
                              <p className="font-medium text-gray-900">{name}</p>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total Budget</p>
                            <p className="font-medium text-gray-900">{formatMoney(request.contract.offer.total_budget)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Requested by: <strong className="ml-1">{request.requested_by.name}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {getDaysAgo(request.created_at)} ({formatDate(request.created_at)})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Duration: {getContractDuration(request.contract.started_at)}
                        </span>
                      </div>
                    </div>

                    {/* Expand */}
                    <button onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg">
                      {expandedRequest === request.id
                        ? <ChevronUp className="w-5 h-5 text-gray-600" />
                        : <ChevronDown className="w-5 h-5 text-gray-600" />}
                    </button>
                  </div>

                  {/* Reason preview */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Termination Reason:</p>
                    <p className="text-gray-900 line-clamp-2">{request.reason || 'No reason provided'}</p>
                  </div>

                  {/* ── PENDING actions ──────────────────────────────────── */}
                  {request.status === 'pending' && (
                    <div className="mt-4 flex gap-3">
                      <button onClick={() => handleApprove(request.id)} disabled={actionLoading === request.id}
                        className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                        {actionLoading === request.id
                          ? <><Loader className="w-5 h-5 animate-spin" /> Processing...</>
                          : <><CheckCircle className="w-5 h-5" /> Approve Termination</>}
                      </button>
                      <button onClick={() => handleReject(request.id)} disabled={actionLoading === request.id}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2">
                        {actionLoading === request.id ? <Loader className="w-5 h-5 animate-spin" /> : <Ban className="w-5 h-5" />}
                        Reject
                      </button>
                    </div>
                  )}

                  {/* ── APPROVED: financial settlement ───────────────────── */}
                  {request.status === 'approved' && (
                    <div className="mt-4 space-y-3">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800 mb-1">
                          <CheckCircle className="w-5 h-5" />
                          <p className="font-semibold">Termination Approved — Complete Financial Settlement</p>
                        </div>
                        <p className="text-sm text-green-700">Run Step 1 then Step 2 in order.</p>
                      </div>

                      {/* Step indicators */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-center">
                        <div className={`p-2.5 rounded-lg border font-medium ${
                          isSettled(request)  ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}>
                          <div>Step 1 · Settle Contract</div>
                          {isSettled(request) && <div className="mt-0.5 text-green-600">✓ Complete</div>}
                        </div>
                        <div className={`p-2.5 rounded-lg border font-medium ${
                          isRefunded(request) ? 'bg-green-50 border-green-200 text-green-700'
                            : isSettled(request) ? 'bg-orange-50 border-orange-200 text-orange-700'
                            : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}>
                          <div>Step 2 · Refund Escrow</div>
                          {isRefunded(request)
                            ? <div className="mt-0.5 text-green-600">✓ Complete</div>
                            : isSettled(request)
                              ? <div className="mt-0.5">Ready</div>
                              : null}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <AdminSettleContractButton
                          contractId={request.contract.id}
                          disabled={actionLoading === request.id || isSettled(request)}
                          onSuccess={fetchTerminationRequests}
                          onResult={setModalResult}
                        />
                        <AdminRefundEscrowButton
                          contractId={request.contract.id}
                          disabled={actionLoading === request.id || !isSettled(request) || isRefunded(request)}
                          onSuccess={fetchTerminationRequests}
                          onResult={setModalResult}
                        />
                      </div>

                      <p className="text-xs text-gray-500 text-center">
                        Settle first to compute the breakdown, then refund to return funds to the client.
                      </p>
                    </div>
                  )}

                  {/* ── REJECTED note ─────────────────────────────────────── */}
                  {request.status === 'rejected' && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      <p className="text-sm text-red-700">Request rejected. Contract remains active.</p>
                    </div>
                  )}
                </div>

                {/* ── Expanded ────────────────────────────────────────────── */}
                {expandedRequest === request.id && (
                  <div className="border-t bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-600" /> Full Reason
                        </h4>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-gray-700 whitespace-pre-line">{request.reason || 'No reason provided'}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-gray-600" /> Contract Info
                        </h4>
                        <div className="bg-white p-4 rounded-lg border space-y-3 text-sm">
                          {[
                            ['Status', request.contract.status],
                            ['End Reason', request.contract.end_reason],
                            ['Notice Period', `${request.contract.termination_notice_days || 7} days`],
                            ['Started', formatDate(request.contract.started_at)],
                            ['Reviewed', request.reviewed_at ? formatDate(request.reviewed_at) : null],
                          ].filter(([, v]) => v).map(([label, value]) => (
                            <div key={label}>
                              <p className="text-gray-500">{label}</p>
                              <p className="font-medium text-gray-900 capitalize">{value}</p>
                            </div>
                          ))}
                          <div>
                            <p className="text-gray-500">Scope</p>
                            <p className="text-gray-900 line-clamp-3">{request.contract.scope_summary || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary stats */}
        {terminationRequests.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label:'Pending',     value:counts.pending,  color:'orange', Icon:AlertTriangle },
              { label:'Approved',    value:counts.approved, color:'green',  Icon:Check        },
              { label:'Rejected',    value:counts.rejected, color:'red',    Icon:Ban          },
              {
                label: 'Total Value',
                value: formatMoney(terminationRequests.reduce((s, r) => s + parseFloat(r.contract?.offer?.total_budget || 0), 0)),
                color: 'purple',
                Icon: DollarSign,
              },
            ].map(({ label, value, color, Icon }) => (
              <div key={label} className="bg-white rounded-lg border p-4 flex items-center gap-3">
                <div className={`w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}