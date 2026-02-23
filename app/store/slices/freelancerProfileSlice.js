import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiPrivate } from "@/lib/apiPrivate";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const extractSkillsAndCategories = (skillsRead = []) => {
  const skills_names = skillsRead.map(fs => fs.skill?.name).filter(Boolean);
  
  // Extract all categories from all skills (many-to-many relationship)
  const categoriesSet = new Set();
  skillsRead.forEach(fs => {
    if (fs.skill?.categories && Array.isArray(fs.skill.categories)) {
      fs.skill.categories.forEach(cat => {
        if (cat?.name) categoriesSet.add(cat.name);
      });
    }
  });
  
  return {
    skills_names,
    categories_names: Array.from(categoriesSet),
  };
};

// ============================================================================
// ASYNC THUNKS - PROFILE OPERATIONS
// ============================================================================

// FETCH FREELANCER PROFILE
export const fetchFreelancerProfile = createAsyncThunk(
  "freelancerProfile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiPrivate.get("/profiles/");
      const data = response.data?.results?.[0] || null;
      
      if (data?.skills_read) {
        Object.assign(data, extractSkillsAndCategories(data.skills_read));
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to fetch profile." }
      );
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
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to create profile." }
      );
    }
  }
);

// UPDATE FREELANCER PROFILE
export const updateFreelancerProfile = createAsyncThunk(
  "freelancerProfile/update",
  async ({ manualData = {}, files = {} }, { getState, rejectWithValue }) => {
    try {
      const { data } = getState().freelancerProfile;
      if (!data?.id) throw new Error("Profile ID not found");

      const formData = new FormData();

      // Simple text fields
      ["bio", "title", "contact_number", "hourly_rate"].forEach(field => {
        if (manualData[field] !== undefined && manualData[field] !== null && manualData[field] !== "") {
          formData.append(field, manualData[field]);
        }
      });

      // Skills - convert to JSON string
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
          formData.append("skills", JSON.stringify(skillsArray));
        }
      }

      // Categories - convert to JSON string
      // Backend expects categories array to match skills array length
      if (manualData.categories) {
        let categoriesArray = [];
        
        if (Array.isArray(manualData.categories)) {
          categoriesArray = manualData.categories
            .map(c => (typeof c === "string" ? c.trim() : c?.name?.trim() || null))
            .filter(Boolean);
        }

        if (categoriesArray.length) {
          formData.append("categories", JSON.stringify(categoriesArray));
        }
      }

      // Education - convert to JSON string
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
          formData.append("education_input", JSON.stringify(educationArray));
        }
      }

      // Experience - convert to JSON string
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
          formData.append("experience_input", JSON.stringify(experienceArray));
        }
      }

      // Portfolio - convert to JSON string
      if (manualData.portfolio) {
        let portfolioArray = [];
        
        if (Array.isArray(manualData.portfolio)) {
          portfolioArray = manualData.portfolio
            .filter(p => p && typeof p === "object" && !Array.isArray(p))
            .map(proj => ({
              title: String(proj.title || ""),
              description: String(proj.description || ""),
              link: proj.link && String(proj.link).trim() !== "" ? String(proj.link) : null
            }));
        }

        if (portfolioArray.length) {
          formData.append("portfolio_input", JSON.stringify(portfolioArray));
        }
      }

      // Pricing - convert to JSON string
      if (manualData.pricing) {
        let pricingArray = [];
        
        if (Array.isArray(manualData.pricing)) {
          pricingArray = manualData.pricing
            .filter(p => p && typeof p === "object" && !Array.isArray(p))
            .map(price => ({
              pricing_type: String(price.pricing_type || ""),
              hourly_rate: price.hourly_rate || null,
              min_hourly_rate: price.min_hourly_rate || null,
              max_hourly_rate: price.max_hourly_rate || null,
              is_default: Boolean(price.is_default)
            }));
        }

        if (pricingArray.length) {
          formData.append("pricing_input", JSON.stringify(pricingArray));
        }
      }

      // Handle file uploads
      if ("profilePicture" in files) {
        if (files.profilePicture instanceof File) {
          const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
          if (!allowedImageTypes.includes(files.profilePicture.type)) {
            throw new Error("Please upload a valid image file (JPG, PNG, GIF, WebP, or AVIF)");
          }
          formData.append("profile_picture", files.profilePicture);
        } else if (files.profilePicture === null) {
          formData.append("profile_picture", "");
        }
      }

      if ("resume" in files) {
        if (files.resume instanceof File) {
          const allowedResumeTypes = ['.pdf', '.doc', '.docx'];
          const fileExtension = '.' + files.resume.name.split('.').pop().toLowerCase();
          
          if (!allowedResumeTypes.includes(fileExtension)) {
            throw new Error("Please upload a PDF, DOC, or DOCX file for resume");
          }
          formData.append("resume", files.resume);
        } else if (files.resume === null) {
          formData.append("resume", "");
        }
      }

      const method = data.id ? 'patch' : 'post';
      const url = data.id ? `/profiles/${data.id}/` : '/profiles/';

      const response = await apiPrivate[method](url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to update profile." }
      );
    }
  }
);

// ============================================================================
// ASYNC THUNKS - PORTFOLIO OPERATIONS
// ============================================================================

// FETCH PORTFOLIO PROJECTS
export const fetchPortfolioProjects = createAsyncThunk(
  "freelancerProfile/fetchPortfolio",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiPrivate.get("/freelancer/portfolio/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to fetch portfolio." }
      );
    }
  }
);

// CREATE PORTFOLIO PROJECT
export const createPortfolioProject = createAsyncThunk(
  "freelancerProfile/createPortfolio",
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await apiPrivate.post("/freelancer/portfolio/", projectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to create portfolio project." }
      );
    }
  }
);

// UPDATE PORTFOLIO PROJECT
export const updatePortfolioProject = createAsyncThunk(
  "freelancerProfile/updatePortfolio",
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const response = await apiPrivate.patch(`/freelancer/portfolio/${id}/`, projectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to update portfolio project." }
      );
    }
  }
);

// DELETE PORTFOLIO PROJECT
export const deletePortfolioProject = createAsyncThunk(
  "freelancerProfile/deletePortfolio",
  async (id, { rejectWithValue }) => {
    try {
      await apiPrivate.delete(`/freelancer/portfolio/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to delete portfolio project." }
      );
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const freelancerProfileSlice = createSlice({
  name: "freelancerProfile",
  initialState: {
    // Profile data
    data: null,
    loading: false,
    error: null,
    successMessage: null,
    
    // Portfolio data
    portfolio: [],
    portfolioLoading: false,
    portfolioError: null,
  },
  reducers: {
    clearProfileState(state) {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
      state.portfolio = [];
      state.portfolioLoading = false;
      state.portfolioError = null;
    },
    clearError(state) {
      state.error = null;
      state.portfolioError = null;
    },
    clearSuccessMessage(state) {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========================================================================
      // PROFILE OPERATIONS
      // ========================================================================
      
      // FETCH PROFILE
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

      // CREATE PROFILE
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

      // UPDATE PROFILE
      .addCase(updateFreelancerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateFreelancerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.successMessage = "Profile updated successfully!";
      })
      .addCase(updateFreelancerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update profile.";
      })

      // ========================================================================
      // PORTFOLIO OPERATIONS
      // ========================================================================
      
      // FETCH PORTFOLIO
      .addCase(fetchPortfolioProjects.pending, (state) => {
        state.portfolioLoading = true;
        state.portfolioError = null;
      })
      .addCase(fetchPortfolioProjects.fulfilled, (state, action) => {
        state.portfolioLoading = false;
        // Ensure portfolio is always an array
        state.portfolio = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPortfolioProjects.rejected, (state, action) => {
        state.portfolioLoading = false;
        state.portfolio = []; // Reset to empty array on error
        state.portfolioError = action.payload?.message || "Failed to fetch portfolio.";
      })

      // CREATE PORTFOLIO PROJECT
      .addCase(createPortfolioProject.pending, (state) => {
        state.portfolioLoading = true;
        state.portfolioError = null;
      })
      .addCase(createPortfolioProject.fulfilled, (state, action) => {
        state.portfolioLoading = false;
        state.portfolio.push(action.payload);
        state.successMessage = "Portfolio project added successfully!";
      })
      .addCase(createPortfolioProject.rejected, (state, action) => {
        state.portfolioLoading = false;
        state.portfolioError = action.payload?.message || "Failed to create portfolio project.";
      })

      // UPDATE PORTFOLIO PROJECT
      .addCase(updatePortfolioProject.pending, (state) => {
        state.portfolioLoading = true;
        state.portfolioError = null;
      })
      .addCase(updatePortfolioProject.fulfilled, (state, action) => {
        state.portfolioLoading = false;
        const index = state.portfolio.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.portfolio[index] = action.payload;
        }
        state.successMessage = "Portfolio project updated successfully!";
      })
      .addCase(updatePortfolioProject.rejected, (state, action) => {
        state.portfolioLoading = false;
        state.portfolioError = action.payload?.message || "Failed to update portfolio project.";
      })

      // DELETE PORTFOLIO PROJECT
      .addCase(deletePortfolioProject.pending, (state) => {
        state.portfolioLoading = true;
        state.portfolioError = null;
      })
      .addCase(deletePortfolioProject.fulfilled, (state, action) => {
        state.portfolioLoading = false;
        state.portfolio = state.portfolio.filter(p => p.id !== action.payload);
        state.successMessage = "Portfolio project deleted successfully!";
      })
      .addCase(deletePortfolioProject.rejected, (state, action) => {
        state.portfolioLoading = false;
        state.portfolioError = action.payload?.message || "Failed to delete portfolio project.";
      });
  },
});

export const { 
  clearProfileState, 
  clearError, 
  clearSuccessMessage,
} = freelancerProfileSlice.actions;

export default freelancerProfileSlice.reducer;