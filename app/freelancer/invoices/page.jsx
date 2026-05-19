// app/freelancer/invoices/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import Link from "next/link";
import {
  Search,
  Download,
  Eye,
  FileText,
  Calendar,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Wallet,
  Plus,
  X,
  Loader2,
  DollarSign,
  SlidersHorizontal,
  ArrowUpRight,
  Banknote,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import jsPDF from "jspdf";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatDateForPDF = (dateString) => {
  if (!dateString) return "Not set";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
};

/* ─────────────────────────────────────────────
   Status Badge
───────────────────────────────────────────── */
const STATUS_CONFIG = {
  paid: {
    chip: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle,
    label: "Paid",
  },
  pending: {
    chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-400",
    icon: Clock,
    label: "Pending",
  },
  overdue: {
    chip: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    dot: "bg-rose-500",
    icon: AlertCircle,
    label: "Overdue",
  },
  issued: {
    chip: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    dot: "bg-violet-500",
    icon: FileText,
    label: "Issued",
  },
  draft: {
    chip: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    dot: "bg-slate-400",
    icon: FileText,
    label: "Draft",
  },
  cancelled: {
    chip: "bg-red-50 text-red-600 ring-1 ring-red-200",
    dot: "bg-red-400",
    icon: XCircle,
    label: "Cancelled",
  },
};

const StatusBadge = ({ status }) => {
  const key = status?.toLowerCase();
  const cfg = STATUS_CONFIG[key] || {
    chip: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    dot: "bg-slate-400",
    label: status || "Unknown",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${cfg.chip}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

/* ─────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, accent, sub }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className={`p-2 rounded-xl ${accent}`}>
        <Icon className="w-4 h-4" />
      </span>
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Filter Pill
───────────────────────────────────────────── */
const FilterPill = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium ring-1 ring-violet-200">
    {label}
    <button
      onClick={onRemove}
      className="hover:text-violet-900 transition-colors"
    >
      <X className="w-3 h-3" />
    </button>
  </span>
);

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
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
  const [drawerOpen, setDrawerOpen] = useState(false);
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
        ...(dateFilter !== "all" && { date_range: dateFilter }),
      };
      const response = await apiPrivate.get("/invoices/", { params });
      const invoiceData = response.data.results || response.data;
      const arr = Array.isArray(invoiceData) ? invoiceData : [invoiceData];
      setInvoices(arr);
      setTotalCount(response.data.count || arr.length);
      setTotalPages(
        response.data.total_pages || Math.ceil(arr.length / itemsPerPage)
      );
      try {
        const statsRes = await apiPrivate.get("freelancer/earnings/summary/");
        setStats({
          total_earnings: statsRes.data.total_net || 0,
          pending_payments: statsRes.data.total_gross || 0,
          paid_invoices_count: statsRes.data.invoice_count || 0,
          platform_fee: statsRes.data.platform_fee || 0,
        });
      } catch {
        setStats({
          total_earnings: arr
            .filter((i) => i.status === "paid")
            .reduce((s, i) => s + parseFloat(i.total_net || 0), 0),
          pending_payments: arr
            .filter((i) => ["pending", "overdue", "issued"].includes(i.status))
            .reduce((s, i) => s + parseFloat(i.total_gross || 0), 0),
          paid_invoices_count: arr.filter((i) => i.status === "paid").length,
          platform_fee: arr.reduce(
            (s, i) => s + parseFloat(i.platform_fee || 0),
            0
          ),
        });
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, dateFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  /* ── PDF Generation ── */
  const generateInvoicePDF = async (invoice) => {
    try {
      setGeneratingPDF((p) => ({ ...p, [invoice.id]: true }));
      const doc = new jsPDF();

      if (invoice.status !== "paid") {
        doc.setTextColor(220, 220, 220);
        doc.setFontSize(55);
        doc.text(invoice.status?.toUpperCase() || "PENDING", 105, 140, {
          align: "center",
          angle: 45,
        });
        doc.setTextColor(0, 0, 0);
      }

      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", 14, 25);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Invoice #: ${invoice.invoice_number || `INV-${invoice.id?.slice(0, 8)?.toUpperCase()}`}`,
        14,
        40
      );
      doc.text(
        `Date: ${formatDateForPDF(invoice.issued_at || invoice.created_at)}`,
        14,
        46
      );
      doc.text(`Status: ${invoice.status?.toUpperCase() || "DRAFT"}`, 14, 52);

      doc.setFont("helvetica", "bold");
      doc.text("FROM", 14, 70);
      doc.setFont("helvetica", "normal");
      doc.text(invoice.freelancer_name || "Freelancer", 14, 76);
      doc.text(invoice.freelancer_email || "", 14, 82);
      doc.text(invoice.freelancer_phone || "", 14, 88);

      doc.setFont("helvetica", "bold");
      doc.text("BILL TO", 100, 70);
      doc.setFont("helvetica", "normal");
      doc.text(invoice.client_name || "Client", 100, 76);
      doc.text(invoice.client_email || "", 100, 82);
      doc.text(invoice.client_phone || "", 100, 88);
      doc.text(invoice.client_address || "", 100, 94);

      doc.setDrawColor(200, 200, 200);
      doc.line(14, 110, 196, 110);

      doc.setFont("helvetica", "bold");
      doc.text("Description", 14, 120);
      doc.text("Qty", 140, 120);
      doc.text("Unit Price", 155, 120);
      doc.text("Total", 182, 120);
      doc.line(14, 122, 196, 122);

      let y = 130;
      const items = invoice.items || [];
      if (items.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.text("No items listed", 14, y);
        y += 10;
      } else {
        items.forEach((item, idx) => {
          if (y > 250) { doc.addPage(); y = 20; }
          doc.setFont("helvetica", "normal");
          const lines = doc.splitTextToSize(item.description || "Service", 110);
          doc.text(lines, 14, y);
          doc.text(String(item.quantity || 1), 140, y);
          doc.text(formatCurrency(item.unit_price || 0), 155, y);
          doc.text(formatCurrency(item.total || 0), 182, y);
          y += Math.max(lines.length * 5, 10);
          if (idx < items.length - 1) { doc.line(14, y, 196, y); y += 5; }
        });
      }

      doc.line(14, y, 196, y);
      y += 10;
      const sx = 140;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Subtotal:", sx, y);
      doc.text(formatCurrency(invoice.subtotal || 0), sx + 42, y);
      y += 7;
      if (invoice.tax_amount > 0) {
        doc.text(`Tax (${invoice.tax_rate || 0}%):`, sx, y);
        doc.text(formatCurrency(invoice.tax_amount), sx + 42, y);
        y += 7;
      }
      if (invoice.platform_fee > 0) {
        doc.text("Platform Fee:", sx, y);
        doc.text(formatCurrency(invoice.platform_fee), sx + 42, y);
        y += 7;
      }
      if (invoice.discount_amount > 0) {
        doc.text("Discount:", sx, y);
        doc.text(`-${formatCurrency(invoice.discount_amount)}`, sx + 42, y);
        y += 7;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Total Amount:", sx, y + 3);
      doc.text(formatCurrency(invoice.total_gross || 0), sx + 42, y + 3);
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 128, 0);
      doc.text("Net (You Receive):", sx, y);
      doc.text(formatCurrency(invoice.total_net || 0), sx + 42, y);
      doc.setTextColor(0, 0, 0);

      y += 20;
      doc.setFont("helvetica", "bold");
      doc.text("Payment Terms:", 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(invoice.payment_terms || "Net 30 days", 14, y + 6);

      if (invoice.notes) {
        y += 15;
        doc.setFont("helvetica", "bold");
        doc.text("Notes:", 14, y);
        doc.setFont("helvetica", "normal");
        doc.text(doc.splitTextToSize(invoice.notes, 180), 14, y + 6);
      }

      const ph = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for your business!", 105, ph - 20, { align: "center" });
      doc.text("Computer-generated invoice.", 105, ph - 15, { align: "center" });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, ph - 10, {
        align: "center",
      });

      doc.save(`invoice-${invoice.invoice_number || invoice.id}.pdf`);
    } catch {
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPDF((p) => ({ ...p, [invoice.id]: false }));
    }
  };

  /* ── Options ── */
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "issued", label: "Issued" },
    { value: "overdue", label: "Overdue" },
    { value: "draft", label: "Draft" },
    { value: "cancelled", label: "Cancelled" },
  ];
  const dateOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" },
  ];

  const hasFilters =
    searchTerm || statusFilter !== "all" || dateFilter !== "all";
  const clearAll = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("all");
    setCurrentPage(1);
  };

  /* ────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Top Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-600 rounded-xl">
                <ReceiptText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-none">
                  My Invoices
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track your earnings & payments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchInvoices}
                disabled={loading}
                title="Refresh"
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors disabled:opacity-40"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => router.push("/freelancer/invoices/create")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-violet-200"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Invoice</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── Stats ── */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={Wallet}
              label="Total Earned"
              value={formatCurrency(stats.total_earnings)}
              accent="bg-emerald-50 text-emerald-600"
              sub="Net after fees"
            />
            <StatCard
              icon={Clock}
              label="Awaiting Payment"
              value={formatCurrency(stats.pending_payments)}
              accent="bg-amber-50 text-amber-600"
              sub="Pending + overdue"
            />
            <StatCard
              icon={ReceiptText}
              label="Total Invoices"
              value={stats.paid_invoices_count}
              accent="bg-violet-50 text-violet-600"
              sub="Paid invoices"
            />
            <StatCard
              icon={DollarSign}
              label="Platform Fees"
              value={formatCurrency(stats.platform_fee)}
              accent="bg-slate-100 text-slate-500"
              sub="Deducted from gross"
            />
          </div>
        )}

        {/* ── Search & Filter Bar ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          <div className="flex gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by invoice number…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { setCurrentPage(1); fetchInvoices(); }
                }}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
              />
            </div>

            {/* Desktop selects */}
            <div className="hidden md:flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400 transition cursor-pointer"
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <select
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                className="text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400 transition cursor-pointer"
              >
                {dateOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Mobile filter button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className={`md:hidden inline-flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-xl border transition
                ${hasFilters
                  ? "border-violet-300 bg-violet-50 text-violet-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {hasFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              )}
            </button>
          </div>

          {/* Active filter pills */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {searchTerm && (
                <FilterPill label={`"${searchTerm}"`} onRemove={() => setSearchTerm("")} />
              )}
              {statusFilter !== "all" && (
                <FilterPill
                  label={statusOptions.find((o) => o.value === statusFilter)?.label}
                  onRemove={() => setStatusFilter("all")}
                />
              )}
              {dateFilter !== "all" && (
                <FilterPill
                  label={dateOptions.find((o) => o.value === dateFilter)?.label}
                  onRemove={() => setDateFilter("all")}
                />
              )}
              <button
                onClick={clearAll}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors ml-1"
              >
                Clear all
              </button>
              <span className="text-xs text-slate-400 ml-auto">
                {totalCount} result{totalCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-800">Could not load invoices</p>
              <p className="text-rose-600 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-600 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && invoices.length === 0 ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 h-16 animate-pulse"
                style={{ opacity: 1 - i * 0.15 }}
              />
            ))}
          </div>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Gross Amount
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      You Receive
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.length > 0 ? (
                    invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Invoice # */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                              ${invoice.status === "paid" ? "bg-emerald-50" :
                                invoice.status === "overdue" ? "bg-rose-50" :
                                invoice.status === "pending" ? "bg-amber-50" :
                                "bg-violet-50"
                              }`}>
                              <ReceiptText className={`w-4 h-4
                                ${invoice.status === "paid" ? "text-emerald-500" :
                                  invoice.status === "overdue" ? "text-rose-500" :
                                  invoice.status === "pending" ? "text-amber-500" :
                                  "text-violet-500"
                                }`} />
                            </div>
                            <span className="font-semibold text-slate-800">
                              {invoice.invoice_number ||
                                `INV-${invoice.id?.slice(0, 8)?.toUpperCase()}`}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-slate-500">
                          {formatDate(invoice.issued_at || invoice.created_at)}
                        </td>

                        {/* Gross */}
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-800">
                            {formatCurrency(invoice.total_gross || 0)}
                          </div>
                          {invoice.platform_fee > 0 && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              Fee: {formatCurrency(invoice.platform_fee)}
                            </div>
                          )}
                        </td>

                        {/* Net */}
                        <td className="px-5 py-4">
                          <span className="text-base font-bold text-emerald-600">
                            {formatCurrency(invoice.total_net || 0)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={invoice.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/freelancer/invoices/${invoice.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Link>
                            <button
                              onClick={() => generateInvoicePDF(invoice)}
                              disabled={generatingPDF[invoice.id]}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {generatingPDF[invoice.id] ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <EmptyState
                          hasFilters={hasFilters}
                          onClear={clearAll}
                          onCreate={() => router.push("/freelancer/invoices/create")}
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && invoices.length > 0 && (
                <Pagination
                  current={currentPage}
                  total={totalPages}
                  count={totalCount}
                  perPage={itemsPerPage}
                  loading={loading}
                  onChange={setCurrentPage}
                />
              )}
            </div>

            {/* ── Mobile Cards ── */}
            <div className="lg:hidden space-y-3">
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3"
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                          ${invoice.status === "paid" ? "bg-emerald-50" :
                            invoice.status === "overdue" ? "bg-rose-50" :
                            invoice.status === "pending" ? "bg-amber-50" :
                            "bg-violet-50"
                          }`}>
                          <ReceiptText className={`w-4 h-4
                            ${invoice.status === "paid" ? "text-emerald-500" :
                              invoice.status === "overdue" ? "text-rose-500" :
                              invoice.status === "pending" ? "text-amber-500" :
                              "text-violet-500"
                            }`} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">
                            {invoice.invoice_number ||
                              `INV-${invoice.id?.slice(0, 8)?.toUpperCase()}`}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatDate(invoice.issued_at || invoice.created_at)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={invoice.status} />
                    </div>

                    {/* Amounts */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-1">Gross</p>
                        <p className="font-semibold text-slate-800">
                          {formatCurrency(invoice.total_gross || 0)}
                        </p>
                        {invoice.platform_fee > 0 && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            Fee: {formatCurrency(invoice.platform_fee)}
                          </p>
                        )}
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3">
                        <p className="text-xs text-emerald-500 mb-1">You Receive</p>
                        <p className="font-bold text-emerald-700">
                          {formatCurrency(invoice.total_net || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Link
                        href={`/freelancer/invoices/${invoice.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                      <button
                        onClick={() => generateInvoicePDF(invoice)}
                        disabled={generatingPDF[invoice.id]}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                <div className="bg-white rounded-2xl border border-slate-100 p-10">
                  <EmptyState
                    hasFilters={hasFilters}
                    onClear={clearAll}
                    onCreate={() => router.push("/freelancer/invoices/create")}
                  />
                </div>
              )}

              {totalPages > 1 && invoices.length > 0 && (
                <Pagination
                  current={currentPage}
                  total={totalPages}
                  count={totalCount}
                  perPage={itemsPerPage}
                  loading={loading}
                  onChange={setCurrentPage}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* ── Mobile Filter Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Filters</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Status
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {statusOptions.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { setStatusFilter(o.value); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      statusFilter === o.value
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Date Range
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {dateOptions.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { setDateFilter(o.value); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      dateFilter === o.value
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { clearAll(); setDrawerOpen(false); }}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Clear All
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
const EmptyState = ({ hasFilters, onClear, onCreate }) => (
  <div className="flex flex-col items-center">
    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
      <ReceiptText className="w-7 h-7 text-slate-400" />
    </div>
    <p className="text-base font-semibold text-slate-700 mb-1">
      {hasFilters ? "No matching invoices" : "No invoices yet"}
    </p>
    <p className="text-sm text-slate-400 mb-5 text-center max-w-xs">
      {hasFilters
        ? "Try adjusting or clearing your filters."
        : "Create your first invoice to start tracking earnings."}
    </p>
    {hasFilters ? (
      <button
        onClick={onClear}
        className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
      >
        Clear Filters
      </button>
    ) : (
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition"
      >
        <Plus className="w-4 h-4" />
        Create Invoice
      </button>
    )}
  </div>
);

const Pagination = ({ current, total, count, perPage, loading, onChange }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
    <p className="text-xs text-slate-400">
      Showing{" "}
      <span className="font-semibold text-slate-600">
        {(current - 1) * perPage + 1}–{Math.min(current * perPage, count)}
      </span>{" "}
      of <span className="font-semibold text-slate-600">{count}</span>
    </p>
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange((p) => Math.max(1, p - 1))}
        disabled={current === 1 || loading}
        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {Array.from({ length: Math.min(5, total) }, (_, i) => {
        let n;
        if (total <= 5) n = i + 1;
        else if (current <= 3) n = i + 1;
        else if (current >= total - 2) n = total - 4 + i;
        else n = current - 2 + i;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            disabled={loading}
            className={`min-w-[36px] py-2 rounded-lg text-sm font-medium transition ${
              current === n
                ? "bg-violet-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {n}
          </button>
        );
      })}
      <button
        onClick={() => onChange((p) => Math.min(total, p + 1))}
        disabled={current === total || loading}
        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default FreelancerInvoicesPage;
