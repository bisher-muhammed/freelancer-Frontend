'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Save, XCircle, Loader2 } from 'lucide-react';
import { apiPrivate } from '@/lib/apiPrivate';

// Simplified API calls
const api = {
  getPlans: () => apiPrivate.get('/subscription-plans/').then(res => res.data),
  createPlan: (data) => apiPrivate.post('/subscription-plans/', data).then(res => res.data),
  updatePlan: (id, data) => apiPrivate.put(`/subscription-plans/${id}/`, data).then(res => res.data),
  deletePlan: (id) => apiPrivate.delete(`/subscription-plans/${id}/`)
};

// Separate Editable Plan Card Component
const EditablePlanCard = ({ plan, onSave, onCancel, onDelete, loading, colors, isNew = false }) => {
  const [localFormData, setLocalFormData] = useState({
    name: plan?.name || '',
    price: plan?.price || '',
    max_projects: plan?.max_projects || 1,
    duration_days: plan?.duration_days || 30
  });

  // Initialize form data when plan changes
  React.useEffect(() => {
    if (plan) {
      setLocalFormData({
        name: plan.name || '',
        price: plan.price || '',
        max_projects: plan.max_projects || 1,
        duration_days: plan.duration_days || 30
      });
    }
  }, [plan]);

  const handleInputChange = (field, value) => {
    setLocalFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(localFormData);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700 hover:border-slate-600 transition-all duration-300 min-w-[300px] max-w-[320px]">
      
      {/* Plan Badge */}
      <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${colors.bg} text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg`}>
        <input
          value={localFormData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="bg-transparent text-center w-32 placeholder-white/70 outline-none border-none"
          placeholder="Plan Name"
        />
      </div>

      {/* Action Buttons for existing plans */}
      {!isNew && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={handleSave} disabled={loading} className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
            <Check className="w-4 h-4 text-white" />
          </button>
          <button onClick={handleCancel} disabled={loading} className="p-2 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Price */}
      <div className="text-center mb-8 mt-6">
        <div className="flex items-baseline justify-center">
          <span className={`text-5xl font-bold bg-gradient-to-r ${colors.bg} bg-clip-text text-transparent`}>
            <div className="flex items-center justify-center">
              <span className="text-white text-3xl mr-2">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={localFormData.price || ''}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="bg-slate-800 text-white text-center px-2 py-1 rounded border border-slate-600 outline-none w-28 text-4xl font-bold"
                placeholder="0.00"
              />
            </div>
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-2">Per Month</p>
      </div>

      {/* Features */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="text-slate-300">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={localFormData.max_projects || 1}
                onChange={(e) => handleInputChange('max_projects', parseInt(e.target.value) || 1)}
                className="bg-slate-800 text-white px-2 py-1 rounded border border-slate-600 outline-none w-20"
              />
              <span>Projects</span>
            </div>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="text-slate-300">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={localFormData.duration_days || 30}
                onChange={(e) => handleInputChange('duration_days', parseInt(e.target.value) || 1)}
                className="bg-slate-800 text-white px-2 py-1 rounded border border-slate-600 outline-none w-20"
              />
              <span>Days Access</span>
            </div>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="text-slate-300">24/7 Support</span>
        </div>

        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400 shrink-0" />
          <span className="text-slate-300">Cloud Storage</span>
        </div>
      </div>

      {/* Action Button */}
      {isNew ? (
        <EditActions onSave={handleSave} onCancel={handleCancel} loading={loading} createMode />
      ) : null}
    </div>
  );
};

// Static Plan Card Component
const StaticPlanCard = ({ plan, onEdit, onDelete, loading, colors, index }) => {
  return (
    <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700 hover:border-slate-600 transition-all duration-300 min-w-[300px] max-w-[320px]">
      
      {/* Plan Badge */}
      <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${colors.bg} text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg`}>
        {plan.name}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={() => onEdit(plan)} disabled={loading} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
          <Edit2 className="w-4 h-4 text-white" />
        </button>
        <button onClick={() => onDelete(plan.id)} disabled={loading} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Price */}
      <div className="text-center mb-8 mt-6">
        <div className="flex items-baseline justify-center">
          <span className={`text-5xl font-bold bg-gradient-to-r ${colors.bg} bg-clip-text text-transparent`}>
            ₹{parseFloat(plan.price).toFixed(2)}
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-2">Per Month</p>
      </div>

      {/* Features */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="text-slate-300">
            {plan.max_projects >= 999 ? 'Unlimited' : plan.max_projects} Projects
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="text-slate-300">{plan.duration_days} Days Access</span>
        </div>

        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="text-slate-300">24/7 Support</span>
        </div>

        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="text-slate-300">Cloud Storage</span>
        </div>
      </div>
    </div>
  );
};

const AdminSubscriptionManager = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  // Card colors configuration
  const cardColors = [
    { bg: 'from-red-500 to-pink-500', badge: 'bg-red-500', button: 'bg-red-500 hover:bg-red-600' },
    { bg: 'from-cyan-500 to-teal-500', badge: 'bg-cyan-500', button: 'bg-cyan-500 hover:bg-cyan-600' },
    { bg: 'from-blue-600 to-blue-500', badge: 'bg-blue-600', button: 'bg-blue-600 hover:bg-blue-700' },
    { bg: 'from-purple-600 to-purple-500', badge: 'bg-purple-600', button: 'bg-purple-600 hover:bg-purple-700' },
    { bg: 'from-orange-500 to-red-500', badge: 'bg-orange-500', button: 'bg-orange-500 hover:bg-orange-600' }
  ];

  const getCardColor = (index) => cardColors[index % cardColors.length];

  // Load plans on component mount
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await api.getPlans();
      const data = Array.isArray(response) ? response : (response.results || response.data || []);
      setPlans(data);
    } catch (error) {
      setError('Failed to load subscription plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateForm = (formData) => {
    if (!formData.name?.trim()) return setError('Plan name is required');
    if (!formData.price || parseFloat(formData.price) <= 0) return setError('Valid price is required');
    if (!formData.max_projects || formData.max_projects < 1) return setError('At least 1 project is required');
    if (!formData.duration_days || formData.duration_days < 1) return setError('Duration must be at least 1 day');
    return true;
  };

  // Handle create operation
  const handleCreate = async (formData) => {
    if (!validateForm(formData)) return;

    setLoading(true);
    try {
      const planData = {
        name: formData.name,
        price: parseFloat(formData.price),
        max_projects: parseInt(formData.max_projects),
        duration_days: parseInt(formData.duration_days)
      };

      const newPlan = await api.createPlan(planData);
      setPlans(prev => [...prev, newPlan]);
      setIsCreating(false);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  // Handle update operation
  const handleUpdate = async (formData) => {
    if (!validateForm(formData)) return;

    setLoading(true);
    try {
      const planData = {
        name: formData.name,
        price: parseFloat(formData.price),
        max_projects: parseInt(formData.max_projects),
        duration_days: parseInt(formData.duration_days)
      };

      const updated = await api.updatePlan(editingId, planData);
      setPlans(prev => prev.map(p => p.id === editingId ? updated : p));
      setEditingId(null);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete operation
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    setLoading(true);
    try {
      await api.deletePlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete plan');
    } finally {
      setLoading(false);
    }
  };

  // Start creating new plan
  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
  };

  // Start editing existing plan
  const startEdit = (plan) => {
    setEditingId(plan.id);
    setIsCreating(false);
  };

  // Cancel operations
  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setError(null);
  };

  // Loading state
  if (loading && plans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Plans Management</h1>
            <p className="text-gray-600 mt-1">Create and manage subscription plans for your platform</p>
          </div>
          
          {!isCreating && !editingId && (
            <button onClick={startCreate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg">
              <Plus className="w-5 h-5" />
              Add New Plan
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Plans Section */}
      <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-3">Available Plans</h2>
          <p className="text-slate-400 text-lg">Choose the perfect plan for your needs</p>
        </div>

        {/* Plans Grid */}
        <div className="flex flex-wrap justify-center gap-8">
          {/* Static Plan Cards */}
          {plans.map((plan, index) => (
            editingId === plan.id ? (
              <EditablePlanCard
                key={`editing-${plan.id}`}
                plan={plan}
                onSave={handleUpdate}
                onCancel={handleCancel}
                onDelete={handleDelete}
                loading={loading}
                colors={getCardColor(index)}
              />
            ) : (
              <StaticPlanCard
                key={`static-${plan.id}`}
                plan={plan}
                onEdit={startEdit}
                onDelete={handleDelete}
                loading={loading}
                colors={getCardColor(index)}
                index={index}
              />
            )
          ))}
          
          {/* New Plan Card */}
          {isCreating && (
            <EditablePlanCard
              key="new-plan"
              plan={null}
              onSave={handleCreate}
              onCancel={handleCancel}
              onDelete={handleDelete}
              loading={loading}
              colors={getCardColor(plans.length)}
              isNew={true}
            />
          )}
        </div>

        {/* Empty State */}
        {plans.length === 0 && !isCreating && !editingId && (
          <div className="text-center py-16">
            <div className="text-slate-400 text-lg mb-4">No subscription plans yet</div>
            <p className="text-slate-500 mb-6">Create your first plan to get started</p>
            <button onClick={startCreate} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create First Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const EditActions = ({ onSave, onCancel, loading, createMode = false }) => (
  <div className="flex gap-2">
    <button onClick={onSave} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {createMode ? 'Create Plan' : 'Save'}
    </button>
    <button onClick={onCancel} disabled={loading} className="flex-1 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
      <XCircle className="w-4 h-4" />
      Cancel
    </button>
  </div>
);

export default AdminSubscriptionManager;
