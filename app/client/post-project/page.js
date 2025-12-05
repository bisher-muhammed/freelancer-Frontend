'use client';
import React, { useState, useEffect } from 'react';
import { apiPrivate } from '@/lib/apiPrivate';
import { Briefcase, Plus, X, Bell, Menu, Check } from 'lucide-react';

const PostProjectPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        skills_required: [],
        assignment_type: 'single',
        team_size: '',
        budget_type: 'fixed',
        fixed_budget: '',
        hourly_min_rate: '',
        hourly_max_rate: '',
        experience_level: '',
        duration: '',
        new_category: '',
        new_skill: '',
        new_skill_category: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [showNewSkill, setShowNewSkill] = useState(false);
    const [addingCategory, setAddingCategory] = useState(false);
    const [addingSkill, setAddingSkill] = useState(false);

    // Fetch categories and skills on component mount
    useEffect(() => {
        fetchCategories();
        fetchSkills();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await apiPrivate.get('/categories/');
            if (response.data && response.data.results) {
                setCategories(response.data.results);
            } else if (Array.isArray(response.data)) {
                setCategories(response.data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const fetchSkills = async () => {
        try {
            const response = await apiPrivate.get('/skills/');
            if (response.data && response.data.results) {
                setAvailableSkills(response.data.results);
            } else if (Array.isArray(response.data)) {
                setAvailableSkills(response.data);
            } else {
                setAvailableSkills([]);
            }
        } catch (error) {
            console.error('Error fetching skills:', error);
            setAvailableSkills([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }

        // Clear team_size if switching to single freelancer
        if (name === 'assignment_type' && value === 'single') {
            setFormData(prev => ({ ...prev, team_size: '' }));
        }

        // Clear budget fields when switching budget type
        if (name === 'budget_type') {
            if (value === 'fixed') {
                setFormData(prev => ({
                    ...prev,
                    hourly_min_rate: '',
                    hourly_max_rate: ''
                }));
            } else {
                setFormData(prev => ({ ...prev, fixed_budget: '' }));
            }
        }
    };

    const handleSkillSelect = (skillId) => {
        const skillIdNum = parseInt(skillId);
        if (!skillIdNum) return;
        
        const skill = availableSkills.find(s => s.id === skillIdNum);
        if (skill && !selectedSkills.find(s => s.id === skill.id)) {
            setSelectedSkills([...selectedSkills, skill]);
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
        setSelectedSkills(selectedSkills.filter(s => s.id !== skillId));
        setFormData({
            ...formData,
            skills_required: formData.skills_required.filter(id => id !== skillId)
        });
    };

    const handleAddCategory = async () => {
        if (!formData.new_category.trim()) {
            setErrors({ ...errors, new_category: 'Category name is required' });
            return;
        }

        setAddingCategory(true);
        try {
            const response = await apiPrivate.post('/categories/', {
                name: formData.new_category
            });
            
            if (response.status === 201) {
                const newCategory = response.data;
                setCategories([...categories, newCategory]);
                setFormData({
                    ...formData,
                    category: newCategory.id,
                    new_category: ''
                });
                setShowNewCategory(false);
                setErrors({ ...errors, new_category: '' });
            }
        } catch (error) {
            console.error('Error adding category:', error);
            if (error.response?.data) {
                setErrors({ ...errors, new_category: error.response.data.name?.[0] || 'Failed to add category' });
            } else {
                setErrors({ ...errors, new_category: 'Failed to add category' });
            }
        } finally {
            setAddingCategory(false);
        }
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
                setSelectedSkills([...selectedSkills, newSkill]);
                setFormData({
                    ...formData,
                    skills_required: [...formData.skills_required, newSkill.id],
                    new_skill: '',
                    new_skill_category: ''
                });
                setShowNewSkill(false);
                setErrors({ ...errors, new_skill: '', new_skill_category: '' });
                
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
                    setErrors({ ...errors, new_skill: backendErrors.name[0] });
                } else if (backendErrors.category) {
                    setErrors({ ...errors, new_skill_category: backendErrors.category[0] });
                } else {
                    setErrors({ ...errors, new_skill: 'Failed to add skill' });
                }
            } else {
                setErrors({ ...errors, new_skill: 'Failed to add skill' });
            }
        } finally {
            setAddingSkill(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Project title is required';
        }

        if (!formData.description.trim() || formData.description.trim().length < 100) {
            newErrors.description = 'Description must be at least 100 characters';
        }

        if (!formData.category) {
            newErrors.category = 'Please select a category';
        }

        if (formData.skills_required.length === 0) {
            newErrors.skills_required = 'Add at least one skill';
        }

        if (formData.budget_type === 'fixed') {
            if (!formData.fixed_budget) {
                newErrors.fixed_budget = 'Budget amount is required';
            } else if (parseFloat(formData.fixed_budget) <= 0) {
                newErrors.fixed_budget = 'Budget must be greater than 0';
            }
        }

        if (formData.budget_type === 'hourly') {
            if (!formData.hourly_min_rate || !formData.hourly_max_rate) {
                newErrors.hourly = 'Both min and max rates are required';
            } else if (parseFloat(formData.hourly_min_rate) >= parseFloat(formData.hourly_max_rate)) {
                newErrors.hourly = 'Min rate must be less than max rate';
            } else if (parseFloat(formData.hourly_min_rate) <= 0 || parseFloat(formData.hourly_max_rate) <= 0) {
                newErrors.hourly = 'Hourly rates must be positive';
            }
        }

        if (!formData.duration) {
            newErrors.duration = 'Please select project duration';
        }

        if (!formData.experience_level) {
            newErrors.experience_level = 'Please select experience level';
        }

        if (formData.assignment_type === 'team' && !formData.team_size) {
            newErrors.team_size = 'Team size is required for team projects';
        }

        if (formData.team_size && parseInt(formData.team_size) <= 0) {
            newErrors.team_size = 'Team size must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare data for submission
            const submitData = {
                title: formData.title,
                description: formData.description,
                category: parseInt(formData.category),
                skills_required: formData.skills_required,
                assignment_type: formData.assignment_type,
                budget_type: formData.budget_type,
                experience_level: formData.experience_level,
                duration: formData.duration,
                team_size: formData.team_size ? parseInt(formData.team_size) : null,
                fixed_budget: formData.fixed_budget ? parseFloat(formData.fixed_budget) : null,
                hourly_min_rate: formData.hourly_min_rate ? parseFloat(formData.hourly_min_rate) : null,
                hourly_max_rate: formData.hourly_max_rate ? parseFloat(formData.hourly_max_rate) : null,
            };

            console.log('Submitting project data:', submitData);

            const response = await apiPrivate.post('/projects/', submitData);

            if (response.status === 201) {
                alert('Project posted successfully!');
                // Clear draft from localStorage
                localStorage.removeItem('projectDraft');
                // Redirect to projects list
                window.location.href = '/projects';
            }
        } catch (error) {
            console.error('Error posting project:', error);
            
            if (error.response?.data) {
                // Handle backend validation errors
                const backendErrors = error.response.data;
                console.log('Backend errors:', backendErrors);
                
                // Convert backend errors to match frontend error format
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
                alert('Failed to post project. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = () => {
        localStorage.setItem('projectDraft', JSON.stringify(formData));
        alert('Draft saved successfully!');
    };

    // Load draft on mount if exists
    useEffect(() => {
        if (!loading) {
            const draft = localStorage.getItem('projectDraft');
            if (draft) {
                const parsedDraft = JSON.parse(draft);
                console.log('Loading draft:', parsedDraft);
                setFormData(parsedDraft);
                
                // Restore selected skills
                if (parsedDraft.skills_required && parsedDraft.skills_required.length > 0) {
                    const skills = availableSkills.filter(s => 
                        parsedDraft.skills_required.includes(s.id)
                    );
                    console.log('Restored skills:', skills);
                    setSelectedSkills(skills);
                }
            }
        }
    }, [loading, availableSkills]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-700">Loading form...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
            {/* Main Content */}
            <main className="max-w-6xl mx-auto">
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3">
                        Post a New Project
                    </h1>
                    <p className="text-gray-700 text-sm md:text-base lg:text-lg">
                        Tell us about your project and find the perfect freelancer
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                    {/* Project Details Section */}
                    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 lg:p-8 border border-blue-100">
                        <div className="mb-4 md:mb-6">
                            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                                Project Details
                            </h2>
                            <p className="text-gray-700 text-sm md:text-base">
                                Provide basic information about your project
                            </p>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                            <div>
                                <label className="block text-sm md:text-base font-semibold text-gray-800 mb-2">
                                    Project Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Build a responsive e-commerce website"
                                    className="w-full px-4 py-3 md:py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
                                />
                                {errors.title && <p className="text-red-600 text-sm md:text-base font-medium mt-2 px-2">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm md:text-base font-semibold text-gray-800 mb-2">
                                    Project Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe your project in detail. What are you trying to achieve? What are the specific requirements?"
                                    rows={5}
                                    className="w-full px-4 py-3 md:py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 resize-y transition-all duration-200"
                                />
                                <div className="flex justify-between items-center mt-2 px-2">
                                    <p className="text-gray-600 text-xs md:text-sm">
                                        Minimum 100 characters ({formData.description.length}/100)
                                    </p>
                                    {errors.description && <p className="text-red-600 text-sm font-medium">{errors.description}</p>}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm md:text-base font-semibold text-gray-800">
                                        Category *
                                    </label>
                                    {!showNewCategory && (
                                        <button
                                            type="button"
                                            onClick={() => setShowNewCategory(true)}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Can't find your category?
                                        </button>
                                    )}
                                </div>
                                
                                {!showNewCategory ? (
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 md:py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 appearance-none cursor-pointer transition-all duration-200"
                                    >
                                        <option value="" className="text-gray-500">Select a category</option>
                                        {Array.isArray(categories) && categories.map(cat => (
                                            <option key={cat.id} value={cat.id} className="text-gray-900">
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                name="new_category"
                                                value={formData.new_category}
                                                onChange={handleInputChange}
                                                placeholder="Enter new category name"
                                                className="flex-1 px-4 py-3 md:py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddCategory}
                                                disabled={addingCategory || !formData.new_category.trim()}
                                                className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                {addingCategory ? 'Adding...' : 'Add'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNewCategory(false);
                                                    setFormData({...formData, new_category: ''});
                                                    setErrors({...errors, new_category: ''});
                                                }}
                                                className="px-4 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors duration-200"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        {errors.new_category && (
                                            <p className="text-red-600 text-sm font-medium px-2">
                                                {errors.new_category}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-600 px-2">
                                            Select from list above or add a new category
                                        </p>
                                    </div>
                                )}
                                {errors.category && !showNewCategory && (
                                    <p className="text-red-600 text-sm md:text-base font-medium mt-2 px-2">
                                        {errors.category}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Skills Required Section */}
                    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 lg:p-8 border border-blue-100">
                        <div className="mb-4 md:mb-6">
                            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                                Skills Required
                            </h2>
                            <p className="text-gray-700 text-sm md:text-base">
                                Add skills that freelancers should have
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm md:text-base font-semibold text-gray-800">
                                        Add Skills *
                                    </label>
                                    {!showNewSkill && (
                                        <button
                                            type="button"
                                            onClick={() => setShowNewSkill(true)}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
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
                                            className="w-full px-4 py-3 md:py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 appearance-none cursor-pointer transition-all duration-200"
                                        >
                                            <option value="" className="text-gray-500">Select a skill from list</option>
                                            {Array.isArray(availableSkills) && availableSkills
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
                                                        className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm md:text-base font-medium shadow-sm"
                                                    >
                                                        {skill.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSkillRemove(skill.id)}
                                                            className="hover:bg-blue-700 rounded-lg p-1 transition-colors duration-200"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    New Skill Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="new_skill"
                                                    value={formData.new_skill}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Next.js, Figma, TensorFlow"
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
                                                />
                                                {errors.new_skill && (
                                                    <p className="text-red-600 text-sm font-medium mt-1 px-2">
                                                        {errors.new_skill}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Category for this Skill *
                                                </label>
                                                <select
                                                    name="new_skill_category"
                                                    value={formData.new_skill_category}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 appearance-none cursor-pointer transition-all duration-200"
                                                >
                                                    <option value="" className="text-gray-500">Select category</option>
                                                    {Array.isArray(categories) && categories.map(cat => (
                                                        <option key={cat.id} value={cat.id} className="text-gray-900">
                                                            {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.new_skill_category && (
                                                    <p className="text-red-600 text-sm font-medium mt-1 px-2">
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
                                                className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
                                                className="px-4 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors duration-200"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600 px-2">
                                            Select from list above or add a new skill with its category
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {errors.skills_required && !showNewSkill && (
                                <p className="text-red-600 text-sm md:text-base font-medium px-2">
                                    {errors.skills_required}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Assignment Type Section */}
                    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 lg:p-8 border border-blue-100">
                        <div className="mb-4 md:mb-6">
                            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                                Assignment Type
                            </h2>
                            <p className="text-gray-700 text-sm md:text-base">
                                Do you need a single freelancer or a team?
                            </p>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`flex flex-col p-4 md:p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${formData.assignment_type === 'single' ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-300'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <input
                                            type="radio"
                                            name="assignment_type"
                                            value="single"
                                            checked={formData.assignment_type === 'single'}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 md:w-6 md:h-6 text-blue-600"
                                        />
                                        <span className="font-bold text-gray-900 text-base md:text-lg">Single Freelancer</span>
                                    </div>
                                    <span className="text-gray-600 text-sm md:text-base ml-8">One person for the entire project</span>
                                </label>

                                <label className={`flex flex-col p-4 md:p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${formData.assignment_type === 'team' ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-300'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <input
                                            type="radio"
                                            name="assignment_type"
                                            value="team"
                                            checked={formData.assignment_type === 'team'}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 md:w-6 md:h-6 text-blue-600"
                                        />
                                        <span className="font-bold text-gray-900 text-base md:text-lg">Team of Freelancers</span>
                                    </div>
                                    <span className="text-gray-600 text-sm md:text-base ml-8">Multiple people working together</span>
                                </label>
                            </div>

                            {formData.assignment_type === 'team' && (
                                <div className="mt-4">
                                    <label className="block text-sm md:text-base font-semibold text-gray-800 mb-2">
                                        Team Size *
                                    </label>
                                    <input
                                        type="number"
                                        name="team_size"
                                        value={formData.team_size}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 3"
                                        min="1"
                                        className="w-full md:w-1/2 lg:w-1/3 px-4 py-3 md:py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
                                    />
                                    {errors.team_size && <p className="text-red-600 text-sm md:text-base font-medium mt-2 px-2">{errors.team_size}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Budget & Timeline Section */}
                    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 lg:p-8 border border-blue-100">
                        <div className="mb-4 md:mb-6">
                            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                                Budget & Timeline
                            </h2>
                            <p className="text-gray-700 text-sm md:text-base">
                                Set your budget and project duration
                            </p>
                        </div>

                        <div className="space-y-6 md:space-y-8">
                            <div>
                                <label className="block text-sm md:text-base font-semibold text-gray-800 mb-3 md:mb-4">
                                    Budget Type *
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className={`flex flex-col p-4 md:p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${formData.budget_type === 'fixed' ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-300'}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <input
                                                type="radio"
                                                name="budget_type"
                                                value="fixed"
                                                checked={formData.budget_type === 'fixed'}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 md:w-6 md:h-6 text-blue-600"
                                            />
                                            <span className="font-bold text-gray-900 text-base md:text-lg">Fixed Price</span>
                                        </div>
                                        <span className="text-gray-600 text-sm md:text-base ml-8">
                                            Pay a set amount for the entire project
                                        </span>
                                    </label>

                                    <label className={`flex flex-col p-4 md:p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${formData.budget_type === 'hourly' ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-300'}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <input
                                                type="radio"
                                                name="budget_type"
                                                value="hourly"
                                                checked={formData.budget_type === 'hourly'}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 md:w-6 md:h-6 text-blue-600"
                                            />
                                            <span className="font-bold text-gray-900 text-base md:text-lg">Hourly Rate</span>
                                        </div>
                                        <span className="text-gray-600 text-sm md:text-base ml-8">
                                            Pay per hour of work
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {formData.budget_type === 'fixed' && (
                                <div>
                                    <label className="block text-sm md:text-base font-semibold text-gray-800 mb-2">
                                        Project Budget *
                                    </label>
                                    <div className="relative max-w-md">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 font-medium">$</span>
                                        <input
                                            type="number"
                                            name="fixed_budget"
                                            value={formData.fixed_budget}
                                            onChange={handleInputChange}
                                            placeholder="5000"
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-12 pr-4 py-3 md:py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
                                        />
                                    </div>
                                    {errors.fixed_budget && <p className="text-red-600 text-sm md:text-base font-medium mt-2 px-2">{errors.fixed_budget}</p>}
                                </div>
                            )}

                            {formData.budget_type === 'hourly' && (
                                <div>
                                    <label className="block text-sm md:text-base font-semibold text-gray-800 mb-2">
                                        Hourly Rate Range *
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-2xl">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Min Hourly Rate</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 font-medium">$</span>
                                                <input
                                                    type="number"
                                                    name="hourly_min_rate"
                                                    value={formData.hourly_min_rate}
                                                    onChange={handleInputChange}
                                                    placeholder="25"
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full pl-12 pr-4 py-3 md:py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Hourly Rate</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 font-medium">$</span>
                                                <input
                                                    type="number"
                                                    name="hourly_max_rate"
                                                    value={formData.hourly_max_rate}
                                                    onChange={handleInputChange}
                                                    placeholder="50"
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full pl-12 pr-4 py-3 md:py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {errors.hourly && (
                                        <p className="text-red-600 text-sm md:text-base font-medium mt-2 px-2">
                                            {errors.hourly}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm md:text-base font-semibold text-gray-800 mb-2">
                                    Project Duration *
                                </label>
                                <select
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    className="w-full md:w-1/2 lg:w-1/3 px-4 py-3 md:py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 appearance-none cursor-pointer transition-all duration-200"
                                >
                                    <option value="" className="text-gray-500">Select duration</option>
                                    <option value="less_than_1_month" className="text-gray-900">Less than 1 month</option>
                                    <option value="1_3_months" className="text-gray-900">1-3 months</option>
                                    <option value="3_6_months" className="text-gray-900">3-6 months</option>
                                    <option value="more_than_6_months" className="text-gray-900">More than 6 months</option>
                                </select>
                                {errors.duration && <p className="text-red-600 text-sm md:text-base font-medium mt-2 px-2">{errors.duration}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Experience Level Section */}
                    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 lg:p-8 border border-blue-100">
                        <div className="mb-4 md:mb-6">
                            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                                Experience Level
                            </h2>
                            <p className="text-gray-700 text-sm md:text-base">
                                What level of experience do you need?
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { value: 'entry', label: 'Entry Level', description: 'Looking for someone relatively new to this field' },
                                { value: 'intermediate', label: 'Intermediate', description: 'Looking for substantial experience in this field' },
                                { value: 'expert', label: 'Expert', description: 'Looking for comprehensive and deep expertise in this field' }
                            ].map((level) => (
                                <label
                                    key={level.value}
                                    className={`flex items-start gap-4 p-4 md:p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${formData.experience_level === level.value ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50'}`}
                                >
                                    <input
                                        type="radio"
                                        name="experience_level"
                                        value={level.value}
                                        checked={formData.experience_level === level.value}
                                        onChange={handleInputChange}
                                        className="mt-1 w-5 h-5 md:w-6 md:h-6 text-blue-600"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900 text-base md:text-lg">{level.label}</div>
                                        <div className="text-gray-600 text-sm md:text-base mt-1">{level.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {errors.experience_level && (
                            <p className="text-red-600 text-sm md:text-base font-medium mt-4 px-2">
                                {errors.experience_level}
                            </p>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 md:px-8 py-3 md:py-4 bg-linear-to-r from-black to-black text-white rounded-xl font-bold text-base md:text-lg hover:from-black hover:to-black active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Posting...
                                </span>
                            ) : 'Post Project'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={isSubmitting}
                            className="flex-1 px-6 md:px-8 py-3 md:py-4 bg-white text-gray-800 border-2 border-blue-200 rounded-xl font-bold text-base md:text-lg hover:bg-blue-50 hover:border-blue-300 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                        >
                            Save as Draft
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default PostProjectPage;
