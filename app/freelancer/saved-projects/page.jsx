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
  Loader2,
  Trash2,
  FolderOpen
} from 'lucide-react';

export default function SavedProjectsList() {
  const router = useRouter();
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [removingId, setRemovingId] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'saved_date',
  });

  // Theme variables
  const primaryColor = '#227C70';
  const primaryHover = '#55784A';

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSavedProjects();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [filters.search, filters.sortBy]);

  const fetchSavedProjects = async () => {
    setLoading(true);
    setErrors('');
    setSuccessMessage('');
    
    try {
      const params = {};
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      // Map sort options to backend ordering
      const orderingMap = {
        'saved_date': '-saved_at',
        'title': 'title',
        'budget': '-budget',
      };
      
      if (filters.sortBy) {
        params.ordering = orderingMap[filters.sortBy] || 'saved_at';
      }

      // Make the API call to get saved projects
      const response = await apiPrivate.get('project/saved/', {
        params: params
      });

      const data = response.data;
      console.log('Saved projects response:', data);
      
      // Handle the API response structure correctly
      // The saved projects are in data.results array
      const savedProjectsData = data.results || [];
      setSavedProjects(savedProjectsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching saved projects:', error);
      setErrors('Failed to fetch saved projects. Please try again.');
      setLoading(false);
      setSavedProjects([]);
    }
  };

  const handleRemoveSaved = async (savedProjectId, projectId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    setRemovingId(savedProjectId);
    try {
      const response = await apiPrivate.post('project/save-toggle/', {
        project_id: projectId
      });

      const { saved, message } = response.data;

      if (!saved) {
        // Remove from local state
        setSavedProjects(prev => prev.filter(sp => sp.id !== savedProjectId));
        setSuccessMessage(message || 'Project removed from saved list');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error removing saved project:', error);
      setErrors(error.response?.data?.detail || 'Failed to remove from saved projects.');
      setTimeout(() => setErrors(''), 5000);
    } finally {
      setRemovingId(null);
    }
  };

  const navigateToDetails = (projectId) => {
    router.push(`/freelancer/project-details/${projectId}`);
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleSortChange = (e) => {
    setFilters({ ...filters, sortBy: e.target.value });
  };

  const formatBudget = (savedProject) => {
    const project = savedProject.project;
    if (!project || !project.budget) return 'Budget not specified';
    return `$${parseFloat(project.budget).toLocaleString()}`;
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

  const formatSavedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to get project data from saved project
  const getProjectData = (savedProject) => {
    return savedProject.project || {};
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

        {/* Error Message */}
        {errors && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {errors}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-8 h-8" style={{ color: primaryColor }} />
            <h1 className="text-4xl font-bold text-gray-900">Saved Projects</h1>
          </div>
          <p className="text-gray-600">Your bookmarked opportunities</p>
        </div>

        {/* Search and Sort */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search saved projects..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={handleSortChange}
                className="appearance-none px-6 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="saved_date">Recently Saved</option>
                <option value="title">Title</option>
                <option value="budget">Budget</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${savedProjects.length} saved projects`}
          </p>
        </div>

        {/* Saved Projects List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="inline-block animate-spin h-12 w-12" style={{ color: primaryColor }} />
            <p className="mt-4 text-gray-600">Loading saved projects...</p>
          </div>
        ) : savedProjects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No saved projects found</p>
            <p className="text-gray-500 mt-2">
              {filters.search ? 
                'Try adjusting your search terms.' : 
                'Browse projects and click the bookmark icon to save them.'}
            </p>
            {!filters.search && (
              <button
                onClick={() => router.push('/freelancer/find-jobs')}
                className="mt-4 px-6 py-2 rounded-lg transition-colors font-medium text-white"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => e.target.style.backgroundColor = primaryHover}
                onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor }
              >
                Browse Projects
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {savedProjects.map((savedProject) => {
              const savedId = savedProject.id; // This is the saved project ID
              const project = getProjectData(savedProject);
              const projectId = project.id;
              const title = project.title;
              const description = project.description;
              const category = project.category;
              const savedAt = savedProject.saved_at;
              const budget = project.budget;
              
              return (
                <div 
                  key={savedId} 
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4"
                  style={{ borderLeftColor: primaryColor }}
                  onClick={() => navigateToDetails(projectId)}
                >
                  {/* Project Header with Remove Button */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Briefcase className="w-5 h-5 text-gray-400" />
                        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                        {category && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                            {category}
                          </span>
                        )}
                      </div>
                      {description && (
                        <p className="text-gray-600 line-clamp-2">{description}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleRemoveSaved(savedId, projectId, e)}
                      disabled={removingId === savedId}
                      className="ml-4 p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      aria-label="Remove from saved"
                      title="Remove from saved projects"
                    >
                      {removingId === savedId ? (
                        <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
                      ) : (
                        <Bookmark className="w-5 h-5 fill-yellow-400 text-yellow-400 group-hover:fill-red-400 group-hover:text-red-400 transition-colors" />
                      )}
                    </button>
                  </div>

                  {/* Saved Date Badge */}
                  {savedAt && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md mb-4 border border-blue-100">
                      <Bookmark className="w-3 h-3" />
                      Saved {formatTimeAgo(savedAt)} • {formatSavedDate(savedAt)}
                    </div>
                  )}

                  {/* Project Details */}
                  <div className="flex items-center gap-8 mb-4 text-sm flex-wrap">
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">{formatBudget(savedProject)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Saved: {formatSavedDate(savedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end items-center pt-4 border-t border-gray-200">
                    <div className="flex gap-3">
                      <button 
                        onClick={(e) => handleRemoveSaved(savedId, projectId, e)}
                        disabled={removingId === savedId}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
                      >
                        {removingId === savedId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Remove
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToDetails(projectId);
                        }}
                        className="px-6 py-2 rounded-lg transition-colors font-medium text-white"
                        style={{ backgroundColor: primaryColor }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = primaryHover}
                        onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}