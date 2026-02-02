"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import { 
  Clock, 
  Calendar, 
  Monitor, 
  Camera, 
  ChevronLeft, 
  AlertCircle, 
  Loader2,
  Play,
  Pause,
  Activity,
  Maximize2,
  Download,
  Video,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon,
  X,
  ArrowLeft,
  AlertTriangle,
  MessageSquare
} from "lucide-react";
import TimeBlockExplanationForm from "@/components/TimeBlockExplanationForm";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SessionTimelineDetail() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id;
  
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedBlocks, setExpandedBlocks] = useState({});
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [allScreenshots, setAllScreenshots] = useState([]);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [explanationFormOpen, setExplanationFormOpen] = useState(false);
  const [selectedBlockForExplanation, setSelectedBlockForExplanation] = useState(null);
  const modalRef = useRef(null);
  const thumbnailContainerRef = useRef(null);

  const THUMBNAILS_PER_VIEW = 3;

  async function fetchSessionTimeline() {
    if (!sessionId) return;
    
    setLoading(true);
    setError("");

    try {
      const response = await apiPrivate.get(
        `freelancer-sessions/${sessionId}/timeline/`
      );

      const data = response.data;
      console.log("Session timeline data:", data);
      
      if (!data || !data.time_blocks) {
        throw new Error("Invalid session data format");
      }

      setSessionData(data);
      
      // Extract all screenshots for slideshow
      const screenshots = [];
      data.time_blocks.forEach(block => {
        if (block.windows) {
          block.windows.forEach(window => {
            if (window.screenshots && Array.isArray(window.screenshots)) {
              window.screenshots.forEach(screenshot => {
                screenshots.push({
                  ...screenshot,
                  blockId: block.id,
                  windowTitle: window.window_title || "Unknown Window",
                  windowId: window.id
                });
              });
            }
          });
        }
      });
      console.log("All screenshots extracted:", screenshots);
      setAllScreenshots(screenshots);
      setThumbnailStartIndex(0);
    } catch (err) {
      console.error("Error fetching session:", err);
      setError(
        err?.response?.data?.detail ||
        err.message ||
        "Failed to load session timeline"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (sessionId) {
      fetchSessionTimeline();
    }
  }, [sessionId]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedScreenshot) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
      
      // Prevent scrolling on body when modal is open
      const handleWheel = (e) => {
        if (modalRef.current && modalRef.current.contains(e.target)) {
          return;
        }
        e.preventDefault();
      };
      
      window.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        window.removeEventListener('wheel', handleWheel);
      };
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'static';
      document.documentElement.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'static';
      document.documentElement.style.overflow = 'unset';
    };
  }, [selectedScreenshot]);

  // Keyboard navigation for modal
  useEffect(() => {
    if (!selectedScreenshot) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeScreenshotModal();
      } else if (e.key === 'ArrowLeft' && currentSlideIndex > 0) {
        prevSlide();
      } else if (e.key === 'ArrowRight' && currentSlideIndex < allScreenshots.length - 1) {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedScreenshot, currentSlideIndex, allScreenshots.length]);

  // Update thumbnail start index when slide changes
  useEffect(() => {
    if (selectedScreenshot && allScreenshots.length > THUMBNAILS_PER_VIEW) {
      const halfView = Math.floor(THUMBNAILS_PER_VIEW / 2);
      let newStartIndex = currentSlideIndex - halfView;
      
      // Adjust boundaries
      if (newStartIndex < 0) {
        newStartIndex = 0;
      } else if (newStartIndex + THUMBNAILS_PER_VIEW > allScreenshots.length) {
        newStartIndex = allScreenshots.length - THUMBNAILS_PER_VIEW;
      }
      
      setThumbnailStartIndex(newStartIndex);
    }
  }, [currentSlideIndex, selectedScreenshot, allScreenshots.length]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "0s";
    if (seconds === 0) return "0s";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m ${remainingSeconds.toString().padStart(2, '0')}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatTimeRange = (start, end) => {
    if (!start) return "";
    
    try {
      const startDate = new Date(start);
      const endDate = end ? new Date(end) : new Date();
      
      const startTime = startDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const endTime = endDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return `${startTime} - ${endTime}`;
    } catch (e) {
      return "Invalid time range";
    }
  };

  const calculateWorkedTime = (block) => {
    const startedAt = new Date(block.started_at);
    const endedAt = block.ended_at ? new Date(block.ended_at) : new Date();
    const totalSeconds = Math.max(Math.floor((endedAt - startedAt) / 1000), 0);
    
    const idleSeconds = block.idle_seconds || (block.idle_ratio ? Math.floor(totalSeconds * block.idle_ratio) : 0);
    const workedSeconds = Math.max(totalSeconds - idleSeconds, 0);
    
    let productivity = 0;
    if (totalSeconds > 0) {
      productivity = Math.round((workedSeconds / totalSeconds) * 100);
    }
    
    return {
      worked: workedSeconds,
      idle: idleSeconds,
      total: totalSeconds,
      productivity
    };
  };

  const toggleBlockExpansion = (blockId) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  const handleScreenshotClick = (screenshot, index) => {
    setSelectedScreenshot(screenshot);
    setCurrentSlideIndex(index);
  };

  const closeScreenshotModal = () => {
    setSelectedScreenshot(null);
    setCurrentSlideIndex(0);
    setThumbnailStartIndex(0);
  };

  const nextSlide = () => {
    if (currentSlideIndex < allScreenshots.length - 1) {
      const newIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(newIndex);
      setSelectedScreenshot(allScreenshots[newIndex]);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      const newIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(newIndex);
      setSelectedScreenshot(allScreenshots[newIndex]);
    }
  };

  const nextThumbnails = () => {
    if (thumbnailStartIndex + THUMBNAILS_PER_VIEW < allScreenshots.length) {
      setThumbnailStartIndex(prev => prev + 1);
    }
  };

  const prevThumbnails = () => {
    if (thumbnailStartIndex > 0) {
      setThumbnailStartIndex(prev => prev - 1);
    }
  };

  const downloadScreenshot = async (screenshotUrl, filename) => {
    try {
      const response = await fetch(screenshotUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `screenshot-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download image:', err);
      const link = document.createElement('a');
      link.href = screenshotUrl;
      link.download = filename || `screenshot-${Date.now()}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    
    console.log("Processing image path:", imagePath);
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/media/')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    if (imagePath.startsWith('media/')) {
      return `${API_BASE_URL}/${imagePath}`;
    }
    
    return `${API_BASE_URL}/media/screenshots/${imagePath}`;
  };

  // Calculate visible thumbnails
  const visibleThumbnails = allScreenshots.slice(
    thumbnailStartIndex,
    Math.min(thumbnailStartIndex + THUMBNAILS_PER_VIEW, allScreenshots.length)
  );

  // Check if any time block has is_flagged = true
  const hasDisputedBlocks = sessionData?.time_blocks?.some(block => block.is_flagged) || false;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
        <p className="text-gray-600">Loading session timeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Sessions
          </button>
          
          <div className="flex flex-col items-center justify-center text-center p-12">
            <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to Load Session
            </h3>
            <p className="text-gray-600 max-w-md mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={fetchSessionTimeline}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Session Not Found
          </h3>
          <p className="text-gray-600 mb-6">The requested session could not be loaded.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  const { started_at, ended_at, time_blocks, total_seconds } = sessionData;
  const totalBlocks = time_blocks.length;
  const totalScreenshots = allScreenshots.length;

  // FIXED: Use session.total_seconds directly instead of double-counting
  const sessionDuration = total_seconds || 0;

  // Calculate worked and idle time from all time blocks
  const sessionTotals = time_blocks.reduce((totals, block) => {
    const blockTimeData = calculateWorkedTime(block);
    
    return {
      workedSeconds: totals.workedSeconds + blockTimeData.worked,
      idleSeconds: totals.idleSeconds + blockTimeData.idle
    };
  }, { workedSeconds: 0, idleSeconds: 0 });

  // Use sessionDuration as total, and ensure worked + idle = total
  const sessionProductivity = sessionDuration > 0 
    ? Math.round((sessionTotals.workedSeconds / sessionDuration) * 100)
    : 0;

  const sessionStart = new Date(started_at);
  const sessionEnd = ended_at ? new Date(ended_at) : new Date();

  return (
    <>
      {/* Main Content with header offset */}
      <div className="min-h-screen bg-white pt-16">
        {/* Fixed Header within content */}
        <div className="sticky top-16 z-30 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sessions
              </button>
            </div>
            
            <div className="pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">Session Timeline</h1>
                  {hasDisputedBlocks && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Disputed</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600">
                  Detailed view of work activity and screenshots
                </p>
                
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    ended_at 
                      ? "bg-gray-100 text-gray-700" 
                      : "bg-green-100 text-green-700"
                  }`}>
                    {ended_at ? "Completed" : "Active"}
                  </div>
                </div>
              </div>
              
              {/* Session Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Session Duration</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDuration(sessionDuration)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Productive Time</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDuration(sessionTotals.workedSeconds)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Pause className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Idle Time</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDuration(sessionTotals.idleSeconds)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Monitor className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Productivity</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {sessionProductivity}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Session Time Info */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Session Started</span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {formatDateTime(started_at)}
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Session Ended</span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {ended_at ? formatDateTime(ended_at) : "Still Active"}
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-600">Productive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-gray-600">Idle</span>
                  </div>
                  {hasDisputedBlocks && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-amber-600">Disputed Time Blocks</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {totalScreenshots} screenshots
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {totalBlocks} time blocks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* All Screenshots Gallery */}
          {allScreenshots.length > 0 && (
            <div className="bg-white border rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">All Screenshots</h2>
                <span className="text-sm text-gray-600">{allScreenshots.length} total</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {allScreenshots.map((screenshot, index) => {
                  const imageUrl = getImageUrl(screenshot.image);
                  
                  return (
                    <div 
                      key={screenshot.id}
                      className="relative group cursor-pointer"
                      onClick={() => handleScreenshotClick(screenshot, index)}
                    >
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            console.error("Failed to load image:", imageUrl);
                            e.target.onerror = null;
                            const parent = e.target.parentElement;
                            parent.innerHTML = `
                              <div class="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                                <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span class="text-xs text-gray-500 text-center px-2">Failed to load</span>
                              </div>
                            `;
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg" />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Maximize2 className="w-4 h-4 text-white drop-shadow-lg" />
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 truncate">
                          {screenshot.taken_at_client ? 
                            new Date(screenshot.taken_at_client).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 
                            "Unknown time"
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timeline Blocks */}
          <div className="space-y-6">
            {time_blocks.map((block, blockIndex) => {
              const blockTimeData = calculateWorkedTime(block);
              const isExpanded = expandedBlocks[block.id];
              const isBlockFlagged = block.is_flagged || false;
              
              return (
                <div key={block.id} className="border rounded-xl overflow-hidden">
                  {/* Block Header */}
                  <div 
                    className={`bg-white p-6 cursor-pointer hover:bg-gray-50 transition-colors ${isBlockFlagged ? 'border-l-4 border-l-amber-500' : ''}`}
                    onClick={() => toggleBlockExpansion(block.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          isBlockFlagged 
                            ? "bg-amber-100" 
                            : block.ended_at 
                            ? "bg-gray-100" 
                            : "bg-green-100"
                        }`}>
                          {isBlockFlagged ? (
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                          ) : block.ended_at ? (
                            <Pause className="w-5 h-5 text-gray-600" />
                          ) : (
                            <Play className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-4">
                            <h3 className="font-semibold text-gray-900">
                              Time Block {blockIndex + 1}
                            </h3>
                            {isBlockFlagged && (
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                  Disputed
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent expanding/collapsing the block
                                    setSelectedBlockForExplanation(block.id);
                                    setExplanationFormOpen(true);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full text-xs font-medium transition-colors"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  Explain Activity
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatTimeRange(block.started_at, block.ended_at)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDateTime(block.started_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-900">
                            {formatDuration(blockTimeData.total)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <ChevronLeft className={`w-4 h-4 transition-transform ${
                            isExpanded ? "-rotate-90" : "rotate-90"
                          }`} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Productivity: {blockTimeData.productivity}%</span>
                        <span>
                          {formatDuration(blockTimeData.worked)} / {formatDuration(blockTimeData.total)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isBlockFlagged ? "bg-amber-500" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(blockTimeData.productivity, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Productive: {formatDuration(blockTimeData.worked)}</span>
                        <span>Idle: {formatDuration(blockTimeData.idle)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-6">
                      {block.windows && block.windows.length > 0 ? (
                        block.windows.map((window, windowIndex) => (
                          <div key={window.id || windowIndex} className="mb-6 last:mb-0">
                            <div className="flex items-center gap-2 mb-4">
                              <Monitor className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">
                                {window.window_title || `Window ${windowIndex + 1}`}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({window.screenshots?.length || 0} screenshots)
                              </span>
                            </div>
                            
                            {window.screenshots && window.screenshots.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {window.screenshots.map((screenshot) => {
                                  const imageUrl = getImageUrl(screenshot.image);
                                  const globalIndex = allScreenshots.findIndex(s => s.id === screenshot.id);
                                  
                                  return (
                                    <div 
                                      key={screenshot.id}
                                      className="relative group cursor-pointer"
                                      onClick={() => handleScreenshotClick(screenshot, globalIndex)}
                                    >
                                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                          src={imageUrl}
                                          alt={`Screenshot at ${screenshot.taken_at_client || 'unknown time'}`}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          loading="lazy"
                                          onError={(e) => {
                                            console.error("Failed to load screenshot:", imageUrl);
                                            e.target.onerror = null;
                                            const parent = e.target.parentElement;
                                            parent.innerHTML = `
                                              <div class="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                                                <svg class="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                                <span class="text-xs text-gray-500">Image error</span>
                                              </div>
                                            `;
                                          }}
                                        />
                                      </div>
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg" />
                                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Maximize2 className="w-4 h-4 text-white drop-shadow-lg" />
                                      </div>
                                      <div className="mt-2">
                                        <p className="text-xs text-gray-600 truncate">
                                          {screenshot.taken_at_client ? 
                                            new Date(screenshot.taken_at_client).toLocaleTimeString([], {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              second: '2-digit'
                                            }) : 
                                            "Unknown time"
                                          }
                                        </p>
                                        <p className={`text-xs truncate ${
                                          screenshot.is_flagged ? "text-amber-600" : "text-green-600"
                                        }`}>
                                          {screenshot.is_flagged ? "⚠️ Flagged" : "✓ Normal"}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm py-4 text-center">
                                No screenshots for this window
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No windows recorded for this time block</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {time_blocks.length === 0 && (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Time Blocks Recorded
              </h3>
              <p className="text-gray-600">
                This session doesn't have any recorded time blocks.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Screenshot Modal - Full screen with proper z-index */}
      {selectedScreenshot && (
        <div 
          ref={modalRef}
          className="fixed inset-0 bg-black bg-opacity-95 z-[999999] flex items-center justify-center"
        >
          <div className="relative w-full max-w-7xl h-full flex flex-col p-4">
            {/* Top Controls */}
            <div className="flex items-center justify-between mb-4 z-[9999999]">
              <button
                onClick={closeScreenshotModal}
                className="p-3 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-lg transition-all backdrop-blur-sm"
                title="Close (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <span className="text-white text-sm bg-black bg-opacity-60 px-4 py-2 rounded-full backdrop-blur-sm">
                  {currentSlideIndex + 1} / {allScreenshots.length}
                </span>
                
                <button
                  onClick={() => downloadScreenshot(
                    getImageUrl(selectedScreenshot.image),
                    `screenshot-${selectedScreenshot.id || Date.now()}.png`
                  )}
                  className="p-3 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-lg transition-all backdrop-blur-sm"
                  title="Download Screenshot"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Main Image Container - Centered */}
            <div className="flex-1 flex items-center justify-center relative">
              {/* Previous Button */}
              {currentSlideIndex > 0 && (
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-4 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full transition-all backdrop-blur-sm"
                  title="Previous (←)"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
              )}
              
              {/* Image Container with centered positioning */}
              <div className="flex flex-col items-center justify-center w-full h-full">
                {/* Image */}
                <div className="flex-1 flex items-center justify-center max-w-full max-h-[70vh] px-4 ml-10">
                  <img
                    src={getImageUrl(selectedScreenshot.image)}
                    alt="Screenshot"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    onError={(e) => {
                      console.error("Failed to load modal image:", getImageUrl(selectedScreenshot.image));
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%232d3748'/%3E%3Ctext x='400' y='300' font-family='Arial' font-size='24' text-anchor='middle' dy='.3em' fill='%23cbd5e0'%3EScreenshot not available%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                
                {/* Screenshot Info - Centered below image */}
                <div className="mt-4 px-4 py-3 bg-black bg-opacity-70 backdrop-blur-md rounded-lg text-white max-w-2xl w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center md:text-left">
                      <p className="text-sm text-gray-300">Captured At</p>
                      <p className="font-medium text-white">
                        {selectedScreenshot.taken_at_client ? 
                          new Date(selectedScreenshot.taken_at_client).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          }) : 
                          "Unknown"
                        }
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-300">Window</p>
                      <p className="font-medium text-white truncate">{selectedScreenshot.windowTitle || "Unknown"}</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-sm text-gray-300">Status</p>
                      <p className={`font-medium ${selectedScreenshot.is_flagged ? 'text-amber-400' : 'text-green-400'}`}>
                        {selectedScreenshot.is_flagged ? "⚠️ Flagged" : "✓ Normal"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Next Button */}
              {currentSlideIndex < allScreenshots.length - 1 && (
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-4 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full transition-all backdrop-blur-sm"
                  title="Next (→)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
            
            {/* Thumbnail Carousel */}
            {allScreenshots.length > 1 && (
              <div className="mt-6 px-4">
                <div className="flex items-center justify-center gap-2">
                  {/* Previous Thumbnails Button */}
                  {thumbnailStartIndex > 0 && (
                    <button
                      onClick={prevThumbnails}
                      className="p-2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full transition-all backdrop-blur-sm"
                      title="Previous thumbnails"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Thumbnail Container */}
                  <div 
                    ref={thumbnailContainerRef}
                    className="flex gap-2 justify-center min-w-0"
                  >
                    {visibleThumbnails.map((screenshot, index) => {
                      const thumbUrl = getImageUrl(screenshot.image);
                      const globalIndex = thumbnailStartIndex + index;
                      
                      return (
                        <button
                          key={screenshot.id || globalIndex}
                          onClick={() => {
                            setCurrentSlideIndex(globalIndex);
                            setSelectedScreenshot(screenshot);
                          }}
                          className={`shrink-0 w-20 h-14 md:w-24 md:h-16 rounded overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                            globalIndex === currentSlideIndex 
                              ? 'border-blue-500 scale-110 shadow-lg' 
                              : 'border-transparent hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={thumbUrl}
                            alt={`Thumbnail ${globalIndex + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='64' viewBox='0 0 96 64'%3E%3Crect width='96' height='64' fill='%234a5568'/%3E%3C/svg%3E";
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Next Thumbnails Button */}
                  {thumbnailStartIndex + THUMBNAILS_PER_VIEW < allScreenshots.length && (
                    <button
                      onClick={nextThumbnails}
                      className="p-2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full transition-all backdrop-blur-sm"
                      title="Next thumbnails"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* Thumbnail Indicator */}
                <div className="text-center mt-2">
                  <p className="text-sm text-gray-400">
                    {Math.min(thumbnailStartIndex + 1, allScreenshots.length)} - 
                    {Math.min(thumbnailStartIndex + THUMBNAILS_PER_VIEW, allScreenshots.length)} 
                    of {allScreenshots.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Explanation Form Modal */}
      <TimeBlockExplanationForm
        blockId={selectedBlockForExplanation}
        isOpen={explanationFormOpen}
        mode="freelancer"
        onClose={() => {
          setExplanationFormOpen(false);
          setSelectedBlockForExplanation(null);
        }}
        onExplanationSubmitted={() => {
          // Refresh session data after explanation is submitted
          fetchSessionTimeline();
        }}
      />
    </>
  );
}