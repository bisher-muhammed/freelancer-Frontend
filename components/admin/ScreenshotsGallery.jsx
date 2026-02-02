"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Download,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Grid3x3,
  Film,
  AlertCircle,
  Camera,
  Clock,
  Monitor,
  ChevronLeft as ChevronLeftIcon,
  Video
} from "lucide-react";

const ScreenshotsGallery = ({ screenshots, apiBaseUrl }) => {
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "carousel"
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const modalRef = useRef(null);
  const thumbnailContainerRef = useRef(null);

  const THUMBNAILS_PER_VIEW = 3;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/media/')) {
      return `${apiBaseUrl}${imagePath}`;
    }
    
    if (imagePath.startsWith('media/')) {
      return `${apiBaseUrl}/${imagePath}`;
    }
    
    return `${apiBaseUrl}/media/screenshots/${imagePath}`;
  };

  const handleScreenshotClick = (screenshot, index) => {
    setSelectedScreenshot(screenshot);
    setCurrentSlideIndex(index);
  };

  const closeModal = () => {
    setSelectedScreenshot(null);
    setCurrentSlideIndex(0);
    setThumbnailStartIndex(0);
  };

  const nextSlide = () => {
    if (currentSlideIndex < screenshots.length - 1) {
      const newIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(newIndex);
      setSelectedScreenshot(screenshots[newIndex]);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      const newIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(newIndex);
      setSelectedScreenshot(screenshots[newIndex]);
    }
  };

  const nextThumbnails = () => {
    if (thumbnailStartIndex + THUMBNAILS_PER_VIEW < screenshots.length) {
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedScreenshot) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
      
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
        closeModal();
      } else if (e.key === 'ArrowLeft' && currentSlideIndex > 0) {
        prevSlide();
      } else if (e.key === 'ArrowRight' && currentSlideIndex < screenshots.length - 1) {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedScreenshot, currentSlideIndex, screenshots.length]);

  // Update thumbnail start index when slide changes
  useEffect(() => {
    if (selectedScreenshot && screenshots.length > THUMBNAILS_PER_VIEW) {
      const halfView = Math.floor(THUMBNAILS_PER_VIEW / 2);
      let newStartIndex = currentSlideIndex - halfView;
      
      if (newStartIndex < 0) {
        newStartIndex = 0;
      } else if (newStartIndex + THUMBNAILS_PER_VIEW > screenshots.length) {
        newStartIndex = screenshots.length - THUMBNAILS_PER_VIEW;
      }
      
      setThumbnailStartIndex(newStartIndex);
    }
  }, [currentSlideIndex, selectedScreenshot, screenshots.length]);

  // Calculate visible thumbnails
  const visibleThumbnails = screenshots.slice(
    thumbnailStartIndex,
    Math.min(thumbnailStartIndex + THUMBNAILS_PER_VIEW, screenshots.length)
  );

  if (screenshots.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Screenshots Available</h3>
        <p className="text-gray-600">No screenshots were captured during this session.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl shadow-sm">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Screenshots</h2>
              <p className="text-sm text-gray-600">{screenshots.length} captured moments</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {screenshots.length} screenshots
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
                title="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("carousel")}
                className={`p-2 rounded-lg transition-all ${viewMode === "carousel" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
                title="Carousel view"
              >
                <Film className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {screenshots.map((screenshot, index) => {
              const imageUrl = getImageUrl(screenshot.image);
              
              return (
                <div 
                  key={screenshot.id || index}
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
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600 truncate">
                        {screenshot.taken_at_client ? 
                          new Date(screenshot.taken_at_client).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 
                          index + 1
                        }
                      </p>
                      {screenshot.is_flagged && (
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Carousel View */}
      {viewMode === "carousel" && (
        <div className="p-6">
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-4 pb-4">
                {screenshots.map((screenshot, index) => {
                  const imageUrl = getImageUrl(screenshot.image);
                  
                  return (
                    <div 
                      key={screenshot.id || index}
                      className="flex-shrink-0 w-64"
                      onClick={() => handleScreenshotClick(screenshot, index)}
                    >
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer">
                        <div className="aspect-video bg-gray-100 overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              Screenshot {index + 1}
                            </span>
                            {screenshot.is_flagged ? (
                              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                                Flagged
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                                Normal
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">
                            {screenshot.taken_at_client ? 
                              new Date(screenshot.taken_at_client).toLocaleString() : 
                              "Unknown time"
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">
                {screenshots.filter(s => !s.is_flagged).length} normal
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-gray-600">
                {screenshots.filter(s => s.is_flagged).length} flagged
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {screenshots.length} screenshots
              </span>
            </div>
            <button
              onClick={() => handleScreenshotClick(screenshots[0], 0)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>
        </div>
      </div>

      {/* Modal - Exactly like tracking page */}
      {selectedScreenshot && (
        <div 
          ref={modalRef}
          className="fixed inset-0 bg-black bg-opacity-95 z-[999999] flex items-center justify-center"
        >
          <div className="relative w-full max-w-7xl h-full flex flex-col p-4">
            {/* Top Controls */}
            <div className="flex items-center justify-between mb-4 z-[9999999]">
              <button
                onClick={closeModal}
                className="p-3 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-lg transition-all backdrop-blur-sm"
                title="Close (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <span className="text-white text-sm bg-black bg-opacity-60 px-4 py-2 rounded-full backdrop-blur-sm">
                  {currentSlideIndex + 1} / {screenshots.length}
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
                <div className="flex-1 flex items-center justify-center max-w-full max-h-[70vh] px-4">
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
                      <p className="text-xs text-gray-400">
                        {selectedScreenshot.taken_at_client ? 
                          new Date(selectedScreenshot.taken_at_client).toLocaleDateString() : 
                          ""
                        }
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-300">Window</p>
                      <p className="font-medium text-white truncate">
                        {selectedScreenshot.windowTitle || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400">
                        Block #{selectedScreenshot.blockId || "Unknown"}
                      </p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-sm text-gray-300">Status</p>
                      <p className={`font-medium ${selectedScreenshot.is_flagged ? 'text-amber-400' : 'text-green-400'}`}>
                        {selectedScreenshot.is_flagged ? "⚠️ Flagged" : "✓ Normal"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {selectedScreenshot.resolution || "Full resolution"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Next Button */}
              {currentSlideIndex < screenshots.length - 1 && (
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
            {screenshots.length > 1 && (
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
                  {thumbnailStartIndex + THUMBNAILS_PER_VIEW < screenshots.length && (
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
                    {Math.min(thumbnailStartIndex + 1, screenshots.length)} - 
                    {Math.min(thumbnailStartIndex + THUMBNAILS_PER_VIEW, screenshots.length)} 
                    of {screenshots.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotsGallery;