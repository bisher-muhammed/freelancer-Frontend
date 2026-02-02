'use client';

import { useState, useEffect } from 'react';
import { apiPrivate } from '@/lib/apiPrivate';
import { 
  X, 
  Briefcase, 
  DollarSign, 
  FileText, 
  Tag, 
  Clock, 
  Award, 
  Users, 
  AlertCircle,
  Save,
  Plus
} from 'lucide-react';

export default function EditProjectModal({ project, onClose, onUpdated }) {
  // Initialize form data with project details
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
    assignment_type: project.assignment_type || 'single',
    team_size: project.team_size || '',
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

  // Fetch categories and skills
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRes = await apiPrivate.get('/categories/');
        const categoriesData = categoriesRes.data.results || categoriesRes.data || [];
        setCategories(categoriesData);
        
        // Fetch skills
        const skillsRes = await apiPrivate.get('/skills/');
        const skillsData = skillsRes.data.results || skillsRes.data || [];
        setAvailableSkills(skillsData);
        
        // Extract skill IDs from project
        let projectSkillIds = [];
        let initialSelectedSkills = [];
        
        if (project.skills_required && Array.isArray(project.skills_required)) {
          // If skills_required is an array of IDs
          project.skills_required.forEach(skill => {
            if (typeof skill === 'number') {
              projectSkillIds.push(skill);
              const foundSkill = skillsData.find(s => s.id === skill);
              if (foundSkill) initialSelectedSkills.push(foundSkill);
            } else if (typeof skill === 'string') {
              const match = skill.match(/Skill object \((\d+)\)/);
              if (match) {
                const skillId = parseInt(match[1]);
                projectSkillIds.push(skillId);
                const foundSkill = skillsData.find(s => s.id === skillId);
                if (foundSkill) initialSelectedSkills.push(foundSkill);
              }
            } else if (skill && typeof skill === 'object' && skill.id) {
              projectSkillIds.push(skill.id);
              const foundSkill = skillsData.find(s => s.id === skill.id) || skill;
              initialSelectedSkills.push(foundSkill);
            }
          });
        } else if (project.skills && Array.isArray(project.skills)) {
          // If skills is an array of skill objects
          project.skills.forEach(skill => {
            if (skill && skill.id) {
              projectSkillIds.push(skill.id);
              const foundSkill = skillsData.find(s => s.id === skill.id) || skill;
              initialSelectedSkills.push(foundSkill);
            }
          });
        }
        
        console.log('Project skill IDs:', projectSkillIds);
        console.log('Initial selected skills:', initialSelectedSkills);
        
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    
    // Clear team_size if switching to single freelancer
    if (name === 'assignment_type' && value === 'single') {
      updatedFormData.team_size = '';
      if (errors.team_size) {
        setErrors({ ...errors, team_size: '' });
      }
    }

    // Clear budget fields when switching budget type
    if (name === 'budget_type') {
      if (value === 'fixed') {
        updatedFormData.hourly_min_rate = '';
        updatedFormData.hourly_max_rate = '';
        if (errors.hourly_min_rate || errors.hourly_max_rate) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.hourly_min_rate;
            delete newErrors.hourly_max_rate;
            delete newErrors.hourly;
            return newErrors;
          });
        }
      } else {
        updatedFormData.fixed_budget = '';
        if (errors.fixed_budget) {
          setErrors({ ...errors, fixed_budget: '' });
        }
      }
    }

    setFormData(updatedFormData);

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSkillSelect = (skillId) => {
    const skillIdNum = parseInt(skillId);
    if (!skillIdNum) return;
    
    const skill = availableSkills.find(s => s.id === skillIdNum);
    if (skill && !selectedSkills.find(s => s.id === skill.id)) {
      const newSelectedSkills = [...selectedSkills, skill];
      setSelectedSkills(newSelectedSkills);
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, skill.id]
      });
    }
    
    // Clear any skills required error
    if (errors.skills_required) {
      setErrors({ ...errors, skills_required: '' });
    }
  };

  const handleSkillRemove = (skillId) => {
    const newSelectedSkills = selectedSkills.filter(s => s.id !== skillId);
    setSelectedSkills(newSelectedSkills);
    setFormData({
      ...formData,
      skills_required: formData.skills_required.filter(id => id !== skillId)
    });
  };

  const handleAddSkill = async () => {
    if (!formData.new_skill.trim()) {
      setErrors({ ...errors, new_skill: 'Skill name is required' });
      return;
    }

    if (!formData.new_skill_category) {
      setErrors({ ...errors, new_skill_category: 'Please select a category for the skill' });
      return;
    }

    setAddingSkill(true);
    try {
      const response = await apiPrivate.post('/skills/', {
        name: formData.new_skill,
        category: parseInt(formData.new_skill_category)
      });
      
      if (response.status === 201) {
        const newSkill = response.data;
        setAvailableSkills([...availableSkills, newSkill]);
        
        // Add the new skill to selected skills
        const newSelectedSkills = [...selectedSkills, newSkill];
        setSelectedSkills(newSelectedSkills);
        setFormData(prev => ({
          ...prev,
          skills_required: [...prev.skills_required, newSkill.id],
          new_skill: '',
          new_skill_category: ''
        }));
        setShowNewSkill(false);
        setErrors(prev => ({ 
          ...prev, 
          new_skill: '', 
          new_skill_category: '' 
        }));
        
        // Clear skills required error if any
        if (errors.skills_required) {
          setErrors({ ...errors, skills_required: '' });
        }
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      if (error.response?.data) {
        const backendErrors = error.response.data;
        if (backendErrors.name) {
          setErrors(prev => ({ ...prev, new_skill: backendErrors.name[0] }));
        } else if (backendErrors.category) {
          setErrors(prev => ({ ...prev, new_skill_category: backendErrors.category[0] }));
        } else {
          setErrors(prev => ({ ...prev, new_skill: 'Failed to add skill' }));
        }
      } else {
        setErrors(prev => ({ ...prev, new_skill: 'Failed to add skill' }));
      }
    } finally {
      setAddingSkill(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (formData.skills_required.length === 0) {
      newErrors.skills_required = 'Add at least one skill';
    }

    // Budget validation
    if (formData.budget_type === 'fixed') {
      if (!formData.fixed_budget) {
        newErrors.fixed_budget = 'Budget amount is required';
      } else if (parseFloat(formData.fixed_budget) <= 0) {
        newErrors.fixed_budget = 'Budget must be greater than 0';
      }
    }

    if (formData.budget_type === 'hourly') {
      if (!formData.hourly_min_rate && !formData.hourly_max_rate) {
        newErrors.hourly = 'Hourly min and max rates are required';
      } else if (!formData.hourly_min_rate) {
        newErrors.hourly_min_rate = 'Hourly min rate is required';
      } else if (!formData.hourly_max_rate) {
        newErrors.hourly_max_rate = 'Hourly max rate is required';
      } else {
        const minRate = parseFloat(formData.hourly_min_rate);
        const maxRate = parseFloat(formData.hourly_max_rate);
        
        if (isNaN(minRate) || isNaN(maxRate)) {
          newErrors.hourly = 'Please enter valid hourly rates';
        } else if (minRate <= 0 || maxRate <= 0) {
          newErrors.hourly = 'Hourly rates must be positive';
        } else if (minRate >= maxRate) {
          newErrors.hourly = 'Hourly min must be less than max';
        }
      }
    }

    if (!formData.duration) {
      newErrors.duration = 'Please select project duration';
    }

    if (!formData.experience_level) {
      newErrors.experience_level = 'Please select experience level';
    }

    // Team validation
    if (formData.assignment_type === 'team') {
      if (!formData.team_size) {
        newErrors.team_size = 'Team size is required for team projects';
      } else if (parseInt(formData.team_size) <= 0) {
        newErrors.team_size = 'Team size must be greater than 0';
      }
    } else if (formData.assignment_type === 'single' && formData.team_size) {
      newErrors.team_size = 'Single freelancer projects cannot have a team size';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

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
        assignment_type: formData.assignment_type,
        team_size: formData.assignment_type === 'team' ? parseInt(formData.team_size) : null,
      };

      // Add budget data based on type
      if (formData.budget_type === 'fixed') {
        submitData.fixed_budget = parseFloat(formData.fixed_budget);
        submitData.hourly_min_rate = null;
        submitData.hourly_max_rate = null;
      } else {
        submitData.hourly_min_rate = parseFloat(formData.hourly_min_rate);
        submitData.hourly_max_rate = parseFloat(formData.hourly_max_rate);
        submitData.fixed_budget = null;
      }

      // Log the data being sent
      console.log('Submitting data:', submitData);

      const res = await apiPrivate.patch(`projects/${project.id}/`, submitData);
      onUpdated(res.data);
      onClose();
    } catch (err) {
      console.error('Error updating project:', err);
      if (err.response?.data) {
        const backendErrors = err.response.data;
        const formattedErrors = {};
        Object.keys(backendErrors).forEach(key => {
          if (Array.isArray(backendErrors[key])) {
            formattedErrors[key] = backendErrors[key].join(', ');
          } else {
            formattedErrors[key] = backendErrors[key];
          }
        });
        setErrors(formattedErrors);
      } else {
        setErrors({ general: 'Failed to update project. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl my-8 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Project</h2>
              <p className="text-gray-700 font-medium text-sm">Update project details</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 font-medium">{errors.general}</p>
            </div>
          )}

          <div className="space-y-8">
            {/* Project Details */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Details
                </h3>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Build a responsive e-commerce website"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.title ? 'border-red-300' : 'border-blue-200'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-2 px-2">
                    <p className="text-gray-700 text-sm">
                      Minimum 5 characters ({formData.title.length}/5)
                    </p>
                    {errors.title && <p className="text-red-600 text-sm font-bold">{errors.title}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.description ? 'border-red-300' : 'border-blue-200'
                    }`}
                    placeholder="Describe the project..."
                  />
                  <div className="flex justify-between items-center mt-2 px-2">
                    <p className="text-gray-700 text-sm">
                      Minimum 20 characters ({formData.description.length}/20)
                    </p>
                    {errors.description && <p className="text-red-600 text-sm font-bold">{errors.description}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.category ? 'border-red-300' : 'border-blue-200'
                    }`}
                  >
                    <option value="" className="text-gray-700">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="text-gray-900">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-600 text-sm font-bold mt-2 px-2">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="open" className="text-gray-900">Open</option>
                    <option value="closed" className="text-gray-900">Closed</option>
                    <option value="in_progress" className="text-gray-900">In Progress</option>
                    <option value="completed" className="text-gray-900">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Skills Required */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Required Skills
                  </h3>
                  {!showNewSkill && (
                    <button
                      type="button"
                      onClick={() => setShowNewSkill(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Can't find a skill?
                    </button>
                  )}
                </div>
                
                {!showNewSkill ? (
                  <div className="space-y-4">
                    <select
                      value=""
                      onChange={(e) => handleSkillSelect(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="" className="text-gray-700">Select a skill from list</option>
                      {availableSkills
                        .filter(skill => !selectedSkills.find(s => s.id === skill.id))
                        .map(skill => (
                          <option key={skill.id} value={skill.id} className="text-gray-900">
                            {skill.name} ({skill.category?.name || 'Uncategorized'})
                          </option>
                        ))
                      }
                    </select>
                    
                    {selectedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {selectedSkills.map((skill) => (
                          <span
                            key={skill.id}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-bold"
                          >
                            {skill.name}
                            <button
                              type="button"
                              onClick={() => handleSkillRemove(skill.id)}
                              className="hover:bg-blue-700 rounded-lg p-1 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {selectedSkills.length === 0 && (
                      <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-xl">
                        <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No skills selected yet</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          New Skill Name *
                        </label>
                        <input
                          type="text"
                          name="new_skill"
                          value={formData.new_skill}
                          onChange={handleInputChange}
                          placeholder="e.g., Next.js, Figma, TensorFlow"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            errors.new_skill ? 'border-red-300' : 'border-blue-200'
                          }`}
                        />
                        {errors.new_skill && (
                          <p className="text-red-600 text-sm font-bold mt-1 px-2">
                            {errors.new_skill}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Category for this Skill *
                        </label>
                        <select
                          name="new_skill_category"
                          value={formData.new_skill_category}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            errors.new_skill_category ? 'border-red-300' : 'border-blue-200'
                          }`}
                        >
                          <option value="" className="text-gray-700">Select category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id} className="text-gray-900">
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        {errors.new_skill_category && (
                          <p className="text-red-600 text-sm font-bold mt-1 px-2">
                            {errors.new_skill_category}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        disabled={addingSkill || !formData.new_skill.trim() || !formData.new_skill_category}
                        className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
                      >
                        {addingSkill ? 'Adding...' : 'Add Skill'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewSkill(false);
                          setFormData({
                            ...formData,
                            new_skill: '',
                            new_skill_category: ''
                          });
                          setErrors({
                            ...errors,
                            new_skill: '',
                            new_skill_category: ''
                          });
                        }}
                        className="px-4 py-3 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition-colors font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-gray-700 text-sm px-2">
                      Select from list above or add a new skill with its category
                    </p>
                  </div>
                )}
                
                {errors.skills_required && !showNewSkill && (
                  <p className="text-red-600 text-sm font-bold px-2">
                    {errors.skills_required}
                  </p>
                )}
              </div>
            </div>

            {/* Assignment Type */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assignment Type
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.assignment_type === 'single' ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-300'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="radio"
                      name="assignment_type"
                      value="single"
                      checked={formData.assignment_type === 'single'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-bold text-gray-900">Single Freelancer</span>
                  </div>
                  <span className="text-gray-700 text-sm ml-8">One person for the entire project</span>
                </label>

                <label className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.assignment_type === 'team' ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-300'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="radio"
                      name="assignment_type"
                      value="team"
                      checked={formData.assignment_type === 'team'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-bold text-gray-900">Team of Freelancers</span>
                  </div>
                  <span className="text-gray-700 text-sm ml-8">Multiple people working together</span>
                </label>
              </div>

              {formData.assignment_type === 'team' && (
                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Team Size *
                  </label>
                  <input
                    type="number"
                    name="team_size"
                    value={formData.team_size}
                    onChange={handleInputChange}
                    placeholder="e.g., 3"
                    min="1"
                    className={`w-full md:w-1/2 px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.team_size ? 'border-red-300' : 'border-blue-200'
                    }`}
                  />
                  {errors.team_size && <p className="text-red-600 text-sm font-bold mt-2 px-2">{errors.team_size}</p>}
                </div>
              )}
              {formData.assignment_type === 'single' && formData.team_size && (
                <p className="text-red-600 text-sm font-bold mt-2 px-2">
                  Single freelancer projects cannot have a team size
                </p>
              )}
            </div>

            {/* Budget & Timeline */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget & Timeline
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Budget Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.budget_type === 'fixed' ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-300'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="radio"
                          name="budget_type"
                          value="fixed"
                          checked={formData.budget_type === 'fixed'}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-blue-600"
                        />
                        <span className="font-bold text-gray-900">Fixed Price</span>
                      </div>
                      <span className="text-gray-700 text-sm ml-8">
                        Pay a set amount for the entire project
                      </span>
                    </label>

                    <label className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.budget_type === 'hourly' ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-300'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="radio"
                          name="budget_type"
                          value="hourly"
                          checked={formData.budget_type === 'hourly'}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-blue-600"
                        />
                        <span className="font-bold text-gray-900">Hourly Rate</span>
                      </div>
                      <span className="text-gray-700 text-sm ml-8">
                        Pay per hour of work
                      </span>
                    </label>
                  </div>
                </div>

                {formData.budget_type === 'fixed' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Project Budget *
                    </label>
                    <div className="relative max-w-md">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold">₹</span>
                      <input
                        type="number"
                        name="fixed_budget"
                        value={formData.fixed_budget}
                        onChange={handleInputChange}
                        placeholder="5000"
                        min="0.01"
                        step="0.01"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          errors.fixed_budget ? 'border-red-300' : 'border-blue-200'
                        }`}
                      />
                    </div>
                    {errors.fixed_budget && <p className="text-red-600 text-sm font-bold mt-2 px-2">{errors.fixed_budget}</p>}
                  </div>
                )}

                {formData.budget_type === 'hourly' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Hourly Rate Range *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Min Hourly Rate</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold">₹</span>
                          <input
                            type="number"
                            name="hourly_min_rate"
                            value={formData.hourly_min_rate}
                            onChange={handleInputChange}
                            placeholder="25"
                            min="0.01"
                            step="0.01"
                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                              errors.hourly_min_rate ? 'border-red-300' : 'border-blue-200'
                            }`}
                          />
                          {errors.hourly_min_rate && (
                            <p className="text-red-600 text-sm font-bold mt-1">{errors.hourly_min_rate}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Max Hourly Rate</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold">₹</span>
                          <input
                            type="number"
                            name="hourly_max_rate"
                            value={formData.hourly_max_rate}
                            onChange={handleInputChange}
                            placeholder="50"
                            min="0.01"
                            step="0.01"
                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                              errors.hourly_max_rate ? 'border-red-300' : 'border-blue-200'
                            }`}
                          />
                          {errors.hourly_max_rate && (
                            <p className="text-red-600 text-sm font-bold mt-1">{errors.hourly_max_rate}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    {errors.hourly && (
                      <p className="text-red-600 text-sm font-bold mt-2 px-2">
                        {errors.hourly}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Project Duration *
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className={`w-full md:w-1/2 px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.duration ? 'border-red-300' : 'border-blue-200'
                    }`}
                  >
                    <option value="" className="text-gray-700">Select duration</option>
                    <option value="less_than_1_month" className="text-gray-900">Less than 1 month</option>
                    <option value="1_3_months" className="text-gray-900">1-3 months</option>
                    <option value="3_6_months" className="text-gray-900">3-6 months</option>
                    <option value="more_than_6_months" className="text-gray-900">More than 6 months</option>
                  </select>
                  {errors.duration && <p className="text-red-600 text-sm font-bold mt-2 px-2">{errors.duration}</p>}
                </div>
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Experience Level
              </h3>

              <div className="space-y-4">
                {[
                  { value: 'entry', label: 'Entry Level', description: 'Looking for someone relatively new to this field' },
                  { value: 'intermediate', label: 'Intermediate', description: 'Looking for substantial experience in this field' },
                  { value: 'expert', label: 'Expert', description: 'Looking for comprehensive and deep expertise in this field' }
                ].map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.experience_level === level.value ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="experience_level"
                      value={level.value}
                      checked={formData.experience_level === level.value}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{level.label}</div>
                      <div className="text-gray-700 text-sm mt-1">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.experience_level && (
                <p className="text-red-600 text-sm font-bold mt-4 px-2">
                  {errors.experience_level}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white flex justify-end gap-4 p-6 border-t border-gray-100">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition-colors font-bold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold disabled:opacity-50 flex items-center gap-2 shadow-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}