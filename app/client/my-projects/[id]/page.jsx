'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiPrivate } from '@/lib/apiPrivate';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  Award,
  Tag,
  XCircle,
  Loader2,
  Target,
  FileText,
  Building,
  Share2,
  Bookmark,
  Users,
  TrendingUp,
  BarChart3,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import EditProjectModal from '@/components/client/EditProjectModal';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await apiPrivate.get(`projects/${id}/`);
        setProject(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to load project');
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProject();
  }, [id]);

  const handleSaveProject = () => {
    setSaved(!saved);
  };

  const handleEdit = () => {
  setShowEditModal(true);
};


  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await apiPrivate.delete(`projects/${id}/`);
        router.push('/projects');
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'closed':
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
      case 'completed':
        return <Award className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDurationLabel = (duration) => {
    const durationMap = {
      'less_than_1_month': 'Less than 1 month',
      '1_3_months': '1-3 months',
      '3_6_months': '3-6 months',
      '6_months_1_year': '6 months - 1 year',
      'more_than_1_year': 'More than 1 year'
    };
    return durationMap[duration] || duration;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="space-y-4">
                  <div className="h-8 w-3/4 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error || 'Project Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error ? 'Failed to load project details. Please try again.' : 'The project you are looking for does not exist.'}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    {project.status?.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">• Posted {formatDate(project.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                >
                <Edit className="h-4 w-4" />
                Edit
                </button>

              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors font-medium"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-600">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Title & Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{project.title}</h1>
                  </div>
                  {project.client?.company_name && (
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">{project.client.company_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Description */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Description
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Key Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700 uppercase">Budget</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {project.budget_type === 'fixed' 
                      ? formatCurrency(project.fixed_budget)
                      : `${formatCurrency(project.hourly_min_rate)} - ${formatCurrency(project.hourly_max_rate)}/hr`
                    }
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700 uppercase">Level</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 capitalize">{project.experience_level}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-700 uppercase">Duration</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{getDurationLabel(project.duration)}</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700 uppercase">Type</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 capitalize">{project.assignment_type}</p>
                </div>
              </div>

              {/* Skills Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Skills Required
                </h2>
                {Array.isArray(project.skills) && project.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {project.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:border-blue-300 hover:text-blue-700 hover:shadow-sm transition-all duration-200"
                      >
                        <Tag className="h-4 w-4" />
                        {skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
                    <Tag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No specific skills required</p>
                    <p className="text-sm text-gray-400 mt-1">Open to all skill levels</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Project Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard
                  icon={<Calendar className="h-5 w-5" />}
                  title="Timeline"
                  value={`${getDurationLabel(project.duration)} • Posted ${formatDate(project.created_at)}`}
                  color="text-blue-600"
                />
                <InfoCard
                  icon={<Users className="h-5 w-5" />}
                  title="Team Size"
                  value={project.team_size ? `${project.team_size} members` : 'Flexible'}
                  color="text-purple-600"
                />
                <InfoCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  title="Budget Type"
                  value={project.budget_type === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                  color="text-green-600"
                />
                <InfoCard
                  icon={<BarChart3 className="h-5 w-5" />}
                  title="Assignment Type"
                  value={project.assignment_type}
                  color="text-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Project Status Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Current Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                    {project.status?.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(project.created_at)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(project.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Budget Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Type</span>
                  <span className="font-semibold text-gray-900 capitalize">{project.budget_type}</span>
                </div>
                {project.budget_type === 'fixed' ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Amount</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(project.fixed_budget)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Min Rate</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(project.hourly_min_rate)}/hr</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Max Rate</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(project.hourly_max_rate)}/hr</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Award className="h-4 w-4 text-emerald-600" />
                  <span className="text-gray-700">Experience: <span className="font-semibold text-gray-900 capitalize">{project.experience_level}</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-700">Duration: <span className="font-semibold text-gray-900">{getDurationLabel(project.duration)}</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-amber-600" />
                  <span className="text-gray-700">Type: <span className="font-semibold text-gray-900 capitalize">{project.assignment_type}</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

       {showEditModal && (
  <EditProjectModal
    project={project}
    onClose={() => setShowEditModal(false)}
    onUpdated={(updatedProject) => {
      setProject(updatedProject);
      setShowEditModal(false);
      // Optionally show success message
      alert('Project updated successfully!');
    }}
  />
)}

        {/* Bottom Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <button 
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Last updated: {formatDate(project.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </div>

    
  );
}

// Helper Components
function InfoCard({ icon, title, value, color }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-')}/10`}>
          <div className={color}>
            {icon}
          </div>
        </div>
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      </div>
      <p className="text-gray-900 font-semibold">{value}</p>
      
    </div>

  );
}