'use client';
import React, { useState, useEffect } from 'react';
import { Search, Clock, Users, DollarSign, MoreVertical } from 'lucide-react';
import { apiPrivate } from '@/lib/apiPrivate';
import Link from 'next/link';


export default function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiPrivate.get('projects/');
        console.log(response.data);
        setProjects(response.data.results || []);
      } catch (err) {
        setError('Failed to fetch projects.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-700';
      case 'review':
        return 'bg-orange-100 text-orange-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDuration = (duration) => {
    const durationMap = {
      '1_3_months': '1-3 months',
      '3_6_months': '3-6 months',
      '6_12_months': '6-12 months',
      'more_than_12_months': '12+ months'
    };
    return durationMap[duration] || duration;
  };

  const calculateDaysAgo = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  };

  // Calculate tab counts dynamically
  const getStatusCount = (status) => {
    if (status === 'all') return projects.length;
    return projects.filter(p => p.status?.toLowerCase() === status).length;
  };

  const tabs = [
    { id: 'all', label: 'All', count: getStatusCount('all') },
    { id: 'open', label: 'Open', count: getStatusCount('open') },
    { id: 'in_progress', label: 'In Progress', count: getStatusCount('in_progress') },
    { id: 'review', label: 'Review', count: getStatusCount('review') },
    { id: 'completed', label: 'Completed', count: getStatusCount('completed') }
  ];

  // Filter by search term and active tab
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || project.status?.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
          <p className="text-gray-600">Manage all your posted projects</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No projects found</p>
            </div>
          ) : (
            filteredProjects.map(project => (
              <div
                key={project.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                        {formatStatus(project.status)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                        {project.experience_level}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                        {formatDuration(project.duration)}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Description preview */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-1 text-gray-700">
                    <DollarSign className="w-5 h-5" />
                    <div>
                      <span className="font-semibold">
                        ${parseFloat(project.fixed_budget || 0).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        {project.budget_type === 'fixed' ? 'Fixed' : 'Hourly'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-gray-700">
                    <Users className="w-5 h-5" />
                    <div>
                      <span className="font-semibold">
                        {project.assignment_type === 'single' ? 'Single' : 'Team'}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">assignment</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-gray-700">
                    <Clock className="w-5 h-5" />
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Posted {calculateDaysAgo(project.created_at)}
                      </div>
                    </div>
                  </div>

                  <Link href={`/client/my-projects/${project.id}`}>
                  <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    View Details
                  </button>
                </Link>

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
