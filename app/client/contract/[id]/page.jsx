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

export default function ClientContractDetailPage() {
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
      const res = await apiPrivate.get(`/contracts/${id}/`);
      setContract(res.data);
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError('Failed to load contract details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await apiPrivate.get(`/contracts/${id}/documents/`);
      setDocuments(res.data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await apiPrivate.get(`/contracts/${id}/documents-folders/`);
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

    const res = await apiPrivate.post(`/contracts/${id}/documents/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setDocuments(prev => [res.data, ...prev]);
    setShowUploadModal(false);
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
      await apiPrivate.delete(`/contracts/${contract.id}/documents/${documentId}/`);
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
    const res = await apiPrivate.post(`/contracts/${id}/documents-folders/`, {
      name: folderName
    });
    setFolders(prev => [...prev, res.data]);
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
  };

  const handleContractAction = async (action, endpoint, confirmationMessage, successCallback) => {
    if (!confirm(confirmationMessage)) return;
    
    setActionLoading(true);
    try {
      await apiPrivate.post(`/contracts/${id}/${endpoint}/`);
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
      await apiPrivate.post(`/contracts/${id}/${endpoint}/`, { 
        [action === 'terminate' ? 'reason' : 'issue']: input 
      });
      fetchContract();
      if (successCallback) successCallback();
    } catch (err) {
      alert(`Unable to ${action} contract. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const markCompleted = () => handleContractAction(
    'mark as completed',
    'complete',
    'Are you sure you want to mark this contract as completed? This will release payment to the freelancer.'
  );

  const terminateContract = () => handleActionWithInput(
    'terminate',
    'terminate',
    'Please enter the reason for termination:',
    'Are you sure you want to terminate this contract? This action cannot be undone.'
  );

  const raiseDispute = () => handleActionWithInput(
    'raise dispute for',
    'dispute',
    'Please describe the issue that requires dispute resolution:',
    'Are you sure you want to raise a dispute? This will pause all payments and require platform intervention.'
  );

  const downloadContract = () => {
    alert('Contract download feature would be implemented here.');
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
      releasedAt: contract.escrow_payment.released_at || null,
      refundedAt: contract.escrow_payment.refunded_at || null
    };
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

  const getEscrowStatusBadge = (escrowData) => {
    if (!escrowData) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          <Info className="w-3 h-3" />
          No Escrow
        </span>
      );
    }

    const statusConfig = {
      escrowed: { 
        bg: 'bg-green-100 text-green-700 border-green-200', 
        icon: <Shield className="w-3 h-3" />,
        label: 'Funds Escrowed' 
      },
      released: { 
        bg: 'bg-blue-100 text-blue-700 border-blue-200', 
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Funds Released' 
      },
      refunded: { 
        bg: 'bg-orange-100 text-orange-700 border-orange-200', 
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Funds Refunded' 
      },
      pending: { 
        bg: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
        icon: <Clock className="w-3 h-3" />,
        label: 'Payment Pending' 
      }
    };

    const config = statusConfig[escrowData.status] || {
      bg: 'bg-gray-100 text-gray-600 border-gray-200',
      icon: <Info className="w-3 h-3" />,
      label: escrowData.status
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
        {config.icon}
        {config.label}
      </span>
    );
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
        totalCost: 0,
        escrowAmount: 0
      };
    }
    
    const offerData = getOfferData(contract);
    const escrowData = getEscrowData(contract);
    
    // Primary amount from escrow or offer
    let contractAmount = 0;
    if (escrowData?.amount) {
      contractAmount = parseFloat(escrowData.amount);
    } else if (offerData?.totalBudget) {
      contractAmount = parseFloat(offerData.totalBudget);
    } else if (offerData?.hourlyRate && offerData?.estimatedHours) {
      contractAmount = parseFloat(offerData.hourlyRate) * parseFloat(offerData.estimatedHours);
    } else if (offerData?.hourlyRate) {
      contractAmount = parseFloat(offerData.hourlyRate);
    }
    
    const feePercentage = parseFloat(contract.platform_fee_percentage) || 0;
    const platformFee = (feePercentage / 100) * contractAmount;
    const totalCost = contractAmount + platformFee;
    
    return {
      contractAmount,
      platformFee,
      totalCost,
      escrowAmount: escrowData?.amount ? parseFloat(escrowData.amount) : 0
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
    const offerData = getOfferData(contract);
    const escrowData = getEscrowData(contract);
    
    return [
      {
        title: 'Escrow Amount',
        value: escrowData?.amount ? formatMoney(escrowData.amount) : 'No Escrow',
        subtitle: escrowData?.status || 'Not funded',
        icon: Shield,
        iconColor: 'text-purple-600',
        bgColor: 'from-purple-50 to-purple-100',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700'
      },
      {
        title: 'Duration',
        value: duration,
        subtitle: `Started ${formatDate(contract?.started_at).split(',')[0]}`,
        icon: CalendarClock,
        iconColor: 'text-green-600',
        bgColor: 'from-green-50 to-green-100',
        borderColor: 'border-green-200',
        textColor: 'text-green-700'
      },
      {
        title: 'Hourly Rate',
        value: offerData?.hourlyRate ? formatMoney(offerData.hourlyRate) + '/hr' : 'N/A',
        subtitle: `${offerData?.rateType || 'unknown'} rate`,
        icon: CreditCard,
        iconColor: 'text-blue-600',
        bgColor: 'from-blue-50 to-blue-100',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700'
      },
      {
        title: 'Status',
        value: contract?.status || 'Unknown',
        subtitle: `Last updated ${formatDate(contract?.updated_at).split(',')[0]}`,
        icon: Award,
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
    const escrowData = getEscrowData(contract);
    
    if (contract.created_at) {
      events.push({
        title: 'Contract Created',
        date: contract.created_at,
        description: 'Contract was created and sent to freelancer',
        icon: FilePlus,
        iconColor: 'text-gray-600',
        bgColor: 'bg-gray-100'
      });
    }
    
    if (contract.offer?.created_at) {
      events.push({
        title: 'Offer Made',
        date: contract.offer.created_at,
        description: `${contract.offer.rate_type} rate offer created`,
        icon: FileText,
        iconColor: 'text-indigo-600',
        bgColor: 'bg-indigo-100'
      });
    }
    
    if (escrowData?.escrowedAt) {
      events.push({
        title: 'Funds Escrowed',
        date: escrowData.escrowedAt,
        description: `${formatMoney(escrowData.amount)} secured in escrow`,
        icon: Shield,
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-100'
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
        iconColor: 'text-green-600',
        bgColor: 'bg-green-100'
      });
    }
    
    if (escrowData?.releasedAt) {
      events.push({
        title: 'Payment Released',
        date: escrowData.releasedAt,
        description: 'Escrow funds released to freelancer',
        icon: CheckCircle,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-100'
      });
    }
    
    if (escrowData?.refundedAt) {
      events.push({
        title: 'Payment Refunded',
        date: escrowData.refundedAt,
        description: 'Escrow funds refunded to client',
        icon: AlertCircle,
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-100'
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
    
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getActionButtons = () => {
    if (!contract) return [];
    
    const actions = [];
    
    switch (contract.status) {
      case 'active':
        actions.push(
          {
            label: 'Mark Completed',
            onClick: markCompleted,
            icon: CheckCircle,
            color: 'bg-green-600 hover:bg-green-700 text-white',
            disabled: actionLoading
          },
          {
            label: 'Terminate',
            onClick: terminateContract,
            icon: XSquare,
            color: 'bg-red-600 hover:bg-red-700 text-white',
            disabled: actionLoading
          },
          {
            label: 'Raise Dispute',
            onClick: raiseDispute,
            icon: AlertTriangle,
            color: 'bg-orange-600 hover:bg-orange-700 text-white',
            disabled: actionLoading
          }
        );
        break;
        
      case 'completed':
        actions.push({
          label: 'Leave a Review',
          onClick: () => router.push(`/review/${contract.freelancer_id}`),
          icon: Star,
          color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          fullWidth: true
        });
        break;
        
      case 'disputed':
        actions.push({
          label: 'Contact Support',
          onClick: () => router.push('/support'),
          icon: HelpCircle,
          color: 'bg-orange-600 hover:bg-orange-700 text-white',
          fullWidth: true
        });
        break;
        
      case 'pending':
        actions.push(
          {
            label: 'Send Reminder',
            onClick: () => {},
            icon: Bell,
            color: 'bg-indigo-600 hover:bg-indigo-700 text-white'
          },
          {
            label: 'Edit Contract',
            onClick: () => {},
            icon: Edit,
            color: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          },
          {
            label: 'Cancel Offer',
            onClick: () => {},
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
                onClick={() => router.push('/client/contract')}
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
            onClick={() => router.push('/client/contract')}
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
  const offerData = getOfferData(contract);
  const escrowData = getEscrowData(contract);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/client/contract')}
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
            <div className="flex items-center gap-3 flex-wrap">
              {getEscrowStatusBadge(escrowData)}
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
        {/* Message Input */}
        {showMessageInput && (
          <div className="mb-6 bg-white border rounded-xl p-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <textarea
                  placeholder="Type your message to the freelancer..."
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

                {/* Escrow Information Card */}
                {escrowData && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-purple-900 mb-2">Escrow Protection Active</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-purple-700">Amount Secured</p>
                            <p className="text-xl font-bold text-purple-900">{formatMoney(escrowData.amount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-purple-700">Status</p>
                            <p className="text-lg font-semibold text-purple-900 capitalize">{escrowData.status}</p>
                          </div>
                          <div>
                            <p className="text-sm text-purple-700">Escrowed On</p>
                            <p className="text-sm font-medium text-purple-900">{formatDate(escrowData.escrowedAt).split(',')[0]}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                      {offerData && (
                        <>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Rate Type</p>
                            <p className="font-medium text-gray-900 capitalize">{offerData.rateType}</p>
                          </div>
                          {offerData.hourlyRate && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Hourly Rate</p>
                              <p className="font-medium text-gray-900">{formatMoney(offerData.hourlyRate)}/hour</p>
                            </div>
                          )}
                          {offerData.estimatedHours && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Estimated Hours</p>
                              <p className="font-medium text-gray-900">{offerData.estimatedHours} hours</p>
                            </div>
                          )}
                          {offerData.totalBudget && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Total Budget</p>
                              <p className="font-medium text-gray-900">{formatMoney(offerData.totalBudget)}</p>
                            </div>
                          )}
                        </>
                      )}
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Termination Notice</p>
                        <p className="font-medium text-gray-900">
                          {contract.termination_notice_days || 7} day{contract.termination_notice_days !== 1 ? 's' : ''}
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
                      <div className="text-sm text-gray-600">
                        That's you!
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Freelancer</p>
                          <p className="font-semibold text-gray-900">Freelancer (ID: {contract.freelancer || 'N/A'})</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => router.push(`/freelancer/${contract.freelancer}`)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          View Profile
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financials Tab */}
            {activeTab === 'financials' && (
              <div className="space-y-6">
                {/* Escrow Summary */}
                {escrowData && (
                  <div className="bg-white border rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-6">Escrow Summary</h3>
                    <div className="space-y-4 max-w-2xl mx-auto">
                      <div className="flex justify-between items-center py-3 border-b">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="font-medium">Escrowed Amount</p>
                            <p className="text-sm text-gray-500">Funds secured in escrow</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-purple-600">
                          {formatMoney(escrowData.amount)}
                        </p>
                      </div>

                      <div className="flex justify-between items-center py-3 border-b">
                        <div className="flex items-center gap-3">
                          <Info className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium">Escrow Status</p>
                            <p className="text-sm text-gray-500">Current state</p>
                          </div>
                        </div>
                        <p className="text-lg font-semibold capitalize">{escrowData.status}</p>
                      </div>

                      {escrowData.escrowedAt && (
                        <div className="flex justify-between items-center py-3 border-b">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="font-medium">Escrowed On</p>
                              <p className="text-sm text-gray-500">Payment secured date</p>
                            </div>
                          </div>
                          <p className="text-sm">{formatDate(escrowData.escrowedAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Breakdown */}
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-6">Payment Breakdown</h3>
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <div className="flex justify-between items-center py-3 border-b">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Contract Value</p>
                          <p className="text-sm text-gray-500">
                            {offerData?.rateType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                          </p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {formatMoney(amounts.contractAmount)}
                        {offerData?.rateType === 'hourly' && '/hour'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b">
                      <div className="flex items-center gap-3">
                        <Percent className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Platform Fee</p>
                          <p className="text-sm text-gray-500">
                            {contract.platform_fee_percentage}% of contract value
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-red-600">+{formatMoney(amounts.platformFee)}</p>
                    </div>

                    <div className="flex justify-between items-center py-4 bg-blue-50 rounded-lg px-4">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-800">Total Cost to You</p>
                          <p className="text-sm text-blue-600">
                            Amount you'll pay
                          </p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">{formatMoney(amounts.totalCost)}</p>
                    </div>
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
                          <div className={`w-12 h-12 ${event.bgColor} rounded-full flex items-center justify-center flex-shrink-0 relative z-10`}>
                            <event.icon className={`w-6 h-6 ${event.iconColor}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {event.description}
                            </p>
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
            <a href="/client/support" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Contact our client support team
            </a>
          </p>
        </div>

        {/* Footer Notes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Escrow Protection & Client Benefits</h4>
              <p className="text-sm text-blue-700 mb-3">
                Your payment is secured in escrow and will only be released upon successful completion of work. 
                This protects both you and the freelancer throughout the contract lifecycle.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-blue-600">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Escrow Protection
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  24/7 Support
                </span>
                <span className="flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Milestone Tracking
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Legal Protection
                </span>
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  Dispute Resolution
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
    </div>
  );
}