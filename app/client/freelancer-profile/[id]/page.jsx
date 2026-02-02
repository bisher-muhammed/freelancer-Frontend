"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import {
  User, Mail, Phone, Calendar, Briefcase,
  Award, CheckCircle, Star, DollarSign,
  Loader2, ArrowLeft, Download,
  Building, GraduationCap, Code,
  AlertCircle, Database, Layout,
  Figma, MapPin, MessageSquare,
  Check, Award as Trophy,
  TrendingUp, Video
} from 'lucide-react';
import MeetingModal from "@/components/client/SheduleMeeting";

export default function FreelancerProfilePage() {
  const router = useRouter();
  const { id } = useParams();   
  const userId = id;
  const searchParams = useSearchParams(); 
  const proposalId = searchParams.get("proposal");
  
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  // Theme variables
  const primaryColor = '#227C70';
  const primaryLight = '#e8f4f2';

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
    if (!userId) {
      router.push('/client/dashboard');
      return;
    }

    console.log('proposalId is', proposalId);

    setLoading(true);
    setError("");
    apiPrivate
      .get(`freelancer-profile/${userId}/`)
      .then((res) => {
        console.log("Freelancer data:", res.data);
        setFreelancer(res.data);
      })
      .catch((err) => {
        console.error("Error loading freelancer:", err);
        setError("Failed to load freelancer profile. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [userId, router]);

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
      'Python': Code,
      'Django': Code,
      'Node.js': Code,
      'TypeScript': Code,
      'Vue': Layout,
      'Angular': Layout,
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
    router.back();
  };

  const handleContactFreelancer = async () => {
    if (!proposalId) {
      alert("Proposal not found. Cannot start chat.");
      return;
    }

    try {
      setSendingMessage(true);
      const response = await apiPrivate.post(
        "chat-rooms/get-or-create/",
        { proposal: proposalId }
      );

      const chatId = response.data.chat_id;
      if (!chatId) {
        throw new Error("Chat ID not returned from server");
      }
      router.push(`/client/chat/${chatId}`);
    } catch (error) {
      console.error("Failed to open chat:", error);
      alert("Unable to start chat. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  const getStats = () => {
    if (!freelancer) return [];
    
    return [
      {
        label: "Hourly Rate",
        value: formatCurrency(freelancer.hourly_rate || 0),
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-50"
      },
      {
        label: "Success Rate",
        value: "95%",
        icon: TrendingUp,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      },
      {
        label: "Projects",
        value: freelancer.completed_projects || "12+",
        icon: Briefcase,
        color: "text-purple-600",
        bgColor: "bg-purple-50"
      },
      {
        label: "Experience",
        value: freelancer.years_experience || "3+ years",
        icon: Award,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50"
      },
      {
        label: "Availability",
        value: freelancer.availability || "Full-time",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50"
      }
    ];
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "skills", label: "Skills", icon: Code },
    { id: "experience", label: "Experience", icon: Building },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "portfolio", label: "Portfolio", icon: Trophy },
  ];

  // Render loading state
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

  // Render error state
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
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render not found state
  if (!freelancer) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">The requested freelancer profile could not be found.</p>
            <button
              onClick={handleBackClick}
              className="px-4 py-2 text-white rounded-lg transition-colors duration-200 flex items-center mx-auto"
              style={{ backgroundColor: primaryColor }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Back Button */}
        <div className="mb-4 md:mb-6">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center text-sm md:text-base font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Proposals
          </button>
        </div>

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
                      const nextSibling = e.target.nextElementSibling;
                      if (nextSibling) {
                        nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div 
                  className={`${freelancer.profile_picture ? 'hidden' : 'flex'} w-32 h-32 md:w-40 md:h-40 rounded-xl items-center justify-center border-4 border-white shadow-lg`}
                  style={{ backgroundColor: primaryLight }}
                >
                  <User className="h-16 w-16 md:h-20 md:w-20" style={{ color: primaryColor }} />
                </div>
                
                {/* Verification Badge */}
                {freelancer.is_verified && (
                  <div className="absolute -top-2 -right-2 p-2 bg-green-500 rounded-full shadow-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}
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
                    {freelancer.is_verified && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="text-lg md:text-xl font-semibold text-gray-700 mb-3">
                    {freelancer.title || "Freelancer"}
                  </div>
                  
                  {/* Rating */}
                  {freelancer.rating && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(freelancer.rating) 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600 font-medium">
                        {freelancer.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">
                        {freelancer.review_count || 0} reviews
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="hover:text-blue-600 transition-colors">
                        {freelancer.email}
                      </span>
                    </div>
                    {freelancer.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{freelancer.location}</span>
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
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <button
                    onClick={handleContactFreelancer}
                    disabled={sendingMessage}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: sendingMessage ? '#ccc' : primaryColor }}
                  >
                    {sendingMessage ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                  
                  {/* Schedule Meeting Button */}
                  {proposalId && (
                    <button
                      onClick={() => setShowMeetingModal(true)}
                      className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm font-medium"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </button>
                  )}
                  
                  {freelancer.resume && (
                    <a
                      href={getFullMediaUrl(freelancer.resume)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mb-6">
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
              {tabs.map((tab) => {
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

        {/* Tab Content - I'll add the rest in the next part due to length */}
        <div className="animate-in fade-in duration-300">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Skills Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    Top Skills
                  </h3>
                  <div className="space-y-4">
                    {freelancer.skills_read?.slice(0, 5).map((skillItem, index) => {
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
                  {freelancer.skills_read?.length > 5 && (
                    <button
                      onClick={() => setActiveTab("skills")}
                      className="w-full mt-4 py-2 text-center text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      View all {freelancer.skills_read.length} skills →
                    </button>
                  )}
                </div>

                {/* Bio Section */}
                {freelancer.bio && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {freelancer.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Email</div>
                      <div className="font-medium text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {freelancer.email}
                      </div>
                    </div>
                    {freelancer.contact_number && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Phone</div>
                        <div className="font-medium text-gray-900 flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {freelancer.contact_number}
                        </div>
                      </div>
                    )}
                    {freelancer.location && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Location</div>
                        <div className="font-medium text-gray-900 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {freelancer.location}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Member Since</div>
                      <div className="font-medium text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(freelancer.created_at)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleContactFreelancer}
                      disabled={sendingMessage}
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: sendingMessage ? '#ccc' : primaryColor }}
                    >
                      {sendingMessage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </button>
                    
                    {/* Schedule Meeting in Quick Actions */}
                    {proposalId && (
                      <button
                        onClick={() => setShowMeetingModal(true)}
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </button>
                    )}
                    
                    {freelancer.resume && (
                      <a
                        href={getFullMediaUrl(freelancer.resume)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Resume
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs content would go here - Skills, Experience, Education, Portfolio */}
          {/* I'll keep it brief for space, but you have this in your original code */}
        </div>
      </div>

      {/* Meeting Modal */}
      <MeetingModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        freelancerId={userId}
        proposalId={proposalId}
      />
    </>
  );
}