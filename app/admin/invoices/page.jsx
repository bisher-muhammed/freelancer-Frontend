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
  BarChart3,
  TrendingUp,
  Wallet,
  CreditCard,
  Users,
  DollarSign,
  MoreVertical,
  ChevronDown,
  X,
  Loader2,
  ExternalLink
} from "lucide-react";

const AdminInvoicesPage = () => {
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
  const itemsPerPage = 10;

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
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
      
      // Fetch stats
      try {
        const statsRes = await apiPrivate.get("/admin/revenue/summary/");
        const statsData = {
          total_revenue: statsRes.data.total_gross || 0,
          paid_invoices_count: statsRes.data.invoice_count || 0,
          pending_amount: statsRes.data.platform_fee || 0,
          net_to_freelancers: statsRes.data.total_net_paid_to_freelancers || 0,
          revenue_change: 12.5,
          paid_invoices_change: 8.2,
          pending_change: -3.1,
          net_change: 15.7
        };
        setStats(statsData);
      } catch (statsErr) {
        console.warn("Could not fetch stats:", statsErr);
      }
      
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(err.response?.data?.detail || "Failed to load invoices");
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
        icon: Clock,
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
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        <span className="hidden sm:inline">{label}</span>
        <span className="inline sm:hidden">{label.charAt(0)}</span>
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
    if (!dateString || dateString === "Invalid Date") {
      return "Not set";
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  const handleDownload = async (invoiceId, filename) => {
    try {
      const response = await apiPrivate.get(`/invoices/${invoiceId}/download/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download invoice");
    }
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

  // Mobile responsive filters
  const MobileFilterSheet = () => (
    <div className={`fixed inset-0 z-50 lg:hidden transition-transform duration-300 ${
      mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
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
          <button
            onClick={() => {
              setStatusFilter("all");
              setDateFilter("all");
              setSearchTerm("");
              setMobileMenuOpen(false);
            }}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileFilterSheet />
      
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                    Invoice Management
                  </h1>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">
                  Manage and track all invoices in one place
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={fetchInvoices}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm text-sm sm:text-base disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
                
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow text-sm sm:text-base"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="inline sm:hidden">Dash</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards - Mobile Responsive */}
      {stats && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon={Wallet}
              iconBg="bg-gradient-to-br from-emerald-100 to-emerald-50"
              iconColor="text-emerald-600"
              title="Total Revenue"
              value={formatCurrency(stats.total_revenue)}
              change={stats.revenue_change}
              trend="up"
              loading={loading}
            />
            
            <StatCard
              icon={CreditCard}
              iconBg="bg-gradient-to-br from-blue-100 to-blue-50"
              iconColor="text-blue-600"
              title="Total Invoices"
              value={stats.paid_invoices_count.toString()}
              change={stats.paid_invoices_change}
              trend="up"
              loading={loading}
            />
            
            <StatCard
              icon={DollarSign}
              iconBg="bg-gradient-to-br from-amber-100 to-amber-50"
              iconColor="text-amber-600"
              title="Platform Fee"
              value={formatCurrency(stats.pending_amount)}
              change={stats.pending_change}
              trend={stats.pending_change >= 0 ? "up" : "down"}
              loading={loading}
            />
            
            <StatCard
              icon={Users}
              iconBg="bg-gradient-to-br from-purple-100 to-purple-50"
              iconColor="text-purple-600"
              title="Net to Freelancers"
              value={formatCurrency(stats.net_to_freelancers)}
              change={stats.net_change}
              trend="up"
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Enhanced Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pb-4 sm:pb-6">
        {/* Search and Desktop Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Search - Mobile Optimized */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-24 sm:pr-28 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 sm:px-4 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors whitespace-nowrap"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </form>

            {/* Desktop Filters - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="relative min-w-[140px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm appearance-none cursor-pointer"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative min-w-[140px]">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm appearance-none cursor-pointer"
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
          
          {/* Active Filters Display */}
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

        {/* Error Display */}
        {error && (
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-rose-800">Error Loading Data</p>
                <p className="text-sm text-rose-600 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-rose-500 hover:text-rose-700 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !invoices.length ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-4">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Loading Invoices
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Fetching your invoice data...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Cards View for Small Screens */}
            <div className="lg:hidden space-y-3 mb-4">
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <div key={invoice.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
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
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(invoice.total_gross || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Net Amount:</span>
                        <span className="font-medium text-gray-700">
                          {formatCurrency(invoice.total_net || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Client:</span>
                        <span className="font-medium text-gray-700 truncate max-w-[120px]">
                          {invoice.client_name || "Unknown"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <Link
                        href={`/admin/invoices/${invoice.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                      <button
                        onClick={() => handleDownload(invoice.id, `invoice-${invoice.invoice_number}.pdf`)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Invoices Found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                        ? "No invoices match your filters"
                        : "No invoices in the system yet"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Freelancer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Amount
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
                        <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-2.5 rounded-xl">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-900 truncate">
                                  {invoice.invoice_number || `INV-${invoice.id.slice(0, 8).toUpperCase()}`}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {invoice.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-2 rounded-full">
                                {invoice.client_logo ? (
                                  <img 
                                    src={invoice.client_logo} 
                                    alt={invoice.freelancer_email}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <Building className="w-4 h-4 text-purple-600" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate">
                                  {invoice.client_name || invoice.freelancer_name || "Unknown Client"}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {invoice.client_email || invoice.freelancer_email }
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {formatDate(invoice.issued_at || invoice.created_at)}
                            </div>
                            {invoice.payout_batch_id && (
                              <div className="text-xs text-gray-500">
                                Batch #{invoice.payout_batch_id}
                              </div>
                            )}
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="text-base font-bold text-gray-900">
                              {formatCurrency(invoice.total_gross || 0)}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <span>Net:</span>
                              <span className="font-medium">
                                {formatCurrency(invoice.total_net || 0)}
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            {getStatusBadge(invoice.status)}
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/admin/invoices/${invoice.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </Link>
                              
                              <button
                                onClick={() => handleDownload(invoice.id, `invoice-${invoice.invoice_number}.pdf`)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                                PDF
                              </button>
                              
                              <Link
                                href={`/admin/invoices/${invoice.id}/edit`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-gray-100 p-4 rounded-2xl mb-4">
                              <FileText className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              No Invoices Found
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                                ? "Try adjusting your filters"
                                : "There are no invoices in the system yet"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Enhanced Pagination */}
              {totalPages > 1 && invoices.length > 0 && (
                <div className="border-t border-gray-200 px-4 sm:px-6 py-4">
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
                        className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
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
                              className={`px-3 py-2 min-w-[40px] rounded-lg text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        {totalPages > 5 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || loading}
                        className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <span className="hidden sm:inline">Next</span>
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

const StatCard = ({ icon: Icon, iconBg, iconColor, title, value, change, trend, loading }) => {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-3 h-3" />;
    if (trend === "down") return <TrendingUp className="w-3 h-3 transform rotate-180" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-emerald-600 bg-emerald-100";
    if (trend === "down") return "text-rose-600 bg-rose-100";
    return "text-amber-600 bg-amber-100";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{title}</p>
          {loading ? (
            <div className="h-7 sm:h-8 bg-gray-200 animate-pulse rounded w-24"></div>
          ) : (
            <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{value}</p>
          )}
        </div>
        <div className={`${iconBg} p-2.5 sm:p-3 rounded-xl flex-shrink-0 ml-3`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
      </div>
      
      {change !== undefined && change !== null && !loading && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            {trend === "up" ? "+" : trend === "down" ? "-" : ""}{Math.abs(change)}%
          </div>
          <span className="text-xs text-gray-500 truncate">from last month</span>
        </div>
      )}
      
      {loading && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="h-6 bg-gray-200 animate-pulse rounded w-full"></div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoicesPage;