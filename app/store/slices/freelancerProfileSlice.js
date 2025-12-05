import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiPrivate } from "@/lib/apiPrivate";

// ----------------------------
// HELPER: safe map & unique
// ----------------------------
const extractSkillsAndCategories = (skillsRead = []) => ({
  skills_names: skillsRead.map(fs => fs.skill?.name).filter(Boolean),
  categories_names: [
    ...new Set(skillsRead.map(fs => fs.skill?.category?.name).filter(Boolean)),
  ],
});

// ----------------------------
// ASYNC THUNKS
// ----------------------------

// FETCH FREELANCER PROFILE
export const fetchFreelancerProfile = createAsyncThunk(
  "freelancerProfile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiPrivate.get("/profiles/");
      const data = response.data?.results?.[0] || null;
      console.log(data)
      if (data?.skills_read) {
        Object.assign(data, extractSkillsAndCategories(data.skills_read));
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message || "Failed to fetch profile." });
    }
  }
);

// CREATE FREELANCER PROFILE
export const createFreelancerProfile = createAsyncThunk(
  "freelancerProfile/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiPrivate.post("/profiles/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message || "Failed to create profile." });
    }
  }
);

// UPDATE FREELANCER PROFILE - FIXED VERSION
export const updateFreelancerProfile = createAsyncThunk(
  "freelancerProfile/updateFreelancerProfile",
  async ({ manualData = {}, files = {} }, { getState, rejectWithValue }) => {
    try {
      const { data } = getState().freelancerProfile;
      if (!data?.id) throw new Error("Profile ID not found");

      const formData = new FormData();

      // ----------------------------
      // SIMPLE TEXT FIELDS
      // ----------------------------
      ["bio", "title", "contact_number", "hourly_rate"].forEach(field => {
        if (manualData[field] !== undefined && manualData[field] !== null && manualData[field] !== "") {
          formData.append(field, manualData[field]);
        }
      });

      // ----------------------------
      // SKILLS → SEND AS JSON STRING (DRF will parse it)
      // ----------------------------
      if (manualData.skills) {
        let skillsArray = [];
        
        if (Array.isArray(manualData.skills)) {
          skillsArray = manualData.skills
            .map(s =>
              typeof s === "string"
                ? s.trim()
                : s?.name
                ? s.name.trim()
                : s?.skill?.name
                ? s.skill.name.trim()
                : null
            )
            .filter(Boolean);
        }

        if (skillsArray.length) {
          // Send as JSON string - backend will parse it
          formData.append("skills", JSON.stringify(skillsArray));
        }
      }

      // ----------------------------
      // CATEGORIES → SEND AS JSON STRING (DRF will parse it)
      // ----------------------------
      if (manualData.categories) {
        let categoriesArray = [];
        
        if (Array.isArray(manualData.categories)) {
          categoriesArray = manualData.categories
            .map(c => (typeof c === "string" ? c.trim() : c?.name?.trim() || null))
            .filter(Boolean);
        }

        if (categoriesArray.length) {
          // Send as JSON string - backend will parse it
          formData.append("categories", JSON.stringify(categoriesArray));
        }
      }

      // ----------------------------
      // EDUCATION → SEND AS JSON STRING (DRF will parse it)
      // ----------------------------
      if (manualData.education) {
        let educationArray = [];
        
        if (Array.isArray(manualData.education)) {
          educationArray = manualData.education
            .filter(e => e && typeof e === "object" && !Array.isArray(e))
            .map(e => ({
              degree: String(e.degree || ""),
              institution: String(e.institution || ""),
              year_completed: String(e.year_completed || e.year || "")
            }));
        }

        if (educationArray.length) {
          // Send as JSON string - backend will parse it
          formData.append("education_input", JSON.stringify(educationArray));
        }
      }

      // ----------------------------
      // EXPERIENCE → SEND AS JSON STRING (DRF will parse it)
      // ----------------------------
      if (manualData.experience) {
        let experienceArray = [];
        
        if (Array.isArray(manualData.experience)) {
          experienceArray = manualData.experience
            .filter(e => e && typeof e === "object" && !Array.isArray(e))
            .map(exp => ({
              company: String(exp.company || ""),
              role: String(exp.role || ""),
              start_date: String(exp.start_date || ""),
              end_date: exp.end_date && String(exp.end_date).trim() !== "" ? String(exp.end_date) : null
            }));
        }

        if (experienceArray.length) {
          // Send as JSON string - backend will parse it
          formData.append("experience_input", JSON.stringify(experienceArray));
        }
      }

      // ----------------------------
      // FILES - FIXED APPROACH
      // ----------------------------
      // Only append file fields if they are explicitly provided in the files object
      if ("profilePicture" in files) {
        if (files.profilePicture instanceof File) {
          // Validate image file type
          const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
          if (!allowedImageTypes.includes(files.profilePicture.type)) {
            throw new Error("Please upload a valid image file (JPG, PNG, GIF, WebP, or AVIF)");
          }
          // Append the actual File object
          formData.append("profile_picture", files.profilePicture);
          console.log("Appending new profile picture:", files.profilePicture.name);
        } else if (files.profilePicture === null) {
          // To remove profile picture, send empty string
          formData.append("profile_picture", "");
          console.log("Removing profile picture");
        }
        // If undefined, don't append anything (leave existing file as is)
      }

      if ("resume" in files) {
        if (files.resume instanceof File) {
          // Validate resume file type
          const allowedResumeTypes = ['.pdf', '.doc', '.docx'];
          const fileExtension = '.' + files.resume.name.split('.').pop().toLowerCase();
          
          if (!allowedResumeTypes.includes(fileExtension)) {
            throw new Error("Please upload a PDF, DOC, or DOCX file for resume");
          }
          // Append the actual File object
          formData.append("resume", files.resume);
          console.log("Appending new resume:", files.resume.name);
        } else if (files.resume === null) {
          // To remove resume, send empty string
          formData.append("resume", "");
          console.log("Removing resume");
        }
        // If undefined, don't append anything (leave existing file as is)
      }

      console.log("=== FormData contents ===");
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0] + ': [File] ' + pair[1].name);
        } else {
          console.log(pair[0] + ': ', pair[1]);
        }
      }

      // ✅ Use PATCH for updates, POST for creation
      const method = data.id ? 'patch' : 'post';
      const url = data.id ? `/profiles/${data.id}/` : '/profiles/';

      const response = await apiPrivate[method](url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      return rejectWithValue(error.response?.data || { message: error.message || "Failed to update profile." });
    }
  }
);

// UPLOAD RESUME & PROFILE PICTURE WITH AI EXTRACTION
export const uploadResumeAndExtract = createAsyncThunk(
  "freelancerProfile/uploadResume",
  async ({ resumeFile, profilePicture }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      if (resumeFile instanceof File) {
        formData.append("resume", resumeFile, resumeFile.name);
      }

      if (profilePicture instanceof File) {
        formData.append("profile_picture", profilePicture, profilePicture.name);
      }

      if (!resumeFile && !profilePicture) {
        throw new Error("No file selected.");
      }

      const response = await apiPrivate.post(
        "/profiles/upload-resume/",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// UPLOAD RESUME ONLY (without extraction)
export const uploadResumeOnly = createAsyncThunk(
  "freelancerProfile/uploadResumeOnly",
  async (resumeFile, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const response = await apiPrivate.post("/profiles/upload-resume/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to upload resume." }
      );
    }
  }
);

// ----------------------------
// SLICE
// ----------------------------
const freelancerProfileSlice = createSlice({
  name: "freelancerProfile",
  initialState: {
    data: null,
    extractedData: null,
    pendingExtractedData: null, // Temporary storage for confirmation
    loading: false,
    resumeUploading: false,
    error: null,
    successMessage: null,
    showConfirmDialog: false,
  },
  reducers: {
    clearProfileState(state) {
      state.data = null;
      state.extractedData = null;
      state.pendingExtractedData = null;
      state.loading = false;
      state.resumeUploading = false;
      state.error = null;
      state.successMessage = null;
      state.showConfirmDialog = false;
    },
    clearError(state) {
      state.error = null;
    },
    clearSuccessMessage(state) {
      state.successMessage = null;
    },
    clearExtractedData(state) {
      state.extractedData = null;
      state.pendingExtractedData = null;
      state.showConfirmDialog = false;
    },
    confirmExtractedData(state) {
      // User confirmed - move pending data to extracted data
      state.extractedData = state.pendingExtractedData;
      state.pendingExtractedData = null;
      state.showConfirmDialog = false;
    },
    cancelExtractedData(state) {
      // User cancelled - clear pending data
      state.pendingExtractedData = null;
      state.showConfirmDialog = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchFreelancerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFreelancerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchFreelancerProfile.rejected, (state, action) => {
        state.loading = false;
        state.data = null;
        state.error = action.payload?.message || "Failed to fetch profile.";
      })

      // CREATE
      .addCase(createFreelancerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createFreelancerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.successMessage = "Profile created successfully!";
      })
      .addCase(createFreelancerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create profile.";
      })

      // UPDATE
      .addCase(updateFreelancerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateFreelancerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.successMessage = "Profile updated successfully!";
        state.extractedData = null;
        state.pendingExtractedData = null;
      })
      .addCase(updateFreelancerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update profile.";
      })

      // UPLOAD RESUME WITH EXTRACTION
      .addCase(uploadResumeAndExtract.pending, (state) => {
        state.resumeUploading = true;
        state.error = null;
        state.pendingExtractedData = null;
        state.showConfirmDialog = false;
      })
      .addCase(uploadResumeAndExtract.fulfilled, (state, action) => {
        state.resumeUploading = false;
        
        // Store in pending state and show confirmation dialog
        if (action.payload.extracted_data) {
          state.pendingExtractedData = action.payload.extracted_data;
          state.showConfirmDialog = true;
          state.successMessage = "Resume uploaded! Review the extracted data.";
        } else {
          state.successMessage = "Files uploaded successfully!";
        }
        
        // Update profile data
        if (action.payload.profile) {
          state.data = action.payload.profile;
        }
      })
      .addCase(uploadResumeAndExtract.rejected, (state, action) => {
        state.resumeUploading = false;
        state.error = action.payload?.message || "Failed to upload resume.";
      })

      // UPLOAD RESUME ONLY
      .addCase(uploadResumeOnly.pending, (state) => {
        state.resumeUploading = true;
        state.error = null;
      })
      .addCase(uploadResumeOnly.fulfilled, (state, action) => {
        state.resumeUploading = false;
        state.successMessage = "Resume uploaded successfully!";
        if (action.payload.profile) {
          state.data = action.payload.profile;
        }
      })
      .addCase(uploadResumeOnly.rejected, (state, action) => {
        state.resumeUploading = false;
        state.error = action.payload?.message || "Failed to upload resume.";
      });
  },
});

export const { 
  clearProfileState, 
  clearError, 
  clearSuccessMessage, 
  clearExtractedData,
  confirmExtractedData,
  cancelExtractedData 
} = freelancerProfileSlice.actions;

export default freelancerProfileSlice.reducer;
