"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import Link from "next/link";
import { 
  ArrowLeft, 
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Image as ImageIcon,
  Clock,
  Receipt,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  BarChart3,
  FileText,
  UserCircle,
  Activity,
  Wallet,
  Users,
  DollarSign,
  CreditCard,
  Flag,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Edit,
  ChevronDown,
  Calendar,
  TrendingUp,
  Percent,
  Battery,
  PlayCircle,
  StopCircle,
  PauseCircle,
  Monitor,
  Globe,
  Cpu,
  Database,
  ArrowUpRight,
  Smartphone,
  Laptop,
  ExternalLink
} from "lucide-react";
import SessionDetails from "@/components/admin/SessionDetails";
import BillingDetails from "@/components/admin/BillingDetails";
import ScreenshotsGallery from "@/components/admin/ScreenshotsGallery";
import TimeBlocksList from "@/components/admin/TimeBlocksList";
import PaymentProcess from "@/components/admin/PaymentProcess";
import TimeBlockExplanationForm from "@/components/TimeBlockExplanationForm";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminBillingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [billingData, setBillingData] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [billingUnits, setBillingUnits] = useState([]);
  const [allScreenshots, setAllScreenshots] = useState([]);
  const [showPaymentProcess, setShowPaymentProcess] = useState(false);
  const [freelancerInfo, setFreelancerInfo] = useState(null);
  
  // Time Block Explanation Form States
  const [showExplanationForm, setShowExplanationForm] = useState(false);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState(null);
  const [explanationMode, setExplanationMode] = useState("admin");
  const [timeBlocks, setTimeBlocks] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch billing data
      const billingRes = await apiPrivate.get(`/billing/admin/billing-units/${id}/`);
      const billing = billingRes.data;
      console.log("Fetched billing data:", billing);
      setBillingData(billing);
      
      // Fetch session data if available
      if (billing.session) {
        try {
          const sessionRes = await apiPrivate.get(`/admin/sessions/${billing.session}/`);
          const session = sessionRes.data.session || sessionRes.data;
          setSessionData(session);
          
          // Extract time blocks
          const timeBlocksData = session.time_blocks || session?.time_blocks || [];
          
          // Fetch explanations for each time block
          const timeBlocksWithExplanations = await Promise.all(
            timeBlocksData.map(async (block) => {
              try {
                const explanationRes = await apiPrivate.get(`/time-blocks/explain/`, {
                  params: { time_block_id: block.id }
                });
                
                // Check if response has data and it's an array
                if (explanationRes.data && Array.isArray(explanationRes.data) && explanationRes.data.length > 0) {
                  return {
                    ...block,
                    explanation: explanationRes.data[0] // Get first explanation
                  };
                }
                return block;
              } catch (err) {
                console.warn(`Could not fetch explanation for block ${block.id}:`, err);
                return block;
              }
            })
          );
          
          setTimeBlocks(timeBlocksWithExplanations);
          
          // Extract screenshots from time blocks
          const screenshots = [];
          timeBlocksData.forEach(block => {
            if (block.windows) {
              block.windows.forEach(window => {
                if (window.screenshots && Array.isArray(window.screenshots)) {
                  window.screenshots.forEach(screenshot => {
                    screenshots.push({
                      ...screenshot,
                      blockId: block.id,
                      windowTitle: window.window_title || "Unknown Window",
                      windowId: window.id,
                      timestamp: screenshot.taken_at_client || block.start_time
                    });
                  });
                }
              });
            }
          });
          setAllScreenshots(screenshots);
        } catch (sessionErr) {
          console.warn("Could not fetch session details:", sessionErr);
        }
      }
      
      // Get freelancer info from billing data
      if (billing.freelancer) {
        try {
          const freelancerRes = await apiPrivate.get(`/admin/freelancers/${billing.freelancer}/`);
          setFreelancerInfo(freelancerRes.data);
        } catch (err) {
          console.warn("Could not fetch freelancer details:", err);
          setFreelancerInfo({
            id: billing.freelancer,
            name: billing.freelancer_name || `User ${billing.freelancer}`,
            email: billing.freelancer_email || null,
            payment_method: null
          });
        }
      }
      
      // Get all billing units for this freelancer
      if (billing.freelancer) {
        try {
          const allBillingRes = await apiPrivate.get(`/billing/admin/billing-units/`, {
            params: { 
              freelancer_id: billing.freelancer,
              status: 'approved' 
            }
          });
          const allUnits = allBillingRes.data || [];
          const freelancerUnits = allUnits.filter(unit => unit.freelancer === billing.freelancer);
          setBillingUnits(freelancerUnits.length > 0 ? freelancerUnits : [billing]);
        } catch (billingErr) {
          console.warn("Could not fetch freelancer billing units:", billingErr);
          setBillingUnits([billing]);
        }
      } else {
        setBillingUnits([billing]);
      }
      
    } catch (err) {
      console.error("Error fetching details:", err);
      setError("Failed to load billing details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  const handleReview = async (billingId, action) => {
    try {
      setProcessingAction(`${action}-${billingId}`);
      
      await apiPrivate.post(`/billing/admin/billing-units/${billingId}/review/`, { action });
      await fetchData();
      
      alert(`Billing unit ${action}d successfully!`);
    } catch (err) {
      console.error("Review error:", err);
      alert(`Failed to ${action} billing unit: ${err.response?.data?.detail || err.message}`);
    } finally {
      setProcessingAction(null);
    }
  };

  const handlePaymentComplete = (payoutData) => {
    fetchData();
    setShowPaymentProcess(false);
    alert(`Batch payment completed! Payout ID: ${payoutData.payout_id}, Status: ${payoutData.status}`);
  };

  // Time Block Explanation Functions
  const handleOpenExplanationForm = (timeBlock, mode = "admin") => {
    setSelectedTimeBlock(timeBlock);
    setExplanationMode(mode);
    setShowExplanationForm(true);
  };

  const handleExplanationSubmitted = async () => {
    await fetchData();
    setShowExplanationForm(false);
    setSelectedTimeBlock(null);
  };

  const handleViewFreelancerExplanation = async (block) => {
    try {
      // If block already has explanation, open it
      if (block.explanation) {
        setSelectedTimeBlock(block);
        setExplanationMode("admin");
        setShowExplanationForm(true);
      } else {
        // Try to fetch explanation
        const explanationRes = await apiPrivate.get(`/time-blocks/explain/`, {
          params: { time_block_id: block.id }
        });
        
        if (explanationRes.data && Array.isArray(explanationRes.data) && explanationRes.data.length > 0) {
          const updatedBlock = {
            ...block,
            explanation: explanationRes.data[0]
          };
          
          // Update the timeBlocks state
          setTimeBlocks(prev => prev.map(b => 
            b.id === block.id ? updatedBlock : b
          ));
          
          setSelectedTimeBlock(updatedBlock);
        } else {
          // No explanation exists
          setSelectedTimeBlock(block);
        }
        setExplanationMode("admin");
        setShowExplanationForm(true);
      }
    } catch (err) {
      console.error("Error fetching explanation:", err);
      // Still open form even if fetch fails
      setSelectedTimeBlock(block);
      setExplanationMode("admin");
      setShowExplanationForm(true);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const config = {
      pending: {
        color: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
        icon: AlertCircle,
        label: "Pending Review"
      },
      approved: {
        color: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white",
        icon: CheckCircle,
        label: "Approved"
      },
      charged: {
        color: "bg-gradient-to-r from-emerald-500 to-green-500 text-white",
        icon: CreditCard,
        label: "Paid"
      },
      rejected: {
        color: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
        icon: XCircle,
        label: "Rejected"
      },
      failed: {
        color: "bg-gradient-to-r from-red-500 to-rose-500 text-white",
        icon: XCircle,
        label: "Failed"
      }
    };

    const { color, icon: Icon, label } = config[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: AlertCircle,
      label: status || "Unknown"
    };

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${color}`}>
        <Icon className="w-4 h-4" />
        {label}
      </span>
    );
  };

  const formatHours = (seconds) => {
    if (!seconds) return "0.00";
    return (seconds / 3600).toFixed(2);
  };

  // Update the calculateEfficiency function:
  const calculateEfficiency = () => {
    const tracked = billingData?.tracked_seconds || billingData?.total_tracked_seconds || 0;
    const billable = billingData?.billable_seconds || 0;
    
    if (tracked > 0 && billable > 0) {
      return Math.round((billable / tracked) * 100);
    }
    return 0;
  };

  const calculateAmount = () => {
    if (!billingData) return "0.00";
    
    const hours = formatHours(billingData.billable_seconds);
    const rate = billingData.hourly_rate || 0;
    return (parseFloat(hours) * rate).toFixed(2);
  };

  // Calculate flagged time statistics
  const calculateFlaggedStats = () => {
    if (!timeBlocks || timeBlocks.length === 0) return { flaggedCount: 0, flaggedSeconds: 0 };
    
    const flaggedBlocks = timeBlocks.filter(block => block.is_flagged);
    const flaggedSeconds = flaggedBlocks.reduce((total, block) => {
      return total + (block.duration || block.total_seconds || 0);
    }, 0);
    
    return {
      flaggedCount: flaggedBlocks.length,
      flaggedSeconds: flaggedSeconds,
      flaggedPercentage: timeBlocks.length > 0 ? Math.round((flaggedBlocks.length / timeBlocks.length) * 100) : 0
    };
  };

  const flaggedStats = calculateFlaggedStats();

  // Check if payment buttons should be shown
  const shouldShowPaymentButtons = () => {
    if (!billingData) return false;
    
    // Show if status is approved AND not already paid AND freelancer info exists
    return billingData.status === 'approved' && 
           billingData.payout_batch === null && 
           freelancerInfo;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
              <Activity className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Billing Details</h3>
            <p className="text-gray-600">Please wait while we fetch the information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !billingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/admin/billing"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Billing List
          </Link>
          
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <AlertCircle className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Unable to Load Data</h3>
                <p className="text-gray-700 mb-4">{error || "Billing unit not found"}</p>
                <button
                  onClick={fetchData}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Loading
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Floating Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/billing"
                  className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 rounded-xl transition-all duration-200 shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    Billing Unit <span className="text-blue-600">#{billingData.id}</span>
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(billingData.status)}
                    <span className="text-sm text-gray-500">
                      Session #{billingData.session || "N/A"}
                    </span>
                    {billingData.payout_batch && (
                      <span className="text-sm text-gray-500">
                        • Payout #{billingData.payout_batch}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {flaggedStats.flaggedCount > 0 && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 px-4 py-2 rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-bold text-red-700">{flaggedStats.flaggedCount} flagged</span>
                      <span className="text-sm text-red-600">time blocks</span>
                    </div>
                  </div>
                )}
                
                {billingData.status === 'approved' && billingData.payout_batch === null && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-4 py-2 rounded-xl">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-green-700">₹{calculateAmount()}</span>
                      <span className="text-sm text-green-600">payable</span>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={fetchData}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 font-medium rounded-xl transition-all duration-200 shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-6">
            {/* Mobile Tab Navigation */}
            <div className="lg:hidden border-b border-gray-200 bg-white">
              <div className="flex overflow-x-auto py-2 space-x-1 scrollbar-hide">
                {['overview', 'billing', 'screenshots', 'timeblocks'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === tab
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {tab === 'screenshots' ? `Screenshots (${allScreenshots.length})` : 
                     tab === 'timeblocks' ? `Time Blocks (${timeBlocks.length})` :
                     tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "overview" && (
              <>
                <SessionDetails 
                  session={sessionData} 
                  billing={billingData}
                />
                <BillingDetails 
                  billing={billingData} 
                  billingUnits={billingUnits}
                />
              </>
            )}
            
            {activeTab === "billing" && (
              <BillingDetails 
                billing={billingData} 
                billingUnits={billingUnits}
              />
            )}
            
            {activeTab === "screenshots" && (
              <ScreenshotsGallery 
                screenshots={allScreenshots}
                apiBaseUrl={API_BASE_URL}
              />
            )}
            
            {activeTab === "timeblocks" && (
              <TimeBlocksList 
                timeBlocks={timeBlocks}
                onOpenExplanationForm={handleOpenExplanationForm}
                onViewFreelancerExplanation={handleViewFreelancerExplanation}
                userRole="admin"
              />
            )}
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="lg:w-80 space-y-6">
            <ActionCard 
              billingData={billingData}
              freelancerInfo={freelancerInfo}
              processingAction={processingAction}
              handleReview={handleReview}
              setShowPaymentProcess={setShowPaymentProcess}
              shouldShowPaymentButtons={shouldShowPaymentButtons()}
            />
            
            <QuickStats 
              billingData={billingData}
              allScreenshots={allScreenshots}
              calculateAmount={calculateAmount}
              calculateEfficiency={calculateEfficiency}
              formatHours={formatHours}
              flaggedStats={flaggedStats}
            />
            
            {freelancerInfo && (
              <FreelancerCard 
                freelancerInfo={freelancerInfo}
                billingData={billingData}
                setShowPaymentProcess={setShowPaymentProcess}
                shouldShowPaymentButtons={shouldShowPaymentButtons()}
              />
            )}
          </div>
        </div>
        
        {/* Desktop Tab Navigation (Bottom) */}
        <div className="hidden lg:block mt-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2">
            <div className="flex items-center justify-center space-x-1">
              <TabButton
                activeTab={activeTab}
                tabName="overview"
                setActiveTab={setActiveTab}
                icon={BarChart3}
                label="Overview"
              />
              <TabButton
                activeTab={activeTab}
                tabName="billing"
                setActiveTab={setActiveTab}
                icon={Receipt}
                label="Billing Details"
              />
              <TabButton
                activeTab={activeTab}
                tabName="screenshots"
                setActiveTab={setActiveTab}
                icon={ImageIcon}
                label={`Screenshots (${allScreenshots.length})`}
              />
              <TabButton
                activeTab={activeTab}
                tabName="timeblocks"
                setActiveTab={setActiveTab}
                icon={Clock}
                label={`Time Blocks (${timeBlocks.length})`}
                badge={flaggedStats.flaggedCount > 0 ? flaggedStats.flaggedCount : null}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Process Modal */}
      {showPaymentProcess && (
        <PaymentModal
          showPaymentProcess={showPaymentProcess}
          setShowPaymentProcess={setShowPaymentProcess}
          billingData={billingData}
          freelancerInfo={freelancerInfo}
          billingUnits={billingUnits}
          handlePaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Time Block Explanation Form Modal */}
      {showExplanationForm && selectedTimeBlock && (
        <TimeBlockExplanationForm
          blockId={selectedTimeBlock.id}
          isOpen={showExplanationForm}
          onClose={() => {
            setShowExplanationForm(false);
            setSelectedTimeBlock(null);
          }}
          onSubmitted={handleExplanationSubmitted}
          mode={explanationMode}
          initialFlag={selectedTimeBlock.is_flagged || false}
          initialReason={selectedTimeBlock.flag_reason || ""}
          blockDetails={selectedTimeBlock}
        />
      )}
    </div>
  );
}

// Helper Components
const ActionCard = ({ 
  billingData, 
  freelancerInfo, 
  processingAction, 
  handleReview, 
  setShowPaymentProcess,
  shouldShowPaymentButtons
}) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="bg-white p-2 rounded-xl shadow-sm">
          <Shield className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Actions</h3>
          <p className="text-sm text-gray-600">Manage billing status</p>
        </div>
      </div>
    </div>
    
    <div className="p-5">
      <div className="space-y-3">
        {billingData.status === "pending" && (
          <>
            <ReviewButton
              action="approve"
              billingId={billingData.id}
              processingAction={processingAction}
              handleReview={handleReview}
              icon={CheckCircle}
              label="Approve Billing"
              gradientClasses="from-emerald-500 to-green-500"
            />
            <ReviewButton
              action="reject"
              billingId={billingData.id}
              processingAction={processingAction}
              handleReview={handleReview}
              icon={XCircle}
              label="Reject Billing"
              gradientClasses="from-rose-500 to-pink-500"
            />
          </>
        )}
        
        {shouldShowPaymentButtons && (
          <BatchPaymentButton 
            setShowPaymentProcess={setShowPaymentProcess}
            icon={Users}
            label="Process Payment"
            gradientClasses="from-blue-500 to-cyan-500"
          />
        )}
        
        {billingData.status === "charged" && (
          <StatusMessage
            icon={CheckCircle}
            title="Payment Processed"
            message="This unit has been paid"
            color="emerald"
            payoutBatch={billingData.payout_batch}
          />
        )}
        
        {billingData.status === "rejected" && (
          <StatusMessage
            icon={XCircle}
            title="Billing Rejected"
            message="This unit has been declined"
            color="rose"
          />
        )}
        
        {billingData.payout_batch && billingData.status !== "charged" && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-500 mb-2" />
            <p className="text-sm text-amber-700">
              This unit is part of Payout Batch #{billingData.payout_batch}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const ReviewButton = ({ action, billingId, processingAction, handleReview, icon: Icon, label, gradientClasses }) => (
  <button
    onClick={() => handleReview(billingId, action)}
    disabled={processingAction === `${action}-${billingId}`}
    className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${gradientClasses} text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {processingAction === `${action}-${billingId}` ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <Icon className="w-5 h-5" />
    )}
    {label}
  </button>
);

const BatchPaymentButton = ({ setShowPaymentProcess, icon: Icon, label, gradientClasses }) => (
  <button
    onClick={() => setShowPaymentProcess(true)}
    className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${gradientClasses} text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:opacity-90`}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

const StatusMessage = ({ icon: Icon, title, message, color, payoutBatch }) => {
  const colorConfig = {
    emerald: { bg: "from-emerald-50 to-emerald-50", border: "border-emerald-200", text: "text-emerald-500" },
    rose: { bg: "from-rose-50 to-rose-50", border: "border-rose-200", text: "text-rose-500" },
    amber: { bg: "from-amber-50 to-amber-50", border: "border-amber-200", text: "text-amber-500" },
    blue: { bg: "from-blue-50 to-blue-50", border: "border-blue-200", text: "text-blue-500" },
    green: { bg: "from-green-50 to-green-50", border: "border-green-200", text: "text-green-500" }
  };

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <div className={`p-4 bg-gradient-to-r ${config.bg} border ${config.border} rounded-xl text-center`}>
      <Icon className={`w-10 h-10 ${config.text} mx-auto mb-2`} />
      <p className={`font-bold text-${color}-800`}>{title}</p>
      <p className={`text-sm text-${color}-600 mt-1`}>{message}</p>
      {payoutBatch && (
        <p className={`text-xs text-${color}-500 mt-2`}>
          Payout Batch: #{payoutBatch}
        </p>
      )}
    </div>
  );
};

const QuickStats = ({ 
  billingData, 
  allScreenshots, 
  calculateAmount, 
  calculateEfficiency, 
  formatHours,
  flaggedStats 
}) => {
  const statItems = [
    {
      icon: Clock,
      iconColor: "blue",
      label: "Billable Time",
      value: `${formatHours(billingData.billable_seconds)} hrs`,
      bgColor: "blue"
    },
    {
      icon: BarChart3,
      iconColor: "emerald",
      label: "Efficiency",
      value: `${calculateEfficiency()}%`,
      bgColor: "emerald"
    },
    {
      icon: Activity,
      iconColor: "amber",
      label: "Screenshots",
      value: allScreenshots.length,
      bgColor: "amber"
    },
    ...(flaggedStats.flaggedCount > 0 ? [{
      icon: Flag,
      iconColor: "red",
      label: "Flagged Blocks",
      value: `${flaggedStats.flaggedCount}`,
      bgColor: "red"
    }] : []),
    ...(billingData.hourly_rate ? [{
      icon: CreditCard,
      iconColor: "indigo",
      label: "Hourly Rate",
      value: `₹${billingData.hourly_rate}/hr`,
      bgColor: "indigo"
    }] : [])
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">Quick Stats</h3>
      </div>
      
      <div className="p-5">
        <div className="space-y-3">
          {statItems.map((item, index) => (
            <StatItem key={index} {...item} />
          ))}
          
          {billingData.hourly_rate && billingData.billable_seconds && (
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Calculated Amount</p>
                  <p className="font-bold text-green-700">
                    ₹{calculateAmount()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon: Icon, iconColor, label, value }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-3">
      <div className={`bg-${iconColor}-100 p-2 rounded-lg`}>
        <Icon className={`w-4 h-4 text-${iconColor}-600`} />
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className={`font-medium text-${iconColor}-600`}>
          {value}
        </p>
      </div>
    </div>
  </div>
);

const FreelancerCard = ({ freelancerInfo, billingData, setShowPaymentProcess, shouldShowPaymentButtons }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="bg-white p-2 rounded-xl shadow-sm">
          <UserCircle className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Freelancer</h3>
          <p className="text-sm text-gray-600">Payment details</p>
        </div>
      </div>
    </div>
    
    <div className="p-5">
      <div className="space-y-3">
        <InfoRow label="Name:" value={freelancerInfo.name || `User ${billingData.freelancer}`} />
        
        {freelancerInfo.email && (
          <InfoRow label="Email:" value={freelancerInfo.email} />
        )}
        
        {freelancerInfo.payment_method && (
          <InfoRow label="Payment Method:" value={freelancerInfo.payment_method} truncate />
        )}
        
        {shouldShowPaymentButtons && (
          <button
            onClick={() => setShowPaymentProcess(true)}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all duration-200 shadow-sm"
          >
            <Wallet className="w-4 h-4" />
            Process Payment
          </button>
        )}
      </div>
    </div>
  </div>
);

const InfoRow = ({ label, value, truncate = false }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600">{label}</span>
    <span className={`font-medium text-gray-900 ${truncate ? 'text-xs truncate max-w-[150px]' : ''}`}>
      {value}
    </span>
  </div>
);

const TabButton = ({ activeTab, tabName, setActiveTab, icon: Icon, label, badge = null }) => (
  <button
    onClick={() => setActiveTab(tabName)}
    className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
      activeTab === tabName
        ? "bg-blue-50 text-blue-700 border border-blue-200"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
    {badge && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

const PaymentModal = ({ 
  showPaymentProcess, 
  setShowPaymentProcess, 
  billingData, 
  freelancerInfo, 
  billingUnits, 
  handlePaymentComplete 
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-2 rounded-lg">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Payment Process</h3>
            <p className="text-sm text-gray-600">Process batch payout</p>
          </div>
        </div>
        <button
          onClick={() => setShowPaymentProcess(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      <div className="p-6">
        <PaymentProcess
          freelancerId={billingData.freelancer}
          freelancerInfo={freelancerInfo}
          billingData={billingData}
          billingUnits={billingUnits}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </div>
  </div>
);