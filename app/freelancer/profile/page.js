"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useFieldArray } from "react-hook-form";
import {
  User,
  Mail,
  Briefcase,
  GraduationCap,
  Upload,
  FileText,
  Plus,
  X,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Phone,
  DollarSign,
  Award,
  AlertTriangle,
} from "lucide-react";
import {
  fetchFreelancerProfile,
  updateFreelancerProfile,
  uploadResumeAndExtract,
  uploadResumeOnly,
  confirmExtractedData,
  cancelExtractedData,
  clearSuccessMessage,
  clearError,
} from "../../store/slices/freelancerProfileSlice";

// Confirmation Dialog Component
function ConfirmationDialog({ isOpen, onConfirm, onCancel, extractedData }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Review Extracted Data</h3>
              <p className="text-sm text-gray-600">Please review the information extracted from your resume</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {extractedData?.title && (
              <div className="border-l-4 border-[#227C70] pl-4 py-2">
                <p className="text-sm font-medium text-gray-700">Title</p>
                <p className="text-gray-900">{extractedData.title}</p>
              </div>
            )}

            {extractedData?.bio && (
              <div className="border-l-4 border-[#227C70] pl-4 py-2">
                <p className="text-sm font-medium text-gray-700">Bio</p>
                <p className="text-gray-900 text-sm">{extractedData.bio}</p>
              </div>
            )}

            {extractedData?.skills && extractedData.skills.length > 0 && (
              <div className="border-l-4 border-[#227C70] pl-4 py-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Skills ({extractedData.skills.length})</p>
                <div className="flex flex-wrap gap-2">
                  {extractedData.skills.slice(0, 10).map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-[#227C70] text-white text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                  {extractedData.skills.length > 10 && (
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
                      +{extractedData.skills.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {extractedData?.education && extractedData.education.length > 0 && (
              <div className="border-l-4 border-[#227C70] pl-4 py-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Education ({extractedData.education.length})</p>
                <div className="space-y-2">
                  {extractedData.education.map((edu, idx) => (
                    <div key={idx} className="text-sm text-gray-900">
                      <span className="font-medium">{edu.degree}</span> - {edu.institution} ({edu.year_completed || edu.year})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extractedData?.experience && extractedData.experience.length > 0 && (
              <div className="border-l-4 border-[#227C70] pl-4 py-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Experience ({extractedData.experience.length})</p>
                <div className="space-y-2">
                  {extractedData.experience.map((exp, idx) => (
                    <div key={idx} className="text-sm text-gray-900">
                      <span className="font-medium">{exp.role}</span> at {exp.company}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Clicking "Use This Data" will populate your profile form with the extracted information. You can review and edit it before saving.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-[#227C70] text-white rounded-lg hover:bg-[#55784A] transition-colors font-medium"
            >
              Use This Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FreelancerProfileForm() {
  const dispatch = useDispatch();
  const { 
    data: profile, 
    extractedData, 
    pendingExtractedData,
    showConfirmDialog,
    loading, 
    resumeUploading, 
    successMessage, 
    error 
  } = useSelector((state) => state.freelancerProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [profilePreview, setProfilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const { register, control, handleSubmit, setValue, reset, watch, formState: { errors, isValid } } = useForm({
    defaultValues: {
      title: "",
      bio: "",
      contact_number: "",
      hourly_rate: "",
      profile_picture: null,
      resume: null,
      categories: "",
      skills: "",
      education: [],
      experience: [],
    },
    mode: "onChange",
  });

  // Education & Experience field arrays
  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({ control, name: "education" });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({ control, name: "experience" });

  // Watch profile picture for preview
  const profilePicture = watch("profile_picture");

  // Load profile on mount
  useEffect(() => {
    dispatch(fetchFreelancerProfile());
  }, [dispatch]);

  // Auto-dismiss success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  // Auto-dismiss error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Set form values when profile data arrives
  useEffect(() => {
    if (!profile) return;

    reset({
      title: profile.title || "",
      bio: profile.bio || "",
      contact_number: profile.contact_number || "",
      hourly_rate: profile.hourly_rate || "",
      categories: Array.isArray(profile.categories_names) 
        ? profile.categories_names.join(", ")
        : "",
      skills: Array.isArray(profile.skills_names)
        ? profile.skills_names.join(", ")
        : "",
      education: profile.education || [],
      experience: profile.experience || [],
    });

    if (profile.profile_picture) {
      setProfilePreview(profile.profile_picture);
    }
  }, [profile, reset]);

  // Handle profile picture preview
  useEffect(() => {
    if (profilePicture && profilePicture.length > 0) {
      const file = profilePicture[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setProfilePreview(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  }, [profilePicture]);

  // Prefill from extracted resume data (after confirmation)
  useEffect(() => {
    if (!extractedData) return;

    console.log("Applying extracted data to form:", extractedData);

    // Update title
    if (extractedData.title) {
      setValue("title", extractedData.title, { shouldValidate: true, shouldDirty: true });
    }

    // Update bio
    if (extractedData.bio) {
      setValue("bio", extractedData.bio, { shouldValidate: true, shouldDirty: true });
    }

    // Update skills
    if (extractedData.skills && Array.isArray(extractedData.skills)) {
      const skillsString = extractedData.skills.join(", ");
      setValue("skills", skillsString, { shouldValidate: true, shouldDirty: true });
    }

    // Update categories
    if (extractedData.categories && Array.isArray(extractedData.categories)) {
      const categoriesString = extractedData.categories.join(", ");
      setValue("categories", categoriesString, { shouldValidate: true, shouldDirty: true });
    }

    // Update education
    if (extractedData.education && Array.isArray(extractedData.education)) {
      const currentEducation = watch("education");
      for (let i = currentEducation.length - 1; i >= 0; i--) {
        removeEducation(i);
      }
      extractedData.education.forEach((edu) => {
        appendEducation({
          degree: edu.degree || "",
          institution: edu.institution || "",
          year_completed: edu.year_completed || edu.year || ""
        });
      });
    }

    // Update experience
    if (extractedData.experience && Array.isArray(extractedData.experience)) {
      const currentExperience = watch("experience");
      for (let i = currentExperience.length - 1; i >= 0; i--) {
        removeExperience(i);
      }
      extractedData.experience.forEach((exp) => {
        appendExperience({
          company: exp.company || "",
          role: exp.role || "",
          start_date: exp.start_date || "",
          end_date: exp.end_date || ""
        });
      });
    }

    setIsEditing(true);
  }, [extractedData, setValue, appendEducation, appendExperience, removeEducation, removeExperience, watch]);

  const handleResumeUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  
  if (!allowedTypes.includes(fileExtension)) {
    alert("Please upload a PDF, DOC, or DOCX file");
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    alert("File size should be less than 5MB");
    return;
  }
  
  const confirmExtraction = window.confirm(
    "Would you like to extract information from this resume to auto-fill your profile?\n\n" +
    "Click OK to extract data, or Cancel to just upload the resume file."
  );
  
  if (confirmExtraction) {
    console.log("Uploading resume with extraction:", file.name);
    dispatch(uploadResumeAndExtract({ resumeFile: file }));
  } else {
    console.log("Uploading resume only:", file.name);
    
    // FIXED: Get current form values to avoid overwriting
    const currentValues = watch();
    
    const manualData = {
      title: currentValues.title || "",
      bio: currentValues.bio || "",
      contact_number: currentValues.contact_number || "",
      hourly_rate: currentValues.hourly_rate || "",
      skills: currentValues.skills?.split(",").map(s => s.trim()).filter(Boolean) || [],
      categories: currentValues.categories?.split(",").map(c => c.trim()).filter(Boolean) || [],
      education: currentValues.education || [],
      experience: currentValues.experience || [],
    };
    
    // FIXED: Only include resume in files object
    dispatch(updateFreelancerProfile({ 
      manualData, 
      files: { resume: file }  // Only resume, not profilePicture
    }))
    .unwrap()
    .then(() => {
      dispatch(fetchFreelancerProfile());
    })
    .catch((error) => {
      console.error("Failed to upload resume:", error);
    });
  }
};


  const handleConfirmExtraction = () => {
    dispatch(confirmExtractedData());
  };

  const handleCancelExtraction = () => {
    dispatch(cancelExtractedData());
  };

  const handleProfilePictureClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    
    if (!allowedImageTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPG, PNG, GIF, WebP, or AVIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const fileList = dataTransfer.files;

    setValue("profile_picture", fileList, { shouldValidate: true });
  };

  const removeProfilePicture = () => {
    setProfilePreview(null);
    setValue("profile_picture", null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Updated onSubmit function
  // Updated onSubmit function
const onSubmit = (formData) => {
  console.log("=== FORM SUBMIT DEBUG ===");
  console.log("1. Raw form data:", formData);

  // Process skills from comma-separated string to array
  let skillsArray = [];
  if (formData.skills) {
    if (typeof formData.skills === 'string') {
      skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (Array.isArray(formData.skills)) {
      skillsArray = formData.skills.map(s => String(s).trim()).filter(Boolean);
    }
  }

  // Process categories from comma-separated string to array
  let categoriesArray = [];
  if (formData.categories) {
    if (typeof formData.categories === 'string') {
      categoriesArray = formData.categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    } else if (Array.isArray(formData.categories)) {
      categoriesArray = formData.categories.map(c => String(c).trim()).filter(Boolean);
    }
  }

  // Clean up experience data
  let cleanedExperience = [];
  if (formData.experience && Array.isArray(formData.experience)) {
    cleanedExperience = formData.experience
      .filter(exp => exp && typeof exp === 'object' && !Array.isArray(exp))
      .map(exp => ({
        company: String(exp.company || ""),
        role: String(exp.role || ""),
        start_date: String(exp.start_date || ""),
        end_date: exp.end_date && String(exp.end_date).trim() !== "" ? String(exp.end_date) : null
      }));
  }

  // Clean up education data
  let cleanedEducation = [];
  if (formData.education && Array.isArray(formData.education)) {
    cleanedEducation = formData.education
      .filter(edu => edu && typeof edu === 'object' && !Array.isArray(edu))
      .map(edu => ({
        degree: String(edu.degree || ""),
        institution: String(edu.institution || ""),
        year_completed: String(edu.year_completed || "")
      }));
  }

  // Prepare manual data object
  const manualData = {
    title: String(formData.title || ""),
    bio: String(formData.bio || ""),
    contact_number: String(formData.contact_number || ""),
    hourly_rate: String(formData.hourly_rate || ""),
    skills: skillsArray,
    categories: categoriesArray,
    education: cleanedEducation,
    experience: cleanedExperience,
  };

  // Prepare files object - ONLY include files that are being changed
  const files = {};
  
  // Handle profile picture - FIXED LOGIC
  if (formData.profile_picture && formData.profile_picture.length > 0) {
    // New file selected
    files.profilePicture = formData.profile_picture[0];
    console.log("New profile picture selected:", files.profilePicture.name);
  } else if (profilePreview === null && profile?.profile_picture) {
    // User explicitly removed existing profile picture
    files.profilePicture = null;
    console.log("Profile picture removed");
  }
  // If neither condition is true, don't include profilePicture in files object
  // This means "don't change the existing file"
  
  // Handle resume - FIXED LOGIC
  if (formData.resume && formData.resume.length > 0) {
    // New file selected
    files.resume = formData.resume[0];
    console.log("New resume selected:", files.resume.name);
  }
  // For resume, we don't have a "remove" option in your UI
  // If you want to add one, you'd check a separate flag here

  console.log("=== PROCESSED DATA ===");
  console.log("Manual data:", manualData);
  console.log("Files:", files);
  console.log("Files object keys:", Object.keys(files));

  dispatch(updateFreelancerProfile({ manualData, files }))
    .unwrap()
    .then(() => {
      setIsEditing(false);
      dispatch(fetchFreelancerProfile());
    })
    .catch((error) => {
      console.error("Failed to update profile:", error);
    });
};


  const navigationItems = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "professional", label: "Professional Info", icon: Award },
    { id: "skills", label: "Skills & Categories", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "experience", label: "Experience", icon: FileText },
  ];

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    const total = 8;
    
    if (watch("title")?.length > 0) completed++;
    if (watch("bio")?.length >= 10) completed++;
    if (watch("contact_number")?.length > 0) completed++;
    if (watch("hourly_rate")?.length > 0) completed++;
    if (watch("skills")?.length > 0) completed++;
    if (watch("categories")?.length > 0) completed++;
    if (watch("education")?.length > 0) completed++;
    if (watch("experience")?.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletion();

  // Get username from profile
  const getUsername = () => {
    if (!profile?.user) return "Loading...";
    if (typeof profile.user === 'string') {
      return profile.user.split(' (')[0];
    }
    return profile.user.username || "User";
  };

  // Get email from profile
  const getEmail = () => {
    if (!profile) return "Loading...";
    return profile.email || profile.user?.email || "Email not available";
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-8">
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onConfirm={handleConfirmExtraction}
        onCancel={handleCancelExtraction}
        extractedData={pendingExtractedData}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-800">Manage your freelancer profile and preferences</p>
          
          {/* Profile Completion */}
          <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-800">Profile Completion</span>
              <span className="text-sm font-semibold text-[#227C70]">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#227C70] h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-700 mt-2">
              Complete your profile to increase your chances of getting hired
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">
              {typeof error === 'string' ? error : 
               error?.error ? error.error : 
               error?.detail ? error.detail :
               'An error occurred'}
            </p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? "bg-[#227C70] text-white"
                        : "text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* User Info - Non Editable */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-[#227C70] rounded-full flex items-center justify-center">
                      {profilePreview ? (
                        <img 
                          src={profilePreview} 
                          alt="Profile" 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {getUsername()}
                    </p>
                    <p className="text-sm text-gray-800 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {getEmail()}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Email verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Profile active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Member since {profile?.created_at ? new Date(profile.created_at).getFullYear() : "2024"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information Section */}
              {activeSection === "personal" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 text-sm font-medium text-[#227C70] hover:text-[#55784A] transition-colors"
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Picture with Preview */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Profile Picture
                      </label>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div 
                            className="relative w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#227C70] transition-colors group"
                            onClick={handleProfilePictureClick}
                          >
                            {profilePreview ? (
                              <>
                                <img 
                                  src={profilePreview} 
                                  alt="Profile preview" 
                                  className="w-full h-full rounded-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Camera className="h-6 w-6 text-white" />
                                </div>
                              </>
                            ) : (
                              <Camera className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 mb-2">
                              {profilePreview ? "Click to change photo" : "Click to upload photo"}
                            </p>
                            {isEditing && profilePreview && (
                              <button
                                type="button"
                                onClick={removeProfilePicture}
                                className="text-sm text-red-600 hover:text-red-700 transition-colors"
                              >
                                Remove photo
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <input
                          ref={imageInputRef}
                          type="file"
                          onChange={handleImageUpload}
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif"
                          className="hidden"
                          disabled={!isEditing}
                        />
                        {errors.profile_picture && (
                          <p className="text-sm text-red-600">{errors.profile_picture.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Resume Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Resume
                      </label>
                      <div className="space-y-3">
                        {profile?.resume && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <FileText className="h-5 w-5 text-[#227C70]" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {profile.resume.split('/').pop()}
                              </p>
                              <a 
                                href={profile.resume}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#227C70] hover:text-[#55784A] transition-colors"
                              >
                                View Resume
                              </a>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#227C70] file:text-white hover:file:bg-[#55784A] transition-colors"
                          disabled={!isEditing || resumeUploading}
                        />
                        {resumeUploading && (
                          <div className="flex items-center gap-2 text-sm text-[#227C70]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing resume...</span>
                          </div>
                        )}
                        <p className="text-xs text-gray-700">
                          {profile?.resume ? "Upload a new resume to replace the current one" : "Upload PDF or DOCX (max 5MB) to auto-fill your profile"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Contact Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...register("contact_number", {
                          required: "Contact number is required",
                          pattern: {
                            value: /^\+?1?\d{9,15}$/,
                            message: "Enter a valid contact number with country code (e.g., +911234567890)"
                          }
                        })}
                        type="text"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#227C70] focus:border-[#227C70] transition-colors text-gray-900 placeholder-gray-500 ${
                          errors.contact_number ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="+911234567890"
                        disabled={!isEditing}
                      />
                    </div>
                    {errors.contact_number && (
                      <p className="text-sm text-red-600 mt-1">{errors.contact_number.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Professional Information Section */}
              {activeSection === "professional" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <Award className="h-5 w-5" />
                    Professional Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Professional Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Professional Title *
                      </label>
                      <input
                        {...register("title", { 
                          required: "Professional title is required",
                          minLength: {
                            value: 2,
                            message: "Title should be at least 2 characters long"
                          },
                          maxLength: {
                            value: 100,
                            message: "Title should not exceed 100 characters"
                          }
                        })}
                        type="text"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#227C70] focus:border-[#227C70] transition-colors text-gray-900 placeholder-gray-500 ${
                          errors.title ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="e.g., Senior Full Stack Developer"
                        disabled={!isEditing}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    {/* Hourly Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Hourly Rate ($) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register("hourly_rate", {
                            required: "Hourly rate is required",
                            pattern: {
                              value: /^\d+(\.\d{1,2})?$/,
                              message: "Please enter a valid hourly rate (e.g., 50.00)"
                            },
                            min: {
                              value: 0.01,
                              message: "Hourly rate must be greater than 0"
                            }
                          })}
                          type="number"
                          step="0.01"
                          min="0.01"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#227C70] focus:border-[#227C70] transition-colors text-gray-900 placeholder-gray-500 ${
                            errors.hourly_rate ? "border-red-300" : "border-gray-300"
                          }`}
                          placeholder="50.00"
                          disabled={!isEditing}
                        />
                      </div>
                      {errors.hourly_rate && (
                        <p className="text-sm text-red-600 mt-1">{errors.hourly_rate.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Professional Bio *
                    </label>
                    <textarea
                      {...register("bio", { 
                        required: "Bio is required",
                        minLength: {
                          value: 10,
                          message: "Bio should be at least 10 characters long"
                        },
                        maxLength: {
                          value: 1000,
                          message: "Bio should not exceed 1000 characters"
                        }
                      })}
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#227C70] focus:border-[#227C70] transition-colors resize-none text-gray-900 placeholder-gray-500 ${
                        errors.bio ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Tell clients about yourself, your experience, and what you can bring to their projects (minimum 10 characters)..."
                      disabled={!isEditing}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.bio ? (
                        <p className="text-sm text-red-600">{errors.bio.message}</p>
                      ) : (
                        <p className="text-sm text-gray-700">
                          {watch("bio")?.length || 0}/1000 characters
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Skills & Categories Section */}
              {activeSection === "skills" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <Briefcase className="h-5 w-5" />
                    Skills & Categories
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Skills */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Skills * (comma-separated)
                      </label>
                      <textarea
                        {...register("skills", { 
                          required: "At least one skill is required",
                          validate: (value) => {
                            const skills = value.split(",").map(s => s.trim()).filter(Boolean);
                            return skills.length > 0 || "Please add at least one skill";
                          }
                        })}
                        rows={6}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#227C70] focus:border-[#227C70] transition-colors resize-none text-gray-900 placeholder-gray-500 ${
                          errors.skills ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="React, Django, Photoshop, Project Management..."
                        disabled={!isEditing}
                      />
                      {errors.skills && (
                        <p className="text-sm text-red-600 mt-1">{errors.skills.message}</p>
                      )}
                      <p className="text-xs text-gray-700 mt-2">
                        Separate multiple skills with commas. Minimum 1 skill required.
                      </p>
                    </div>

                    {/* Categories */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Categories * (comma-separated)
                      </label>
                      <textarea
                        {...register("categories", { 
                          required: "At least one category is required",
                          validate: (value) => {
                            const categories = value.split(",").map(c => c.trim()).filter(Boolean);
                            return categories.length > 0 || "Please add at least one category";
                          }
                        })}
                        rows={6}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#227C70] focus:border-[#227C70] transition-colors resize-none text-gray-900 placeholder-gray-500 ${
                          errors.categories ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Web Development, Design, Marketing, Consulting..."
                        disabled={!isEditing}
                      />
                      {errors.categories && (
                        <p className="text-sm text-red-600 mt-1">{errors.categories.message}</p>
                      )}
                      <p className="text-xs text-gray-700 mt-2">
                        Separate multiple categories with commas. Minimum 1 category required.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Education Section */}
              {activeSection === "education" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Education
                    </h2>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => appendEducation({ degree: "", institution: "", year_completed: "" })}
                        className="flex items-center gap-2 px-4 py-2 bg-[#227C70] text-white rounded-lg hover:bg-[#55784A] transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add Education
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {educationFields.length === 0 && (
                      <div className="text-center py-8 text-gray-600">
                        <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No education entries yet</p>
                        {isEditing && (
                          <p className="text-sm mt-1">Add your first education entry to get started</p>
                        )}
                      </div>
                    )}

                    {educationFields.map((item, index) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 relative">
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeEducation(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                            title="Remove education"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">
                              Degree *
                            </label>
                            <input
                              {...register(`education.${index}.degree`, { 
                                required: "Degree is required",
                                minLength: {
                                  value: 2,
                                  message: "Degree should be at least 2 characters"
                                }
                              })}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#227C70] focus:border-[#227C70] transition-colors text-gray-900 placeholder-gray-500 ${
                                errors.education?.[index]?.degree ? "border-red-300" : "border-gray-300"
                              }`}
                              placeholder="Bachelor of Science"
                              disabled={!isEditing}
                            />
                            {errors.education?.[index]?.degree && (
                              <p className="text-sm text-red-600 mt-1">{errors.education[index].degree.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">
                              Institution *
                            </label>
                            <input
                              {...register(`education.${index}.institution`, { 
                                required: "Institution is required",
                                minLength: {
                                  value: 2,
                                  message: "Institution name should be at least 2 characters"
                                }
                              })}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#227C70] focus:border-[#227C70] transition-colors text-gray-900 placeholder-gray-500 ${
                                errors.education?.[index]?.institution ? "border-red-300" : "border-gray-300"
                              }`}
                              placeholder="University Name"
                              disabled={!isEditing}
                            />
                            {errors.education?.[index]?.institution && (
                              <p className="text-sm text-red-600 mt-1">{errors.education[index].institution.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">
                              Year Completed *
                            </label>
                            <input
                              {...register(`education.${index}.year_completed`, { 
                                required: "Year is required",
                                pattern: {
                                  value: /^(19|20)\d{2}$/,
                                  message: "Please enter a valid year (e.g., 2020)"
                                },
                                validate: (value) => {
                                  const year = parseInt(value);
                                  const currentYear = new Date().getFullYear();
                                  return (year >= 1950 && year <= currentYear + 6) || 
                                    `Year must be between 1950 and ${currentYear + 6}`;
                                }
                              })}
                              type="number"
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#227C70] focus:border-[#227C70] transition-colors text-gray-900 placeholder-gray-500 ${
                                errors.education?.[index]?.year_completed ? "border-red-300" : "border-gray-300"
                              }`}
                              placeholder="2020"
                              disabled={!isEditing}
                            />
                            {errors.education?.[index]?.year_completed && (
                              <p className="text-sm text-red-600 mt-1">{errors.education[index].year_completed.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience Section */}
              {activeSection === "experience" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Work Experience
                    </h2>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => appendExperience({ company: "", role: "", start_date: "", end_date: "" })}
                        className="flex items-center gap-2 px-4 py-2 bg-[#227C70] text-white rounded-lg hover:bg-[#55784A] transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add Experience
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {experienceFields.length === 0 && (
                      <div className="text-center py-8 text-gray-600">
                        <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No experience entries yet</p>
                        {isEditing && (
                          <p className="text-sm mt-1">Add your first work experience to get started</p>
                        )}
                      </div>
                    )}

                    {experienceFields.map((item, index) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 relative">
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                            title="Remove experience"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">
                              Company *
                            </label>
                            <input
                              {...register(`experience.${index}.company`, { 
                                required: "Company name is required",
                                minLength: {
                                  value: 2,
                                  message: "Company name should be at least 2 characters"
                                }
                              })}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#227C70] focus:border-[#227C70] transition-colors text-gray-900 placeholder-gray-500 ${
                                errors.experience?.[index]?.company ? "border-red-300" : "border-gray-300"
                              }`}
                              placeholder="Company Name"
                              disabled={!isEditing}
                            />
                            {errors.experience?.[index]?.company && (
                              <p className="text-sm text-red-600 mt-1">{errors.experience[index].company.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">
                              Role *
                            </label>
                            <input
                              {...register(`experience.${index}.role`, { 
                                required: "Role is required",
                                minLength: {
                                  value: 2,
                                  message: "Role should be at least 2 characters"
                                }
                              })}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#227C70] focus:border-[#227C70] transition-colors text-gray-900 placeholder-gray-500 ${
                                errors.experience?.[index]?.role ? "border-red-300" : "border-gray-300"
                              }`}
                              placeholder="Job Title"
                              disabled={!isEditing}
                            />
                            {errors.experience?.[index]?.role && (
                              <p className="text-sm text-red-600 mt-1">{errors.experience[index].role.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">
                              Start Date *
                            </label>
                            <input
                              {...register(`experience.${index}.start_date`, { 
                                required: "Start date is required",
                                validate: (value) => {
                                  const date = new Date(value);
                                  const currentDate = new Date();
                                  return date <= currentDate || "Start date cannot be in the future";
                                }
                              })}
                              type="date"
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#227C70] focus:border-[#227C70] transition-colors text-gray-900 ${
                                errors.experience?.[index]?.start_date ? "border-red-300" : "border-gray-300"
                              }`}
                              disabled={!isEditing}
                            />
                            {errors.experience?.[index]?.start_date && (
                              <p className="text-sm text-red-600 mt-1">{errors.experience[index].start_date.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">
                              End Date
                            </label>
                            <input
                              {...register(`experience.${index}.end_date`, {
                                validate: (value, formValues) => {
                                  if (!value) return true;
                                  const startDate = new Date(formValues.experience[index].start_date);
                                  const endDate = new Date(value);
                                  return endDate >= startDate || "End date must be after start date";
                                }
                              })}
                              type="date"
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#227C70] focus:border-[#227C70] transition-colors text-gray-900 ${
                                errors.experience?.[index]?.end_date ? "border-red-300" : "border-gray-300"
                              }`}
                              placeholder="Leave empty if current"
                              disabled={!isEditing}
                            />
                            {errors.experience?.[index]?.end_date && (
                              <p className="text-sm text-red-600 mt-1">{errors.experience[index].end_date.message}</p>
                            )}
                            <p className="text-xs text-gray-600 mt-1">Leave empty if currently working</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    dispatch(fetchFreelancerProfile());
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isEditing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isEditing || loading || !isValid}
                  className="flex items-center gap-2 px-6 py-3 bg-[#227C70] text-white rounded-lg hover:bg-[#55784A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
