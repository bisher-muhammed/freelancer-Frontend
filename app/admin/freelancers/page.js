"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import {
  User, Mail, Phone, Calendar, Briefcase,
  Award, CheckCircle, XCircle, Star, DollarSign,
  FileText, Shield, Clock, Loader2,
  ArrowLeft, Download, Send,
  Building, GraduationCap, Code,
  CheckSquare, AlertCircle, Database, Layout,
  Figma, Hash, MapPin, ExternalLink,
  Globe, Eye, Edit, Trash2, Plus
} from 'lucide-react';

export default function FreelancersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("user");

  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Theme variables
  const primaryColor = '#227C70';
  const primaryHover = '#55784A';
  const primaryLight = '#e8f4f2';
  const primaryDark = '#1a5f55';

  // Helper function to get full media URLs
  const getFullMediaUrl = (path) => {
    if (!path) return null;
    
    if (path.startsWith('http')) return path;
    
    if (path.startsWith('/media/')) {
      return `http://localhost:8000${path}`;
    }
    
    return `http://localhost:8000/media/${path}`;
  };

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError("");
    apiPrivate
      .get(`/freelancers/${userId}/`)
      .then((res) => {
        console.log("Freelancer data:", res.data);
        setFreelancer(res.data);
      })
      .catch((err) => {
        console.error("Error loading freelancer:", err);
        setError("Failed to load freelancer profile. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleVerifyFreelancer = async () => {
    if (!freelancer || freelancer.is_verified) {
      setError("Freelancer is already verified");
      return;
    }

    setVerifying(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await apiPrivate.post(`/freelancers/${userId}/verify/`);
      setFreelancer(prev => ({ ...prev, is_verified: true }));
      setSuccessMessage(response.data.detail || "Freelancer verified successfully!");
      
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (err) {
      console.error("Failed to verify freelancer:", err);
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.error || 
                      err.message || 
                      "Failed to verify freelancer. Please try again.";
      setError(errorMsg);
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteFreelancer = async () => {
    if (!freelancer) return;

    setDeleting(true);
    setError("");
    
    try {
      await apiPrivate.delete(`/users/${freelancer.id}/`);
      setSuccessMessage("Freelancer deleted successfully!");
      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);
    } catch (err) {
      console.error("Failed to delete freelancer:", err);
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.error || 
                      err.message || 
                      "Failed to delete freelancer. Please try again.";
      setError(errorMsg);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getSkillIcon = (skillName) => {
    const skillIcons = {
      'JavaScript': Code,
      'React': Layout,
      'Next.js': Layout,
      'HTML': Code,
      'CSS': Code,
      'MongoDB': Database,
      'Figma': Figma,
    };
    
    return skillIcons[skillName] || Code;
  };

  const getProficiencyLevel = (level) => {
    const levels = {
      1: 'Beginner',
      2: 'Intermediate',
      3: 'Advanced',
      4: 'Expert',
      5: 'Master'
    };
    return levels[level] || 'Not specified';
  };

  const handleBackClick = () => {
    router.push('/admin/users');
  };

  const getStats = () => {
    if (!freelancer) return [];
    
    return [
      {
        label: "Hourly Rate",
        value: formatCurrency(freelancer.hourly_rate || 0),
        icon: DollarSign,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      },
      {
        label: "Skills",
        value: freelancer.skills_names?.length || 0,
        icon: Code,
        color: "text-green-600",
        bgColor: "bg-green-50"
      },
      {
        label: "Experience",
        value: freelancer.experience?.length || 0,
        icon: Briefcase,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50"
      },
      {
        label: "Education",
        value: freelancer.education?.length || 0,
        icon: GraduationCap,
        color: "text-purple-600",
        bgColor: "bg-purple-50"
      },
      {
        label: "Categories",
        value: freelancer.categories_names?.length || 0,
        icon: Award,
        color: "text-pink-600",
        bgColor: "bg-pink-50"
      },
      {
        label: "Joined",
        value: formatDate(freelancer.created_at),
        icon: Calendar,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50"
      }
    ];
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No User Selected</h2>
          <p className="text-gray-600 mb-6">Please select a freelancer from the user management page.</p>
          <button
            onClick={handleBackClick}
            className="px-4 py-2 text-white rounded-lg transition-colors duration-200 flex items-center mx-auto"
            style={{ backgroundColor: primaryColor }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
          <div className="text-lg text-gray-600">Loading freelancer profile...</div>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Error Loading Profile</h2>
            </div>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center"
              >
                <Loader2 className="h-4 w-4 mr-2" />
                Try Again
              </button>
              <button
                onClick={handleBackClick}
                className="px-4 py-2 text-white rounded-lg transition-colors duration-200 flex items-center"
                style={{ backgroundColor: primaryColor }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">The requested freelancer profile could not be loaded.</p>
            <button
              onClick={handleBackClick}
              className="px-4 py-2 text-white rounded-lg transition-colors duration-200 flex items-center mx-auto"
              style={{ backgroundColor: primaryColor }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Back Button */}
      <div className="mb-4 md:mb-6">
        <button
          onClick={handleBackClick}
          className="inline-flex items-center text-sm md:text-base font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Users
        </button>
      </div>

      {/* Messages */}
      {(successMessage || error) && (
        <div className="mb-4 md:mb-6 animate-in fade-in duration-300">
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
              <div className="text-green-800">{successMessage}</div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
              <div className="text-red-800">{error}</div>
            </div>
          )}
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="relative">
              {freelancer.profile_picture ? (
                <img
                  src={getFullMediaUrl(freelancer.profile_picture)}
                  alt={freelancer.username}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-xl flex items-center justify-center border-4 border-white shadow-lg"
                  style={{ backgroundColor: primaryLight }}
                >
                  <User className="h-16 w-16 md:h-20 md:w-20" style={{ color: primaryColor }} />
                </div>
              )}
              
              {/* Verification Badge */}
              <div className={`absolute -top-2 -right-2 p-2 rounded-full shadow-lg ${freelancer.is_verified ? 'bg-green-500' : 'bg-yellow-500'}`}>
                {freelancer.is_verified ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : (
                  <Clock className="h-5 w-5 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {freelancer.username || "Unnamed User"}
                  </h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                    ${freelancer.is_verified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'}`}>
                    {freelancer.is_verified ? "Verified" : "Unverified"}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ID: {freelancer.id}
                  </span>
                </div>
                
                <div className="text-lg md:text-xl font-semibold text-gray-700 mb-3">
                  {freelancer.title || "No title specified"}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <a 
                      href={`mailto:${freelancer.email}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {freelancer.email}
                    </a>
                  </div>
                  {freelancer.contact_number && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <a 
                        href={`tel:${freelancer.contact_number}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {freelancer.contact_number}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined {formatDate(freelancer.created_at)}
                  </div>
                </div>
                
                {/* Bio */}
                {freelancer.bio && (
                  <div className="mt-4">
                    <p className="text-gray-600 leading-relaxed">
                      {freelancer.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2">
                {!freelancer.is_verified && (
                  <button
                    onClick={handleVerifyFreelancer}
                    disabled={verifying}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Verify Freelancer
                      </>
                    )}
                  </button>
                )}
                
                {freelancer.resume && (
                  <a
                    href={getFullMediaUrl(freelancer.resume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    View Resume
                  </a>
                )}
                
                <a
                  href={`mailto:${freelancer.email}`}
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </a>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                  className="inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200 text-sm font-medium disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-6">
        {getStats().map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xl md:text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 mt-1">
                    {stat.label}
                  </div>
                </div>
                <div className={`h-10 w-10 md:h-12 md:w-12 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                  <Icon className="h-5 w-5 md:h-6 md:w-6" style={{ color: primaryColor }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs Section */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 overflow-x-auto pb-1">
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "skills", label: "Skills", icon: Code },
              { id: "experience", label: "Experience", icon: Building },
              { id: "education", label: "Education", icon: GraduationCap },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'text-white' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id ? primaryColor : 'transparent'
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-300">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Skills Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  Skills & Expertise
                </h3>
                <div className="space-y-4">
                  {freelancer.skills_read?.map((skillItem, index) => {
                    const SkillIcon = getSkillIcon(skillItem.skill.name);
                    return (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-center mb-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                            <SkillIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{skillItem.skill.name}</div>
                            <div className="text-sm text-gray-500">{skillItem.skill.category.name}</div>
                          </div>
                          <div className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                            {getProficiencyLevel(skillItem.level)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">Proficiency level:</div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-2 w-2 rounded-full mx-0.5 ${
                                  level <= skillItem.level 
                                    ? 'bg-green-500' 
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bio Section */}
              {freelancer.bio && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Bio</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {freelancer.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Account Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">User ID</div>
                    <div className="font-medium text-gray-900 flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      {freelancer.id}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Member Since</div>
                    <div className="font-medium text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(freelancer.created_at)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                    <div className="font-medium text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(freelancer.updated_at)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Verification Status</div>
                    <div className="flex items-center">
                      {freelancer.is_verified ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="font-medium text-gray-900">Verified</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="font-medium text-gray-900">Pending Verification</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {!freelancer.is_verified && (
                    <button
                      onClick={handleVerifyFreelancer}
                      disabled={verifying}
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Verify Freelancer
                        </>
                      )}
                    </button>
                  )}
                  
                  <a
                    href={`mailto:${freelancer.email}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </a>
                  
                  {freelancer.resume && (
                    <a
                      href={getFullMediaUrl(freelancer.resume)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      View Resume
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Skills & Expertise</h3>
              <div className="text-sm text-gray-600">
                Total Skills: {freelancer.skills_names?.length || 0}
              </div>
            </div>
            <div className="space-y-6">
              {freelancer.categories_names?.map((category, catIndex) => {
                const categorySkills = freelancer.skills_read?.filter(
                  skillItem => skillItem.skill.category.name === category
                );
                
                if (!categorySkills || categorySkills.length === 0) return null;
                
                return (
                  <div key={catIndex} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-semibold text-gray-800">{category}</h4>
                      <span className="text-sm text-gray-500">{categorySkills.length} skills</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categorySkills.map((skillItem, skillIndex) => {
                        const SkillIcon = getSkillIcon(skillItem.skill.name);
                        return (
                          <div
                            key={skillIndex}
                            className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                          >
                            <div className="flex items-center mb-3">
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                                <SkillIcon className="h-5 w-5 text-gray-600" />
                              </div>
                              <div className="font-medium text-gray-900">{skillItem.skill.name}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Level: {getProficiencyLevel(skillItem.level)}
                              </span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <div
                                    key={level}
                                    className={`h-2 w-2 rounded-full mx-0.5 ${
                                      level <= skillItem.level 
                                        ? 'bg-green-500' 
                                        : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === "experience" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Work Experience
              </h3>
              <div className="text-sm text-gray-600">
                Total: {freelancer.experience?.length || 0}
              </div>
            </div>
            <div className="space-y-6">
              {freelancer.experience && freelancer.experience.length > 0 ? (
                freelancer.experience.map((exp, index) => (
                  <div key={index} className="relative pl-8">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="absolute left-[-4px] top-0 w-3 h-3 rounded-full bg-[#227C70]"></div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow duration-200">
                      <div className="mb-3">
                        <div className="font-bold text-lg text-gray-900">{exp.role}</div>
                        <div className="text-gray-700 font-medium">{exp.company}</div>
                        <div className="text-sm text-gray-500 mt-1 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                          {!exp.end_date && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <div className="text-gray-500">No work experience listed</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Education Tab */}
        {activeTab === "education" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Education
              </h3>
              <div className="text-sm text-gray-600">
                Total: {freelancer.education?.length || 0}
              </div>
            </div>
            <div className="space-y-6">
              {freelancer.education && freelancer.education.length > 0 ? (
                freelancer.education.map((edu, index) => (
                  <div key={index} className="relative pl-8">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="absolute left-[-4px] top-0 w-3 h-3 rounded-full bg-blue-500"></div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow duration-200">
                      <div className="mb-3">
                        <div className="font-bold text-lg text-gray-900">{edu.degree}</div>
                        <div className="text-gray-700 font-medium">{edu.institution}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Completed: {edu.year_completed}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <div className="text-gray-500">No education information listed</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Freelancer Account</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This will permanently delete the freelancer's account and all associated data including profile, skills, education, and experience.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFreelancer}
                  disabled={deleting}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}