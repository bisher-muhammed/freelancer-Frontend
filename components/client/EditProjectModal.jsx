'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { apiPrivate } from '@/lib/apiPrivate';
import { 
  X, Briefcase, DollarSign, FileText, Tag,
  Award, AlertCircle, Save, Plus
} from 'lucide-react';

export default function EditProjectModal({ project, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    title: project.title || '',
    description: project.description || '',
    status: project.status || 'open',
    budget_type: project.budget_type || 'fixed',
    fixed_budget: project.fixed_budget || '',
    hourly_min_rate: project.hourly_min_rate || '',
    hourly_max_rate: project.hourly_max_rate || '',
    experience_level: project.experience_level || '',
    duration: project.duration || '',
    category: project.category?.id || project.category || '',
    skills_required: [],
    new_skill: '',
    new_skill_category: '',
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showNewSkill, setShowNewSkill] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Portal needs document to be available
  useEffect(() => {
    setMounted(true);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, skillsRes] = await Promise.all([
          apiPrivate.get('/categories/'),
          apiPrivate.get('/skills/'),
        ]);

        const categoriesData = categoriesRes.data.results || categoriesRes.data || [];
        const skillsData = skillsRes.data.results || skillsRes.data || [];
        setCategories(categoriesData);
        setAvailableSkills(skillsData);

        let projectSkillIds = [];
        let initialSelectedSkills = [];

        const sourceSkills = project.skills || project.skills_required || [];
        sourceSkills.forEach(skill => {
          if (typeof skill === 'number') {
            projectSkillIds.push(skill);
            const found = skillsData.find(s => s.id === skill);
            if (found) initialSelectedSkills.push(found);
          } else if (skill && typeof skill === 'object' && skill.id) {
            projectSkillIds.push(skill.id);
            const found = skillsData.find(s => s.id === skill.id) || skill;
            initialSelectedSkills.push(found);
          }
        });

        setSelectedSkills(initialSelectedSkills);
        setFormData(prev => ({
          ...prev,
          skills_required: projectSkillIds,
          category: project.category?.id || project.category || ''
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [project]);

  const clearError = (...keys) => {
    setErrors(prev => {
      const next = { ...prev };
      keys.forEach(k => delete next[k]);
      return next;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    if (name === 'budget_type') {
      if (value === 'fixed') {
        updated.hourly_min_rate = '';
        updated.hourly_max_rate = '';
        clearError('hourly_min_rate', 'hourly_max_rate', 'hourly');
      } else {
        updated.fixed_budget = '';
        clearError('fixed_budget');
      }
    }

    setFormData(updated);
    clearError(name);
  };

  const handleSkillSelect = (skillId) => {
    const id = parseInt(skillId);
    if (!id) return;
    const skill = availableSkills.find(s => s.id === id);
    if (skill && !selectedSkills.find(s => s.id === id)) {
      setSelectedSkills(prev => [...prev, skill]);
      setFormData(prev => ({ ...prev, skills_required: [...prev.skills_required, id] }));
      clearError('skills_required');
    }
  };

  const handleSkillRemove = (skillId) => {
    setSelectedSkills(prev => prev.filter(s => s.id !== skillId));
    setFormData(prev => ({ ...prev, skills_required: prev.skills_required.filter(id => id !== skillId) }));
  };

  const handleAddSkill = async () => {
    if (!formData.new_skill.trim()) { setErrors(prev => ({ ...prev, new_skill: 'Skill name is required' })); return; }
    if (!formData.new_skill_category) { setErrors(prev => ({ ...prev, new_skill_category: 'Please select a category' })); return; }

    setAddingSkill(true);
    try {
      const res = await apiPrivate.post('/skills/', {
        name: formData.new_skill,
        category: parseInt(formData.new_skill_category)
      });
      if (res.status === 201) {
        const newSkill = res.data;
        setAvailableSkills(prev => [...prev, newSkill]);
        setSelectedSkills(prev => [...prev, newSkill]);
        setFormData(prev => ({
          ...prev,
          skills_required: [...prev.skills_required, newSkill.id],
          new_skill: '',
          new_skill_category: ''
        }));
        setShowNewSkill(false);
        clearError('new_skill', 'new_skill_category', 'skills_required');
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.name) setErrors(prev => ({ ...prev, new_skill: data.name[0] }));
      else if (data?.category) setErrors(prev => ({ ...prev, new_skill_category: data.category[0] }));
      else setErrors(prev => ({ ...prev, new_skill: 'Failed to add skill' }));
    } finally {
      setAddingSkill(false);
    }
  };

  const validateForm = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    else if (formData.title.trim().length < 5) e.title = 'At least 5 characters';
    if (!formData.description.trim()) e.description = 'Description is required';
    else if (formData.description.trim().length < 20) e.description = 'At least 20 characters';
    if (!formData.category) e.category = 'Please select a category';
    if (formData.skills_required.length === 0) e.skills_required = 'Add at least one skill';
    if (formData.budget_type === 'fixed') {
      if (!formData.fixed_budget) e.fixed_budget = 'Budget is required';
      else if (parseFloat(formData.fixed_budget) <= 0) e.fixed_budget = 'Must be greater than 0';
    }
    if (formData.budget_type === 'hourly') {
      const min = parseFloat(formData.hourly_min_rate);
      const max = parseFloat(formData.hourly_max_rate);
      if (!formData.hourly_min_rate || !formData.hourly_max_rate) e.hourly = 'Both rates are required';
      else if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0) e.hourly = 'Enter valid positive rates';
      else if (min >= max) e.hourly = 'Min must be less than max';
    }
    if (!formData.duration) e.duration = 'Please select duration';
    if (!formData.experience_level) e.experience_level = 'Please select experience level';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    setErrors({});
    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        category: parseInt(formData.category),
        skills_required: formData.skills_required,
        budget_type: formData.budget_type,
        experience_level: formData.experience_level,
        duration: formData.duration,
        fixed_budget: formData.budget_type === 'fixed' ? parseFloat(formData.fixed_budget) : null,
        hourly_min_rate: formData.budget_type === 'hourly' ? parseFloat(formData.hourly_min_rate) : null,
        hourly_max_rate: formData.budget_type === 'hourly' ? parseFloat(formData.hourly_max_rate) : null,
      };
      const res = await apiPrivate.patch(`projects/${project.id}/`, submitData);
      onUpdated(res.data);
      onClose();
    } catch (err) {
      if (err.response?.data) {
        const formatted = {};
        Object.keys(err.response.data).forEach(key => {
          formatted[key] = Array.isArray(err.response.data[key])
            ? err.response.data[key].join(', ')
            : err.response.data[key];
        });
        setErrors(formatted);
      } else {
        setErrors({ general: 'Failed to update project. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Loading spinner (also via portal) ──────────────────────────────────────
  if (loading) {
    if (!mounted) return null;
    return createPortal(
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999]">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Loading project data...</p>
        </div>
      </div>,
      document.body
    );
  }

  if (!mounted) return null;

  // ── Modal via portal — renders at document.body, escapes sidebar layout ──
  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-700 rounded-lg">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Edit Project</h2>
              <p className="text-xs text-gray-500">Update project details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-7">

          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              <p className="text-red-700 text-sm font-medium">{errors.general}</p>
            </div>
          )}

          {/* Project Details */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4" /> Project Details
            </h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Project Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Build a responsive e-commerce website"
                className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
              <div className="flex justify-between mt-1.5 px-1">
                <span className="text-xs text-gray-400">{formData.title.length} / 5 min</span>
                {errors.title && <span className="text-xs text-red-600 font-medium">{errors.title}</span>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe the project..."
                className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all resize-none ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
              <div className="flex justify-between mt-1.5 px-1">
                <span className="text-xs text-gray-400">{formData.description.length} / 20 min</span>
                {errors.description && <span className="text-xs text-red-600 font-medium">{errors.description}</span>}
              </div>
            </div>

            {/* Category + Status side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all ${errors.category ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                {errors.category && <p className="text-xs text-red-600 font-medium mt-1 px-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Tag className="h-4 w-4" /> Required Skills
              </h3>
              {!showNewSkill && (
                <button
                  type="button"
                  onClick={() => setShowNewSkill(true)}
                  className="text-xs text-gray-700 hover:text-gray-900 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add new skill
                </button>
              )}
            </div>

            {!showNewSkill ? (
              <div className="space-y-3">
                <select
                  value=""
                  onChange={(e) => handleSkillSelect(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
                >
                  <option value="">Select a skill...</option>
                  {availableSkills
                    .filter(skill => !selectedSkills.find(s => s.id === skill.id))
                    .map(skill => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name} {skill.category?.name ? `(${skill.category.name})` : ''}
                      </option>
                    ))}
                </select>

                {selectedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map(skill => (
                      <span key={skill.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-semibold">
                        {skill.name}
                        <button type="button" onClick={() => handleSkillRemove(skill.id)} className="hover:bg-gray-600 rounded p-0.5 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-xl">
                    <Tag className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                    <p className="text-gray-400 text-xs">No skills selected</p>
                  </div>
                )}

                {errors.skills_required && <p className="text-xs text-red-600 font-medium px-1">{errors.skills_required}</p>}
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Skill Name *</label>
                    <input
                      type="text"
                      name="new_skill"
                      value={formData.new_skill}
                      onChange={handleInputChange}
                      placeholder="e.g., Next.js"
                      className={`w-full px-3 py-2 border-2 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all ${errors.new_skill ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.new_skill && <p className="text-xs text-red-600 mt-1">{errors.new_skill}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                    <select
                      name="new_skill_category"
                      value={formData.new_skill_category}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border-2 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all ${errors.new_skill_category ? 'border-red-300' : 'border-gray-200'}`}
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    {errors.new_skill_category && <p className="text-xs text-red-600 mt-1">{errors.new_skill_category}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    disabled={addingSkill || !formData.new_skill.trim() || !formData.new_skill_category}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {addingSkill ? 'Adding...' : 'Add Skill'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewSkill(false);
                      setFormData(prev => ({ ...prev, new_skill: '', new_skill_category: '' }));
                      clearError('new_skill', 'new_skill_category');
                    }}
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Budget & Timeline */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Budget & Timeline
            </h3>

            {/* Budget type toggle */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'fixed',  label: 'Fixed Price',  desc: 'Set total amount' },
                { value: 'hourly', label: 'Hourly Rate',  desc: 'Pay per hour' },
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.budget_type === opt.value ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="budget_type"
                    value={opt.value}
                    checked={formData.budget_type === opt.value}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-gray-700"
                  />
                  <div>
                    <div className="text-sm font-bold text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Fixed */}
            {formData.budget_type === 'fixed' && (
              <div className="max-w-xs">
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">$</span>
                  <input
                    type="number"
                    name="fixed_budget"
                    value={formData.fixed_budget}
                    onChange={handleInputChange}
                    placeholder="5000"
                    min="0.01"
                    step="0.01"
                    className={`w-full pl-8 pr-4 py-2.5 border-2 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all ${errors.fixed_budget ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  />
                </div>
                {errors.fixed_budget && <p className="text-xs text-red-600 font-medium mt-1">{errors.fixed_budget}</p>}
              </div>
            )}

            {/* Hourly */}
            {formData.budget_type === 'hourly' && (
              <div>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  {[
                    { name: 'hourly_min_rate', label: 'Min /hr', placeholder: '25', error: errors.hourly_min_rate },
                    { name: 'hourly_max_rate', label: 'Max /hr', placeholder: '50', error: errors.hourly_max_rate },
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-semibold text-gray-800 mb-1.5">{field.label} *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">$</span>
                        <input
                          type="number"
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          placeholder={field.placeholder}
                          min="0.01"
                          step="0.01"
                          className={`w-full pl-8 pr-3 py-2.5 border-2 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all ${field.error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                        />
                      </div>
                      {field.error && <p className="text-xs text-red-600 mt-1">{field.error}</p>}
                    </div>
                  ))}
                </div>
                {errors.hourly && <p className="text-xs text-red-600 font-medium mt-2">{errors.hourly}</p>}
              </div>
            )}

            {/* Duration */}
            <div className="max-w-xs">
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Duration *</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all ${errors.duration ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              >
                <option value="">Select duration</option>
                <option value="less_than_1_month">Less than 1 month</option>
                <option value="1_3_months">1–3 months</option>
                <option value="3_6_months">3–6 months</option>
                <option value="more_than_6_months">More than 6 months</option>
              </select>
              {errors.duration && <p className="text-xs text-red-600 font-medium mt-1">{errors.duration}</p>}
            </div>
          </section>

          {/* Experience Level */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4" /> Experience Level
            </h3>

            <div className="space-y-2">
              {[
                { value: 'entry',        label: 'Entry Level',   desc: 'New to the field' },
                { value: 'intermediate', label: 'Intermediate',  desc: 'Substantial experience' },
                { value: 'expert',       label: 'Expert',        desc: 'Deep expertise' },
              ].map(level => (
                <label
                  key={level.value}
                  className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.experience_level === level.value
                      ? 'border-gray-400 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="experience_level"
                    value={level.value}
                    checked={formData.experience_level === level.value}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-gray-700"
                  />
                  <div>
                    <div className="text-sm font-bold text-gray-900">{level.label}</div>
                    <div className="text-xs text-gray-500">{level.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {errors.experience_level && <p className="text-xs text-red-600 font-medium px-1">{errors.experience_level}</p>}
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-gray-700 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {saving
              ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Saving...</>
              : <><Save className="h-4 w-4" /> Save Changes</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body  // ← escapes sidebar layout entirely
  );
}
