// app/client/contract/[id]/page.jsx
'use client';

import { apiPrivate } from '@/lib/apiPrivate';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  Shield,
  AlertTriangle,
  TrendingUp,
  Percent,
  Download,
  MessageSquare,
  Settings,
  Briefcase,
  Target,
  Award,
  FileCheck,
  ShieldCheck,
  Clock3,
  ChevronRight,
  CreditCard,
  FileBarChart,
  CalendarClock,
  BarChart,
  Users,
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  ExternalLink,
  Copy,
  CheckSquare,
  XSquare,
  Send,
  Upload,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Bell,
  Share2,
  Printer,
  HelpCircle,
  FilePlus,
  Wallet,
  TrendingDown,
  Info,
  FolderPlus,
  Folder,
  X,
  Image as ImageIcon,
  File,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import ContractMessages from '@/lib/hooks/contractMessage';
import FolderManager from '@/lib/hooks/FolderManager';
import DocumentList from '@/lib/hooks/DocumentList';
import DocumentUpload from '@/lib/hooks/DocumentUpload';
import DocumentPreview from '@/lib/hooks/DocumentPreview';
import TrackingPolicyModal from '@/components/freelancer/TrackingPolicyModal';

// Utility function for better error handling
const fetchWithAuth = async (apiPrivate, endpoint, options = {}) => {
  try {
    const response = await apiPrivate(endpoint, options);
    return response;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error(`Endpoint not found: ${endpoint}`);
      throw new Error(`Resource not found`);
    } else if (error.response?.status === 403) {
      console.error(`Access forbidden to: ${endpoint}`);
      throw new Error(`You don't have permission to access this resource`);
    } else if (error.response?.status === 401) {
      console.error(`Unauthorized: ${endpoint}`);
      throw new Error(`Please log in to access this resource`);
    }
    throw error;
  }
};

export default function FreelancerContractDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMessageInput, setShowMessageInput] = useState(false);

  // Document states
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Tracking Policy states
  const [showTrackingPolicy, setShowTrackingPolicy] = useState(false);

  useEffect(() => {
    if (id) {
      fetchContract();
      fetchDocuments();
      fetchFolders();
    }
  }, [id]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(apiPrivate, `/contracts/${id}/`);
      const contractData = res.data;
      setContract(contractData);

      // Show modal when contract is active and freelancer has NOT yet accepted policy.
      // Logic: tracking_required=false means not yet accepted, tracking_policy!=null means
      // admin has created a policy that needs acceptance.
      // After acceptance → backend sets tracking_required=true.
      if (
        contractData?.status === 'active' &&
        contractData?.tracking_required === false &&
        contractData?.tracking_policy !== null
      ) {
        setTimeout(() => setShowTrackingPolicy(true), 1500);
      }
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError(err.message || 'Failed to load contract details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetchWithAuth(apiPrivate, `/contracts/${id}/documents/`);
      setDocuments(res.data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await fetchWithAuth(apiPrivate, `/contracts/${id}/documents-folders/`);
      setFolders(res.data);
    } catch (err) {
      console.error('Error fetching folders:', err);
    }
  };

  const handleUploadDocument = async (file, folderId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folder', folderId);
    }

    try {
      const res = await fetchWithAuth(apiPrivate, `/contracts/${id}/documents/`, {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDocuments(prev => [res.data, ...prev]);
      setShowUploadModal(false);
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Failed to upload document. Please try again.');
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteDocument = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await fetchWithAuth(apiPrivate, `/contracts/${id}/documents/${documentId}/`, {
        method: 'DELETE'
      });
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      if (previewDocument?.id === documentId) {
        setPreviewDocument(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete document.');
    }
  };

  const handleCreateFolder = async (folderName) => {
    try {
      const res = await fetchWithAuth(apiPrivate, `/contracts/${id}/documents-folders/`, {
        method: 'POST',
        data: { name: folderName }
      });
      setFolders(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Error creating folder:', err);
      alert('Failed to create folder.');
    }
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
  };

  const handleContractAction = async (action, endpoint, confirmationMessage, successCallback) => {
    if (!confirm(confirmationMessage)) return;

    setActionLoading(true);
    try {
      await fetchWithAuth(apiPrivate, `/contracts/${id}/${endpoint}/`, {
        method: 'POST'
      });
      fetchContract();
      if (successCallback) successCallback();
    } catch (err) {
      alert(`Unable to ${action} contract. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActionWithInput = async (action, endpoint, promptMessage, confirmationMessage, successCallback) => {
    const input = prompt(promptMessage);
    if (!input) return;

    if (!confirm(confirmationMessage)) return;

    setActionLoading(true);
    try {
      await fetchWithAuth(apiPrivate, `/contracts/${id}/${endpoint}/`, {
        method: 'POST',
        data: {
          [action === 'terminate' ? 'reason' : 'issue']: input
        }
      });
      fetchContract();
      if (successCallback) successCallback();
    } catch (err) {
      alert(`Unable to ${action} contract. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const requestPayment = () => handleContractAction(
    'request payment',
    'request-payment',
    'Are you sure you want to request payment for this contract? This will notify the client.',
    () => alert('Payment request sent to client.')
  );

  const raiseDispute = () => handleActionWithInput(
    'raise dispute for',
    'dispute',
    'Please describe the issue that requires dispute resolution:',
    'Are you sure you want to raise a dispute? This will pause all payments and require platform intervention.'
  );

  const submitDeliverable = () => {
    // Check if tracking policy is required and accepted
    if (!contract?.tracking_required && contract?.tracking_policy !== null) {
      if (!confirm('You need to accept the work tracking policy before submitting deliverables. Would you like to review the policy now?')) {
        return;
      }
      setShowTrackingPolicy(true);
      return;
    }

    const description = prompt('Enter a brief description of your deliverable:');
    if (!description) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.zip,.rar,.png,.jpg,.jpeg';

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!confirm('Submit this deliverable to the client?')) return;

      setActionLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);
        formData.append('type', 'deliverable');

        await fetchWithAuth(apiPrivate, `/contracts/${id}/submit-deliverable/`, {
          method: 'POST',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        alert('Deliverable submitted successfully!');
        fetchContract();
      } catch (err) {
        alert('Failed to submit deliverable. Please try again.');
      } finally {
        setActionLoading(false);
      }
    };

    fileInput.click();
  };

  // ✅ FIX: Update local contract state so UI reacts immediately without full refetch
  const handleTrackingPolicyAccepted = async () => {
    try {
      setContract(prev => ({ ...prev, tracking_required: true })); // backend sets this on accept
      alert('Tracking policy accepted successfully! You can now use work tracking features.');
    } catch (err) {
      console.error('Error updating tracking policy state:', err);
    }
  };

  // ✅ FIX: The modal itself already calls the API; this just handles local state after rejection
  const handleTrackingPolicyRejected = () => {
    alert('Tracking policy rejected. Some features like time tracking and deliverable submission may be limited.');
  };

  const downloadContract = () => {
    alert('Contract download feature would be implemented here.');
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="w-5 h-5" />,
        label: 'Active',
        badgeColor: 'bg-green-500',
        description: 'Contract is active and in progress'
      },
      completed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Award className="w-5 h-5" />,
        label: 'Completed',
        badgeColor: 'bg-blue-500',
        description: 'Contract has been successfully completed'
      },
      terminated: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="w-5 h-5" />,
        label: 'Terminated',
        badgeColor: 'bg-red-500',
        description: 'Contract has been terminated'
      },
      disputed: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: <AlertTriangle className="w-5 h-5" />,
        label: 'Disputed',
        badgeColor: 'bg-orange-500',
        description: 'Contract is under dispute resolution'
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="w-5 h-5" />,
        label: 'Pending',
        badgeColor: 'bg-yellow-500',
        description: 'Contract is pending acceptance'
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const calculateContractAmounts = () => {
    if (!contract) {
      return {
        contractAmount: 0,
        platformFee: 0,
        freelancerEarnings: 0
      };
    }

    const hourlyRate = parseFloat(contract.offer?.agreed_hourly_rate) || 0;
    const platformFeePercentage = parseFloat(contract.platform_fee_percentage) || 0;

    const platformFeePerHour = (platformFeePercentage / 100) * hourlyRate;
    const freelancerRatePerHour = hourlyRate - platformFeePerHour;

    return {
      contractAmount: hourlyRate,
      platformFee: platformFeePerHour,
      freelancerEarnings: freelancerRatePerHour,
      isHourly: contract.rate_type === 'hourly',
      estimatedHours: contract.offer?.estimated_hours
    };
  };

  const getContractDuration = () => {
    if (!contract?.started_at) return '0 days';

    try {
      const start = new Date(contract.started_at);
      const end = contract.ended_at ? new Date(contract.ended_at) : new Date();
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } catch (error) {
      return 'Invalid duration';
    }
  };

  const getQuickStats = () => {
    const amounts = calculateContractAmounts();
    const duration = getContractDuration();

    return [
      {
        title: 'Your Rate',
        value: amounts.isHourly ? `₹${amounts.freelancerEarnings.toFixed(2)}/hr` : `₹${amounts.freelancerEarnings.toFixed(2)}`,
        subtitle: amounts.isHourly
          ? `After ${contract?.platform_fee_percentage || 0}% platform fee`
          : 'Fixed price project',
        icon: DollarSign,
        iconColor: 'text-green-600',
        bgColor: 'from-green-50 to-green-100',
        borderColor: 'border-green-200',
        textColor: 'text-green-700'
      },
      {
        title: 'Client Rate',
        value: amounts.isHourly ? `₹${amounts.contractAmount.toFixed(2)}/hr` : `₹${amounts.contractAmount.toFixed(2)}`,
        subtitle: amounts.isHourly ? 'Hourly rate' : 'Total project value',
        icon: CreditCard,
        iconColor: 'text-blue-600',
        bgColor: 'from-blue-50 to-blue-100',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700'
      },
      {
        title: 'Duration',
        value: duration,
        subtitle: `Started ${formatDate(contract?.started_at)}`,
        icon: CalendarClock,
        iconColor: 'text-purple-600',
        bgColor: 'from-purple-50 to-purple-100',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700'
      },
      {
        title: 'Status',
        value: contract?.status || 'Unknown',
        subtitle: `Last updated ${formatDate(contract?.updated_at)}`,
        icon: Shield,
        iconColor: 'text-amber-600',
        bgColor: 'from-amber-50 to-amber-100',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700'
      }
    ];
  };

  const getTimelineEvents = () => {
    if (!contract) return [];

    const events = [];

    if (contract.created_at) {
      events.push({
        title: 'Contract Created',
        date: contract.created_at,
        description: 'Contract was created by client',
        icon: FilePlus,
        iconColor: 'text-gray-600',
        bgColor: 'bg-gray-100'
      });
    }

    if (contract.accepted_at) {
      events.push({
        title: 'Contract Accepted',
        date: contract.accepted_at,
        description: 'You accepted the contract',
        icon: CheckCircle,
        iconColor: 'text-green-600',
        bgColor: 'bg-green-100'
      });
    }

    if (contract.started_at) {
      events.push({
        title: 'Contract Started',
        date: contract.started_at,
        description: 'Work officially began',
        icon: FileCheck,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-100'
      });
    }

    if (contract.completed_at) {
      events.push({
        title: 'Contract Completed',
        date: contract.completed_at,
        description: 'Work was completed successfully',
        icon: Award,
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-100'
      });
    }

    if (contract.terminated_at) {
      events.push({
        title: 'Contract Terminated',
        date: contract.terminated_at,
        description: 'Contract was terminated',
        icon: XCircle,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-100'
      });
    }

    events.push({
      title: 'Current Status',
      date: contract.updated_at,
      description: `Status: ${contract.status}`,
      icon: Clock,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-100'
    });

    return events;
  };

  const getActionButtons = () => {
    if (!contract) return [];

    const actions = [];

    switch (contract.status) {
      case 'active':
        // Add tracking policy button if not accepted
        if (!contract?.tracking_required && contract?.tracking_policy !== null) {
          actions.push({
            label: 'Review Tracking Policy',
            onClick: () => setShowTrackingPolicy(true),
            icon: ShieldCheck,
            color: 'bg-blue-600 hover:bg-blue-700',
            disabled: actionLoading
          });
        }

        actions.push(
          {
            label: 'Submit Deliverable',
            onClick: submitDeliverable,
            icon: Upload,
            color: 'bg-indigo-600 hover:bg-indigo-700',
            disabled: actionLoading || (!contract?.tracking_required && contract?.tracking_policy !== null)
          },
          {
            label: 'Request Payment',
            onClick: requestPayment,
            icon: DollarSign,
            color: 'bg-green-600 hover:bg-green-700',
            disabled: actionLoading
          },
          {
            label: 'Raise Dispute',
            onClick: raiseDispute,
            icon: AlertTriangle,
            color: 'bg-orange-600 hover:bg-orange-700',
            disabled: actionLoading
          }
        );
        break;

      case 'completed':
        actions.push({
          label: 'Request Review',
          onClick: () => alert('Review request sent to client'),
          icon: Star,
          color: 'bg-indigo-600 hover:bg-indigo-700',
          fullWidth: true
        });
        break;

      case 'disputed':
        actions.push({
          label: 'Contact Support',
          onClick: () => router.push('/support'),
          icon: HelpCircle,
          color: 'bg-orange-600 hover:bg-orange-700',
          fullWidth: true
        });
        break;

      case 'pending':
        actions.push(
          {
            label: 'Accept Contract',
            onClick: () => handleContractAction('accept', 'accept', 'Are you sure you want to accept this contract?'),
            icon: CheckCircle,
            color: 'bg-green-600 hover:bg-green-700'
          },
          {
            label: 'Decline Contract',
            onClick: () => {
              const reason = prompt('Please provide a reason for declining (optional):');
              if (reason !== null) {
                handleContractAction('decline', 'decline', 'Are you sure you want to decline this contract? This action cannot be undone.');
              }
            },
            icon: XCircle,
            color: 'border border-red-300 text-red-600 hover:bg-red-50'
          }
        );
        break;
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">Error Loading Contract</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={fetchContract}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/contract-list')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Contracts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto text-center py-16">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Contract Not Found</h3>
          <p className="text-gray-500 mb-6">
            The contract you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => router.push('/contract-list')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View All Contracts
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(contract.status);
  const amounts = calculateContractAmounts();
  const quickStats = getQuickStats();
  const timelineEvents = getTimelineEvents();
  const actionButtons = getActionButtons();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/contract-list')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Contract #{contract.id}
                </h1>
                <p className="text-gray-600">{contract.project_title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig.color}`}>
                {statusConfig.icon}
                <span className="font-medium">{statusConfig.label}</span>
              </span>
              <button
                onClick={downloadContract}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download Contract"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setShowMessageInput(!showMessageInput)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Send Message"
              >
                <Send className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Tracking policy NOT accepted — warning banner */}
        {contract.status === 'active' &&
          !contract.tracking_required &&
          contract.tracking_policy !== null && (
            <div className="mb-4 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-yellow-50 text-yellow-800 border border-yellow-200">
              <div className="flex items-start gap-3 flex-1">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold">⚠ Work Tracking Policy Required</p>
                  <p className="text-sm mt-1">
                    You need to accept the work tracking policy to enable time tracking and deliverable submission features.
                    {contract.tracking_policy?.version && ` (Version ${contract.tracking_policy.version})`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTrackingPolicy(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <ShieldCheck className="w-4 h-4" />
                Review &amp; Accept Policy
              </button>
            </div>
          )}

        {/* Tracking policy accepted — success banner */}
        {contract.status === 'active' &&
          contract.tracking_required === true && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-800 border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">
                  ✓ Work Tracking Policy Accepted
                  {contract.tracking_policy?.version && ` (Version ${contract.tracking_policy.version})`}
                </span>
              </div>
            </div>
          )}

        {/* Message Input */}
        {showMessageInput && (
          <div className="mb-6 bg-white border rounded-xl p-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <textarea
                  placeholder="Type your message to the client..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500">
                  Click on the "Messages" tab to send messages
                </p>
                <button
                  onClick={() => {
                    setActiveTab('messages');
                    setShowMessageInput(false);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  Go to Messages
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl border mb-6">
          <div className="flex overflow-x-auto border-b">
            {['overview', 'financials', 'timeline', 'documents', 'messages'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {quickStats.map((stat, index) => (
                    <div key={index} className={`bg-gradient-to-br ${stat.bgColor} border ${stat.borderColor} rounded-xl p-5`}>
                      <div className="flex items-center justify-between mb-3">
                        <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                        <TrendingUp className="w-5 h-5 text-gray-500" />
                      </div>
                      <p className={`text-sm ${stat.textColor} mb-1`}>{stat.title}</p>
                      <p className={`text-xl font-bold ${stat.textColor.replace('700', '900')}`}>
                        {stat.value}
                      </p>
                      <p className={`text-xs ${stat.textColor} mt-1`}>
                        {stat.subtitle}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Project & Scope */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <Briefcase className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold">Project Details</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Project Title</p>
                        <p className="font-medium text-gray-900">{contract.project_title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Rate Type</p>
                        <p className="font-medium text-gray-900 capitalize">{contract.rate_type}</p>
                        {contract.rate_type === 'hourly' && (
                          <p className="text-sm text-gray-600 mt-1">
                            Hourly rate: ₹{contract.offer?.agreed_hourly_rate || '0.00'}/hour
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Termination Notice</p>
                        <p className="font-medium text-gray-900">
                          {contract.termination_notice_days || 7} day{contract.termination_notice_days !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Contract Duration</p>
                        <p className="font-medium text-gray-900">
                          {contract.duration_days ? `${contract.duration_days} days` : 'Ongoing'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold">Scope Summary</h3>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">
                        {contract.scope_summary || 'No scope description provided.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Parties Involved */}
                <div className="bg-white border rounded-xl p-5">
                  <h3 className="text-lg font-semibold mb-4">Parties Involved</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Client</p>
                          <p className="font-semibold text-gray-900">{contract.client_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => router.push(`/client/${contract.client_id}`)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          View Client Profile
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Freelancer</p>
                          <p className="font-semibold text-gray-900">{contract.freelancer_name}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        That's you!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financials Tab */}
            {activeTab === 'financials' && (
              <div className="space-y-6">
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-6">
                    {amounts.isHourly ? 'Hourly Rate Breakdown' : 'Payment Breakdown'}
                  </h3>
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <div className="flex justify-between items-center py-3 border-b">
                      <div className="flex items-center gap-3">
                        {amounts.isHourly ? (
                          <Clock className="w-5 h-5 text-gray-500" />
                        ) : (
                          <DollarSign className="w-5 h-5 text-gray-500" />
                        )}
                        <div>
                          <p className="font-medium">{amounts.isHourly ? 'Hourly Rate' : 'Contract Value'}</p>
                          <p className="text-sm text-gray-500">
                            {amounts.isHourly ? 'Rate agreed with client' : 'Fixed Price'}
                          </p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{amounts.contractAmount.toFixed(2)}
                        {amounts.isHourly && '/hour'}
                      </p>
                    </div>

                    {amounts.estimatedHours && amounts.isHourly && (
                      <div className="flex justify-between items-center py-3 border-b">
                        <div className="flex items-center gap-3">
                          <Clock3 className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium">Estimated Hours</p>
                            <p className="text-sm text-gray-500">Initial time estimate</p>
                          </div>
                        </div>
                        <p className="text-lg font-semibold">{amounts.estimatedHours} hours</p>
                      </div>
                    )}

                    {amounts.isHourly && contract.offer?.total_budget && (
                      <div className="flex justify-between items-center py-3 border-b">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium">Total Budget</p>
                            <p className="text-sm text-gray-500">Based on estimated hours</p>
                          </div>
                        </div>
                        <p className="text-lg font-semibold">₹{parseFloat(contract.offer.total_budget).toFixed(2)}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-3 border-b">
                      <div className="flex items-center gap-3">
                        <Percent className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Platform Fee</p>
                          <p className="text-sm text-gray-500">
                            {contract.platform_fee_percentage}% {amounts.isHourly ? 'per hour' : 'of contract value'}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-red-600">
                        -₹{amounts.platformFee.toFixed(2)}
                        {amounts.isHourly && '/hour'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center py-4 bg-green-50 rounded-lg px-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">
                            {amounts.isHourly ? 'Your Net Hourly Rate' : 'Your Net Earnings'}
                          </p>
                          <p className="text-sm text-green-600">
                            {amounts.isHourly ? "Amount you'll earn per hour" : "Amount you'll receive"}
                          </p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        ₹{amounts.freelancerEarnings.toFixed(2)}
                        {amounts.isHourly && '/hour'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Schedule */}
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-6">Payment Schedule</h3>
                  <div className="space-y-4">
                    {amounts.isHourly ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium">Hourly Rate</p>
                              <p className="text-sm text-gray-500">Paid weekly for logged hours</p>
                            </div>
                          </div>
                          <p className="text-lg font-bold">₹{amounts.freelancerEarnings.toFixed(2)}/hour</p>
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                          You will receive payments weekly based on approved timesheets
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckSquare className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium">Fixed Payment</p>
                            <p className="text-sm text-gray-500">Upon client approval of deliverables</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold">₹{amounts.freelancerEarnings.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-6">Contract Timeline</h3>
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-8">
                      {timelineEvents.map((event, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className={`w-12 h-12 ${event.bgColor} rounded-full flex items-center justify-center flex-shrink-0 relative`}>
                            <event.icon className={`w-6 h-6 ${event.iconColor}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                            <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="bg-white border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Contract Documents</h3>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Document
                    </button>
                  </div>

                  <FolderManager
                    folders={folders}
                    documents={documents}
                    onCreateFolder={handleCreateFolder}
                    onFolderClick={handleFolderClick}
                  />

                  <DocumentList
                    documents={documents}
                    folders={folders}
                    onPreview={setPreviewDocument}
                    onDownload={handleDownload}
                    onDelete={handleDeleteDocument}
                  />
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <ContractMessages
                contractId={id}
                contract={contract}
                apiPrivate={apiPrivate}
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white border rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Contract Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actionButtons.length > 0 ? (
              actionButtons.map((button, index) => (
                <button
                  key={index}
                  onClick={button.onClick}
                  disabled={button.disabled}
                  className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg transition-colors ${button.color} ${button.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${button.fullWidth ? 'col-span-3' : ''}`}
                >
                  {button.icon && <button.icon className="w-5 h-5" />}
                  <span className="font-medium">{button.label}</span>
                </button>
              ))
            ) : (
              <div className="col-span-3 text-center py-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-full">
                  <Info className="w-5 h-5" />
                  <span className="font-medium">No actions available for this contract status</span>
                </div>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Need assistance?{' '}
            <a href="/freelancer/support" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Contact our freelancer support team
            </a>
          </p>
        </div>

        {/* Footer Notes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">FreelancerHub Protection &amp; Benefits</h4>
              <p className="text-sm text-blue-700">
                As a freelancer, you're protected by FreelancerHub's secure payment system, dispute resolution process,
                and guaranteed payments. All contracts include milestone tracking and payment protection.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-blue-600">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Payment Protection
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Dedicated Support
                </span>
                <span className="flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Milestone Management
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Legal Protection
                </span>
                <span className="flex items-center gap-1">
                  <Wallet className="w-3 h-3" />
                  Guaranteed Payments
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <DocumentUpload
          folders={folders}
          onUpload={handleUploadDocument}
          onClose={() => setShowUploadModal(false)}
          maxSizeMB={10}
        />
      )}

      {previewDocument && (
        <DocumentPreview
          document={previewDocument}
          onDownload={handleDownload}
          onDelete={handleDeleteDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}

      {/* ✅ Tracking Policy Modal */}
      {showTrackingPolicy && (
        <TrackingPolicyModal
          contractId={id}
          onAccept={() => {
            handleTrackingPolicyAccepted();
            setShowTrackingPolicy(false);
          }}
          onReject={() => {
            handleTrackingPolicyRejected();
            setShowTrackingPolicy(false);
          }}
          onClose={() => setShowTrackingPolicy(false)}
          apiPrivate={apiPrivate}
        />
      )}
    </div>
  );
}