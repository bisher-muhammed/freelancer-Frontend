'use client';
import { useState, useEffect } from "react";
import { apiPrivate } from "@/lib/apiPrivate";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  MoreVertical,
  ExternalLink,
  User,
  TrendingUp,
  Shield,
  Award,
  Target,
  Eye,
  MessageSquare,
  Search,
  Filter,
  Info
} from "lucide-react";

export default function FreelancerContractPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await apiPrivate.get('/freelancer/contracts/');
      
      const data = response.data;
      const contractArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      setContracts(contractArray);
    } catch (err) {
      console.error("Error fetching contracts:", err);
      setError('Failed to fetch contracts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // DATA EXTRACTION HELPERS
  // ============================
  const formatMoney = (amount) => {
    if (!amount) return '₹0';
    return `₹${Number(amount).toLocaleString()}`;
  };

  const getOfferData = (contract) => {
    if (!contract?.offer) return null;
    return {
      totalBudget: contract.offer.total_budget || null,
      hourlyRate: contract.offer.agreed_hourly_rate || null,
      estimatedHours: contract.offer.estimated_hours || null,
      rateType: contract.offer.rate_type || 'unknown'
    };
  };

  const getEscrowData = (contract) => {
    if (!contract?.escrow_payment) return null;
    return {
      amount: contract.escrow_payment.amount || null,
      status: contract.escrow_payment.status || 'none',
      escrowedAt: contract.escrow_payment.escrowed_at || null,
      releasedAt: contract.escrow_payment.released_at || null
    };
  };

  // ============================
  // STATUS BADGES
  // ============================
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        bg: "bg-green-100 text-green-800",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Active"
      },
      completed: {
        bg: "bg-blue-100 text-blue-800",
        icon: <Award className="w-4 h-4" />,
        label: "Completed"
      },
      terminated: {
        bg: "bg-red-100 text-red-800",
        icon: <XCircle className="w-4 h-4" />,
        label: "Terminated"
      },
      disputed: {
        bg: "bg-orange-100 text-orange-800",
        icon: <AlertCircle className="w-4 h-4" />,
        label: "Disputed"
      },
      pending: {
        bg: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="w-4 h-4" />,
        label: "Pending"
      }
    };

    const config = statusConfig[status] || {
      bg: "bg-gray-100 text-gray-800",
      icon: <Clock className="w-4 h-4" />,
      label: status
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getEscrowStatusBadge = (escrowData) => {
    if (!escrowData) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <Info className="w-3 h-3" />
          No Escrow
        </span>
      );
    }

    const statusConfig = {
      escrowed: { 
        bg: 'bg-green-100 text-green-700', 
        icon: <Shield className="w-3 h-3" />,
        label: 'Escrowed' 
      },
      released: { 
        bg: 'bg-blue-100 text-blue-700', 
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Released' 
      },
      refunded: { 
        bg: 'bg-orange-100 text-orange-700', 
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Refunded' 
      },
      pending: { 
        bg: 'bg-yellow-100 text-yellow-700', 
        icon: <Clock className="w-3 h-3" />,
        label: 'Pending' 
      }
    };

    const config = statusConfig[escrowData.status] || {
      bg: 'bg-gray-100 text-gray-600',
      icon: <Info className="w-3 h-3" />,
      label: escrowData.status
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ============================
  // FILTERING
  // ============================
  const filteredContracts = contracts.filter(contract => {
    if (filter !== "all" && contract.status !== filter) return false;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        contract.project_title?.toLowerCase().includes(term) ||
        contract.client_name?.toLowerCase().includes(term) ||
        contract.scope_summary?.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  const navigateToDetails = (contractId) => {
    router.push(`/freelancer/contract-list/${contractId}`);
  };

  // ============================
  // STATS
  // ============================
  const getStats = () => {
    const stats = {
      total: contracts.length,
      active: contracts.filter(c => c.status === 'active').length,
      completed: contracts.filter(c => c.status === 'completed').length,
      disputed: contracts.filter(c => c.status === 'disputed').length,
      pending: contracts.filter(c => c.status === 'pending').length
    };

    // Calculate total potential earnings from escrow or offers
    stats.totalEarnings = contracts.reduce((sum, c) => {
      const escrowData = getEscrowData(c);
      const offerData = getOfferData(c);
      
      if (escrowData?.amount) {
        return sum + parseFloat(escrowData.amount);
      } else if (offerData?.totalBudget) {
        return sum + parseFloat(offerData.totalBudget);
      }
      return sum;
    }, 0);

    // Count contracts with active escrow
    stats.escrowedCount = contracts.filter(c => 
      c.escrow_payment?.status === 'escrowed'
    ).length;

    return stats;
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded mb-4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">Error Loading Contracts</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchContracts}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!Array.isArray(contracts) || contracts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Contracts Yet</h3>
            <p className="text-gray-500 mb-6">
              You don't have any active contracts. Start by applying to projects!
            </p>
            <button
              onClick={() => router.push('/projects')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Browse Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Contracts</h1>
              <p className="text-gray-600 mt-2">Manage all your freelance contracts in one place</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-600" />
              <span className="text-sm text-gray-500">Protected by Escrow</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Contracts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                </div>
                <Award className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Escrowed</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.escrowedCount}</p>
                </div>
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Earnings</p>
                  <p className="text-xl font-bold text-purple-600">
                    {formatMoney(stats.totalEarnings)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl border p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search contracts by project or client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {["all", "active", "completed", "terminated", "disputed", "pending"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                      filter === status
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Filter className="w-3 h-3" />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredContracts.map((contract) => {
            const offerData = getOfferData(contract);
            const escrowData = getEscrowData(contract);

            return (
              <div
                key={contract.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer group"
                onClick={() => navigateToDetails(contract.id)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getStatusBadge(contract.status)}
                        {getEscrowStatusBadge(escrowData)}
                        <span className="text-xs text-gray-500">
                          Contract #{contract.id}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {contract.project_title}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToDetails(contract.id);
                      }}
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{contract.client_name}</p>
                      <p className="text-sm text-gray-500">Client</p>
                    </div>
                  </div>

                  {/* Scope Summary */}
                  {contract.scope_summary && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Scope Summary</p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {contract.scope_summary}
                      </p>
                    </div>
                  )}

                  {/* Payment Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    {/* Escrow Amount or Budget */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {escrowData ? 'Escrow Amount' : 'Total Budget'}
                      </p>
                      <div className="flex items-center gap-2">
                        {escrowData ? (
                          <Shield className="w-4 h-4 text-purple-600" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-blue-600" />
                        )}
                        <span className="font-semibold text-gray-900">
                          {formatMoney(escrowData?.amount || offerData?.totalBudget)}
                        </span>
                      </div>
                    </div>

                    {/* Hourly Rate */}
                    {offerData?.hourlyRate && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Hourly Rate</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            {formatMoney(offerData.hourlyRate)}/hr
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Estimated Hours */}
                    {offerData?.estimatedHours && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Est. Hours</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {offerData.estimatedHours} hrs
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Rate Type */}
                    {offerData && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Rate Type</p>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {offerData.rateType}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contract Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Platform Fee</p>
                      <p className="font-medium text-gray-900">
                        {contract.platform_fee_percentage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Started</p>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {formatDate(contract.started_at)}
                        </span>
                      </div>
                    </div>
                    {contract.ended_at && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Ended</p>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {formatDate(contract.ended_at)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Escrow Info Badge */}
                  {escrowData?.escrowedAt && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-600">Funds Secured in Escrow</p>
                          <p className="text-sm font-medium text-green-700">
                            {formatDate(escrowData.escrowedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar for Active Contracts */}
                  {contract.status === 'active' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>In Progress</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToDetails(contract.id);
                      }}
                      className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {contract.status === 'active' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/freelancer/contracts/${contract.id}/messages`);
                        }}
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
                        title="Message Client"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State for Filter */}
        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No {filter !== 'all' ? filter : ''} contracts found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? `No contracts match "${searchTerm}"`
                : `You don't have any ${filter !== 'all' ? filter : ''} contracts.`}
            </p>
            {(filter !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                }}
                className="mt-4 px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Summary Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Performance Overview</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Contracts</span>
                <span className="font-medium text-green-600">{stats.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-medium text-blue-600">
                  {stats.completed > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Escrowed Funds</span>
                <span className="font-medium text-purple-600">{stats.escrowedCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Earnings Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Earnings</span>
                <span className="font-medium text-gray-900">
                  {formatMoney(stats.totalEarnings)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. per Contract</span>
                <span className="font-medium text-gray-900">
                  {formatMoney(stats.total > 0 ? stats.totalEarnings / stats.total : 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Platform Fees</span>
                <span className="font-medium text-orange-600">
                  {formatMoney(stats.totalEarnings * 0.1)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/projects')}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
              >
                Browse Projects
              </button>
              <button
                onClick={() => router.push('/freelancer/earnings')}
                className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                View Earnings
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Escrow-protected payments
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Secure contract management
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Direct client messaging
            </span>
          </div>
          <p>
            Need help with a contract?{" "}
            <a href="/support" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}