import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiPrivate } from "@/lib/apiPrivate";

// ----------------------------
// FETCH CLIENT PROFILE
// ----------------------------
export const fetchClientProfile = createAsyncThunk(
  "clientProfile/fetchClientProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiPrivate.get("/profile/");
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);


// ----------------------------
// UPDATE CLIENT PROFILE
// ----------------------------
// UPDATE
export const updateClientProfile = createAsyncThunk(
  "clientProfile/updateClientProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiPrivate.patch(`/profile/update_profile/`, formData, {  // note the custom action URL
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);




export const createClientProfile = createAsyncThunk(
  "clientProfile/createClientProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiPrivate.post("/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);



// ----------------------------
// SLICE
// ----------------------------
const clientProfileSlice = createSlice({
  name: "clientProfile",
  initialState: {
    data: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearProfileState(state) {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
    clearError(state) {
      state.error = null;
    },
    clearSuccessMessage(state) {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
        // Create
      .addCase(createClientProfile.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createClientProfile.fulfilled, (state, action) => {
        state.creating = false;
        state.data = action.payload;
        state.successMessage = "Profile created successfully!";
      })
      .addCase(createClientProfile.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload?.message || "Failed to create client profile.";
      })


      // Fetch
      .addCase(fetchClientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchClientProfile.rejected, (state, action) => {
        state.loading = false;
        state.data = null;
        state.error = action.payload?.message || "Failed to fetch client profile.";
      })

      // Update
      .addCase(updateClientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateClientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.successMessage = "Profile updated successfully!";
      })
      .addCase(updateClientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update client profile.";
      });
  },
});

export const { clearProfileState, clearError, clearSuccessMessage } = clientProfileSlice.actions;
export default clientProfileSlice.reducer;

