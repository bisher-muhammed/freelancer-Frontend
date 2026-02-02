"use client";

import { useEffect, useState } from "react";
import { apiPrivate } from "@/lib/apiPrivate";
import { 
  PlusCircle, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  List, 
  Clock,
  Eye,
  Edit,
  Trash2,
  Copy,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  Shield,
  FileCheck,
  AlertCircle,
  ChevronLeft,
  ChevronsUpDown,
  RefreshCw
} from "lucide-react";

export default function TrackingPolicy() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    version: "",
    title: "",
    content: "",
    is_active: true,
  });

  // Fetch policies
  const fetchPolicies = async () => {
    setFetching(true);
    try {
      const res = await apiPrivate.get("admin-tracking-policy/list");
      // Extract policies from results array in the response
      setPolicies(res.data?.results || res.data || []);
    } catch (err) {
      console.error("Failed to load policies", err);
      setMessage({ 
        type: "error", 
        text: "Failed to load policies. Please check your connection." 
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Create policy
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await apiPrivate.post("admin-tracking-policy/create", formData);
      setFormData({
        version: "",
        title: "",
        content: "",
        is_active: true,
      });
      setMessage({ 
        type: "success", 
        text: "✅ Policy created successfully!" 
      });
      fetchPolicies();
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: "❌ Failed to create policy." 
      });
      console.error("Create failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter policies based on search - FIXED: Check if policies is array
  const filteredPolicies = Array.isArray(policies) 
    ? policies.filter(policy => {
        if (!policy) return false;
        return (
          policy.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          policy.version?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          policy.content?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : [];

  // Active policy count
  const activePolicies = Array.isArray(policies) 
    ? policies.filter(p => p?.is_active).length 
    : 0;

  // Preview policy
  const previewPolicy = (policy) => {
    setSelectedPolicy(policy);
    setShowPreview(true);
  };

  // Delete policy
  const handleDeletePolicy = async (policyId) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      try {
        await apiPrivate.delete(`admin/tracking-privacy/delete/${policyId}`);
        setMessage({ type: "success", text: "Policy deleted!" });
        fetchPolicies();
      } catch (err) {
        setMessage({ type: "error", text: "Failed to delete policy." });
        console.error("Delete failed", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Shield className="text-blue-600" size={32} />
                Tracking Policies
              </h1>
              <p className="text-gray-600 text-lg">
                Manage tracking policy documents
              </p>
            </div>
            <button 
              onClick={fetchPolicies}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Policies</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(policies) ? policies.length : 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="text-blue-600" size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Active Policies</p>
                  <p className="text-2xl font-bold text-green-600">{activePolicies}</p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="text-green-600" size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Latest Version</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Array.isArray(policies) && policies.length > 0 
                      ? `v${policies[0]?.version}`
                      : 'v0.0.0'
                    }
                  </p>
                </div>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <ChevronsUpDown className="text-purple-600" size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Last Updated</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Array.isArray(policies) && policies.length > 0 
                      ? new Date(policies[0]?.created_at || Date.now()).toLocaleDateString()
                      : 'No policies'
                    }
                  </p>
                </div>
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Clock className="text-amber-600" size={22} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Policy Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                  <PlusCircle className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Create New Policy</h3>
                  <p className="text-sm text-gray-500">Add a new tracking policy version</p>
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl mb-6 ${
                  message.type === "success" 
                    ? "bg-green-50 border border-green-200 text-green-800" 
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}>
                  <div className="flex items-center gap-2">
                    {message.type === "success" ? (
                      <CheckCircle size={20} />
                    ) : (
                      <AlertCircle size={20} />
                    )}
                    <p className="font-medium">{message.text}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Version Number *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      v
                    </div>
                    <input
                      className="w-full pl-8 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      name="version"
                      placeholder="1.0.0"
                      value={formData.version}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Policy Title *
                  </label>
                  <input
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    name="title"
                    placeholder="e.g., Data Tracking Policy 2024"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Policy Content *
                  </label>
                  <textarea
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[200px]"
                    name="content"
                    placeholder="Enter policy content..."
                    rows={8}
                    value={formData.content}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <input
                    type="checkbox"
                    id="is_active"
                    className="w-5 h-5 text-blue-600 rounded"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <label htmlFor="is_active" className="cursor-pointer">
                    <p className="font-semibold text-gray-800">Set as Active Policy</p>
                    <p className="text-sm text-gray-600">
                      This will become the currently enforced policy
                    </p>
                  </label>
                </div>

                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <FileCheck size={20} />
                      Publish New Policy
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Policies List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-800 p-2 rounded-lg">
                      <List className="text-white" size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Policy History</h3>
                      <p className="text-sm text-gray-500">All tracking policy versions</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search policies..."
                        className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          viewMode === 'list' 
                            ? 'bg-white text-gray-900' 
                            : 'text-gray-600'
                        }`}
                        onClick={() => setViewMode('list')}
                      >
                        List
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          viewMode === 'grid' 
                            ? 'bg-white text-gray-900' 
                            : 'text-gray-600'
                        }`}
                        onClick={() => setViewMode('grid')}
                      >
                        Grid
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              {fetching ? (
                <div className="py-20 text-center">
                  <Loader2 className="animate-spin text-blue-600 mx-auto" size={36} />
                  <p className="text-lg font-medium text-gray-700 mt-4">Loading policies...</p>
                </div>
              ) : filteredPolicies.length === 0 ? (
                <div className="py-20 text-center">
                  <FileText className="text-gray-400 mx-auto mb-4" size={48} />
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">
                    {searchTerm ? "No matching policies" : "No policies yet"}
                  </h4>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? `No policies match "${searchTerm}"`
                      : "Create your first tracking policy"
                    }
                  </p>
                </div>
              ) : viewMode === 'list' ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Version</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Title</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Created</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPolicies.map((policy) => (
                        <tr key={policy.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                              v{policy.version}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">{policy.title}</p>
                          </td>
                          <td className="px-6 py-4">
                            {policy.is_active ? (
                              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-gray-600">
                                {new Date(policy.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => previewPolicy(policy)}
                                className="p-2 hover:bg-blue-50 rounded-lg text-gray-600 hover:text-blue-600"
                                title="Preview"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                className="p-2 hover:bg-green-50 rounded-lg text-gray-600 hover:text-green-600"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeletePolicy(policy.id)}
                                className="p-2 hover:bg-red-50 rounded-lg text-gray-600 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPolicies.map((policy) => (
                    <div 
                      key={policy.id} 
                      className={`border rounded-xl p-5 cursor-pointer ${
                        policy.is_active 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => previewPolicy(policy)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          policy.is_active 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          v{policy.version}
                        </span>
                      </div>

                      <h4 className="font-bold text-lg text-gray-900 mb-2">
                        {policy.title}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {policy.content}
                      </p>

                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={14} />
                          <span>
                            {new Date(policy.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 font-medium text-sm">
                          View Details
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing {filteredPolicies.length} of {Array.isArray(policies) ? policies.length : 0} policies
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedPolicy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Policy Preview</h3>
                  <p className="text-sm text-gray-500">v{selectedPolicy.version}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-900">{selectedPolicy.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    selectedPolicy.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedPolicy.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <pre className="whitespace-pre-wrap font-mono text-gray-800">
                  {selectedPolicy.content}
                </pre>
              </div>
            </div>

            <div className="px-6 py-4 border-t">
              <button
                onClick={() => setShowPreview(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}