// app/admin/invoices/[id]/page.jsx
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
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Receipt,
  Tag,
  Hash,
  FileEdit,
  Send,
  Archive,
  Trash2,
  Eye,
  Copy,
  ExternalLink,
  Users,
  Percent,
  Wallet,
  FileSpreadsheet,
  Package,
  Layers,
  BarChart
} from "lucide-react";

const AdminInvoiceDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);

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

  // Direct CSV Download
  const handleCSVDownload = () => {
    if (!invoice) return;
    
    try {
      setProcessingAction("download-csv");
      
      // Create CSV content
      const csvContent = [
        ['Invoice Details', '', '', ''],
        ['Invoice Number', invoice.invoice_number],
        ['Status', invoice.status],
        ['Issued Date', formatDate(invoice.issued_at)],
        ['Created Date', formatDate(invoice.created_at)],
        ['Currency', invoice.currency],
        ['', ''],
        ['Financial Summary', '', '', ''],
        ['Total Gross', invoice.total_gross],
        ['Platform Fee', invoice.platform_fee],
        ['Total Net', invoice.total_net],
        ['', ''],
        ['Additional Information', '', '', ''],
        ['Payout Batch ID', invoice.payout_batch_id || 'N/A'],
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

  // Direct PDF Download using jsPDF
  const handlePDFDownload = async () => {
    if (!invoice) return;
    
    try {
      setProcessingAction("download-pdf");
      
      // Dynamically import jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Add invoice details
      doc.setFontSize(20);
      doc.text('INVOICE', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Invoice Number: ${invoice.invoice_number}`, 20, 40);
      doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 50);
      doc.text(`Issued Date: ${formatDate(invoice.issued_at)}`, 20, 60);
      doc.text(`Created Date: ${formatDate(invoice.created_at)}`, 20, 70);
      
      // Add financial summary
      doc.setFontSize(14);
      doc.text('Financial Summary', 20, 90);
      
      doc.setFontSize(12);
      doc.text(`Total Gross: ${formatCurrency(invoice.total_gross)}`, 20, 105);
      doc.text(`Platform Fee: ${formatCurrency(invoice.platform_fee)}`, 20, 115);
      doc.text(`Total Net: ${formatCurrency(invoice.total_net)}`, 20, 125);
      
      // Add additional info
      if (invoice.payout_batch_id) {
        doc.text(`Payout Batch: ${invoice.payout_batch_id}`, 20, 140);
      }
      
      doc.text(`Currency: ${invoice.currency}`, 20, 150);
      
      // Save the PDF
      doc.save(`invoice-${invoice.invoice_number}.pdf`);
      
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setProcessingAction(null);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-title { font-size: 24px; font-weight: bold; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .info-item { margin-bottom: 8px; }
          .info-label { font-weight: bold; color: #666; }
          .info-value { color: #333; }
          .financial-summary { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
          .amount { font-size: 18px; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="invoice-title">INVOICE</div>
          <div>${invoice.invoice_number}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Invoice Details</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Invoice Number:</div>
              <div class="info-value">${invoice.invoice_number}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status:</div>
              <div class="info-value">${invoice.status.toUpperCase()}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Issued Date:</div>
              <div class="info-value">${formatDate(invoice.issued_at)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Created Date:</div>
              <div class="info-value">${formatDate(invoice.created_at)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Currency:</div>
              <div class="info-value">${invoice.currency}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Financial Summary</div>
          <div class="financial-summary">
            <div style="margin-bottom: 10px;">
              <span>Total Gross:</span>
              <span class="amount" style="float: right;">${formatCurrency(invoice.total_gross)}</span>
            </div>
            <div style="margin-bottom: 10px;">
              <span>Platform Fee:</span>
              <span style="float: right;">${formatCurrency(invoice.platform_fee)}</span>
            </div>
            <div style="margin-bottom: 10px;">
              <span>Total Net:</span>
              <span class="amount" style="float: right;">${formatCurrency(invoice.total_net)}</span>
            </div>
            ${invoice.payout_batch_id ? `
            <div style="margin-bottom: 10px;">
              <span>Payout Batch ID:</span>
              <span style="float: right;">${invoice.payout_batch_id}</span>
            </div>
            ` : ''}
          </div>
        </div>
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p>Invoice ID: ${invoice.id}</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const getStatusBadge = (status) => {
    const config = {
      paid: {
        color: "bg-gradient-to-r from-emerald-500 to-green-500 text-white",
        icon: CheckCircle,
        label: "Paid"
      },
      issued: {
        color: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white",
        icon: FileText,
        label: "Issued"
      },
      pending: {
        color: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
        icon: Clock,
        label: "Pending"
      },
      overdue: {
        color: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
        icon: AlertCircle,
        label: "Overdue"
      },
      draft: {
        color: "bg-gradient-to-r from-gray-500 to-slate-500 text-white",
        icon: FileText,
        label: "Draft"
      },
      cancelled: {
        color: "bg-gradient-to-r from-red-500 to-rose-500 text-white",
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
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
              <FileText className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading Invoice Details
            </h3>
            <p className="text-gray-600">
              Please wait while we fetch the invoice information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/admin/invoices"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Invoices
          </Link>
          
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <AlertCircle className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Unable to Load Invoice
                </h3>
                <p className="text-gray-700 mb-4">
                  {error || "Invoice not found"}
                </p>
                <button
                  onClick={fetchInvoice}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Floating Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/invoices"
                  className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 rounded-xl transition-all duration-200 shadow-sm group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </Link>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    Invoice Details
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {getStatusBadge(invoice.status)}
                    <span className="text-sm text-gray-500">
                      {invoice.invoice_number}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchInvoice}
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
          {/* Left Column - Invoice Details */}
          <div className="flex-1 space-y-6">
            {/* Invoice Overview Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Invoice Overview</h3>
                      <p className="text-sm text-gray-600">
                        Complete invoice information
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(invoice.total_gross)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Financial Summary */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    Financial Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Gross</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(invoice.total_gross)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <Percent className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Platform Fee</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(invoice.platform_fee)}
                          </p>
                          <p className="text-xs text-amber-600 mt-1">
                            {((parseFloat(invoice.platform_fee) / parseFloat(invoice.total_gross)) * 100).toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Wallet className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Net</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(invoice.total_net)}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Paid to freelancer
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Details Grid */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailCard
                      icon={Hash}
                      title="Invoice Number"
                      value={invoice.invoice_number}
                      copyable={true}
                    />
                    
                    <DetailCard
                      icon={Tag}
                      title="Status"
                      value={getStatusBadge(invoice.status)}
                      isComponent={true}
                    />
                    
                    <DetailCard
                      icon={Calendar}
                      title="Issued Date"
                      value={formatDate(invoice.issued_at)}
                    />
                    
                    <DetailCard
                      icon={Calendar}
                      title="Created Date"
                      value={formatDate(invoice.created_at)}
                    />
                    
                    <DetailCard
                      icon={CreditCard}
                      title="Currency"
                      value={invoice.currency}
                    />
                    
                    {invoice.payout_batch_id && (
                      <DetailCard
                        icon={Layers}
                        title="Payout Batch ID"
                        value={invoice.payout_batch_id}
                        copyable={true}
                      />
                    )}
                  </div>
                </div>

                {/* Invoice ID Section */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Invoice ID</h5>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-800 font-mono truncate">
                      {invoice.id}
                    </code>
                    <button
                      onClick={() => copyToClipboard(invoice.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Financial Breakdown
                </h4>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Total Gross Amount</p>
                      <p className="text-sm text-gray-600">Total invoice amount before fees</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(invoice.total_gross)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div>
                      <p className="font-medium text-gray-900">Platform Fee</p>
                      <p className="text-sm text-gray-600">Service fee deducted</p>
                    </div>
                    <p className="text-xl font-bold text-amber-700">
                      -{formatCurrency(invoice.platform_fee)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div>
                      <p className="font-medium text-gray-900">Net Amount</p>
                      <p className="text-sm text-gray-600">Amount paid to freelancer</p>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(invoice.total_net)}
                    </p>
                  </div>
                </div>
                
                {/* Fee Percentage */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Platform Fee Percentage</span>
                    <span className="font-bold text-blue-700">
                      {((parseFloat(invoice.platform_fee) / parseFloat(invoice.total_gross)) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${(parseFloat(invoice.platform_fee) / parseFloat(invoice.total_gross)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="lg:w-80 space-y-6">
            {/* Action Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Export & Print</h3>
              </div>
              
              <div className="p-5">
                <div className="space-y-3">
                  <button
                    onClick={handlePDFDownload}
                    disabled={processingAction === 'download-pdf'}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 group"
                  >
                    {processingAction === 'download-pdf' ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                    {processingAction === 'download-pdf' ? 'Generating PDF...' : 'Download PDF'}
                  </button>
                  
                  <button
                    onClick={handleCSVDownload}
                    disabled={processingAction === 'download-csv'}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 group"
                  >
                    {processingAction === 'download-csv' ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                    {processingAction === 'download-csv' ? 'Generating CSV...' : 'Download CSV'}
                  </button>
                  
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 font-medium rounded-xl transition-all duration-200 shadow-sm group"
                  >
                    <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Print Invoice
                  </button>
                  
                  <button
                    onClick={() => copyToClipboard(invoice.id)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 shadow-sm group"
                  >
                    <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Copy Invoice ID
                  </button>
                </div>
              </div>
            </div>

            {/* Invoice Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Quick Info</h3>
              </div>
              
              <div className="p-5">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Issued</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(invoice.issued_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(invoice.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Currency</p>
                      <p className="font-medium text-gray-900">
                        {invoice.currency}
                      </p>
                    </div>
                  </div>
                  
                  {invoice.payout_batch_id && (
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-lg">
                        <Layers className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Batch ID</p>
                        <p className="font-medium text-gray-900">
                          {invoice.payout_batch_id}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Share Options */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Share</h3>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const text = `Invoice ${invoice.invoice_number}: ${formatCurrency(invoice.total_gross)}`;
                      copyToClipboard(text);
                    }}
                    className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Copy className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Copy Info</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const shareText = `Check out invoice ${invoice.invoice_number} for ${formatCurrency(invoice.total_gross)}`;
                      if (navigator.share) {
                        navigator.share({
                          title: `Invoice ${invoice.invoice_number}`,
                          text: shareText,
                        });
                      } else {
                        copyToClipboard(shareText);
                        alert('Share text copied to clipboard!');
                      }
                    }}
                    className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailCard = ({ icon: Icon, title, value, copyable = false, isComponent = false }) => (
  <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
    <div className="flex items-center gap-3 mb-2">
      <div className="bg-white p-2 rounded-lg shadow-sm">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </div>
    <div className="flex items-center justify-between">
      {isComponent ? (
        value
      ) : (
        <span className="text-lg font-semibold text-gray-900 truncate">{value}</span>
      )}
      {copyable && (
        <button
          onClick={() => navigator.clipboard.writeText(value)}
          className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
          title="Copy to clipboard"
        >
          <Copy className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

export default AdminInvoiceDetailPage;