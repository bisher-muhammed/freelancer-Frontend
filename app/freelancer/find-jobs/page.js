"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Added missing import
import { apiPrivate } from "@/lib/apiPrivate";
import { 
  Search, 
  DollarSign, 
  Clock, 
  Users, 
  Bookmark, 
  ChevronDown, 
  Star,
  Briefcase,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

export default function OpenProjectsList() {
  const router = useRouter(); // Added router initialization
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: '',
    minBudget: 0,
    maxBudget: 10000,
    sortBy: 'most_recent',
    experience_level: '',
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    count: 0,
    nextPage: null,
    prevPage: null,
    totalPages: 0,
  });

  // Theme variables
  const primaryColor = '#227C70';
  const primaryHover = '#55784A';

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [filters.search, filters.category, filters.status, filters.minBudget, filters.maxBudget, filters.sortBy, filters.experience_level, pagination.page]);

  const fetchProjects = async () => {
    setLoading(true);
    setErrors('');
    setSuccessMessage('');
    
    try {
      // Build query parameters
      const params = {};
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      if (filters.category && filters.category !== 'all') {
        params.category = filters.category;
      }

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.experience_level) {
        params.experience_level = filters.experience_level;
      }
      
      if (filters.minBudget > 0) {
        params.budget_min = filters.minBudget;
      }
      
      if (filters.maxBudget < 10000) {
        params.budget_max = filters.maxBudget;
      }
      
      // Map sort options to backend ordering
      const orderingMap = {
        'most_recent': '-created_at',
        'oldest': 'created_at',
        'highest_budget': '-fixed_budget',
        'lowest_budget': 'fixed_budget',
      };
      
      if (filters.sortBy) {
        params.ordering = orderingMap[filters.sortBy] || '-created_at';
      }
      
      params.page = pagination.page;

      // Make the API call
      const response = await apiPrivate.get('freelancer-projects/open', {
        params: params
      });

      const data = response.data;
      console.log(data)
      
      // Handle paginated response
      if (data.results) {
        setProjects(data.results);
        setPagination({
          ...pagination,
          count: data.count,
          nextPage: data.next,
          prevPage: data.previous,
          totalPages: Math.ceil(data.count / 10)
        });
      } else {
        setProjects(data);
        setPagination({
          ...pagination,
          count: data.length,
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setErrors('Failed to fetch projects. Please try again.');
      setLoading(false);
      setProjects([]);
    }
  };

  const navigateToDetails = (projectId) => {
    router.push(`/freelancer/project-details/${projectId}`); // navigate to project details page
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleCategoryChange = (e) => {
    setFilters({ ...filters, category: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleStatusChange = (e) => {
    setFilters({ ...filters, status: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleExperienceChange = (e) => {
    setFilters({ ...filters, experience_level: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleMinBudgetChange = (e) => {
    const value = parseInt(e.target.value);
    setFilters({ ...filters, minBudget: value });
  };

  const handleMaxBudgetChange = (e) => {
    const value = parseInt(e.target.value);
    setFilters({ ...filters, maxBudget: value });
  };

  const handleSortChange = (e) => {
    setFilters({ ...filters, sortBy: e.target.value });
  };

  // Fixed: Removed duplicate and now calls navigateToDetails
  const handleApply = (projectId) => {
    navigateToDetails(projectId); // navigate to details page where Apply button exists
  };

  const handleBookmark = (projectId) => {
    console.log('Bookmarked project:', projectId);
  };

  const formatBudget = (project) => {
    if (project.budget_type === 'hourly') {
      return `$${project.hourly_min_rate}/hr - $${project.hourly_max_rate}/hr`;
    } else if (project.budget_type === 'fixed') {
      return `$${project.fixed_budget?.toLocaleString()}`;
    }
    return 'Budget not specified';
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  const handleNextPage = () => {
    if (pagination.nextPage) {
      setPagination({ ...pagination, page: pagination.page + 1 });
    }
  };

  const handlePrevPage = () => {
    if (pagination.prevPage) {
      setPagination({ ...pagination, page: pagination.page - 1 });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
          <p className="text-gray-600">Find your next opportunity</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs by title, skills, or keywords..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <select
                value={filters.category}
                onChange={handleCategoryChange}
                className="appearance-none px-6 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Categories</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="writing">Writing</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
            <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>

          {/* Budget Range Slider */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700">Budget Range</label>
              <span className="text-sm text-gray-600">${filters.minBudget} - ${filters.maxBudget}</span>
            </div>
            <div className="flex gap-4 items-center">
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={filters.minBudget}
                onChange={handleMinBudgetChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={filters.maxBudget}
                onChange={handleMaxBudgetChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${pagination.count || projects.length} jobs found`}
          </p>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="most_recent">Most Recent</option>
              <option value="oldest">Oldest</option>
              <option value="highest_budget">Highest Budget</option>
              <option value="lowest_budget">Lowest Budget</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="inline-block animate-spin h-12 w-12 text-blue-600" />
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : errors ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {errors}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No projects found matching your criteria.</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  {/* Project Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">{project.title}</h2>
                        {project.client?.is_verified && (
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                            Verified Client
                          </span>
                        )}
                        {project.status && (
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            project.status === 'open' ? 'bg-green-50 text-green-700 border border-green-200' :
                            project.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                            'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}>
                            {project.status.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 leading-relaxed">{project.description}</p>
                    </div>
                    <button
                      onClick={() => handleBookmark(project.id)}
                      className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Bookmark className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Skills */}
                  {project.skills_required && project.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills_required.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                        >
                          {typeof skill === 'string' ? skill : skill.name || skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Project Details */}
                  <div className="flex items-center gap-8 mb-4 text-sm flex-wrap">
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">{formatBudget(project)}</span>
                      <span className="text-gray-500 capitalize">{project.budget_type}</span>
                    </div>
                    {project.duration && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{project.duration}</span>
                      </div>
                    )}
                    {project.experience_level && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        <span className="capitalize">{project.experience_level}</span>
                      </div>
                    )}
                    {project.proposals_count !== undefined && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{project.proposals_count || 0} proposals</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Posted {formatTimeAgo(project.created_at)}</span>
                    </div>
                  </div>

                  {/* Client Info and Apply Button */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Client: {project.client?.company_name || project.client?.username || 'Anonymous'}</span>
                      {project.client?.average_rating && (
                        <>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{project.client.average_rating}</span>
                            {project.client.total_reviews && (
                              <span className="text-gray-500">({project.client.total_reviews} reviews)</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <button 
                      onClick={() => handleApply(project.id)}
                      className="px-6 py-2 rounded-lg transition-colors font-medium text-white"
                      style={{ backgroundColor: primaryColor }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = primaryHover}
                      onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={handlePrevPage}
                  disabled={!pagination.prevPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.nextPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}