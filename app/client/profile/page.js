'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientProfile, updateClientProfile, createClientProfile } from '../../store/slices/clientProfileSlice';
import { Loader2, CheckCircle, XCircle, Camera, User, Building, Phone, MapPin, FileText, X, Star, DollarSign, ShieldCheck, Calendar, Mail, Edit2 } from 'lucide-react';

export default function ClientProfilePage() {
  const dispatch = useDispatch();
  const { data: profileData, loading, creating, error, successMessage } = useSelector(state => state.clientProfile);
  const user = useSelector(state => state.user.user);

  // Extract profile from results array
  const profile = profileData?.results?.[0] || null;

  const [formData, setFormData] = useState({
    company_name: '',
    contact_number: '',
    bio: '',
    country: '',
    city: '',
    profile_picture: null,
  });

  const [preview, setPreview] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    dispatch(fetchClientProfile());
  }, [dispatch]);

  // Refetch profile after successful update
  useEffect(() => {
    if (submitSuccess) {
      dispatch(fetchClientProfile());
      setSubmitSuccess(false);
    }
  }, [submitSuccess, dispatch]);

  // Sync state with API data
  useEffect(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || '',
        contact_number: profile.contact_number || '',
        bio: profile.bio || '',
        country: profile.country || '',
        city: profile.city || '',
        profile_picture: null,
      });
      
      // Handle profile picture URL
      if (profile.profile_picture) {
        setPreview(profile.profile_picture);
      } else {
        setPreview(null);
      }
      
      setIsEditing(false);
    } else if (profile === null && !loading) {
      // Profile doesn't exist, show create form
      setIsEditing(true);
    }
  }, [profile, loading]);

  // Frontend validation
  const validateForm = () => {
    const { company_name, bio, contact_number, country, profile_picture } = formData;

    if (!company_name && !bio) return 'Please provide at least company name or bio.';
    if (contact_number && !/^\+?1?\d{9,15}$/.test(contact_number))
      return 'Enter a valid contact number with country code (e.g., +911234567890).';
    if (country && !/^[a-zA-Z\s]+$/.test(country))
      return 'Country name must contain only letters and spaces.';
    if (profile_picture) {
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
      const ext = profile_picture.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(ext))
        return `Unsupported file type '${ext}'. Allowed: ${validExtensions.join(', ')}`;
      if (profile_picture.size > 5 * 1024 * 1024)
        return 'Profile picture size should not exceed 5MB.';
    }
    return null;
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setFormData(prev => ({ ...prev, profile_picture: file }));
      setImageLoading(true);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setImageLoading(false);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, profile_picture: null }));
    setPreview(profile?.profile_picture || null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationMsg = validateForm();
    if (validationMsg) {
      setValidationError(validationMsg);
      return;
    }
    setValidationError('');

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        // Only append if it's a file or if it's a field that has changed
        if (key === 'profile_picture' || (profile && value !== profile[key])) {
          form.append(key, value);
        } else if (!profile) {
          // For new profile, append all fields
          form.append(key, value);
        }
      }
    });

    try {
      if (profile) {
        await dispatch(updateClientProfile(form)).unwrap();
      } else {
        await dispatch(createClientProfile(form)).unwrap();
      }
      
      // Trigger refetch after successful update
      setSubmitSuccess(true);
      
      // Exit edit mode
      setIsEditing(false);
      
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && profile) {
      // Reset form to current profile data when entering edit mode
      setFormData({
        company_name: profile.company_name || '',
        contact_number: profile.contact_number || '',
        bio: profile.bio || '',
        country: profile.country || '',
        city: profile.city || '',
        profile_picture: null,
      });
      setPreview(profile.profile_picture || null);
    }
  };

  const handleCancel = () => {
    if (profile) {
      // Reset form to original profile data
      setFormData({
        company_name: profile.company_name || '',
        contact_number: profile.contact_number || '',
        bio: profile.bio || '',
        country: profile.country || '',
        city: profile.city || '',
        profile_picture: null,
      });
      setPreview(profile.profile_picture || null);
      setIsEditing(false);
    }
    setValidationError('');
  };

  const isLoading = loading || creating;

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          {profile ? 'My Profile' : 'Create Profile'}
        </h1>
        <p className="text-gray-600 mt-1 text-sm lg:text-base">
          {profile 
            ? (isEditing ? 'Edit your company information and profile settings' : 'Manage your company information and profile settings')
            : 'Set up your company profile to get started'}
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center">
          <XCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Left Sidebar - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
            {/* Profile Picture */}
            <div className="text-center mb-4 lg:mb-6">
              <div className="relative inline-block">
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Profile"
                      className="h-24 w-24 lg:h-32 lg:w-32 rounded-full object-cover border-4 border-white shadow-md mx-auto"
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        setImageLoading(false);
                        setPreview(null);
                      }}
                    />
                    {isEditing && (
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 lg:p-1.5 shadow-lg transition-all"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="h-24 w-24 lg:h-32 lg:w-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-4 border-white shadow-md mx-auto flex items-center justify-center text-white text-2xl lg:text-4xl font-bold">
                    {profile?.username?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-full">
                    <Loader2 className="h-4 w-4 lg:h-6 lg:w-6 animate-spin text-gray-500" />
                  </div>
                )}

                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 lg:p-2 shadow-lg cursor-pointer border border-gray-200 hover:shadow-xl transition-all">
                    <Camera className="h-3 w-3 lg:h-4 lg:w-4 text-gray-700" />
                    <input
                      type="file"
                      name="profile_picture"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-4 lg:mb-6 pb-4 lg:pb-6 border-b border-gray-200">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">
                {profile?.username || user?.username || 'Username'}
              </h2>
              <p className="text-gray-600 text-xs lg:text-sm mb-2">
                {isEditing ? (
                  <span className="italic text-gray-400">Edit mode</span>
                ) : (
                  profile?.company_name || 'Company Name'
                )}
              </p>
              {profile?.email && (
                <div className="flex items-center justify-center text-xs lg:text-sm text-gray-500 mt-2">
                  <Mail className="h-3 w-3 mr-1" />
                  {profile.email}
                </div>
              )}
            </div>

            {/* Profile Stats */}
            {profile && (
              <div className="space-y-2 lg:space-y-3">
                <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-xs lg:text-sm text-gray-700">Projects Posted</span>
                  </div>
                  <span className="text-xs lg:text-sm font-semibold text-gray-900">
                    {profile.total_projects_posted || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
                    <span className="text-xs lg:text-sm text-gray-700">Rating</span>
                  </div>
                  <span className="text-xs lg:text-sm font-semibold text-gray-900">
                    {Number(profile.rating || 0).toFixed(1)}/5
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-xs lg:text-sm text-gray-700">Total Spent</span>
                  </div>
                  <span className="text-xs lg:text-sm font-semibold text-gray-900">
                    ₹{profile.total_spent || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <ShieldCheck className={`h-4 w-4 mr-2 ${profile.verified ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-xs lg:text-sm text-gray-700">Status</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    profile.verified 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {profile.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <div className="pt-3 lg:pt-4 border-t border-gray-200 space-y-1 lg:space-y-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-2" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-2" />
                    Updated {new Date(profile.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Content - Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
            {/* Edit Button */}
            {profile && !isEditing && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 lg:mb-6 pb-4 lg:pb-6 border-b border-gray-200">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">Profile Information</h2>
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}

            {/* Edit Mode Header */}
            {isEditing && profile && (
              <div className="mb-4 lg:mb-6 pb-4 lg:pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900">Edit Profile Information</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    Edit Mode
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Make changes to your profile information below
                </p>
              </div>
            )}

            {validationError && (
              <div className="mb-4 lg:mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 lg:p-4 rounded-lg text-sm">
                {validationError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Enter your company name"
                    className={`w-full pl-10 lg:pl-12 pr-4 py-2 lg:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base ${
                      !isEditing && profile 
                        ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed' 
                        : 'border-gray-300'
                    }`}
                    disabled={!isEditing && !!profile}
                  />
                </div>
                {!isEditing && profile && (
                  <p className="mt-1 text-xs text-gray-500">Click Edit Profile to change</p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="+911234567890"
                    className={`w-full pl-10 lg:pl-12 pr-4 py-2 lg:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base ${
                      !isEditing && profile 
                        ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed' 
                        : 'border-gray-300'
                    }`}
                    disabled={!isEditing && !!profile}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Country"
                      className={`w-full pl-10 lg:pl-12 pr-4 py-2 lg:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base ${
                        !isEditing && profile 
                          ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed' 
                          : 'border-gray-300'
                      }`}
                      disabled={!isEditing && !!profile}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={`w-full px-4 py-2 lg:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base ${
                      !isEditing && profile 
                        ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed' 
                        : 'border-gray-300'
                    }`}
                    disabled={!isEditing && !!profile}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us about your company..."
                  className={`w-full px-4 py-2 lg:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black text-sm lg:text-base ${
                    !isEditing && profile 
                      ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed' 
                      : 'border-gray-300'
                  }`}
                  maxLength={500}
                  disabled={!isEditing && !!profile}
                />
                <div className="flex justify-end mt-2">
                  <span className={`text-xs lg:text-sm ${
                    formData.bio.length > 450 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {formData.bio.length}/500
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {(isEditing || !profile) && (
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                  {profile && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="px-4 lg:px-6 py-2 lg:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm lg:text-base order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 lg:px-6 py-2 lg:py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 text-sm lg:text-base order-1 sm:order-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{profile ? 'Updating...' : 'Creating...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>{profile ? 'Save Changes' : 'Create Profile'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}