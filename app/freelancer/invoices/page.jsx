// app/freelancer/invoices/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Calendar,
  Building,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Wallet,
  Plus,
  X,
  Loader2,
  DollarSign
} from "lucide-react";
// Import jsPDF only
import jsPDF from "jspdf";

const FreelancerInvoicesPage = () => {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState({});
  const itemsPerPage = 10;

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        freelancer: true,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(dateFilter !== "all" && { date_range: dateFilter })
      };
      
      const response = await apiPrivate.get("/invoices/", { params });
      const invoiceData = response.data.results || response.data;
      
      const invoicesArray = Array.isArray(invoiceData) ? invoiceData : [invoiceData];
      setInvoices(invoicesArray);
      setTotalCount(response.data.count || invoicesArray.length);
      setTotalPages(response.data.total_pages || Math.ceil(invoicesArray.length / itemsPerPage));
      
      // Fetch freelancer stats
      try {
        const statsRes = await apiPrivate.get("freelancer/earnings/summary/");
        const statsData = {
          total_earnings: statsRes.data.total_net || 0,
          pending_payments: statsRes.data.total_gross || 0,
          paid_invoices_count: statsRes.data.invoice_count || 0,
          platform_fee: statsRes.data.platform_fee || 0
        };
        setStats(statsData);
      } catch (statsErr) {
        console.warn("Could not fetch freelancer stats:", statsErr);
        // Fallback stats from invoices
        const totalEarnings = invoicesArray
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + parseFloat(inv.total_net || 0), 0);
        
        const pendingPayments = invoicesArray
          .filter(inv => ['pending', 'overdue', 'issued'].includes(inv.status))
          .reduce((sum, inv) => sum + parseFloat(inv.total_gross || 0), 0);
        
        setStats({
          total_earnings: totalEarnings,
          pending_payments: pendingPayments,
          paid_invoices_count: invoicesArray.filter(inv => inv.status === 'paid').length,
          platform_fee: invoicesArray.reduce((sum, inv) => sum + parseFloat(inv.platform_fee || 0), 0)
        });
      }
      
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(err.response?.data?.detail || "Failed to load your invoices");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, dateFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInvoices();
  }, [fetchInvoices]);

  const getStatusBadge = (status) => {
    const config = {
      paid: {
        color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        icon: CheckCircle,
        label: "Paid"
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
      issued: {
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: FileText,
        label: "Issued"
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

    const statusLower = status?.toLowerCase();
    const { color, icon: Icon, label } = config[statusLower] || {
      color: "bg-gray-100 text-gray-800 border border-gray-200",
      icon: AlertCircle,
      label: status || "Unknown"
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatDateForPDF = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  const generateInvoicePDF = async (invoice) => {
    try {
      setGeneratingPDF(prev => ({ ...prev, [invoice.id]: true }));
      
      const doc = new jsPDF();
      
      // Add watermark for status
      if (invoice.status !== 'paid') {
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(60);
        doc.text(invoice.status?.toUpperCase() || 'PENDING', 105, 140, { 
          align: 'center', 
          angle: 45 
        });
        doc.setTextColor(0, 0, 0);
      }
      
      // Header
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", 14, 25);
      
      // Invoice Details
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      // Invoice Number and Date
      doc.text(`Invoice #: ${invoice.invoice_number || `INV-${invoice.id?.slice(0, 8)?.toUpperCase() || '00000000'}`}`, 14, 40);
      doc.text(`Date: ${formatDateForPDF(invoice.issued_at || invoice.created_at)}`, 14, 46);
      doc.text(`Status: ${invoice.status?.toUpperCase() || 'DRAFT'}`, 14, 52);
      
      // Freelancer Details
      doc.setFont("helvetica", "bold");
      doc.text("FROM", 14, 70);
      doc.setFont("helvetica", "normal");
      doc.text(invoice.freelancer_name || "Freelancer", 14, 76);
      doc.text(invoice.freelancer_email || "", 14, 82);
      doc.text(invoice.freelancer_phone || "", 14, 88);
      
      // Client Details
      doc.setFont("helvetica", "bold");
      doc.text("BILL TO", 100, 70);
      doc.setFont("helvetica", "normal");
      doc.text(invoice.client_name || "Client", 100, 76);
      doc.text(invoice.client_email || "", 100, 82);
      doc.text(invoice.client_phone || "", 100, 88);
      doc.text(invoice.client_address || "", 100, 94);
      
      // Line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 110, 196, 110);
      
      // Invoice Items Section
      doc.setFont("helvetica", "bold");
      doc.text("Description", 14, 120);
      doc.text("Qty", 140, 120);
      doc.text("Unit Price", 160, 120);
      doc.text("Total", 180, 120);
      
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 122, 196, 122);
      
      // Add invoice items
      let yPosition = 130;
      const items = invoice.items || [];
      
      if (items.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.text("No items listed", 14, yPosition);
        yPosition += 10;
      } else {
        items.forEach((item, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFont("helvetica", "normal");
          
          // Split description into multiple lines if too long
          const description = item.description || "Service";
          const maxWidth = 110;
          const descriptionLines = doc.splitTextToSize(description, maxWidth);
          
          // Draw description
          doc.text(descriptionLines, 14, yPosition);
          
          // Calculate height needed for description
          const descHeight = descriptionLines.length * 5;
          
          // Draw quantity, price, and total on first line
          doc.text((item.quantity || 1).toString(), 140, yPosition);
          doc.text(formatCurrency(item.unit_price || 0), 160, yPosition);
          doc.text(formatCurrency(item.total || 0), 180, yPosition);
          
          // Update y position based on description height
          yPosition += Math.max(descHeight, 10);
          
          // Add separator line between items
          if (index < items.length - 1) {
            doc.line(14, yPosition, 196, yPosition);
            yPosition += 5;
          }
        });
      }
      
      // Summary Section
      doc.setDrawColor(200, 200, 200);
      doc.line(14, yPosition, 196, yPosition);
      yPosition += 10;
      
      const summaryX = 140;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      // Subtotal
      doc.text("Subtotal:", summaryX, yPosition);
      doc.text(formatCurrency(invoice.subtotal || 0), summaryX + 40, yPosition);
      yPosition += 7;
      
      // Tax if applicable
      if (invoice.tax_amount && invoice.tax_amount > 0) {
        doc.text(`Tax (${invoice.tax_rate || 0}%):`, summaryX, yPosition);
        doc.text(formatCurrency(invoice.tax_amount || 0), summaryX + 40, yPosition);
        yPosition += 7;
      }
      
      // Platform Fee
      if (invoice.platform_fee && invoice.platform_fee > 0) {
        doc.text("Platform Fee:", summaryX, yPosition);
        doc.text(formatCurrency(invoice.platform_fee || 0), summaryX + 40, yPosition);
        yPosition += 7;
      }
      
      // Discount if applicable
      if (invoice.discount_amount && invoice.discount_amount > 0) {
        doc.text("Discount:", summaryX, yPosition);
        doc.text(`-${formatCurrency(invoice.discount_amount || 0)}`, summaryX + 40, yPosition);
        yPosition += 7;
      }
      
      // Total Amount
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Total Amount:", summaryX, yPosition + 3);
      doc.text(formatCurrency(invoice.total_gross || 0), summaryX + 40, yPosition + 3);
      
      // Net Amount (Freelancer Receives)
      yPosition += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 128, 0);
      doc.text("Net Amount (You Receive):", summaryX, yPosition);
      doc.text(formatCurrency(invoice.total_net || 0), summaryX + 40, yPosition);
      doc.setTextColor(0, 0, 0);
      
      // Payment Terms
      yPosition += 20;
      doc.setFont("helvetica", "bold");
      doc.text("Payment Terms:", 14, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(invoice.payment_terms || "Net 30 days", 14, yPosition + 6);
      
      // Notes
      if (invoice.notes) {
        yPosition += 15;
        doc.setFont("helvetica", "bold");
        doc.text("Notes:", 14, yPosition);
        doc.setFont("helvetica", "normal");
        const splitNotes = doc.splitTextToSize(invoice.notes, 180);
        doc.text(splitNotes, 14, yPosition + 6);
      }
      
      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text("Thank you for your business!", 105, pageHeight - 20, { align: 'center' });
      doc.text("This is a computer-generated invoice.", 105, pageHeight - 15, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, pageHeight - 10, { align: 'center' });
      
      // Save PDF
      doc.save(`invoice-${invoice.invoice_number || invoice.id}.pdf`);
      
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPDF(prev => ({ ...prev, [invoice.id]: false }));
    }
  };

  const handleDownload = async (invoice) => {
    await generateInvoicePDF(invoice);
  };

  // Function to download all filtered invoices as a zip (optional enhancement)
  const downloadAllInvoices = async () => {
    if (invoices.length === 0) return;
    
    try {
      // For multiple invoices, you might want to create a zip file
      // This would require jszip library
      // For now, we'll just download the first invoice
      if (invoices.length === 1) {
        await generateInvoicePDF(invoices[0]);
      } else {
        // Option 1: Download first invoice
        await generateInvoicePDF(invoices[0]);
        
        // Option 2: Show message
        // alert(`To download multiple invoices, please download them individually or contact support.`);
        
        // Option 3: Generate combined PDF (more complex)
        // generateCombinedPDF(invoices);
      }
    } catch (err) {
      console.error("Error downloading invoices:", err);
      alert("Failed to download invoices");
    }
  };

  // Optional: Generate combined PDF for multiple invoices
  const generateCombinedPDF = (invoicesList) => {
    const doc = new jsPDF();
    
    invoicesList.forEach((invoice, index) => {
      if (index > 0) {
        doc.addPage();
      }
      
      // Add invoice content (simplified version)
      doc.setFontSize(20);
      doc.text(`INVOICE ${index + 1}: ${invoice.invoice_number || `INV-${invoice.id?.slice(0, 8)}`}`, 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Client: ${invoice.client_name}`, 20, 40);
      doc.text(`Amount: ${formatCurrency(invoice.total_gross || 0)}`, 20, 50);
      doc.text(`Status: ${invoice.status}`, 20, 60);
      doc.text(`Date: ${formatDateForPDF(invoice.issued_at)}`, 20, 70);
    });
    
    doc.save(`invoices-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "issued", label: "Issued" },
    { value: "overdue", label: "Overdue" },
    { value: "draft", label: "Draft" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const dateOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Invoices</h1>
              <p className="text-gray-600 mt-1">Track your payments and earnings</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/freelancer/invoices/create')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg transition-colors text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Invoice</span>
                <span className="inline sm:hidden">New</span>
              </button>
              
              <button
                onClick={fetchInvoices}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.total_earnings)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="bg-amber-100 p-2 rounded-lg mr-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Payments</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.pending_payments)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                  <p className="text-xl font-bold text-gray-900">{stats.paid_invoices_count}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Platform Fees</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.platform_fee)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </form>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm min-w-[140px]"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm min-w-[140px]"
                >
                  {dateOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Active Filters */}
          {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  Status: {statusOptions.find(o => o.value === statusFilter)?.label}
                  <button onClick={() => setStatusFilter("all")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {dateFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  Date: {dateOptions.find(o => o.value === dateFilter)?.label}
                  <button onClick={() => setDateFilter("all")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDateFilter("all");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium ml-auto"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Mobile Filter Modal */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      setCurrentPage(1);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {dateOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Error Loading Invoices</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 ml-auto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !invoices.length ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Loading Your Invoices
              </h3>
              <p className="text-gray-600">
                Getting your payment history...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-4 mb-6">
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <div key={invoice.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          invoice.status === 'paid' ? 'bg-emerald-100' :
                          invoice.status === 'pending' ? 'bg-amber-100' :
                          invoice.status === 'overdue' ? 'bg-rose-100' :
                          'bg-blue-100'
                        }`}>
                          <FileText className={`w-4 h-4 ${
                            invoice.status === 'paid' ? 'text-emerald-600' :
                            invoice.status === 'pending' ? 'text-amber-600' :
                            invoice.status === 'overdue' ? 'text-rose-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">
                            {invoice.invoice_number || `INV-${invoice.id.slice(0, 8).toUpperCase()}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(invoice.issued_at || invoice.created_at)}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(invoice.status)}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Client:</span>
                        <span className="font-medium text-gray-700">
                          {invoice.client_name || "Unknown"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(invoice.total_gross || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between bg-emerald-50 p-2 rounded">
                        <span className="text-sm text-gray-600">You Receive:</span>
                        <span className="font-bold text-emerald-700">
                          {formatCurrency(invoice.total_net || 0)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <Link
                        href={`/freelancer/invoices/${invoice.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                      <button
                        onClick={() => handleDownload(invoice)}
                        disabled={generatingPDF[invoice.id]}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingPDF[invoice.id] ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        PDF
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Invoices Found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                        ? "No invoices match your filters"
                        : "You haven't created any invoices yet"}
                    </p>
                    <button
                      onClick={() => router.push('/freelancer/invoices/create')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Create Your First Invoice
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        You Receive
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.length > 0 ? (
                      invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                invoice.status === 'paid' ? 'bg-emerald-100' :
                                invoice.status === 'pending' ? 'bg-amber-100' :
                                invoice.status === 'overdue' ? 'bg-rose-100' :
                                'bg-blue-100'
                              }`}>
                                <FileText className={`w-4 h-4 ${
                                  invoice.status === 'paid' ? 'text-emerald-600' :
                                  invoice.status === 'pending' ? 'text-amber-600' :
                                  invoice.status === 'overdue' ? 'text-rose-600' :
                                  'text-blue-600'
                                }`} />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {invoice.invoice_number || `INV-${invoice.id.slice(0, 8).toUpperCase()}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-gray-100 p-2 rounded-full">
                                <Building className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {invoice.client_name || "Unknown Client"}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {formatDate(invoice.issued_at || invoice.created_at)}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="text-base font-bold text-gray-900">
                              {formatCurrency(invoice.total_gross || 0)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Fee: {formatCurrency(invoice.platform_fee || 0)}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="text-lg font-bold text-emerald-700">
                              {formatCurrency(invoice.total_net || 0)}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            {getStatusBadge(invoice.status)}
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/freelancer/invoices/${invoice.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm font-medium"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </Link>
                              
                              <button
                                onClick={() => handleDownload(invoice)}
                                disabled={generatingPDF[invoice.id]}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {generatingPDF[invoice.id] ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-3.5 h-3.5" />
                                    PDF
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No Invoices Yet
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                              ? "Try adjusting your filters"
                              : "Create your first invoice"}
                          </p>
                          <button
                            onClick={() => router.push('/freelancer/invoices/create')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                          >
                            <Plus className="w-4 h-4" />
                            Create New Invoice
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && invoices.length > 0 && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, totalCount)}
                      </span>{" "}
                      of <span className="font-medium">{totalCount}</span> invoices
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || loading}
                        className="px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              disabled={loading}
                              className={`px-3 py-2 min-w-[40px] rounded text-sm font-medium ${
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || loading}
                        className="px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FreelancerInvoicesPage;