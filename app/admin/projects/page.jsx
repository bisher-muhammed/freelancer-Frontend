'use client';
import { useState, useEffect } from "react";
import { apiPrivate } from "@/lib/apiPrivate";
import Link from "next/link";
import { 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  User, 
  Clock,
  FileText,
  RefreshCw,
  X,
  Package,
  CheckCircle,
  AlertCircle,
  ChevronDown
} from "lucide-react";

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [budgetFilter, setBudgetFilter] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setStatsLoading(true);
            const response = await apiPrivate.get('admin-projects/');
            if (Array.isArray(response.data?.results)) {
                setProjects(response.data.results);
            } else {
                setProjects([]);
            }
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch projects. Please try again.');
        } finally {
            setLoading(false);
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Filter and sort projects
    const filteredProjects = projects
        .filter(project => {
            // Search filter
            if (search && !project.title.toLowerCase().includes(search.toLowerCase()) && 
                !project.client_email.toLowerCase().includes(search.toLowerCase())) {
                return false;
            }
            
            // Status filter
            if (statusFilter && project.status !== statusFilter) {
                return false;
            }
            
            // Budget type filter
            if (budgetFilter && project.budget_type !== budgetFilter) {
                return false;
            }
            
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.created_at || b.id) - new Date(a.created_at || a.id);
                case "oldest":
                    return new Date(a.created_at || a.id) - new Date(b.created_at || b.id);
                case "budget_high":
                    const budgetA = a.budget_type === 'fixed' ? a.fixed_budget : a.hourly_max_rate;
                    const budgetB = b.budget_type === 'fixed' ? b.fixed_budget : b.hourly_max_rate;
                    return budgetB - budgetA;
                case "budget_low":
                    const budgetA2 = a.budget_type === 'fixed' ? a.fixed_budget : a.hourly_min_rate;
                    const budgetB2 = b.budget_type === 'fixed' ? b.fixed_budget : b.hourly_min_rate;
                    return budgetA2 - budgetB2;
                default:
                    return 0;
            }
        });

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'closed':
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
            case 'active':
                return <CheckCircle className="h-3 w-3 mr-1" />;
            case 'closed':
            case 'completed':
                return <Package className="h-3 w-3 mr-1" />;
            case 'pending':
                return <Clock className="h-3 w-3 mr-1" />;
            case 'cancelled':
                return <X className="h-3 w-3 mr-1" />;
            default:
                return <AlertCircle className="h-3 w-3 mr-1" />;
        }
    };

    const getBudgetTypeColor = (type) => {
        return type === 'fixed' 
            ? 'bg-purple-100 text-purple-800 border-purple-200'
            : 'bg-orange-100 text-orange-800 border-orange-200';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("");
        setBudgetFilter("");
        setSortBy("newest");
    };

    const hasActiveFilters = search || statusFilter || budgetFilter || sortBy !== "newest";

    // Stats calculation
    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status?.toLowerCase() === 'open' || p.status?.toLowerCase() === 'active').length,
        completed: projects.filter(p => p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'closed').length,
        fixedBudget: projects.filter(p => p.budget_type === 'fixed').length,
        hourlyBudget: projects.filter(p => p.budget_type === 'hourly').length,
        pending: projects.filter(p => p.status?.toLowerCase() === 'pending').length,
        cancelled: projects.filter(p => p.status?.toLowerCase() === 'cancelled').length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Project Management</h1>
                            <p className="text-gray-700 mt-1 font-medium">Manage and monitor all projects</p>
                        </div>
                        <button
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                hasActiveFilters 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <X className="h-4 w-4" />
                            Clear Filters
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search projects by title or client..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-11 pr-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="sm:hidden px-4 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {[search, statusFilter, budgetFilter, sortBy !== "newest"].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Filters */}
                    {showFilters && (
                        <div className="sm:hidden bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium text-gray-900">Filters</h3>
                                <button onClick={() => setShowFilters(false)} className="text-gray-800 hover:text-gray-900">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-1">Status</label>
                                    <select 
                                        value={statusFilter} 
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                    >
                                        <option value="">All Status</option>
                                        <option value="open">Open</option>
                                        <option value="active">Active</option>
                                        <option value="closed">Closed</option>
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-1">Budget Type</label>
                                    <select 
                                        value={budgetFilter} 
                                        onChange={(e) => setBudgetFilter(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                    >
                                        <option value="">All Types</option>
                                        <option value="fixed">Fixed</option>
                                        <option value="hourly">Hourly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-1">Sort By</label>
                                    <select 
                                        value={sortBy} 
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="budget_high">Budget (High to Low)</option>
                                        <option value="budget_low">Budget (Low to High)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Cards - Main 4 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {statsLoading ? (
                        <>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
                                        <p className="text-gray-900 text-sm mt-1 font-medium">Total</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <FileText className="h-8 w-8 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-3xl font-bold text-green-700">{stats.active}</h3>
                                        <p className="text-gray-900 text-sm mt-1 font-medium">Active</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <Clock className="h-8 w-8 text-green-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-3xl font-bold text-blue-700">{stats.completed}</h3>
                                        <p className="text-gray-900 text-sm mt-1 font-medium">Completed</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <Calendar className="h-8 w-8 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-3xl font-bold text-purple-700">{stats.fixedBudget}</h3>
                                        <p className="text-gray-900 text-sm mt-1 font-medium">Fixed Budget</p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-lg">
                                        <DollarSign className="h-8 w-8 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Additional Stats Cards - Bottom 2 */}
                <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-yellow-700">{stats.pending}</h3>
                                <p className="text-gray-900 text-sm mt-1 font-medium">Pending</p>
                            </div>
                            <div className="bg-yellow-50 p-2 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-red-700">{stats.cancelled}</h3>
                                <p className="text-gray-900 text-sm mt-1 font-medium">Cancelled</p>
                            </div>
                            <div className="bg-red-50 p-2 rounded-lg">
                                <X className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Desktop Filters */}
                    <div className="hidden sm:block p-6 border-b border-gray-100">
                        <div className="flex flex-wrap gap-3 items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                <select 
                                    value={statusFilter} 
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                >
                                    <option value="">All Status</option>
                                    <option value="open">Open</option>
                                    <option value="active">Active</option>
                                    <option value="closed">Closed</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                <select 
                                    value={budgetFilter} 
                                    onChange={(e) => setBudgetFilter(e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                >
                                    <option value="">All Types</option>
                                    <option value="fixed">Fixed</option>
                                    <option value="hourly">Hourly</option>
                                </select>

                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="budget_high">Budget (High to Low)</option>
                                    <option value="budget_low">Budget (Low to High)</option>
                                </select>
                            </div>
                            
                            <div className="text-sm text-gray-900 font-medium">
                                Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                            <p className="mt-4 text-gray-900 font-medium">Loading projects...</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <X className="h-8 w-8 text-red-600" />
                            </div>
                            <p className="text-red-700 font-semibold">{error}</p>
                            <button
                                onClick={fetchProjects}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && filteredProjects.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-900 font-medium">No projects found.</p>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-semibold">
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* Projects Table */}
                    {!loading && filteredProjects.length > 0 && (
                        <>
                            {/* Mobile Cards */}
                            <div className="sm:hidden divide-y divide-gray-100">
                                {filteredProjects.map((project) => (
                                    <div key={project.id} className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-xs font-semibold text-gray-700">ID: #{project.id}</span>
                                                <h3 className="text-sm font-semibold text-gray-900 mt-1">{project.title}</h3>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                                                {getStatusIcon(project.status)}
                                                {project.status?.toUpperCase() || 'N/A'}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center text-gray-800">
                                                <User className="h-3 w-3 mr-2 text-gray-600" />
                                                <span className="font-medium">{project.client_email}</span>
                                            </div>
                                            <div className="flex items-center text-gray-800">
                                                {project.budget_type === 'fixed' ? (
                                                    <>
                                                        <DollarSign className="h-3 w-3 mr-2 text-gray-600" />
                                                        <span className="font-medium">₹{project.fixed_budget}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock className="h-3 w-3 mr-2 text-gray-600" />
                                                        <span className="font-medium">₹{project.hourly_min_rate} - ₹{project.hourly_max_rate}/hr</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-700">
                                                Created: {formatDate(project.created_at)}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getBudgetTypeColor(project.budget_type)}`}>
                                                {project.budget_type?.toUpperCase() || 'N/A'}
                                            </span>
                                            <Link
                                                href={`/admin/projects/${project.id}`}
                                                className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                                            >
                                                <Eye className="h-3 w-3 mr-1" />
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table - Full Width Scrollable */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase whitespace-nowrap">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase whitespace-nowrap min-w-[200px]">Project</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase whitespace-nowrap min-w-[180px]">Client</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase whitespace-nowrap">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase whitespace-nowrap">Budget</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase whitespace-nowrap">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase whitespace-nowrap min-w-[120px]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredProjects.map((project) => (
                                            <tr key={project.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">#{project.id}</td>
                                                <td className="px-4 py-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{project.title}</p>
                                                        <p className="text-xs text-gray-700 mt-1">{formatDate(project.created_at)}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 text-gray-600 mr-2" />
                                                        <span className="text-sm text-gray-900 font-medium">{project.client_email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(project.status)}`}>
                                                        {getStatusIcon(project.status)}
                                                        {project.status?.toUpperCase() || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {project.budget_type === 'fixed' ? (
                                                            <div className="flex items-center">
                                                                <DollarSign className="h-4 w-4 mr-2 text-gray-700" />
                                                                ₹{project.fixed_budget}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center">
                                                                <Clock className="h-4 w-4 mr-2 text-gray-700" />
                                                                ₹{project.hourly_min_rate} - ₹{project.hourly_max_rate}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap ${getBudgetTypeColor(project.budget_type)}`}>
                                                        {project.budget_type?.toUpperCase() || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Link
                                                        href={`/admin/projects/${project.id}`}
                                                        className="inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!loading && filteredProjects.length > 0 && (
                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between text-sm">
                        <div className="text-gray-900 font-medium">
                            Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                        </div>
                        <button 
                            onClick={fetchProjects} 
                            className="mt-2 sm:mt-0 flex items-center gap-2 text-blue-700 hover:text-blue-800 font-semibold"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}