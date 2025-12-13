"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import {
  DollarSign,
  Clock,
  Briefcase,
  Users,
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  MapPin,
  Bookmark,
  Award,
  UserCircle,
  ChevronLeft,
  Share2,
  AlertCircle
} from 'lucide-react';

export default function ProjectDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const response = await apiPrivate.get(`/project/${id}/`);
      setProject(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load project details. Please try again.');
      setProject(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleApply = () => {
    // Redirect to proposal page instead of applying directly
    router.push(`/freelancer/proposals/${id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.title,
        text: `Check out this project: ${project?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show temporary toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm z-50';
      toast.textContent = 'Link copied to clipboard!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark API call
  };

  const formatDuration = (duration) => {
    const map = {
      '1_3_months': '1-3 months',
      '3_6_months': '3-6 months',
      '6_months_plus': '6+ months'
    };
    return map[duration] || duration;
  };

  const formatExperienceLevel = (level) => {
    const map = {
      'entry': 'Entry Level',
      'intermediate': 'Intermediate',
      'expert': 'Expert'
    };
    return map[level] || level;
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return posted.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin h-12 w-12 text-blue-600 mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{error}</p>
              <button
                onClick={fetchProject}
                className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Back Button - Mobile Sticky Header */}
        <div className="sticky top-0 bg-gray-50 pt-2 pb-4 z-40 -mx-4 px-4 sm:mx-0 sm:px-0 sm:static sm:bg-transparent sm:pt-0">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm sm:text-base">Back to Jobs</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Project Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {project.title}
                    </h1>
                    {project.client?.verified && (
                      <span className="self-start sm:self-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200 whitespace-nowrap">
                        ✓ Verified Client
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">Posted {getTimeAgo(project.created_at)}</span>
                    </span>
                    <span className="hidden sm:flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">8 proposals</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">
                        {project.client?.city}, {project.client?.country}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    onClick={handleShare}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Share project"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={toggleBookmark}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label={isBookmarked ? "Remove bookmark" : "Bookmark project"}
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-gray-600 text-gray-600' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>

              {/* Mobile Apply Button - Sticky Bottom */}
              <div className="sticky bottom-0 bg-white border-t py-4 -mx-4 px-4 sm:hidden">
                <button
                  onClick={handleApply}
                  disabled={project.already_applied}
                  className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    project.already_applied
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800 active:bg-gray-900"
                  }`}
                >
                  {project.already_applied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Already Applied
                    </>
                  ) : (
                    "Submit Proposal"
                  )}
                </button>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Job Description</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {project.description}
              </div>
            </div>

            {/* Skills Required */}
            {project.skills_required && project.skills_required.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Skills Required</h2>
                <div className="flex flex-wrap gap-2">
                  {project.skills_required.map(skill => (
                    <span
                      key={skill.id}
                      className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-default"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* About the Client */}
            {project.client && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">About the Client</h2>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    {project.client.profile_picture ? (
                      <img 
                        src={project.client.profile_picture} 
                        alt={project.client.company_name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                        {project.client.company_name?.[0]?.toUpperCase() || 'C'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {project.client.company_name}
                    </h3>
                    {project.client.average_rating && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {project.client.average_rating}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({project.client.total_reviews || 0} reviews)
                        </span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm text-gray-900 font-medium">
                          {project.client.city}, {project.client.country}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Member Since</p>
                        <p className="text-sm text-gray-900 font-medium">{project.client.member_since}</p>
                      </div>
                      {project.client.jobs_posted && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Jobs Posted</p>
                          <p className="text-sm text-gray-900 font-medium">{project.client.jobs_posted}</p>
                        </div>
                      )}
                      {project.client.hire_rate && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Hire Rate</p>
                          <p className="text-sm text-gray-900 font-medium">{project.client.hire_rate}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Desktop Apply Button */}
            <div className="hidden sm:block bg-white rounded-lg shadow-sm p-6">
              <button
                onClick={handleApply}
                disabled={project.already_applied}
                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  project.already_applied
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {project.already_applied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Already Applied
                  </>
                ) : (
                  "Submit Proposal"
                )}
              </button>
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Job Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Budget</p>
                  <div className="flex items-baseline gap-1">
                    <DollarSign className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <span className="text-xl font-bold text-gray-900 truncate">
                      {project.budget_type === 'fixed'
                        ? `$${parseFloat(project.fixed_budget).toLocaleString()}`
                        : `$${project.hourly_min_rate} - $${project.hourly_max_rate}`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {project.budget_type === 'fixed' ? 'Fixed Price' : 'Hourly'}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-2">Project Duration</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-700 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatDuration(project.duration)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-2">Experience Level</p>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-gray-700 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatExperienceLevel(project.experience_level)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-2">Proposals</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-700 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">
                      8 submitted
                    </span>
                  </div>
                </div>

                {project.estimated_hours && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 mb-2">Estimated Hours</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-700 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">
                        {project.estimated_hours} hours
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info - Hidden on mobile, shown on tablet+ */}
            <div className="hidden sm:block bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Tips for Proposal</h2>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Customize your cover letter</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Highlight relevant experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Include portfolio links</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Be specific about deliverables</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}