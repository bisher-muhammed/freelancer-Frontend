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
  Share2,
  Download,
  Printer,
  Shield,
  CreditCard,
  Lock,
  Wallet,
  TrendingUp,
  Info
} from "lucide-react";
import EscrowPaymentButton from "@/components/client/EscrowPayButton";

export default function ClientOfferDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) fetchOffer();
  }, [id]);

  const fetchOffer = async () => {
    try {
      const res = await apiPrivate.get(`/offers/client/${id}/`);
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
        return <AlertCircle className="w-5 h-5" />;
      case "expired":
        return <Clock className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
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

  const calculateBudgetInfo = () => {
    if (!offer) return null;
    
    const maxHours = Math.floor(offer.total_budget / offer.agreed_hourly_rate);
    let estimatedCost = null;
    let percentage = null;
    let remaining = null;

    if (offer.estimated_hours) {
      estimatedCost = offer.agreed_hourly_rate * offer.estimated_hours;
      percentage = (estimatedCost / offer.total_budget) * 100;
      remaining = offer.total_budget - estimatedCost;
    }

    return {
      maxHours,
      estimatedCost,
      percentage,
      remaining
    };
  };

  const copyToClipboard = () => {
    const budgetInfo = calculateBudgetInfo();
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

  // Check if escrow payment button should be shown
  const showEscrowPaymentButton = () => {
    if (!offer) return false;
    
    // Only show for accepted offers
    if (offer.status !== 'accepted') return false;
    
    // Check if escrow payment exists and its status
    if (offer.payment) {
      // Don't show if payment is already escrowed, released, or refunded
      return offer.payment.status === 'pending' || offer.payment.status === 'failed';
    }
    
    // No payment record exists - show button
    return true;
  };

  const getEscrowStatus = () => {
    if (!offer?.payment) return 'not_created';
    return offer.payment.status;
  };

  const getEscrowStatusDisplay = () => {
    const status = getEscrowStatus();
    switch (status) {
      case 'not_created':
        return { text: 'No Escrow Created', color: 'text-gray-600', bg: 'bg-gray-100', icon: <Shield className="w-4 h-4" /> };
      case 'pending':
        return { text: 'Payment Pending', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <Clock className="w-4 h-4" /> };
      case 'escrowed':
        return { text: 'Funds Secured', color: 'text-green-600', bg: 'bg-green-100', icon: <Lock className="w-4 h-4" /> };
      case 'released':
        return { text: 'Funds Released', color: 'text-blue-600', bg: 'bg-blue-100', icon: <CheckCircle className="w-4 h-4" /> };
      case 'refunded':
        return { text: 'Funds Refunded', color: 'text-red-600', bg: 'bg-red-100', icon: <XCircle className="w-4 h-4" /> };
      case 'failed':
        return { text: 'Payment Failed', color: 'text-red-600', bg: 'bg-red-100', icon: <AlertCircle className="w-4 h-4" /> };
      default:
        return { text: 'Unknown Status', color: 'text-gray-600', bg: 'bg-gray-100', icon: <AlertCircle className="w-4 h-4" /> };
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

  if (error) {
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
              onClick={() => router.push("/client/offers")}
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

  const budgetInfo = calculateBudgetInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/client/offers")}
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
                        {offer.status === "pending" && "Waiting for freelancer's response"}
                        {offer.status === "accepted" && "Freelancer has accepted this offer"}
                        {offer.status === "rejected" && "Freelancer has rejected this offer"}
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
                      <span className="text-sm">Project Offer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Created {formatDate(offer.created_at)}</span>
                    </div>
                  </div>

                  {/* Payment Structure */}
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
                        <p className="text-sm text-gray-600 mt-1">To be held in escrow</p>
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
                          Max {budgetInfo.maxHours} hours
                        </p>
                      </div>
                    </div>

                    {/* Estimated Hours */}
                    {offer.estimated_hours && budgetInfo && (
                      <div className="pt-6 border-t border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm text-gray-700 mb-1">Estimated Hours (for planning)</p>
                            <p className="text-xl font-bold text-gray-900">{offer.estimated_hours} hours</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-700 mb-1">Estimated Cost</p>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(budgetInfo.estimatedCost)}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Budget Usage</span>
                            <span className={`font-semibold ${budgetInfo.percentage > 100 ? 'text-red-600' : 'text-green-600'}`}>
                              {budgetInfo.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${budgetInfo.percentage > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(budgetInfo.percentage, 100)}%` }}
                            ></div>
                          </div>
                          {budgetInfo.remaining >= 0 ? (
                            <p className="text-sm text-green-700">
                              Buffer: {formatCurrency(budgetInfo.remaining)} remaining
                            </p>
                          ) : (
                            <p className="text-sm text-red-700">
                              ⚠️ Estimate exceeds budget by {formatCurrency(Math.abs(budgetInfo.remaining))}
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
                        <div className={`px-4 py-2 rounded-lg ${new Date(offer.valid_until) > new Date() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          <p className="text-sm font-medium">
                            {new Date(offer.valid_until) > new Date() ? 'Active' : 'Expired'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Escrow Payment Section - Only for accepted offers */}
                  {offer.status === 'accepted' && (
                    <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">Escrow Protection</h3>
                            <p className="text-sm text-gray-600">
                              Secure your payment with escrow service
                            </p>
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${getEscrowStatusDisplay().bg} ${getEscrowStatusDisplay().color} flex items-center gap-2`}>
                          {getEscrowStatusDisplay().icon}
                          <span className="font-medium">{getEscrowStatusDisplay().text}</span>
                        </div>
                      </div>
                      
                      {offer.payment && (
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Escrow Amount:</span>
                            <span className="font-bold text-gray-900">
                              {formatCurrency(offer.payment.amount)}
                            </span>
                          </div>
                          {offer.payment.refundable_until && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Refundable Until:</span>
                              <span className="font-medium text-gray-900">
                                {formatDate(offer.payment.refundable_until)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show payment button only for accepted offers without completed escrow */}
                      {showEscrowPaymentButton() && (
                        <div className="mt-4">
                          <EscrowPaymentButton
                            offerId={offer.id}
                            amount={offer.total_budget}
                            onPaymentSuccess={() => {
                              // Refresh offer data after successful payment
                              fetchOffer();
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-3 text-center">
                            Your funds will be held securely until work is completed
                          </p>
                        </div>
                      )}

                      {/* Show status messages for existing payments */}
                      {offer.payment && (
                        <div className="mt-4">
                          {offer.payment.status === 'escrowed' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <div>
                                  <p className="font-medium text-green-800">Funds Secured</p>
                                  <p className="text-sm text-green-700">
                                    Payment of {formatCurrency(offer.payment.amount)} is held in escrow.
                                    {offer.payment.escrowed_at && ` Secured on ${formatDate(offer.payment.escrowed_at)}`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {offer.payment.status === 'pending' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-yellow-600" />
                                <div>
                                  <p className="font-medium text-yellow-800">Payment Initiated</p>
                                  <p className="text-sm text-yellow-700">
                                    Please complete the payment process to secure funds in escrow.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {offer.payment.status === 'failed' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <div>
                                  <p className="font-medium text-red-800">Payment Failed</p>
                                  <p className="text-sm text-red-700">
                                    There was an issue with your payment. Please try again.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* How Escrow Works */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">How Escrow Payment Works</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>You deposit {formatCurrency(offer.total_budget)} into escrow before work begins</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Freelancer is paid at {formatCurrency(offer.agreed_hourly_rate)} per hour for completed work</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Work continues until the budget is exhausted or project is completed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Estimated hours ({offer.estimated_hours || 'N/A'}) are for planning only - not a limit</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Your funds are protected until you approve the completed work</span>
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
                        <h3 className="font-bold text-gray-900">Your Message to Freelancer</h3>
                        <p className="text-sm text-gray-600">Personal note sent with this offer</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <p className="text-gray-700 whitespace-pre-line">{offer.message}</p>
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
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Offer Created</p>
                        <p className="text-sm text-gray-600">{formatDate(offer.created_at)}</p>
                      </div>
                    </div>
                    
                    {/* Escrow timeline entry if exists */}
                    {offer.payment && (
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          offer.payment.status === 'escrowed' ? 'bg-green-100' : 
                          offer.payment.status === 'pending' ? 'bg-yellow-100' :
                          offer.payment.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {offer.payment.status === 'escrowed' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                           offer.payment.status === 'pending' ? <Clock className="w-4 h-4 text-yellow-600" /> :
                           offer.payment.status === 'failed' ? <XCircle className="w-4 h-4 text-red-600" /> :
                           <Shield className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {offer.payment.status === 'escrowed' ? "Escrow Secured" :
                             offer.payment.status === 'pending' ? "Escrow Payment Initiated" :
                             offer.payment.status === 'failed' ? "Escrow Payment Failed" :
                             "Escrow Created"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {offer.payment.status === 'escrowed' && offer.payment.escrowed_at 
                              ? `Secured on ${formatDate(offer.payment.escrowed_at)}`
                              : offer.payment.status === 'pending' 
                                ? "Awaiting payment completion"
                                : "Escrow status updated"}
                          </p>
                        </div>
                      </div>
                    )}

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
                           "Awaiting Response"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {offer.status === "pending" 
                            ? "Freelancer hasn't responded yet"
                            : `Updated ${formatDate(offer.updated_at || offer.created_at)}`}
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
            {/* Freelancer Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                Freelancer Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{offer.freelancer_name || "Unknown Freelancer"}</h4>
                    <p className="text-sm text-gray-600">{offer.freelancer_email || "No email provided"}</p>
                  </div>
                </div>
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
                  <span className="font-medium text-gray-900">{budgetInfo.maxHours} hrs</span>
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
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/client/proposals?offer=${offer.id}`)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Original Proposal
                </button>
                
                {/* Show escrow payment button in sidebar too */}
                {showEscrowPaymentButton() && (
                  <EscrowPaymentButton
                    offerId={offer.id}
                    amount={offer.total_budget}
                    onPaymentSuccess={fetchOffer}
                    className="w-full"
                    variant="primary"
                  />
                )}
                
                {offer.status === "pending" && (
                  <button className="w-full px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors duration-200 font-medium">
                    Withdraw Offer
                  </button>
                )}
                <button
                  onClick={() => router.push("/client/offers")}
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