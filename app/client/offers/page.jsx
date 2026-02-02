"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import { 
  Briefcase, 
  Clock, 
  Calendar, 
  DollarSign, 
  User, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  Filter,
  Search,
  RefreshCw,
  Eye,
  ExternalLink,
  Wallet,
  TrendingUp
} from "lucide-react";

export default function ClientOfferListPage() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchClientOffers();
  }, []);

  useEffect(() => {
    filterOffers();
  }, [offers, searchTerm, statusFilter]);

  const fetchClientOffers = async () => {
    try {
      setLoading(true);
      const res = await apiPrivate.get("/offers/client/");

      const data = res.data;
      console.log("Fetched Offers:", data);

      // ✅ Handle both paginated & non-paginated DRF responses
      if (Array.isArray(data)) {
        setOffers(data);
        setFilteredOffers(data);
      } else if (Array.isArray(data.results)) {
        setOffers(data.results);
        setFilteredOffers(data.results);
      } else {
        setOffers([]);
        setFilteredOffers([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to load offers"
      );
    } finally {
      setLoading(false);
    }
  };

  const filterOffers = () => {
    let filtered = offers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(offer =>
        offer.project_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.freelancer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(offer => offer.status === statusFilter);
    }

    setFilteredOffers(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "expired":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-50 border-green-200 text-green-800";
      case "rejected":
        return "bg-red-50 border-red-200 text-red-800";
      case "pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "expired":
        return "bg-gray-50 border-gray-200 text-gray-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleViewDetails = (offerId) => {
    router.push(`/client/offers/${offerId}`);
  };

  const handleCreateNewOffer = () => {
    router.push("/client/proposals");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading your offers...</p>
          <p className="mt-2 text-gray-500">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold">Error Loading Offers</h2>
            </div>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchClientOffers}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Offers</h1>
              <p className="text-gray-600">
                Manage and track offers you've sent to freelancers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateNewOffer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Create New Offer
              </button>
              <button
                onClick={fetchClientOffers}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Offers</p>
                  <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div 
              onClick={() => setStatusFilter('pending')}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {offers.filter(o => o.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div 
              onClick={() => setStatusFilter('accepted')}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Accepted</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {offers.filter(o => o.status === 'accepted').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      offers.reduce((sum, offer) => sum + (offer.total_budget || 0), 0)
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, freelancers, or messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Offers List */}
        {filteredOffers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No offers found</h3>
            <p className="text-gray-600 mb-6">
              {offers.length === 0 
                ? "You haven't sent any offers yet. Start by creating an offer for a freelancer."
                : "No offers match your current filters. Try adjusting your search criteria."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {offers.length === 0 && (
                <button
                  onClick={handleCreateNewOffer}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  Create Your First Offer
                </button>
              )}
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Offer Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                        {offer.project_title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>To: {offer.freelancer_name || "Freelancer"}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Sent {formatDate(offer.created_at || offer.valid_until)}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${getStatusColor(offer.status)}`}>
                      {getStatusIcon(offer.status)}
                      <span className="text-sm font-medium capitalize">{offer.status}</span>
                    </div>
                  </div>

                  {/* Offer Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Total Budget</p>
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-lg text-gray-900">
                          {formatCurrency(offer.total_budget)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Hourly Rate</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(offer.agreed_hourly_rate)}/hr
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Hours */}
                  {offer.estimated_hours && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">Estimated: {offer.estimated_hours} hours</span>
                        </div>
                        <span className="text-sm font-medium text-blue-900">
                          {formatCurrency(offer.agreed_hourly_rate * offer.estimated_hours)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message and Additional Info */}
                <div className="p-6">
                  {offer.message && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700">Your Message</p>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">{offer.message}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Valid until:</span>
                        <span className="font-medium text-gray-900">{formatDate(offer.valid_until)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(offer.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium text-sm group-hover:bg-blue-100"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Info and Actions */}
        {filteredOffers.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-gray-600 text-sm">
                  <p>
                    Showing <span className="font-semibold text-gray-900">{filteredOffers.length}</span> of{" "}
                    <span className="font-semibold text-gray-900">{offers.length}</span> offers
                  </p>
                  {(searchTerm || statusFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium mt-1 inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Clear filters
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCreateNewOffer}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center gap-2 text-sm"
                  >
                    <Briefcase className="w-4 h-4" />
                    New Offer
                  </button>
                  <button
                    onClick={fetchClientOffers}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center gap-2 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}