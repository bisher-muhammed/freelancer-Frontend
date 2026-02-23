// app/admin/termination-requests/page.jsx
'use client';

import { apiPrivate } from '@/lib/apiPrivate';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  DollarSign,
  FileText,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Shield,
  AlertCircle,
  Loader,
  RefreshCw,
  Info,
  Check,
  Ban
} from 'lucide-react';
import AdminSettleContractButton from '@/components/admin/AdminSettleContractButton';
import AdminRefundEscrowButton from '@/components/admin/AdminRefundEscrowButton';



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
  const [currentView, setCurrentView] = useState('pending'); // 'pending', 'approved', 'all'

  useEffect(() => {
    fetchTerminationRequests();
  }, []);

  const fetchTerminationRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiPrivate.get('/admin/contracts/termination-requests/');
      setTerminationRequests(res.data || []);
    } catch (err) {
      console.error('Error fetching termination requests:', err);
      setError(err.message || 'Failed to load termination requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Updated: only takes requestId, uses correct endpoint ─────────────────
  const handleApprove = async (requestId) => {
    if (!confirm('Are you sure you want to approve this termination request? This will terminate the contract.')) {
      return;
    }
    setActionLoading(requestId);
    try {
      await apiPrivate.post(`/admin/termination-requests/${requestId}/approve/`);
      await fetchTerminationRequests();
      alert('Termination request approved successfully!');
    } catch (err) {
      console.error('Error approving request:', err);
      alert(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to approve termination request. Please try again.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ── Updated: only takes requestId, uses correct endpoint ─────────────────
  const handleReject = async (requestId) => {
    if (!confirm('Are you sure you want to reject this termination request? This will keep the contract active.')) {
      return;
    }
    setActionLoading(requestId);
    try {
      await apiPrivate.post(`/admin/termination-requests/${requestId}/reject/`);
      await fetchTerminationRequests();
      alert('Termination request rejected successfully!');
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to reject termination request. Please try again.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatMoney = (amount) => {
    if (!amount) return '₹0';
    return `₹${Number(amount).toLocaleString()}`;
  };

  const getDaysAgo = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    } catch (error) {
      return '';
    }
  };

  const getContractDuration = (startedAt) => {
    if (!startedAt) return 'Not started';
    try {
      const start = new Date(startedAt);
      const now = new Date();
      const diffTime = Math.abs(now - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } catch (error) {
      return 'Invalid duration';
    }
  };

  // Filter requests based on current view and search
  const filteredRequests = terminationRequests.filter(request => {
    if (currentView === 'pending' && request.status !== 'pending') return false;
    if (currentView === 'approved' && request.status !== 'approved') return false;
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      request.contract?.client?.name?.toLowerCase().includes(search) ||
      request.contract?.freelancer?.name?.toLowerCase().includes(search) ||
      request.requested_by?.name?.toLowerCase().includes(search) ||
      request.reason?.toLowerCase().includes(search) ||
      request.contract?.scope_summary?.toLowerCase().includes(search)
    );
  });

  // Sort the filtered requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'created_at':
        aVal = new Date(a.created_at);
        bVal = new Date(b.created_at);
        break;
      case 'budget':
        aVal = parseFloat(a.contract?.offer?.total_budget || 0);
        bVal = parseFloat(b.contract?.offer?.total_budget || 0);
        break;
      case 'client':
        aVal = a.contract?.client?.name || '';
        bVal = b.contract?.client?.name || '';
        break;
      case 'freelancer':
        aVal = a.contract?.freelancer?.name || '';
        bVal = b.contract?.freelancer?.name || '';
        break;
      case 'status':
        aVal = a.status || '';
        bVal = b.status || '';
        break;
      default:
        return 0;
    }
    if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
    else return aVal < bVal ? 1 : -1;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronDown className="w-4 h-4 text-gray-400" />;
    return sortOrder === 'asc' ?
      <ChevronUp className="w-4 h-4 text-indigo-600" /> :
      <ChevronDown className="w-4 h-4 text-indigo-600" />;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const pendingCount  = terminationRequests.filter(r => r.status === 'pending').length;
  const approvedCount = terminationRequests.filter(r => r.status === 'approved').length;
  const allCount      = terminationRequests.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">Error Loading Termination Requests</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={fetchTerminationRequests}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <AlertTriangle className="w-7 h-7 text-orange-600" />
                Termination Requests
              </h1>
              <p className="text-gray-600 mt-1">
                Review and manage contract termination requests
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setCurrentView('pending')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'pending'
                      ? 'bg-white text-orange-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Pending ({pendingCount})
                  </div>
                </button>
                <button
                  onClick={() => setCurrentView('approved')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'approved'
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Approved ({approvedCount})
                  </div>
                </button>
                <button
                  onClick={() => setCurrentView('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'all'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    All ({allCount})
                  </div>
                </button>
              </div>
              <button
                onClick={fetchTerminationRequests}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client, freelancer, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleSort('created_at')}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  sortBy === 'created_at'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Date
                <SortIcon field="created_at" />
              </button>
              <button
                onClick={() => toggleSort('budget')}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  sortBy === 'budget'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Budget
                <SortIcon field="budget" />
              </button>
              <button
                onClick={() => toggleSort('status')}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  sortBy === 'status'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Status
                <SortIcon field="status" />
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {sortedRequests.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? 'No Matching Requests' : `No ${currentView} Requests`}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? 'Try adjusting your search terms'
                : currentView === 'all'
                  ? 'No termination requests found'
                  : `No ${currentView} termination requests`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl border hover:shadow-md transition-shadow"
              >
                {/* Request Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Contract #{request.contract.id}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Client</p>
                            <p className="font-medium text-gray-900">{request.contract.client.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Freelancer</p>
                            <p className="font-medium text-gray-900">{request.contract.freelancer.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Budget</p>
                            <p className="font-medium text-gray-900">
                              {formatMoney(request.contract.offer.total_budget)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Requested by: {request.requested_by.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {getDaysAgo(request.created_at)} ({formatDate(request.created_at)})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Contract duration: {getContractDuration(request.contract.started_at)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {expandedRequest === request.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>

                  {/* Reason Preview */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Termination Reason:</p>
                    <p className="text-gray-900 line-clamp-2">
                      {request.reason || 'No reason provided'}
                    </p>
                  </div>

                  {/* Action Buttons — pending */}
                  {request.status === 'pending' && (
                    <div className="mt-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={actionLoading === request.id}
                          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {actionLoading === request.id ? (
                            <>
                              <Loader className="w-5 h-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              Approve Termination
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={actionLoading === request.id}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {actionLoading === request.id ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <Ban className="w-5 h-5" />
                          )}
                          Reject Request
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Approved Request Actions */}
                  {request.status === 'approved' && (
                    <div className="mt-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-3">
                        <div className="flex items-center gap-2 text-green-800 mb-2">
                          <CheckCircle className="w-5 h-5" />
                          <p className="font-semibold">Termination Approved!</p>
                        </div>
                        <p className="text-sm text-green-700">
                          Complete the financial settlement below:
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <AdminSettleContractButton
                          contractId={request.contract.id}
                          disabled={actionLoading === request.id}
                          onSuccess={fetchTerminationRequests}
                          className="flex-1"
                        />
                        <AdminRefundEscrowButton
                          contractId={request.contract.id}
                          disabled={actionLoading === request.id}
                          onSuccess={fetchTerminationRequests}
                          className="flex-1"
                        />
                      </div>

                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800">
                          💡 <strong>Settle Contract:</strong> Updates ledger entries and marks contract as financially settled.
                          <br />
                          💡 <strong>Refund Escrow:</strong> Returns escrowed funds to the client.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {expandedRequest === request.id && (
                  <div className="border-t bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Reason */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-600" />
                          Full Termination Reason
                        </h4>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-gray-700 whitespace-pre-line">
                            {request.reason || 'No detailed reason provided'}
                          </p>
                        </div>
                      </div>

                      {/* Contract Details */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-gray-600" />
                          Contract Information
                        </h4>
                        <div className="bg-white p-4 rounded-lg border space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Contract Status</p>
                            <p className="font-medium text-gray-900 capitalize">{request.contract.status}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Scope Summary</p>
                            <p className="text-gray-900 text-sm line-clamp-3">
                              {request.contract.scope_summary || 'No scope summary available'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Termination Notice Period</p>
                            <p className="font-medium text-gray-900">
                              {request.contract.termination_notice_days || 7} days
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Started On</p>
                            <p className="font-medium text-gray-900">
                              {formatDate(request.contract.started_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Guidelines */}
                    <div className="mt-6 space-y-4">
                      {request.status === 'pending' && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-blue-900 mb-2">Review Guidelines</h4>
                              <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Verify the termination reason is valid and reasonable</li>
                                <li>• Check if the termination notice period has been respected</li>
                                <li>• Review contract status and payment history before approval</li>
                                <li>• Contact both parties if more information is needed</li>
                                <li>• Ensure all deliverables and payments are settled</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {request.status === 'approved' && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-green-900 mb-2">Next Steps</h4>
                              <ul className="text-sm text-green-800 space-y-1">
                                <li>• Contract has been terminated</li>
                                <li>• Complete financial settlement using buttons above</li>
                                <li>• Settle Contract: Finalize all financial transactions</li>
                                <li>• Refund Escrow: Return client's escrowed funds</li>
                                <li>• Both actions can be performed independently</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {terminationRequests.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatMoney(
                      terminationRequests.reduce((sum, req) =>
                        sum + parseFloat(req.contract?.offer?.total_budget || 0), 0
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Oldest Pending</p>
                  <p className="text-lg font-bold text-gray-900">
                    {pendingCount > 0
                      ? getDaysAgo(terminationRequests
                          .filter(r => r.status === 'pending')
                          .reduce((oldest, req) =>
                            new Date(req.created_at) < new Date(oldest.created_at) ? req : oldest
                          ).created_at)
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}