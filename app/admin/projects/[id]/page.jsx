'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiPrivate } from '@/lib/apiPrivate';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  FileText, 
  Tag, 
  Briefcase, 
  Users, 
  Award,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Shield,
  Hash,
  Layers,
  Clock3,
  Loader2
} from 'lucide-react';

export default function AdminProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mark component as mounted to prevent memory leaks
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const extractSkillIds = useCallback((skillsArray) => {
    if (!skillsArray || !Array.isArray(skillsArray)) return [];
    
    const skillIds = [];
    skillsArray.forEach(skill => {
      if (typeof skill === 'string') {
        // Handle string format like "Skill object (4)"
        const match = skill.match(/Skill object \((\d+)\)/);
        if (match) {
          skillIds.push(match[1]);
        }
      } else if (skill && typeof skill === 'object' && skill.id) {
        // Handle actual skill object
        skillIds.push(String(skill.id));
      }
    });
    return skillIds;
  }, []);

  const fetchSkillDetails = useCallback(async (skillIds) => {
    if (!skillIds || skillIds.length === 0) return [];
    
    if (!mounted) return [];
    
    try {
      setSkillsLoading(true);
      
      // Fallback: Show skill ID for now
      // You should replace this with actual API call
      const skillNames = skillIds.map(skillId => {
        return `Skill ${skillId}`;
      });
      
      return skillNames;
    } catch (err) {
      console.error('Failed to fetch skill details:', err);
      return skillIds.map(id => `Skill ${id}`);
    } finally {
      // Only update state if component is still mounted
      if (mounted) {
        setSkillsLoading(false);
      }
    }
  }, [mounted]);

  const fetchProject = useCallback(async () => {
    if (!id || !mounted) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await apiPrivate.get(`admin-projects/${id}/`);
      console.log('Project details response:', response.data);
      
      // Only update state if component is still mounted
      if (!mounted) return;
      
      setProject(response.data);
      
      // Extract skill names from the skill objects
      const skillsArray = response.data?.skills_required || [];
      
      if (skillsArray.length > 0) {
        console.log('Skills array:', skillsArray);
        
        // First, try to extract skill IDs
        const skillIds = extractSkillIds(skillsArray);
        console.log('Extracted skill IDs:', skillIds);
        
        if (skillIds.length > 0) {
          // Fetch skill details
          const skillNames = await fetchSkillDetails(skillIds);
          if (mounted) {
            setSkills(skillNames);
          }
        } else {
          // Fallback: try to extract names directly from objects
          const skillNames = skillsArray.map(skill => {
            console.log('Processing skill:', skill);
            
            if (skill && typeof skill === 'object') {
              // Check if it's a proper skill object
              if (skill.name) {
                return skill.name;
              } else if (skill.id) {
                return `Skill ${skill.id}`;
              }
            }
            
            // If it's a string, try to parse it
            if (typeof skill === 'string') {
              // Check if it's a JSON string
              try {
                const parsed = JSON.parse(skill);
                if (parsed && parsed.name) {
                  return parsed.name;
                }
              } catch {
                // Not JSON, check if it's "Skill object (id)" format
                const match = skill.match(/Skill object \((\d+)\)/);
                if (match) {
                  return `Skill ${match[1]}`;
                }
                // Return as is
                return skill;
              }
            }
            
            return 'Unknown Skill';
          });
          if (mounted) {
            setSkills(skillNames);
          }
        }
      } else {
        if (mounted) {
          setSkills([]);
        }
      }
    } catch (err) {
      console.error(err);
      if (mounted) {
        setError(
          err?.response?.data?.detail || 
          err?.message || 
          'Failed to load project details'
        );
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }, [id, mounted, extractSkillIds, fetchSkillDetails]);

  useEffect(() => {
    if (id && mounted) {
      fetchProject();
    }
  }, [id, mounted, fetchProject]);

  const getStatusColor = (status) => {
    const statusStr = String(status || '').toLowerCase();
    switch (statusStr) {
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
    const statusStr = String(status || '').toLowerCase();
    switch (statusStr) {
      case 'open':
      case 'active':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'closed':
      case 'completed':
        return <Award className="h-4 w-4 mr-1" />;
      case 'pending':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return <AlertCircle className="h-4 w-4 mr-1" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  const getDurationLabel = (duration) => {
    const durationMap = {
      'less_than_1_month': 'Less than 1 month',
      '1_3_months': '1-3 months',
      '3_6_months': '3-6 months',
      '6_months_1_year': '6 months - 1 year',
      'more_than_1_year': 'More than 1 year'
    };
    return durationMap[duration] || duration || 'Not specified';
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(true);
    try {
      await apiPrivate.delete(`admin-projects/${id}/`);
      router.push('/admin/projects');
    } catch (err) {
      console.error(err);
      alert('Failed to delete project');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center mb-6">
          <Link 
            href="/admin/projects" 
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-900 font-medium">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center mb-6">
          <Link 
            href="/admin/projects" 
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-red-700 font-semibold text-lg mb-4">{error}</p>
          <button
            onClick={fetchProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center mb-6">
          <Link 
            href="/admin/projects" 
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-900 font-semibold text-lg">No project found.</p>
        </div>
      </div>
    );
  }

  // Safely get project properties with defaults
  const projectId = project?.id || 'N/A';
  const projectStatus = project?.status || 'Unknown';
  const projectTitle = project?.title || 'Untitled Project';
  const projectDescription = project?.description || 'No description provided.';
  const projectBudgetType = project?.budget_type || 'fixed';
  const projectFixedBudget = project?.fixed_budget || 0;
  const projectHourlyMinRate = project?.hourly_min_rate || 0;
  const projectHourlyMaxRate = project?.hourly_max_rate || 0;
  const projectExperienceLevel = project?.experience_level || 'Not specified';
  const projectAssignmentType = project?.assignment_type || 'Not specified';
  const projectTeamSize = project?.team_size || 'N/A';
  const projectDuration = project?.duration || '';
  const projectCategory = project?.category?.name || 'Not specified';
  const projectCreatedAt = project?.created_at;
  const projectUpdatedAt = project?.updated_at;
  const projectClient = project?.client;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with Back Button */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <Link 
                href="/admin/projects" 
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{projectTitle}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(projectStatus)}`}>
                  {getStatusIcon(projectStatus)}
                  {String(projectStatus).toUpperCase()}
                </span>
                <span className="text-gray-700 font-medium">
                  <Hash className="h-4 w-4 inline mr-1" />
                  ID: #{projectId}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={fetchProject}
                disabled={loading}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Project Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Description
                </h2>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {projectDescription}
                </p>
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Skills Required
                </h2>
                {skillsLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                )}
              </div>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span 
                      key={`skill-${index}-${skill}`} // Better key using both index and skill name
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 italic">
                  {skillsLoading ? 'Loading skills...' : 'No skills specified.'}
                </p>
              )}
            </div>
            
            {/* Project Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <Briefcase className="h-5 w-5" />
                Project Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                    <div className="flex items-center text-gray-900 font-medium">
                      <Award className="h-4 w-4 mr-2 text-gray-600" />
                      {projectExperienceLevel.charAt(0).toUpperCase() + projectExperienceLevel.slice(1)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Type</label>
                    <div className="flex items-center text-gray-900 font-medium">
                      <Users className="h-4 w-4 mr-2 text-gray-600" />
                      {projectAssignmentType.charAt(0).toUpperCase() + projectAssignmentType.slice(1)}
                      {projectAssignmentType === 'team' && projectTeamSize && projectTeamSize !== 'N/A' && (
                        <span className="ml-2 text-gray-600">
                          (Team size: {projectTeamSize})
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Duration</label>
                    <div className="flex items-center text-gray-900 font-medium">
                      <Clock3 className="h-4 w-4 mr-2 text-gray-600" />
                      {getDurationLabel(projectDuration)}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                    <div className="flex items-center text-gray-900 font-medium">
                      <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                      {formatDate(projectCreatedAt)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                    <div className="flex items-center text-gray-900 font-medium">
                      <Clock className="h-4 w-4 mr-2 text-gray-600" />
                      {formatDate(projectUpdatedAt)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div className="flex items-center text-gray-900 font-medium">
                      <Layers className="h-4 w-4 mr-2 text-gray-600" />
                      {projectCategory}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar Info */}
          <div className="space-y-6">
            {/* Budget Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5" />
                Budget
              </h2>
              {projectBudgetType === 'fixed' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Budget Type</span>
                    <span className="font-semibold text-gray-900 bg-purple-100 text-purple-800 px-2 py-1 rounded">Fixed</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {formatCurrency(projectFixedBudget)}
                      </div>
                      <p className="text-sm text-gray-600">Fixed Price</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Budget Type</span>
                    <span className="font-semibold text-gray-900 bg-orange-100 text-orange-800 px-2 py-1 rounded">Hourly</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Minimum Rate</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(projectHourlyMinRate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Maximum Rate</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(projectHourlyMaxRate)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-100 text-center">
                      <p className="text-sm text-gray-600">per hour</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Additional Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Quick Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Project ID</span>
                  <code className="text-sm font-mono text-gray-900">#{projectId}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Budget Type</span>
                  <span className="font-medium text-gray-900 capitalize">{projectBudgetType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Experience</span>
                  <span className="font-medium text-gray-900 capitalize">{projectExperienceLevel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Assignment</span>
                  <span className="font-medium text-gray-900 capitalize">{projectAssignmentType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Duration</span>
                  <span className="font-medium text-gray-900">{getDurationLabel(projectDuration)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Required Skills</span>
                  <span className="font-medium text-gray-900">{skills.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}