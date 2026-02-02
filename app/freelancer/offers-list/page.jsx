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
  FileText,
  TrendingUp,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Wallet
} from "lucide-react";

export default function FreelancerOffersListPage() {
  const router = useRouter();

  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    filterOffers();
  }, [offers, searchTerm, statusFilter]);

  const fetchOffers = async (url = "/offers/freelancer/") => {
    try {
      setLoading(true);
      const res = await apiPrivate.get(url);

      const data = res.data;
      setOffers(data.results || []);
      setFilteredOffers(data.results || []);
      setCount(data.count || 0);
      setNext(data.next);
      setPrevious(data.previous);
      
      // Calculate pagination
      const pageSize = 10; // Assuming default page size
      const pages = Math.ceil((data.count || 1) / pageSize);
      setTotalPages(pages || 1);
      
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load offers"
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
        offer.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (validUntil) => {
    const today = new Date();
    const validDate = new Date(validUntil);
    const diffTime = validDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewDetails = (offerId) => {
    router.push(`/freelancer/offers-list/${offerId}`);
  };

  const handlePageChange = (pageUrl) => {
    if (pageUrl) {
      fetchOffers(pageUrl);
      // Extract page number from URL
      const pageMatch = pageUrl.match(/page=(\d+)/);
      if (pageMatch) {
        setCurrentPage(parseInt(pageMatch[1]));
      }
    }
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
              onClick={() => fetchOffers()}
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

  if (!offers.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No offers received yet</h3>
            <p className="text-gray-600 mb-6">
              When clients send you offers, they will appear here. Keep your profile updated to receive more offers.
            </p>
            <button
              onClick={() => router.push("/freelancer/profile")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Update Profile
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Offers Received</h1>
              <p className="text-gray-600">
                Review and manage offers from clients
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchOffers()}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Offers</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
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

            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
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

            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Average Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      offers.reduce((sum, offer) => sum + (offer.total_budget || 0), 0) / (offers.length || 1)
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
                  placeholder="Search projects, clients, or messages..."
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
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No offers found</h3>
            <p className="text-gray-600 mb-6">
              No offers match your current filters. Try adjusting your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOffers.map((offer) => {
                const daysRemaining = getDaysRemaining(offer.valid_until);
                const isExpiringSoon = daysRemaining <= 3 && daysRemaining > 0;
                
                return (
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
                              <span>From: {offer.client_name}</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>Received {formatDate(offer.created_at)}</span>
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
                              <span className="text-sm font-medium">Estimated Hours</span>
                            </div>
                            <span className="text-sm font-bold text-blue-900">
                              {offer.estimated_hours} hours
                            </span>
                          </div>
                          <p className="text-xs text-blue-600 mt-1">
                            At {formatCurrency(offer.agreed_hourly_rate)}/hr = {formatCurrency(offer.agreed_hourly_rate * offer.estimated_hours)} of {formatCurrency(offer.total_budget)} budget
                          </p>
                        </div>
                      )}

                      {/* Validity Warning */}
                      {offer.status === 'pending' && isExpiringSoon && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <div className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message and Actions */}
                    <div className="p-6">
                      {offer.message && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-700">Client's Message</p>
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
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleViewDetails(offer.id)}
                            className="px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium flex items-center gap-2 text-sm group-hover:bg-blue-100"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {(previous || next) && (
              <div className="mt-8 bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {filteredOffers.length} of {count} offers
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(previous)}
                      disabled={!previous}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      <span className="px-3 py-1 text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(next)}
                      disabled={!next}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Next
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}