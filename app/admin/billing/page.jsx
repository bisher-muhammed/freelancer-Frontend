"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import {
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  DollarSign,
  Clock,
  User,
  FileText,
  MoreVertical,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  CreditCard,
  TrendingUp,
  BarChart3,
  Receipt,
  Activity,
  ArrowUpRight
} from "lucide-react";

export default function AdminBillingPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [filterDate, setFilterDate] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });

  useEffect(() => {
    fetchBilling();
  }, []);

  async function fetchBilling() {
    setLoading(true);
    try {
      const response = await apiPrivate.get("admin/billing-units/");
      console.log("Billing data:", response.data);
      setItems(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (error) {
      console.error("Error fetching billing:", error);
    } finally {
      setLoading(false);
    }
  }

  // FIXED FILTER FUNCTION - Safe string conversion for session
  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = searchTerm === "" || 
      // Handle session (which is a number - 51)
      (item.session !== undefined && item.session !== null && 
       `session ${item.session}`.toLowerCase().includes(searchLower)) ||
      // Handle ID
      (item.id !== undefined && item.id !== null && 
       item.id.toString().toLowerCase().includes(searchLower)) ||
      // Handle freelancer username (if it exists)
      (item.freelancer?.username && 
       item.freelancer.username.toLowerCase().includes(searchLower)) ||
      // Handle freelancer ID
      (item.freelancer && typeof item.freelancer === 'object' && item.freelancer.id && 
       `freelancer ${item.freelancer.id}`.toLowerCase().includes(searchLower)) ||
      // Handle contract ID
      (item.contract && 
       `contract ${item.contract}`.toLowerCase().includes(searchLower)) ||
      // Handle amount
      (item.gross_amount && 
       item.gross_amount.toString().toLowerCase().includes(searchLower)) ||
      // Handle status
      (item.status && 
       item.status.toLowerCase().includes(searchLower));
    
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
    const matchesDate = filterDate === null || 
      (new Date(item.created_at) >= filterDate.startDate && 
       new Date(item.created_at) <= filterDate.endDate);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sort function
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortConfig.key === "created_at") {
      return sortConfig.direction === "asc" 
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortConfig.key === "gross_amount") {
      return sortConfig.direction === "asc" 
        ? parseFloat(a.gross_amount) - parseFloat(b.gross_amount)
        : parseFloat(b.gross_amount) - parseFloat(a.gross_amount);
    }
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(amount || 0));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: "bg-amber-100 text-amber-800", icon: AlertCircle },
      approved: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      charged: { color: "bg-emerald-100 text-emerald-800", icon: CreditCard },
      rejected: { color: "bg-rose-100 text-rose-800", icon: XCircle }
    };
    
    const { color, icon: Icon } = config[status] || { color: "bg-gray-100 text-gray-800", icon: AlertCircle };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleViewDetails = (id) => {
    router.push(`/admin/billing/${id}`);
  };

  // Summary calculations
  const totalAmount = filteredItems.reduce((sum, item) => sum + parseFloat(item.gross_amount || 0), 0);
  const pendingCount = filteredItems.filter(item => item.status === "pending").length;
  const approvedCount = filteredItems.filter(item => item.status === "approved").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
              <Activity className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Billing Data</h3>
            <p className="text-gray-600">Please wait while we fetch billing information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Billing Management</h1>
              <p className="text-gray-600 mt-2">Manage and review all billing units and payments</p>
            </div>
            <button
              onClick={fetchBilling}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 font-medium rounded-xl transition-all duration-200 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Billing</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{filteredItems.length} billing units</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Awaiting approval</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Ready for payment</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-2xl border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(filteredItems.reduce((sum, item) => sum + (item.billable_seconds || 0), 0) / 3600)}
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Billable hours</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
                <input
                  type="text"
                  placeholder="Search by ID, session, freelancer, amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="charged">Paid</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("created_at")}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                    >
                      Created
                      {sortConfig.key === "created_at" && (
                        <ArrowUpRight className={`w-3 h-3 ${sortConfig.direction === "asc" ? "rotate-90" : "-rotate-90"}`} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Freelancer
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("gross_amount")}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                    >
                      Amount
                      {sortConfig.key === "gross_amount" && (
                        <ArrowUpRight className={`w-3 h-3 ${sortConfig.direction === "asc" ? "rotate-90" : "-rotate-90"}`} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Receipt className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">No billing units found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchTerm || selectedStatus !== "all" ? "Try adjusting your filters" : "No billing data available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(item.created_at)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            Session #{item.session}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            Freelancer #{item.freelancer}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(item.gross_amount)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatCurrency(item.hourly_rate)}/hr
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {Math.round((item.billable_seconds || 0) / 3600 * 100) / 100}h
                          </span>
                          <span className="text-xs text-gray-500">
                            {Math.round((item.tracked_seconds || 0) / 60)}m total
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(item.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600">
          <div>
            Showing <span className="font-medium">{filteredItems.length}</span> of{" "}
            <span className="font-medium">{items.length}</span> billing units
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span>Pending: {pendingCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Approved: {approvedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}