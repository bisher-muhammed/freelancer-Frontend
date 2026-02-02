"use client";

import React from "react";
import {
  Clock,
  DollarSign,
  Receipt,
  Calendar,
  TrendingUp,
  Percent,
  Activity,
  Battery,
  Layers
} from "lucide-react";

const BillingDetails = ({ billing, billingUnits }) => {
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === "" || isNaN(amount)) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(0);
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(amount));
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-sm">
            <Receipt className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Billing Details</h2>
            <p className="text-sm text-gray-600">Financial breakdown and calculations</p>
          </div>
        </div>
      </div>


      <div className="space-y-4">
        {[
          { label: "Hourly Rate", value: billing?.hourly_rate, iconColor: "blue", icon: <DollarSign className="w-4 h-4 text-blue-600" /> , suffix: "/hr"},
          { label: "Total Budget", value: billing?.offer?.total_budget, iconColor: "green", icon: <DollarSign className="w-4 h-4 text-green-600" /> },
          { label: "Total Paid", value: billing?.offer?.total_paid, iconColor: "amber", icon: <DollarSign className="w-4 h-4 text-amber-600" /> },
          { label: "Remaining Budget", value: billing?.offer?.remaining_budget, iconColor: "purple", icon: <DollarSign className="w-4 h-4 text-purple-600" /> },
        ].map((item) => (
          <div 
            key={item.label} 
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className={`bg-${item.iconColor}-100 p-2 rounded-lg`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(item.value)}{item.suffix || ""}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>


      <div className="p-6">
        {/* Main Financial Summary */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Financial Overview */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Financial Overview
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hourly Rate</p>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(billing?.hourly_rate)}/hr
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Billable Hours</p>
                      <p className="font-medium text-gray-900">
                        {billing?.billable_seconds 
                          ? (billing.billable_seconds / 3600).toFixed(2) + " hrs"
                          : "0 hrs"
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-2 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Gross Amount</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(billing?.gross_amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right - Time Analysis */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Time Analysis
              </h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">productive_time</span>
                    <span className="font-medium text-gray-900">
                      {formatTime(billing?.productive_time || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Idle Time</span>
                    <span className="font-medium text-amber-600">
                      {formatTime(billing?.idle_seconds || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full" 
                      style={{ 
                        width: `${billing?.tracked_seconds > 0 
                          ? ((billing?.idle_seconds || 0) / billing.tracked_seconds) * 100 
                          : 0
                        }%` 
                      }}
                    />
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-blue-100 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Billable Time</span>
                    <span className="font-bold text-blue-600">
                      {formatTime(billing?.billable_seconds || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" 
                      style={{ 
                        width: `${billing?.tracked_seconds > 0 
                          ? ((billing?.billable_seconds || 0) / billing.tracked_seconds) * 100 
                          : 0
                        }%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Efficiency: {billing?.tracked_seconds > 0 
                      ? `${Math.round(((billing?.billable_seconds || 0) / billing.tracked_seconds) * 100)}%`
                      : "0%"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Period & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Billing Period */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Billing Period
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(billing?.period_start)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(billing?.period_end)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Created At</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(billing?.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Performance Metrics
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs text-gray-500">Productivity</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {billing?.tracked_seconds > 0 
                      ? `${Math.round(((billing?.billable_seconds || 0) / billing.tracked_seconds) * 100)}%`
                      : "0%"
                    }
                  </p>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Battery className="w-4 h-4 text-amber-600" />
                    <p className="text-xs text-gray-500">Idle Ratio</p>
                  </div>
                  <p className="text-xl font-bold text-amber-600">
                    {billing?.tracked_seconds > 0 
                      ? `${Math.round(((billing?.idle_seconds || 0) / billing.tracked_seconds) * 100)}%`
                      : "0%"
                    }
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Billable Rate</p>
                  </div>
                  <p className="font-bold text-blue-600">
                    {formatCurrency(billing?.gross_amount / (billing?.billable_seconds / 3600) || 0)}/hr
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  Effective rate based on billable time
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Billing Units */}
        {billingUnits && billingUnits.length > 1 && (
          <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              Related Billing Units
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {billingUnits.map((unit) => (
                unit && (
                  <div 
                    key={unit.id}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      unit.id === billing?.id
                        ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Unit #{unit.id}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatCurrency(unit.gross_amount)}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          unit.status === 'pending' 
                            ? 'bg-amber-100 text-amber-800'
                            : unit.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : unit.status === 'charged'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {unit.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingDetails;