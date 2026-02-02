"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import { 
  ArrowLeft, 
  Briefcase, 
  User, 
  DollarSign, 
  Clock, 
  Calendar, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Mail,
  ExternalLink,
  Copy,
  Download,
  Printer,
  Check,
  X,
  Send,
  Loader2,
  Info,
  Wallet,
  TrendingUp
} from "lucide-react";

export default function FreelancerOfferDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [responding, setResponding] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [responseAction, setResponseAction] = useState(null); // 'accept' or 'reject'
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (id) fetchOffer();
  }, [id]);

  const fetchOffer = async () => {
    try {
      const res = await apiPrivate.get(`/offers/freelancer/${id}/`);
      setOffer(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load offer details"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-5 h-5" />;
      case "rejected":
        return <XCircle className="w-5 h-5" />;
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "expired":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "expired":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getDaysRemaining = () => {
    if (!offer?.valid_until) return 0;
    const today = new Date();
    const validDate = new Date(offer.valid_until);
    const diffTime = validDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateBudgetUsage = () => {
    if (!offer || !offer.estimated_hours) return null;
    const estimatedCost = offer.agreed_hourly_rate * offer.estimated_hours;
    const percentage = (estimatedCost / offer.total_budget) * 100;
    return {
      estimatedCost,
      percentage,
      remaining: offer.total_budget - estimatedCost,
      maxHours: Math.floor(offer.total_budget / offer.agreed_hourly_rate)
    };
  };

  const copyToClipboard = () => {
    const budgetInfo = calculateBudgetUsage();
    const text = `Offer for ${offer?.project_title}
Status: ${offer?.status}
Total Budget: ${formatCurrency(offer.total_budget)}
Hourly Rate: ${formatCurrency(offer.agreed_hourly_rate)}/hr
${offer.estimated_hours ? `Estimated Hours: ${offer.estimated_hours} hours` : ''}
${budgetInfo ? `Maximum Hours: ${budgetInfo.maxHours} hours` : ''}
Valid Until: ${formatDate(offer?.valid_until)}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResponse = async (action) => {
    if (!offer || offer.status !== 'pending') return;

    setResponding(true);
    setError("");
    try {
      const endpoint = action === 'accept' 
        ? `/offers/${offer.id}/accept/`
        : `/offers/${offer.id}/reject/`;

      const payload = {
        message: responseMessage || `I have ${action}ed your offer.`
      };

      console.log(`Sending ${action} request to:`, endpoint, "with payload:", payload);
      
      let response;
      try {
        response = await apiPrivate.put(endpoint, payload);
      } catch (putError) {
        console.log("PUT failed, trying PATCH...");
        response = await apiPrivate.patch(endpoint, payload);
      }
      
      console.log("Response received:", response.data);
      
      setOffer(prev => ({ ...prev, status: action }));
      setSuccessMessage(`Offer ${action}ed successfully!`);
      
      setTimeout(() => {
        router.push('/freelancer/offers-list');
      }, 2000);
      
    } catch (err) {
      console.error("Response error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      const errorMessage = err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === 'object' ? JSON.stringify(err.response.data) : err.response?.data) ||
        `Failed to ${action} offer. Please try again.`;
      
      setError(errorMessage);
    } finally {
      setResponding(false);
      setShowConfirmModal(false);
    }
  };

  const openConfirmModal = (action) => {
    setResponseAction(action);
    setShowConfirmModal(true);
  };

  const isOfferExpired = () => {
    if (!offer?.valid_until) return false;
    return new Date(offer.valid_until) < new Date();
  };

  const handleSendMessage = () => {
    if (offer?.client_email) {
      window.location.href = `mailto:${offer.client_email}?subject=Regarding Offer for ${offer.project_title}`;
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
          <p className="mt-6 text-lg font-medium text-gray-700">Loading offer details...</p>
          <p className="mt-2 text-gray-500">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error && !offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold">Error Loading Offer</h2>
            </div>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <button
                onClick={fetchOffer}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Offer Not Found</h2>
            <p className="text-gray-600 mb-6">The offer you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => router.push("/freelancer/offers-list")}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              View All Offers
            </button>
          </div>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();
  const isExpired = isOfferExpired();
  const budgetUsage = calculateBudgetUsage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Success Message Modal */}
      {successMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <p className="text-gray-500 text-sm mb-6">Redirecting to offers page...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                responseAction === 'accept' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {responseAction === 'accept' ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {responseAction === 'accept' ? 'Accept Offer?' : 'Reject Offer?'}
              </h3>
              <p className="text-gray-600 mb-6">
                {responseAction === 'accept' 
                  ? 'Are you sure you want to accept this offer? Once accepted, the client will be notified.'
                  : 'Are you sure you want to reject this offer? This action cannot be undone.'}
              </p>
              
              {responseAction === 'accept' && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      Upon acceptance, you'll be able to start working on the project and communicate with the client through the platform.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  disabled={responding}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResponse(responseAction)}
                  disabled={responding}
                  className={`flex-1 px-4 py-3 rounded-lg text-white font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                    responseAction === 'accept' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } ${responding ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {responding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : responseAction === 'accept' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  {responding ? 'Processing...' : responseAction === 'accept' ? 'Accept Offer' : 'Reject Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/freelancer/offers-list")}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Offer Details</h1>
              <p className="text-gray-600 mt-1">ID: {offer.id}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center gap-2 text-gray-700"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center gap-2 text-gray-700"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800 mb-1">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Offer Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Offer Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Status Header */}
              <div className={`px-6 py-4 border-b ${getStatusColor(offer.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(offer.status)}
                    <div>
                      <h2 className="font-bold text-lg capitalize">{offer.status} Offer</h2>
                      <p className="text-sm opacity-90">
                        {offer.status === "pending" && "You need to respond to this offer"}
                        {offer.status === "accepted" && "You have accepted this offer"}
                        {offer.status === "rejected" && "You have rejected this offer"}
                        {offer.status === "expired" && "This offer has expired"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium px-3 py-1 bg-white/50 rounded-full backdrop-blur-sm">
                    Escrow Payment
                  </span>
                </div>
              </div>

              {/* Offer Content */}
              <div className="p-6">
                {/* Project & Amount */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{offer.project_title}</h3>
                  <div className="flex items-center gap-4 text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">Client Offer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Received {formatDate(offer.created_at)}</span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mb-6">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Wallet className="w-5 h-5 text-blue-600" />
                          <p className="text-sm text-gray-600">Total Escrow Budget</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                          {formatCurrency(offer.total_budget)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Held in escrow</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <p className="text-sm text-gray-600">Agreed Hourly Rate</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                          {formatCurrency(offer.agreed_hourly_rate)}/hr
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Max {Math.floor(offer.total_budget / offer.agreed_hourly_rate)} hours
                        </p>
                      </div>
                    </div>

                    {/* Estimated Hours */}
                    {offer.estimated_hours && budgetUsage && (
                      <div className="pt-6 border-t border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm text-gray-700 mb-1">Estimated Hours (for planning)</p>
                            <p className="text-xl font-bold text-gray-900">{offer.estimated_hours} hours</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-700 mb-1">Estimated Cost</p>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(budgetUsage.estimatedCost)}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Budget Usage</span>
                            <span className={`font-semibold ${budgetUsage.percentage > 100 ? 'text-red-600' : 'text-green-600'}`}>
                              {budgetUsage.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${budgetUsage.percentage > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(budgetUsage.percentage, 100)}%` }}
                            ></div>
                          </div>
                          {budgetUsage.remaining >= 0 ? (
                            <p className="text-sm text-green-700">
                              Buffer: {formatCurrency(budgetUsage.remaining)} remaining
                            </p>
                          ) : (
                            <p className="text-sm text-red-700">
                              ⚠️ Estimate exceeds budget by {formatCurrency(Math.abs(budgetUsage.remaining))}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Validity Info */}
                    <div className="pt-6 border-t border-blue-200 mt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Valid Until</p>
                          <p className="font-semibold text-gray-900">{formatDate(offer.valid_until)}</p>
                        </div>
                        {offer.status === 'pending' && daysRemaining > 0 && (
                          <div className={`px-4 py-2 rounded-lg ${daysRemaining <= 3 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            <p className="text-sm font-medium">
                              {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                            </p>
                          </div>
                        )}
                        {isExpired && (
                          <div className="px-4 py-2 rounded-lg bg-red-100 text-red-800">
                            <p className="text-sm font-medium">Expired</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* How Payment Works */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">How Escrow Payment Works</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>The full budget of {formatCurrency(offer.total_budget)} is held in escrow upfront</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>You'll be paid at {formatCurrency(offer.agreed_hourly_rate)} per hour for work completed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Work continues until the budget is exhausted or project is completed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Estimated hours ({offer.estimated_hours || 'N/A'}) are for planning only - not a limit</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Message Section */}
                {offer.message && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Client's Message</h3>
                        <p className="text-sm text-gray-600">Personal note from the client</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <p className="text-gray-700 whitespace-pre-line">{offer.message}</p>
                    </div>
                  </div>
                )}

                {/* Response Section (Only for pending offers) */}
                {offer.status === 'pending' && !isExpired && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Send className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Your Response</h3>
                        <p className="text-sm text-gray-600">Add a message for the client (optional)</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        placeholder="Add a personal message to the client when accepting or rejecting..."
                        className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none placeholder:text-gray-500"
                        rows="4"
                      />
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => openConfirmModal('accept')}
                          className="flex-1 px-6 py-3.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-bold text-lg flex items-center justify-center gap-3"
                        >
                          <Check className="w-5 h-5" />
                          Accept Offer
                        </button>
                        <button
                          onClick={() => openConfirmModal('reject')}
                          className="flex-1 px-6 py-3.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-bold text-lg flex items-center justify-center gap-3"
                        >
                          <X className="w-5 h-5" />
                          Reject Offer
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    Timeline
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Offer Sent</p>
                        <p className="text-sm text-gray-600">{formatDate(offer.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        offer.status === "accepted" ? "bg-green-100" : 
                        offer.status === "rejected" ? "bg-red-100" : "bg-gray-100"
                      }`}>
                        {offer.status === "accepted" ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                         offer.status === "rejected" ? <XCircle className="w-4 h-4 text-red-600" /> :
                         <Clock className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {offer.status === "accepted" ? "Offer Accepted" :
                           offer.status === "rejected" ? "Offer Rejected" :
                           "Your Response"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {offer.status === "pending" 
                            ? "Waiting for your response"
                            : `You ${offer.status}ed this offer on ${formatDate(offer.updated_at || offer.created_at)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Client Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                Client Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{offer.client_name || "Unknown Client"}</h4>
                    <p className="text-gray-600 text-sm mb-2 truncate">{offer.client_email || "No email provided"}</p>
                    <p className="text-sm text-gray-500">Client</p>
                  </div>
                </div>
                {offer.client_email && (
                  <button
                    onClick={handleSendMessage}
                    className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </button>
                )}
              </div>
            </div>

            {/* Offer Details */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                Offer Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Offer ID</span>
                  <span className="font-medium text-gray-900">{offer.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Budget</span>
                  <span className="font-medium text-gray-900">{formatCurrency(offer.total_budget)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Hourly Rate</span>
                  <span className="font-medium text-gray-900">{formatCurrency(offer.agreed_hourly_rate)}/hr</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Max Hours</span>
                  <span className="font-medium text-gray-900">
                    {Math.floor(offer.total_budget / offer.agreed_hourly_rate)} hrs
                  </span>
                </div>
                {offer.estimated_hours && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Est. Hours</span>
                    <span className="font-medium text-gray-900">{offer.estimated_hours} hrs</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Payment Type</span>
                  <span className="font-medium text-gray-900">Escrow</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Days Remaining</span>
                  <span className={`font-medium ${daysRemaining <= 3 ? 'text-red-600' : 'text-gray-900'}`}>
                    {isExpired ? 'Expired' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {offer.status === "pending" && !isExpired ? (
                  <>
                    <button
                      onClick={() => openConfirmModal('accept')}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Accept Offer
                    </button>
                    <button
                      onClick={() => openConfirmModal('reject')}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reject Offer
                    </button>
                  </>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600">
                      {isExpired 
                        ? "This offer has expired and cannot be accepted."
                        : offer.status === "accepted"
                        ? "You have already accepted this offer."
                        : "You have rejected this offer."}
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => router.push("/freelancer/offers-list")}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Back to Offers
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}