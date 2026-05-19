import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiPublic } from "@/lib/apiPublic";
import { apiPrivate } from "@/lib/apiPrivate";

export const sendOtp = createAsyncThunk(
  "user/sendOtp",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await apiPublic.post("send-otp/", formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to send OTP" }
      );
    }
  }
);

export const submitRegisterForm = createAsyncThunk(
  "user/submitRegisterForm",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await apiPublic.post("register/", formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Form submission failed" }
      );
    }
  }
);

export const verifyOtpAndRegister = createAsyncThunk(
  "user/verifyOtpAndRegister",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await apiPublic.post("verify-otp/", formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "OTP verification failed" }
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {

      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await apiPublic.post(
        "login/",
        {
          ...credentials,
          timezone,
        },
        {
          withCredentials: true,
        }
      );

      const { success, message, user } = res.data;

      if (!success) {
        return rejectWithValue({
          message: message || "Login failed",
        });
      }

      return {
        user,
        message,
      };

    } catch (err) {

      return rejectWithValue({
        message:
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Login failed.",
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logoutUser",
  async (_, { rejectWithValue }) => {
    try {

      await apiPrivate.post(
        "logout/",
        {},
        {
          withCredentials: true,
        }
      );

      return true;

    } catch (err) {

      return rejectWithValue({
        message: "Logout failed",
      });
    }
  }
);

export const googleLogin = createAsyncThunk(
  "user/googleLogin",
  async (token, { rejectWithValue }) => {
    try {

      const res = await apiPublic.post(
        "google-login/",
        { id_token: token },
        {
          withCredentials: true,
        }
      );

      const { success, message, user } = res.data;

      if (!success) {
        return rejectWithValue({
          message,
        });
      }

      return {
        user,
        message,
      };

    } catch (err) {

      return rejectWithValue({
        message:
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Google login failed.",
      });
    }
  }
);

const initialState = {
  user: null,
  loading: false,
  error: null,
  successMessage: null,
  otpSent: false,
  formSubmitted: false,
};

const userSlice = createSlice({
  name: "user",

  initialState,

  reducers: {

    resetStatus(state) {
      state.error = null;
      state.successMessage = null;
    },

    clearUser(state) {
      state.user = null;
    },
  },

  extraReducers: (builder) => {

    builder

      // SEND OTP
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;

        state.successMessage =
          action.payload.message ||
          "OTP sent successfully!";
      })

      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload?.message ||
          "Failed to send OTP.";
      })

      // REGISTER
      .addCase(submitRegisterForm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(submitRegisterForm.fulfilled, (state, action) => {
        state.loading = false;
        state.formSubmitted = true;

        state.successMessage =
          action.payload.message ||
          "Form submitted successfully.";
      })

      .addCase(submitRegisterForm.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload?.message ||
          "Form submission failed.";
      })

      // VERIFY OTP
      .addCase(verifyOtpAndRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(verifyOtpAndRegister.fulfilled, (state, action) => {
        state.loading = false;

        state.successMessage =
          action.payload.message ||
          "Registration successful!";

        state.otpSent = false;
        state.formSubmitted = false;
      })

      .addCase(verifyOtpAndRegister.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload?.message ||
          "OTP verification failed.";
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        state.user = action.payload.user;

        state.successMessage =
          action.payload.message ||
          "Login successful.";
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload?.message ||
          "Login failed.";
      })

      // GOOGLE LOGIN
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;

        state.user = action.payload.user;

        state.successMessage =
          action.payload.message ||
          "Google login successful.";
      })

      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload?.message ||
          "Google login failed.";
      })

      // LOGOUT
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;

        state.user = null;
        state.error = null;
        state.successMessage = null;
        state.otpSent = false;
        state.formSubmitted = false;
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;

        // still clear user locally
        state.user = null;

        state.error =
          action.payload?.message ||
          "Logout failed.";
      });
  },
});

export const {
  resetStatus,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;
