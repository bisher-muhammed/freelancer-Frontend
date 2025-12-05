"use client";

import { useEffect, useState, useCallback } from "react";
import { apiPrivate } from "@/lib/apiPrivate";
import { 
  Users, Briefcase, UserCheck, Shield, Ban, 
  CheckCircle, Eye, Search, Filter, X, 
  ChevronLeft, ChevronRight, Loader2,
  MoreVertical, User, Mail, Calendar
} from 'lucide-react';
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingUserId, setTogglingUserId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [filters, setFilters] = useState({
    role: "",
    isActive: "",
    search: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    count: 0,
    totalPages: 0,
  });

  // Theme variables
  const primaryColor = '#227C70';
  const primaryHover = '#55784A';
  const primaryLight = `${primaryColor}15`;

  // Debounced search
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiPrivate.get("/users", {
        params: {
          role: filters.role,
          is_active: filters.isActive,
          search: filters.search,
          page: pagination.page,
          page_size: 10, // Smaller page size for mobile
        },
      });

      setUsers(response.data.results);
      setPagination(prev => ({
        ...prev,
        count: response.data.count,
        totalPages: Math.ceil(response.data.count / 10),
      }));
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters.role, filters.isActive, filters.search, pagination.page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUserStatus = async (userId, currentStatus) => {
    if (togglingUserId) return;
    
    setTogglingUserId(userId);
    setError("");
    
    try {
      const response = await apiPrivate.post("toggle_block/", {
        user_id: userId
      });

      const { is_active, message } = response.data;
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, is_active } 
            : user
        )
      );

      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update user status");
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ role: "", isActive: "", search: "" });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = debounce((value) => {
    handleFilterChange("search", value);
  }, 500);

  const hasActiveFilters = filters.role || filters.isActive || filters.search;

  // Responsive table columns
  const getVisibleColumns = () => {
    if (typeof window === 'undefined') return 6;
    const width = window.innerWidth;
    if (width < 640) return 2; // Mobile: User & Actions only
    if (width < 1024) return 4; // Tablet: User, Role, Status, Actions
    return 6; // Desktop: All columns
  };

  // Mobile-friendly user card
  const UserCard = ({ user }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3 animate-in fade-in duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className="h-10 w-10 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: primaryLight }}>
              <User className="h-5 w-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <div className="font-medium text-gray-900 truncate max-w-[150px]">
                {user.username || "No username"}
              </div>
              <div className="text-xs text-gray-500 flex items-center mt-1">
                <Mail className="h-3 w-3 mr-1" />
                <span className="truncate max-w-[180px]">{user.email}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
              ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                user.role === 'client' ? 'bg-blue-100 text-blue-800' : 
                'bg-green-100 text-green-800'}`}>
              {user.role}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
              ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
              <Calendar className="h-3 w-3 mr-1.5" />
              {new Date(user.date_joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {user.role === 'freelancer' && (
          <Link
            href={`/admin/freelancers?user=${user.id}`}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:shadow-sm"
            style={{ backgroundColor: primaryLight, color: primaryColor }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Profile
          </Link>

          )}
          
          <button
            onClick={() => toggleUserStatus(user.id, user.is_active)}
            disabled={togglingUserId === user.id}
            className={`p-2 rounded-lg transition-all duration-200 ${
              user.is_active 
                ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
            title={user.is_active ? "Block User" : "Unblock User"}
          >
            {togglingUserId === user.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : user.is_active ? (
              <Ban className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 pt-3 border-t border-gray-100">
        ID: {user.id}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 animate-in fade-in duration-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Users className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 mr-2 sm:mr-3" style={{ color: primaryColor }} />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">User Management</h1>
          </div>
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-white border border-gray-200 shadow-sm"
          >
            <Filter className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600">Manage and monitor platform users</p>
      </div>

      {/* Messages */}
      {(successMessage || error) && (
        <div className="mb-4 sm:mb-6 animate-in fade-in duration-300">
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2" />
                <div className="text-green-800 text-sm sm:text-base">{successMessage}</div>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center">
                <Ban className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2" />
                <div className="text-red-800 text-sm sm:text-base">{error}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Filter Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={filters.role}
                  onChange={(e) => {
                    handleFilterChange("role", e.target.value);
                    setMobileMenuOpen(false);
                  }}
                >
                  <option value="">All Roles</option>
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={filters.isActive}
                  onChange={(e) => {
                    handleFilterChange("isActive", e.target.value);
                    setMobileMenuOpen(false);
                  }}
                >
                  <option value="">All Users</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm"
                    placeholder="Search users..."
                    defaultValue={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearFilters();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar (Desktop) */}
      <div className="hidden lg:block mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2"
                  style={{ focusRingColor: primaryColor }}
                  placeholder="Search by email or username..."
                  defaultValue={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ focusRingColor: primaryColor }}
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
                <option value="admin">Admin</option>
              </select>
              
              <select
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ focusRingColor: primaryColor }}
                value={filters.isActive}
                onChange={(e) => handleFilterChange("isActive", e.target.value)}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { icon: Users, label: "Total", value: pagination.count, color: "text-gray-900" },
          { icon: Briefcase, label: "Clients", value: users.filter(u => u.role === 'client').length, color: "text-blue-600" },
          { icon: UserCheck, label: "Freelancers", value: users.filter(u => u.role === 'freelancer').length, color: "text-green-600" },
          { icon: Shield, label: "Admins", value: users.filter(u => u.role === 'admin').length, color: "text-purple-600" },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  {stat.label}
                </div>
              </div>
              <div 
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: primaryLight }}
              >
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: primaryColor }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="text-sm sm:text-base text-gray-600">
          {pagination.count > 0 ? (
            `Showing ${Math.min((pagination.page - 1) * 10 + 1, pagination.count)}-${Math.min(pagination.page * 10, pagination.count)} of ${pagination.count} users`
          ) : 'No users found'}
        </div>
        
        {/* Mobile Search */}
        <div className="lg:hidden flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Users List/Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin mb-3" style={{ color: primaryColor }} />
                      <div className="text-gray-600">Loading users...</div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="h-12 w-12 text-gray-300 mb-3" />
                      <div className="text-gray-500 text-lg font-medium mb-2">
                        {hasActiveFilters ? "No users match your filters" : "No users found"}
                      </div>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-sm font-medium transition-colors duration-200 hover:underline"
                          style={{ color: primaryColor }}
                        >
                          Clear filters to see all users
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center mr-3"
                          style={{ backgroundColor: primaryLight }}>
                          <User className="h-5 w-5" style={{ color: primaryColor }} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.username || "No username"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'client' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                        ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(user.date_joined).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                        disabled={togglingUserId === user.id}
                        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                          ${user.is_active 
                            ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {togglingUserId === user.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Updating...
                          </>
                        ) : user.is_active ? (
                          <>
                            <Ban className="h-4 w-4 mr-2" />
                            Block
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Unblock
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'freelancer' ? (
                        <Link
                          href={`/admin/freelancers?user=${user.id}`}
                          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:shadow-sm"
                          style={{ backgroundColor: primaryLight, color: primaryColor }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Link>

                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: primaryColor }} />
              <div className="text-gray-600">Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <div className="text-gray-500 font-medium mb-2">
                {hasActiveFilters ? "No users match your filters" : "No users found"}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm font-medium transition-colors duration-200 hover:underline"
                  style={{ color: primaryColor }}
                >
                  Clear filters to see all users
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 sm:p-4">
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-gray-100 px-4 py-3 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors duration-200
                          ${pagination.page === pageNum
                            ? 'text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        style={{
                          backgroundColor: pagination.page === pageNum ? primaryColor : 'transparent'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: pagination.totalPages }))}
                        className="h-8 w-8 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        {pagination.totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
