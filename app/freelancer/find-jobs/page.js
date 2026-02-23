"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]); // Store all projects for client-side filtering
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    minBudget: 0,
    maxBudget: 50000,
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
  const primaryHover = '#1a6359';

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [filters.search, filters.category, filters.status, filters.minBudget, filters.maxBudget, filters.sortBy, filters.experience_level, allProjects]);

  const fetchProjects = async () => {
    setLoading(true);
    setErrors('');
    setSuccessMessage('');
    
    try {
      // Fetch all open projects without filters
      const response = await apiPrivate.get('freelancer-projects/open');
      const data = response.data;
      
      // Handle paginated or direct response
      if (data.results) {
        setAllProjects(data.results);
      } else {
        setAllProjects(data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setErrors('Failed to fetch projects. Please try again.');
      setLoading(false);
      setAllProjects([]);
      setProjects([]);
    }
  };

  const applyFilters = () => {
    let filtered = [...allProjects];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(project => {
        const title = project.title?.toLowerCase() || '';
        const description = project.description?.toLowerCase() || '';
        const skills = project.skills_required?.map(s => 
          typeof s === 'string' ? s.toLowerCase() : (s.name || '').toLowerCase()
        ).join(' ') || '';
        
        return title.includes(searchLower) || 
               description.includes(searchLower) || 
               skills.includes(searchLower);
      });
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(project => 
        project.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Experience level filter
    if (filters.experience_level) {
      filtered = filtered.filter(project => 
        project.experience_level?.toLowerCase() === filters.experience_level.toLowerCase()
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'most_recent':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'highest_budget':
          const budgetA = a.budget_type === 'fixed' ? (a.fixed_budget || 0) : (a.hourly_max_rate || 0);
          const budgetB = b.budget_type === 'fixed' ? (b.fixed_budget || 0) : (b.hourly_max_rate || 0);
          return budgetB - budgetA;
        case 'lowest_budget':
          const budgetA2 = a.budget_type === 'fixed' ? (a.fixed_budget || 0) : (a.hourly_min_rate || 0);
          const budgetB2 = b.budget_type === 'fixed' ? (b.fixed_budget || 0) : (b.hourly_min_rate || 0);
          return budgetA2 - budgetB2;
        default:
          return 0;
      }
    });

    // Update pagination
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (pagination.page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProjects = filtered.slice(startIndex, endIndex);

    setProjects(paginatedProjects);
    setPagination({
      ...pagination,
      count: filtered.length,
      totalPages: totalPages,
      nextPage: pagination.page < totalPages ? true : null,
      prevPage: pagination.page > 1 ? true : null,
    });
  };

  const navigateToDetails = (projectId) => {
    router.push(`/freelancer/project-details/${projectId}`);
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
    // Ensure min doesn't exceed max
    if (value <= filters.maxBudget) {
      setFilters({ ...filters, minBudget: value });
    }
  };

  const handleMaxBudgetChange = (e) => {
    const value = parseInt(e.target.value);
    // Ensure max doesn't go below min
    if (value >= filters.minBudget) {
      setFilters({ ...filters, maxBudget: value });
    }
  };

  const handleSortChange = (e) => {
    setFilters({ ...filters, sortBy: e.target.value });
  };

  const handleApply = (projectId) => {
    navigateToDetails(projectId);
  };

  const handleBookmark = async (projectId) => {
    try {
      const response = await apiPrivate.post('project/save-toggle/', {
        project_id: projectId
      });

      const { saved, message } = response.data;

      // Update the project in the state
      setProjects(prevProjects => 
        prevProjects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              is_saved: saved,
              saved_count: saved 
                ? (project.saved_count || 0) + 1
                : Math.max(0, (project.saved_count || 1) - 1)
            };
          }
          return project;
        })
      );

      // Show success message
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('Error toggling bookmark:', error);
      
      let errorMessage = 'Failed to save project. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setErrors(errorMessage);
      setTimeout(() => setErrors(''), 5000);
    }
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Trigger re-filter
      setTimeout(() => applyFilters(), 0);
    }
  };

  const handlePrevPage = () => {
    if (pagination.prevPage) {
      setPagination({ ...pagination, page: pagination.page - 1 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Trigger re-filter
      setTimeout(() => applyFilters(), 0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 flex items-center gap-2 font-medium">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errors && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 flex items-center gap-2 font-medium">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errors}</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
          <p className="text-gray-700 text-lg">Find your next opportunity</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs by title, skills, or keywords..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>
            <button 
              onClick={() => {
                setFilters({
                  search: '',
                  category: 'all',
                  status: '',
                  minBudget: 0,
                  maxBudget: 50000,
                  sortBy: 'most_recent',
                  experience_level: '',
                });
                setPagination({ ...pagination, page: 1 });
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-900 font-medium"
            >
              <XCircle className="w-4 h-4" />
              Reset Filters
            </button>
          </div>

          {/* Active Filters Display */}
          {(filters.search || filters.status || filters.experience_level) && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Active Filters:</span>
              {filters.search && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-1 font-medium">
                  Search: "{filters.search}"
                  <button onClick={() => setFilters({...filters, search: ''})} className="hover:bg-blue-200 rounded-full p-0.5">
                    <XCircle className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1 font-medium capitalize">
                  {filters.status.replace('_', ' ')}
                  <button onClick={() => setFilters({...filters, status: ''})} className="hover:bg-green-200 rounded-full p-0.5">
                    <XCircle className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.experience_level && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full flex items-center gap-1 font-medium capitalize">
                  {filters.experience_level}
                  <button onClick={() => setFilters({...filters, experience_level: ''})} className="hover:bg-orange-200 rounded-full p-0.5">
                    <XCircle className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Additional Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={handleStatusChange}
                className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown className="absolute right-3 bottom-2.5 text-gray-500 w-4 h-4 pointer-events-none" />
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Experience Level</label>
              <select
                value={filters.experience_level}
                onChange={handleExperienceChange}
                className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 cursor-pointer"
              >
                <option value="">All Experience Levels</option>
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
              <ChevronDown className="absolute right-3 bottom-2.5 text-gray-500 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-900 font-semibold text-lg">
            {loading ? 'Loading...' : `${pagination.count || projects.length} jobs found`}
          </p>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium cursor-pointer"
            >
              <option value="most_recent">Most Recent</option>
              <option value="oldest">Oldest</option>
              <option value="highest_budget">Highest Budget</option>
              <option value="lowest_budget">Lowest Budget</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <Loader2 className="inline-block animate-spin h-12 w-12 text-blue-600" />
            <p className="mt-4 text-gray-700 font-medium">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold mb-2">No projects found</p>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200">
                  {/* Project Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h2 className="text-xl font-bold text-gray-900">{project.title}</h2>
                        {project.client?.is_verified && (
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                            ✓ Verified Client
                          </span>
                        )}
                        {project.status && (
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            project.status === 'open' ? 'bg-green-50 text-green-800 border border-green-200' :
                            project.status === 'in_progress' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                            'bg-gray-50 text-gray-800 border border-gray-200'
                          }`}>
                            {project.status.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed line-clamp-2">{project.description}</p>
                    </div>
                    <button
                      onClick={() => handleBookmark(project.id)}
                      className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors group flex-shrink-0"
                      aria-label={project.is_saved ? "Remove from saved" : "Save project"}
                    >
                      <Bookmark 
                        className={`w-6 h-6 transition-colors ${
                          project.is_saved 
                            ? 'fill-yellow-500 text-yellow-500' 
                            : 'text-gray-400 group-hover:text-yellow-500'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Skills */}
                  {project.skills_required && project.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills_required.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-gray-100 text-gray-800 text-sm font-medium rounded-md border border-gray-200"
                        >
                          {typeof skill === 'string' ? skill : skill.name || skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Project Details */}
                  <div className="flex items-center gap-6 mb-4 text-sm flex-wrap">
                    <div className="flex items-center gap-2 text-gray-800">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <span className="font-bold">{formatBudget(project)}</span>
                      <span className="text-gray-600 capitalize">({project.budget_type})</span>
                    </div>
                    {project.duration && (
                      <div className="flex items-center gap-2 text-gray-800">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">{project.duration}</span>
                      </div>
                    )}
                    {project.experience_level && (
                      <div className="flex items-center gap-2 text-gray-800">
                        <Briefcase className="w-4 h-4 text-gray-600" />
                        <span className="capitalize font-medium">{project.experience_level}</span>
                      </div>
                    )}
                    {project.proposals_count !== undefined && (
                      <div className="flex items-center gap-2 text-gray-800">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">{project.proposals_count || 0} proposals</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span>Posted {formatTimeAgo(project.created_at)}</span>
                    </div>
                    {project.saved_count > 0 && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Bookmark className="w-4 h-4 text-gray-500" />
                        <span>{project.saved_count} saved</span>
                      </div>
                    )}
                  </div>

                  {/* Client Info and Apply Button */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-800">
                      <span className="font-medium">Client: {project.client?.company_name || project.client?.username || 'Anonymous'}</span>
                      {project.client?.average_rating && (
                        <>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-gray-900">{project.client.average_rating}</span>
                            {project.client.total_reviews && (
                              <span className="text-gray-600">({project.client.total_reviews} reviews)</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <button 
                      onClick={() => handleApply(project.id)}
                      className="px-6 py-2.5 rounded-lg transition-all font-semibold text-white shadow-sm hover:shadow-md"
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
              <div className="flex justify-center items-center gap-4 mt-8 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <button
                  onClick={handlePrevPage}
                  disabled={!pagination.prevPage}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-900"
                >
                  Previous
                </button>
                <span className="text-gray-900 font-semibold">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.nextPage}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-900"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom styles for range sliders */}
      <style jsx>{`
        .range-slider {
          pointer-events: none;
        }

        .range-slider::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: ${primaryColor};
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        .range-slider::-moz-range-thumb {
          pointer-events: auto;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: ${primaryColor};
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        .range-slider::-webkit-slider-thumb:hover {
          background: ${primaryHover};
          transform: scale(1.15);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
        }

        .range-slider::-moz-range-thumb:hover {
          background: ${primaryHover};
          transform: scale(1.15);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
        }

        .range-slider::-webkit-slider-thumb:active {
          transform: scale(1.25);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
        }

        .range-slider::-moz-range-thumb:active {
          transform: scale(1.25);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
        }

        .range-slider:focus {
          outline: none;
        }

        .range-slider::-webkit-slider-runnable-track {
          background: transparent;
        }

        .range-slider::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}