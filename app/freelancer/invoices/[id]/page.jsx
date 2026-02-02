// app/freelancer/invoices/[id]/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Printer,
  Share2,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  User,
  Building,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Tag,
  Hash,
  Send,
  Trash2,
  Eye,
  Copy,
  Users,
  Percent,
  Wallet,
  FileSpreadsheet,
  Package,
  Layers,
  Banknote,
  Receipt,
  QrCode,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Smartphone,
  MessageSquare,
  FileSignature
} from "lucide-react";

const FreelancerInvoiceDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiPrivate.get(`/invoices/${id}/`);
      setInvoice(response.data);
      
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setError(err.response?.data?.detail || "Invoice not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const handleCSVDownload = () => {
    if (!invoice) return;
    
    try {
      setProcessingAction("download-csv");
      
      const csvContent = [
        ['Freelancer Invoice Summary', '', '', ''],
        ['Invoice Number', invoice.invoice_number],
        ['Status', invoice.status],
        ['Issued Date', formatDate(invoice.issued_at)],
        ['Total Amount', invoice.total_gross],
        ['Platform Fee', invoice.platform_fee],
        ['Your Earnings', invoice.total_net],
        ['Invoice ID', invoice.id]
      ];

      const csv = csvContent.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoice_number}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error("CSV download error:", err);
      alert("Failed to generate CSV");
    } finally {
      setProcessingAction(null);
    }
  };

  const handlePDFDownload = async () => {
    if (!invoice) return;
    
    try {
      setProcessingAction("download-pdf");
      
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Simple PDF content
      doc.setFontSize(16);
      doc.text('Invoice Summary', 20, 20);
      
      doc.setFontSize(10);
      doc.text(`Invoice #: ${invoice.invoice_number}`, 20, 30);
      doc.text(`Date: ${formatDate(invoice.issued_at)}`, 20, 35);
      doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 40);
      
      doc.setFontSize(12);
      doc.text('Financial Summary', 20, 50);
      doc.text(`Total: ${formatCurrency(invoice.total_gross)}`, 20, 58);
      doc.text(`Fee: -${formatCurrency(invoice.platform_fee)}`, 20, 65);
      doc.setFont('helvetica', 'bold');
      doc.text(`You Receive: ${formatCurrency(invoice.total_net)}`, 20, 72);
      
      doc.save(`invoice-${invoice.invoice_number}.pdf`);
      
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to generate PDF");
    } finally {
      setProcessingAction(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendReminder = async () => {
    if (!invoice) return;
    
    try {
      setProcessingAction("send-reminder");
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Payment reminder sent!');
    } catch (err) {
      alert("Failed to send reminder");
    } finally {
      setProcessingAction(null);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      paid: {
        color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        icon: CheckCircle,
        label: "Paid"
      },
      issued: {
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: FileText,
        label: "Issued"
      },
      pending: {
        color: "bg-amber-100 text-amber-800 border border-amber-200",
        icon: Clock,
        label: "Pending"
      },
      overdue: {
        color: "bg-rose-100 text-rose-800 border border-rose-200",
        icon: AlertCircle,
        label: "Overdue"
      },
      draft: {
        color: "bg-gray-100 text-gray-800 border border-gray-200",
        icon: FileText,
        label: "Draft"
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border border-red-200",
        icon: XCircle,
        label: "Cancelled"
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

  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-6"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading Invoice
            </h3>
            <p className="text-gray-600">
              Getting your details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/freelancer/invoices"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </Link>
          
          <div className="bg-white rounded-xl border border-red-200 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-500 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Invoice Not Found
                </h3>
                <p className="text-gray-700 mb-4">
                  {error || "This invoice doesn't exist in your account"}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={fetchInvoice}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg"
                  >
                    Try Again
                  </button>
                  <Link
                    href="/freelancer/invoices"
                    className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
                  >
                    View All Invoices
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate fee percentage
  const feePercentage = ((parseFloat(invoice.platform_fee) / parseFloat(invoice.total_gross)) * 100).toFixed(1);
  const earningsPercentage = ((parseFloat(invoice.total_net) / parseFloat(invoice.total_gross)) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/freelancer/invoices"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Invoice #{invoice.invoice_number}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(invoice.status)}
                  <span className="text-sm text-gray-600">
                    {formatDate(invoice.issued_at)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchInvoice}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                <button
                  onClick={handleSendReminder}
                  disabled={processingAction === "send-reminder"}
                  className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 font-medium rounded-lg disabled:opacity-50"
                >
                  {processingAction === "send-reminder" ? "Sending..." : "Remind"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-6">
            {/* Earnings Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Your Earnings</h3>
                    <p className="text-sm text-gray-600">Net amount after fees</p>
                  </div>
                  <Wallet className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl sm:text-4xl font-bold text-emerald-700 mb-2">
                    {formatCurrency(invoice.total_net)}
                  </div>
                  <p className="text-gray-600">
                    from total of {formatCurrency(invoice.total_gross)}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg">
                        <Receipt className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Invoice Total</p>
                        <p className="font-medium text-gray-900">{formatCurrency(invoice.total_gross)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">100%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg">
                        <Percent className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Platform Fee</p>
                        <p className="font-medium text-gray-900">-{formatCurrency(invoice.platform_fee)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{feePercentage}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg">
                        <Wallet className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Your Earnings</p>
                        <p className="font-bold text-emerald-700">{formatCurrency(invoice.total_net)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emerald-600">{earningsPercentage}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Details Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Invoice Details</h3>
                  <button
                    onClick={() => setShowMoreDetails(!showMoreDetails)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    {showMoreDetails ? 'Show Less' : 'Show More'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showMoreDetails ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Hash className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Invoice Number</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Issued Date</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(invoice.issued_at)}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Currency</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{invoice.currency}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Freelancer</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{invoice.freelancer_name}</p>
                  </div>
                </div>
                
                {showMoreDetails && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Additional Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Layers className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">Payout Batch ID</span>
                        </div>
                        <p className="font-semibold text-gray-900">{invoice.payout_batch_id || 'Not assigned'}</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">Created At</span>
                        </div>
                        <p className="font-semibold text-gray-900">{formatDate(invoice.created_at)}</p>
                      </div>
                    </div>
                    
                    {/* Invoice ID Section */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">Invoice Reference ID</h5>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-white px-3 py-2 rounded text-sm text-gray-800 font-mono truncate">
                          {invoice.id}
                        </code>
                        <button
                          onClick={() => copyToClipboard(invoice.id)}
                          className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm font-medium"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Timeline */}
          <div className="lg:w-96 space-y-6">
            {/* Actions Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Actions</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={handlePDFDownload}
                    disabled={processingAction === 'download-pdf'}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg disabled:opacity-50"
                  >
                    {processingAction === 'download-pdf' ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                    {processingAction === 'download-pdf' ? 'Generating...' : 'Download PDF'}
                  </button>
                  
                  <button
                    onClick={handleCSVDownload}
                    disabled={processingAction === 'download-csv'}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 font-medium rounded-lg disabled:opacity-50"
                  >
                    {processingAction === 'download-csv' ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-5 h-5" />
                    )}
                    {processingAction === 'download-csv' ? 'Generating...' : 'Download CSV'}
                  </button>
                  
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
                  >
                    <Printer className="w-5 h-5" />
                    Print Copy
                  </button>
                  
                  <button
                    onClick={() => copyToClipboard(`Invoice ${invoice.invoice_number} - ${formatCurrency(invoice.total_gross)}`)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg"
                  >
                    <Share2 className="w-5 h-5" />
                    Share Details
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Status Timeline</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <TimelineStep
                    title="Invoice Created"
                    description="Invoice was generated"
                    date={formatDate(invoice.created_at)}
                    completed={true}
                  />
                  
                  <TimelineStep
                    title="Invoice Issued"
                    description="Sent to client"
                    date={formatDate(invoice.issued_at)}
                    completed={['issued', 'pending', 'overdue', 'paid'].includes(invoice.status)}
                    current={invoice.status === 'issued'}
                  />
                  
                  <TimelineStep
                    title="Awaiting Payment"
                    description="Waiting for client payment"
                    date={invoice.due_date ? `Due: ${formatDate(invoice.due_date)}` : "No due date"}
                    completed={['paid'].includes(invoice.status)}
                    current={['pending', 'overdue'].includes(invoice.status)}
                    warning={invoice.status === 'overdue'}
                  />
                  
                  <TimelineStep
                    title="Payment Received"
                    description="Client has paid"
                    date="Not yet"
                    completed={invoice.status === 'paid'}
                    current={false}
                  />
                  
                  <TimelineStep
                    title="Amount Credited"
                    description="Transferred to your account"
                    date={invoice.payout_batch_id ? "Processed" : "Pending"}
                    completed={!!invoice.payout_batch_id}
                    current={invoice.status === 'paid' && !invoice.payout_batch_id}
                  />
                </div>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Quick Info</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg">
                        <Percent className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fee Rate</p>
                        <p className="font-medium text-gray-900">{feePercentage}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium text-amber-600">
                        {formatCurrency(invoice.platform_fee)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Your Share</p>
                        <p className="font-medium text-gray-900">{earningsPercentage}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Earnings</p>
                      <p className="font-medium text-emerald-600">
                        {formatCurrency(invoice.total_net)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineStep = ({ title, description, date, completed, current, warning = false }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="relative flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          completed ? 'bg-emerald-100' : 
          current ? 'bg-blue-100' : 
          warning ? 'bg-rose-100' : 
          'bg-gray-100'
        }`}>
          {completed ? (
            <CheckCircle className={`w-4 h-4 ${warning ? 'text-rose-600' : 'text-emerald-600'}`} />
          ) : (
            <div className={`w-3 h-3 rounded-full ${
              current ? 'bg-blue-600 animate-pulse' : 
              warning ? 'bg-rose-600' : 
              'bg-gray-400'
            }`}></div>
          )}
        </div>
        {!completed && !current && (
          <div className="absolute top-8 bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-200"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${
          completed ? 'text-emerald-700' : 
          current ? 'text-blue-700' : 
          warning ? 'text-rose-700' : 
          'text-gray-700'
        }`}>
          {title}
        </p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{date}</p>
      </div>
    </div>
  );
};

export default FreelancerInvoiceDetailPage;