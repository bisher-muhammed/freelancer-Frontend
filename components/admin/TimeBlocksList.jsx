"use client";

import React from "react";
import {
  Clock,
  Calendar,
  AlertCircle,
  Activity,
  Battery,
  TrendingUp,
  PlayCircle,
  StopCircle,
  PauseCircle,
  ChevronRight,
  ChevronDown,
  Layers,
  Flag,
  MessageSquare,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink
} from "lucide-react";

const TimeBlocksList = ({ 
  timeBlocks, 
  onOpenExplanationForm,
  onViewFreelancerExplanation,
  userRole = "freelancer" // "freelancer" or "admin"
}) => {
  const [expandedBlocks, setExpandedBlocks] = React.useState({});

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTimeShort = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid time";
    }
  };

  const toggleExpand = (blockId) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  const getEndReasonBadge = (reason) => {
    if (!reason) return null;
    
    const config = {
      STOP: {
        color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        icon: StopCircle,
        label: "Manual Stop"
      },
      PAUSE: {
        color: "bg-amber-100 text-amber-800 border border-amber-200",
        icon: PauseCircle,
        label: "Paused"
      },
      SYSTEM_SLEEP: {
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: PauseCircle,
        label: "System Sleep"
      },
      IDLE: {
        color: "bg-rose-100 text-rose-800 border border-rose-200",
        icon: AlertCircle,
        label: "Idle"
      }
    };

    const { color, icon: Icon, label } = config[reason] || {
      color: "bg-gray-100 text-gray-800 border border-gray-200",
      icon: AlertCircle,
      label: reason || "Unknown"
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const getFlagSourceBadge = (source) => {
    if (!source || source === "NONE") return null;
    
    const config = {
      SYSTEM: {
        color: "bg-blue-100 text-blue-800",
        icon: Shield,
        label: "System Flagged"
      },
      ADMIN: {
        color: "bg-purple-100 text-purple-800",
        icon: Flag,
        label: "Admin Flagged"
      }
    };

    const { color, icon: Icon, label } = config[source] || {
      color: "bg-gray-100 text-gray-800",
      icon: Flag,
      label: source
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 70) return "text-emerald-600";
    if (efficiency >= 40) return "text-amber-600";
    return "text-rose-600";
  };

  // FIXED: Proper efficiency calculation
  const calculateEfficiency = (block) => {
    if (!block.duration_seconds || block.duration_seconds === 0) {
      // Fallback to total_seconds if duration_seconds doesn't exist
      if (!block.total_seconds || block.total_seconds === 0) return 0;
      
      const workedSeconds = block.worked_seconds || block.active_seconds || 0;
      return Math.round((workedSeconds / block.total_seconds) * 100);
    }
    
    // Use duration_seconds as the total time
    const activeSeconds = block.active_seconds || block.worked_seconds || 0;
    return Math.round((activeSeconds / block.duration_seconds) * 100);
  };

  const handleAdminFlag = (block, e) => {
    e.stopPropagation();
    if (onOpenExplanationForm) {
      onOpenExplanationForm(block, "admin");
    }
  };

  const handleViewExplanation = (block, e) => {
    e.stopPropagation();
    if (onViewFreelancerExplanation) {
      onViewFreelancerExplanation(block);
    }
  };

  if (timeBlocks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
          <Clock className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Time Blocks</h3>
        <p className="text-gray-600">No time blocks were recorded for this session.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Time Blocks</h2>
              <p className="text-sm text-gray-600">
                {timeBlocks.length} recorded blocks • 
                {timeBlocks.filter(b => b.is_flagged).length} flagged
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total: {formatTime(timeBlocks.reduce((sum, block) => 
              sum + (block.duration_seconds || block.total_seconds || 0), 0))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {timeBlocks.map((block, index) => {
            const efficiency = calculateEfficiency(block);
            const isExpanded = expandedBlocks[block.id || index];
            const hasExplanation = block.explanation;
            
            return (
              <div 
                key={block.id || index}
                className={`bg-gradient-to-br from-white to-gray-50 rounded-xl border transition-all duration-200 ${
                  block.is_flagged 
                    ? 'border-rose-200 hover:border-rose-300' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Block Header */}
                <div className="p-4 cursor-pointer" onClick={() => toggleExpand(block.id || index)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        block.is_flagged ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {block.is_flagged ? <AlertCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            Block #{block.id || index + 1}
                          </h3>
                          {block.is_flagged && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs px-2 py-1 bg-rose-100 text-rose-800 rounded-full">
                                Flagged
                              </span>
                              {getFlagSourceBadge(block.flag_source)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {formatDate(block.started_at)}
                          </div>
                          {block.end_reason && getEndReasonBadge(block.end_reason)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {userRole === "admin" && (
                        <div className="flex items-center gap-2">
                          {/* View Explanation Button (always show if there's explanation) */}
                          {hasExplanation && (
                            <button
                              onClick={(e) => handleViewExplanation(block, e)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                              title="View freelancer explanation"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Flag/Review Button */}
                          <button
                            onClick={(e) => handleAdminFlag(block, e)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                              block.is_flagged 
                                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {hasExplanation ? (
                              <>
                                <Eye className="w-3 h-3" />
                                Review Explanation
                              </>
                            ) : block.is_flagged ? (
                              <>
                                <AlertCircle className="w-3 h-3" />
                                Review Flag
                              </>
                            ) : (
                              <>
                                <Flag className="w-3 h-3" />
                                Flag Block
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${getEfficiencyColor(efficiency)}`}>
                            {efficiency}%
                          </span>
                          <span className="text-sm text-gray-600">Efficiency</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatTime(block.duration_seconds || block.total_seconds || 0)}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200 pt-4">
                    {/* Timeline */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">Timeline</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatTimeShort(block.started_at)} - {formatTimeShort(block.ended_at)}
                        </div>
                      </div>
                      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="absolute inset-0 flex">
                          <div 
                            className="h-full bg-emerald-500"
                            style={{ 
                              width: `${((block.active_seconds || block.worked_seconds || 0) / (block.duration_seconds || block.total_seconds || 1)) * 100}%` 
                            }}
                          />
                          <div 
                            className="h-full bg-amber-500"
                            style={{ 
                              width: `${((block.idle_seconds || 0) / (block.duration_seconds || block.total_seconds || 1)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>Active ({formatTime(block.active_seconds || block.worked_seconds || 0)})</span>
                        <span>Idle ({formatTime(block.idle_seconds || 0)})</span>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700">Active Time</span>
                        </div>
                        <div className="text-xl font-bold text-emerald-900">
                          {formatTime(block.active_seconds || block.worked_seconds || 0)}
                        </div>
                        <div className="text-xs text-emerald-600 mt-1">
                          {block.duration_seconds || block.total_seconds > 0 ? 
                            Math.round(((block.active_seconds || block.worked_seconds || 0) / (block.duration_seconds || block.total_seconds || 1)) * 100) 
                            : 0}% of total
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Battery className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-700">Idle Time</span>
                        </div>
                        <div className="text-xl font-bold text-amber-900">
                          {formatTime(block.idle_seconds || 0)}
                        </div>
                        <div className="text-xs text-amber-600 mt-1">
                          {block.idle_ratio ? Math.round(block.idle_ratio * 100) : 0}% idle ratio
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Performance</span>
                        </div>
                        <div className={`text-xl font-bold ${getEfficiencyColor(efficiency)}`}>
                          {efficiency}%
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {efficiency >= 70 ? "Good" : efficiency >= 40 ? "Average" : "Needs improvement"}
                        </div>
                      </div>
                    </div>

                    {/* Windows Information */}
                    {block.windows && block.windows.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Screenshot Windows</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {block.windows.map((window, winIndex) => (
                            <div 
                              key={window.id || winIndex}
                              className="p-2 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-gray-900">
                                    {formatTimeShort(window.start_at)} - {formatTimeShort(window.end_at)}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {window.screenshots?.length || 0} screenshots
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-600">
                                    {window.used_count || 0}/{window.max_count || 3} used
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Flag Reason */}
                    {block.flag_reason && (
                      <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                          <span className="text-sm font-medium text-rose-700">Flag Reason</span>
                          {block.flag_source && (
                            <span className="text-xs text-rose-600">
                              ({block.flag_source === "SYSTEM" ? "System" : "Admin"})
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-rose-600">{block.flag_reason}</p>
                        {block.flagged_at && (
                          <p className="text-xs text-rose-500 mt-1">
                            Flagged at: {formatDate(block.flagged_at)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Freelancer Explanation (IMPROVED DISPLAY) */}
                    {hasExplanation && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 p-1.5 rounded-lg">
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-blue-900">Freelancer Explanation</h4>
                              <p className="text-xs text-blue-600">
                                Submitted: {block.explanation.created_at ? 
                                  formatDate(block.explanation.created_at) : 
                                  'Unknown date'
                                }
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              block.explanation.admin_status === 'ACCEPTED' 
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : block.explanation.admin_status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {block.explanation.admin_status || 'PENDING REVIEW'}
                            </span>
                            
                            {userRole === "admin" && (
                              <button
                                onClick={(e) => handleViewExplanation(block, e)}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Review
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg border border-blue-100 mb-3">
                          <p className="text-sm text-gray-800">{block.explanation.explanation}</p>
                        </div>
                        
                        {block.explanation.admin_note && (
                          <div className="mt-3 pt-3 border-t border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="bg-amber-100 p-1 rounded">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                              </div>
                              <h5 className="text-xs font-bold text-amber-800">Admin Note</h5>
                            </div>
                            <div className="bg-white p-2 rounded border border-amber-100">
                              <p className="text-xs text-amber-800">{block.explanation.admin_note}</p>
                            </div>
                            <p className="text-xs text-amber-600 mt-1 text-right">
                              Reviewed: {block.explanation.admin_reviewed_at ? 
                                formatDate(block.explanation.admin_reviewed_at) : 
                                'Not reviewed'
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(timeBlocks.reduce((sum, block) => 
                sum + (block.active_seconds || block.worked_seconds || 0), 0))}
            </div>
            <div className="text-sm text-gray-600">Total Active Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">
              {formatTime(timeBlocks.reduce((sum, block) => 
                sum + (block.idle_seconds || 0), 0))}
            </div>
            <div className="text-sm text-gray-600">Total Idle Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {timeBlocks.length > 0 
                ? Math.round(timeBlocks.reduce((sum, block) => 
                    sum + calculateEfficiency(block), 0) / timeBlocks.length)
                : 0
              }%
            </div>
            <div className="text-sm text-gray-600">Average Efficiency</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeBlocksList;