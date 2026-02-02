"use client";

import React from "react";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Monitor,
  Smartphone,
  Laptop,
  StopCircle,
  AlertCircle,
  ArrowUpRight,
  Globe,
  Cpu,
  Database
} from "lucide-react";

const SessionDetails = ({ session, billing}) => {
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
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

  const getDeviceIcon = (platform) => {
    if (!platform) return <Monitor className="w-4 h-4" />;
    
    const config = {
      windows: <Monitor className="w-4 h-4" />,
      mac: <Monitor className="w-4 h-4" />,
      linux: <Monitor className="w-4 h-4" />,
      android: <Smartphone className="w-4 h-4" />,
      ios: <Smartphone className="w-4 h-4" />
    };

    return config[platform.toLowerCase()] || <Laptop className="w-4 h-4" />;
  };

  const getEndReasonBadge = (reason) => {
    if (!reason) return null;
    
    const config = {
      STOP: {
        color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        icon: StopCircle,
        label: "Manual Stop"
      },
      TIMEOUT: {
        color: "bg-amber-50 text-amber-700 border border-amber-200",
        icon: Clock,
        label: "Timeout"
      },
      ERROR: {
        color: "bg-rose-50 text-rose-700 border border-rose-200",
        icon: AlertCircle,
        label: "Error"
      }
    };

    const { color, icon: Icon, label } = config[reason] || {
      color: "bg-gray-50 text-gray-700 border border-gray-200",
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

  const timeBlocks = session?.time_blocks || [];
  const firstTimeBlock = timeBlocks[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Session Details</h2>
              <p className="text-sm text-gray-600">Recorded activity and system information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Session Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-100 p-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Session ID</p>
                <p className="font-mono font-semibold text-gray-900">#{session?.id || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-purple-100 p-1.5 rounded-lg">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-semibold text-gray-900">
                  {formatTime(session?.total_seconds || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-emerald-100 p-1.5 rounded-lg">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Freelancer ID</p>
                <p className="font-semibold text-gray-900">{billing?.freelancer || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-blue-600" />
            Timeline
          </h3>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-500"></div>
            
            <div className="space-y-6 pl-10">
              {/* Start Time */}
              <div className="relative">
                <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Session Started</p>
                      <p className="text-sm text-gray-600">{formatDate(session?.started_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {session?.platform && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-lg">
                          {getDeviceIcon(session.platform)}
                          <span className="text-xs font-medium text-gray-700">{session.platform}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* End Time (if available) */}
              {session?.ended_at && (
                <div className="relative">
                  <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-white p-4 rounded-xl border border-emerald-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Session Ended</p>
                        <p className="text-sm text-gray-600">{formatDate(session.ended_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {firstTimeBlock?.end_reason && getEndReasonBadge(firstTimeBlock.end_reason)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-gray-600" />
            System Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {session?.platform && (
              <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg">
                  {getDeviceIcon(session.platform)}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Platform</p>
                  <p className="text-sm font-medium text-gray-900">{session.platform}</p>
                </div>
              </div>
            )}
            
            {session?.app_version && (
              <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg">
                  <Globe className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">App Version</p>
                  <p className="text-sm font-medium text-gray-900">{session.app_version}</p>
                </div>
              </div>
            )}
            
            {session?.ip_address && (
              <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg">
                  <Globe className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">IP Address</p>
                  <p className="font-mono text-sm font-medium text-gray-900">{session.ip_address}</p>
                </div>
              </div>
            )}
            
            {billing?.contract && (
              <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Contract</p>
                  <p className="text-sm font-medium text-gray-900">#{billing.contract}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;