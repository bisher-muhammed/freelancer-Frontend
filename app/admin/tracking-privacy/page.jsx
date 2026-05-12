"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiPrivate } from "@/lib/apiPrivate";
import {
  PlusCircle, FileText, CheckCircle, Loader2, Clock,
  Eye, Edit, Trash2, Copy, Search, Calendar, ChevronRight,
  Shield, FileCheck, AlertCircle, ChevronsUpDown, RefreshCw,
  ChevronDown, ChevronUp, X, Check, ArrowUpDown,
} from "lucide-react";

// ─── Toast System ─────────────────────────────────────────────────────────────
function useToasts() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, text) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback(
    (id) => setToasts(prev => prev.filter(t => t.id !== id)),
    []
  );

  return { toasts, addToast, removeToast };
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border pointer-events-auto min-w-[280px] max-w-sm ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success"
            ? <CheckCircle size={16} className="shrink-0" />
            : <AlertCircle size={16} className="shrink-0" />
          }
          <p className="text-sm font-medium flex-1">{toast.text}</p>
          <button
            onClick={() => onRemove(toast.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ policy, onConfirm, onCancel, loading }) {
  if (!policy) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-100 p-3 rounded-xl shrink-0">
              <Trash2 className="text-red-600" size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete Policy</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-200">
            <p className="font-semibold text-gray-900 text-sm">{policy.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">Version {policy.version}</p>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Are you sure you want to permanently delete this policy version? Any
            users currently subject to this policy will be affected.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading
                ? <Loader2 className="animate-spin" size={16} />
                : <Trash2 size={16} />
              }
              Delete Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({ policy, onClose }) {
  if (!policy) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{policy.title}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  v{policy.version}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                  policy.is_active
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}>
                  {policy.is_active ? "Active" : "Inactive"}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={11} />
                  {new Date(policy.created_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 leading-relaxed">
              {policy.content}
            </pre>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl shrink-0 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-mono">
            {policy.content?.length?.toLocaleString()} characters
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white text-gray-700 font-medium text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, colorClass, bgClass }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
            {label}
          </p>
          <p className={`text-2xl font-bold ${colorClass || "text-gray-900"}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`${bgClass || "bg-gray-100"} p-2.5 rounded-lg`}>
          <Icon size={20} className={colorClass || "text-gray-600"} />
        </div>
      </div>
    </div>
  );
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────
function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ArrowUpDown size={12} className="text-gray-400" />;
  return sortDir === "asc"
    ? <ChevronUp size={12} className="text-blue-600" />
    : <ChevronDown size={12} className="text-blue-600" />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const EMPTY_FORM = { version: "", title: "", content: "", is_active: true };

export default function TrackingPolicy() {
  const [policies, setPolicies] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [expandedRow, setExpandedRow] = useState(null);
  const [previewPolicy, setPreviewPolicyState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const { toasts, addToast, removeToast } = useToasts();
  const formRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPolicies = useCallback(async () => {
    setFetching(true);
    try {
      const res = await apiPrivate.get("admin-tracking-policy/list");
      setPolicies(res.data?.results || res.data || []);
    } catch {
      addToast("error", "Failed to load policies. Please check your connection.");
    } finally {
      setFetching(false);
    }
  }, [addToast]);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  // ── Form ───────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const startEdit = (policy) => {
    setFormData({
      version: policy.version,
      title: policy.title,
      content: policy.content,
      is_active: policy.is_active,
    });
    setEditMode(true);
    setEditId(policy.id);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelEdit = () => {
    setFormData(EMPTY_FORM);
    setEditMode(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode) {
        await apiPrivate.patch(`admin-tracking-policy/update/${editId}`, formData);
        addToast("success", "Policy updated successfully.");
        cancelEdit();
      } else {
        await apiPrivate.post("admin-tracking-policy/create", formData);
        addToast("success", "Policy published successfully.");
        setFormData(EMPTY_FORM);
      }
      fetchPolicies();
    } catch {
      addToast("error", editMode ? "Failed to update policy." : "Failed to create policy.");
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiPrivate.delete(`admin/tracking-privacy/delete/${deleteTarget.id}`);
      addToast("success", "Policy deleted successfully.");
      setDeleteTarget(null);
      fetchPolicies();
    } catch {
      addToast("error", "Failed to delete policy.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Clipboard ─────────────────────────────────────────────────────────────
  const copyToClipboard = (text, label) => {
    navigator.clipboard
      .writeText(text)
      .then(() => addToast("success", `${label} copied to clipboard.`));
  };

  // ── Sort & Filter ─────────────────────────────────────────────────────────
  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const filteredPolicies = Array.isArray(policies)
    ? policies
        .filter(p => {
          if (!p) return false;
          const q = searchTerm.toLowerCase();
          return (
            p.title?.toLowerCase().includes(q) ||
            p.version?.toLowerCase().includes(q) ||
            p.content?.toLowerCase().includes(q)
          );
        })
        .sort((a, b) => {
          let av = a[sortField];
          let bv = b[sortField];
          if (sortField === "created_at") { av = new Date(av); bv = new Date(bv); }
          if (av < bv) return sortDir === "asc" ? -1 : 1;
          if (av > bv) return sortDir === "asc" ? 1 : -1;
          return 0;
        })
    : [];

  const safeArr = Array.isArray(policies) ? policies : [];
  const activePolicies = safeArr.filter(p => p?.is_active).length;
  const latestPolicy = safeArr.length
    ? [...safeArr].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── Sticky top bar ── */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3.5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <Shield className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                Tracking Policies
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                Version control for policy documents
              </p>
            </div>
          </div>
          <button
            onClick={fetchPolicies}
            disabled={fetching}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={fetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total"
            value={safeArr.length}
            icon={FileText}
            bgClass="bg-blue-50"
            colorClass="text-blue-700"
          />
          <StatCard
            label="Active"
            value={activePolicies}
            sub={`${safeArr.length - activePolicies} inactive`}
            icon={CheckCircle}
            bgClass="bg-green-50"
            colorClass="text-green-700"
          />
          <StatCard
            label="Latest Version"
            value={latestPolicy ? `v${latestPolicy.version}` : "—"}
            icon={ChevronsUpDown}
            bgClass="bg-purple-50"
            colorClass="text-purple-700"
          />
          <StatCard
            label="Last Published"
            value={
              latestPolicy
                ? new Date(latestPolicy.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "—"
            }
            sub={latestPolicy ? String(new Date(latestPolicy.created_at).getFullYear()) : ""}
            icon={Clock}
            bgClass="bg-amber-50"
            colorClass="text-amber-700"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Form panel ── */}
          <div ref={formRef} className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden lg:sticky lg:top-20">
              {/* Form header */}
              <div
                className={`px-5 py-4 border-b ${
                  editMode
                    ? "bg-amber-50 border-amber-100"
                    : "bg-slate-900 border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg ${
                      editMode ? "bg-amber-200" : "bg-white/10"
                    }`}
                  >
                    {editMode ? (
                      <Edit className="text-amber-800" size={17} />
                    ) : (
                      <PlusCircle className="text-white" size={17} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-bold text-sm ${
                        editMode ? "text-amber-900" : "text-white"
                      }`}
                    >
                      {editMode ? "Edit Policy" : "New Policy"}
                    </h3>
                    <p
                      className={`text-xs ${
                        editMode ? "text-amber-700" : "text-slate-400"
                      }`}
                    >
                      {editMode
                        ? `Editing v${formData.version}`
                        : "Publish a new version"}
                    </p>
                  </div>
                  {editMode && (
                    <button
                      onClick={cancelEdit}
                      className="text-amber-700 hover:text-amber-900 transition-colors p-1"
                      title="Cancel edit"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Version */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Version *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono font-bold">
                      v
                    </span>
                    <input
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      name="version"
                      placeholder="1.0.0"
                      value={formData.version}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Title *
                  </label>
                  <input
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    name="title"
                    placeholder="e.g., Data Tracking Policy 2025"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Content *
                    </label>
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        formData.content.length > 4000
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    >
                      {formData.content.length.toLocaleString()} chars
                    </span>
                  </div>
                  <textarea
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none font-mono leading-relaxed"
                    name="content"
                    placeholder="Enter policy content..."
                    rows={10}
                    value={formData.content}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Active toggle */}
                <div
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors select-none"
                  onClick={() =>
                    setFormData(prev => ({ ...prev, is_active: !prev.is_active }))
                  }
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Set as active</p>
                    <p className="text-xs text-gray-500">Currently enforced version</p>
                  </div>
                  <div
                    className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
                      formData.is_active ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        formData.is_active ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                    <input
                      type="checkbox"
                      className="sr-only"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-2 pt-1">
                  {editMode && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 ${
                      editMode
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : editMode ? (
                      <Check size={16} />
                    ) : (
                      <FileCheck size={16} />
                    )}
                    {loading
                      ? "Saving..."
                      : editMode
                      ? "Save Changes"
                      : "Publish Policy"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── Policy list ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* List header */}
              <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Policy History</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {filteredPolicies.length} of {safeArr.length} version
                    {safeArr.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="Search policies..."
                    className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition w-full sm:w-56"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              {fetching ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="animate-spin text-blue-600 mx-auto" size={28} />
                  <p className="text-sm text-gray-400">Loading policies…</p>
                </div>
              ) : filteredPolicies.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="bg-gray-100 rounded-2xl p-4 inline-flex mb-4">
                    <FileText className="text-gray-400" size={32} />
                  </div>
                  <h4 className="font-semibold text-gray-700 mb-1">
                    {searchTerm ? "No matching policies" : "No policies yet"}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {searchTerm
                      ? "Try a different search term"
                      : "Use the form to publish your first policy"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        {[
                          { label: "Version", field: "version", w: "w-32" },
                          { label: "Title", field: "title" },
                          { label: "Status", field: null, w: "w-28" },
                          { label: "Created", field: "created_at", w: "w-32" },
                          { label: "Actions", field: null, w: "w-24", right: true },
                        ].map(col => (
                          <th
                            key={col.label}
                            className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                              col.right ? "text-right" : "text-left"
                            } ${col.w || ""} ${col.field ? "cursor-pointer select-none hover:text-gray-700" : ""}`}
                            onClick={col.field ? () => toggleSort(col.field) : undefined}
                          >
                            <span className="flex items-center gap-1.5">
                              {col.label}
                              {col.field && (
                                <SortIcon
                                  field={col.field}
                                  sortField={sortField}
                                  sortDir={sortDir}
                                />
                              )}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredPolicies.map(policy => (
                        <>
                          {/* Main row */}
                          <tr
                            key={policy.id}
                            className={`hover:bg-blue-50/20 transition-colors cursor-pointer ${
                              expandedRow === policy.id ? "bg-blue-50/10" : ""
                            }`}
                            onClick={() =>
                              setExpandedRow(
                                expandedRow === policy.id ? null : policy.id
                              )
                            }
                          >
                            {/* Version */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                                  v{policy.version}
                                </span>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    copyToClipboard(policy.version, "Version");
                                  }}
                                  className="text-gray-300 hover:text-gray-500 transition-colors"
                                  title="Copy version"
                                >
                                  <Copy size={11} />
                                </button>
                              </div>
                            </td>

                            {/* Title */}
                            <td className="px-5 py-3.5">
                              <p
                                className="font-medium text-gray-900 truncate max-w-[180px]"
                                title={policy.title}
                              >
                                {policy.title}
                              </p>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-3.5">
                              {policy.is_active ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                  Inactive
                                </span>
                              )}
                            </td>

                            {/* Created */}
                            <td className="px-5 py-3.5">
                              <span className="text-gray-500 text-xs tabular-nums">
                                {new Date(policy.created_at).toLocaleDateString(
                                  "en-US",
                                  { year: "numeric", month: "short", day: "numeric" }
                                )}
                              </span>
                            </td>

                            {/* Actions */}
                            <td
                              className="px-5 py-3.5 text-right"
                              onClick={e => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setPreviewPolicyState(policy)}
                                  className="p-1.5 hover:bg-blue-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Preview full content"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  onClick={() => startEdit(policy)}
                                  className="p-1.5 hover:bg-amber-100 rounded-lg text-gray-400 hover:text-amber-600 transition-colors"
                                  title="Edit policy"
                                >
                                  <Edit size={15} />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(policy)}
                                  className="p-1.5 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete policy"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Inline expanded content */}
                          {expandedRow === policy.id && (
                            <tr key={`${policy.id}-exp`} className="bg-blue-50/10">
                              <td colSpan={5} className="px-5 py-3">
                                <div className="bg-white rounded-xl border border-blue-100 p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                      Content Preview
                                    </p>
                                    <button
                                      onClick={() => setPreviewPolicyState(policy)}
                                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                    >
                                      Full view <ChevronRight size={12} />
                                    </button>
                                  </div>
                                  <p className="text-sm text-gray-700 font-mono leading-relaxed line-clamp-4">
                                    {policy.content || "No content."}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer hint */}
              {!fetching && filteredPolicies.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40">
                  <p className="text-xs text-gray-400">
                    Click a row to preview content inline · Click{" "}
                    <Edit size={10} className="inline" /> to load it into the form for
                    editing
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <PreviewModal
        policy={previewPolicy}
        onClose={() => setPreviewPolicyState(null)}
      />
      <DeleteModal
        policy={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
