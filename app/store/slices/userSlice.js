import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiPublic } from "@/lib/apiPublic";

export const sendOtp = createAsyncThunk(
  "user/sendOtp",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await apiPublic.post("send-otp/", formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to send OTP" });
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
      return rejectWithValue(err.response?.data || { message: "Form submission failed" });
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
      return rejectWithValue(err.response?.data || { message: "OTP verification failed" });
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("🌍 Detected browser timezone:", timezone);

      const res = await apiPublic.post("login/", {
        ...credentials,
        timezone,
      });

      const { success, message, data } = res.data;

      if (!success) {
        return rejectWithValue({ message: message || "Login failed" });
      }

      const { user, access, refresh } = data;

      return { user, access, refresh, message };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Login failed.";
      return rejectWithValue({ message: msg });
    }
  }
);


export const googleLogin = createAsyncThunk(
  "user/googleLogin",
  async (token, { rejectWithValue }) => {
    try {
      const res = await apiPublic.post("google-login/", { id_token: token });
      const { success, message, data } = res.data;

      if (!success) return rejectWithValue({ message });

      return { user: data.user, access: data.access, refresh: data.refresh, message };
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
  accessToken: null,
  refreshToken: null,
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
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      state.successMessage = null;
      state.otpSent = false;
      state.formSubmitted = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      }
    },
    updateAccessToken(state, action) {
      state.accessToken = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("access", action.payload);
      }
    },
  },
  extraReducers: (builder) => {
  builder
    .addCase(sendOtp.pending, (s) => { s.loading = true; s.error = null; })
    .addCase(sendOtp.fulfilled, (s, a) => {
      s.loading = false; s.otpSent = true;
      s.successMessage = a.payload.message || "OTP sent successfully!";
    })
    .addCase(sendOtp.rejected, (s, a) => {
      s.loading = false; s.error = a.payload?.message || "Failed to send OTP.";
    })

    .addCase(submitRegisterForm.pending, (s) => { s.loading = true; s.error = null; })
    .addCase(submitRegisterForm.fulfilled, (s, a) => {
      s.loading = false; s.formSubmitted = true;
      s.successMessage = a.payload.message || "Form submitted successfully.";
    })
    .addCase(submitRegisterForm.rejected, (s, a) => {
      s.loading = false; s.error = a.payload?.message || "Form submission failed.";
    })

    .addCase(verifyOtpAndRegister.pending, (s) => { s.loading = true; s.error = null; })
    .addCase(verifyOtpAndRegister.fulfilled, (s, a) => {
      s.loading = false;
      s.successMessage = a.payload.message || "Registration successful!";
      s.otpSent = false; s.formSubmitted = false;
    })
    .addCase(verifyOtpAndRegister.rejected, (s, a) => {
      s.loading = false; s.error = a.payload?.message || "OTP verification failed.";
    })

    .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
    .addCase(loginUser.fulfilled, (s, a) => {
      s.loading = false;
      s.user = a.payload.user;
      s.accessToken = a.payload.access;
      s.refreshToken = a.payload.refresh;
      s.successMessage = a.payload.message || "Login successful.";

      if (typeof window !== "undefined") {
        localStorage.setItem("access", a.payload.access);
        localStorage.setItem("refresh", a.payload.refresh);
      }
    })
    .addCase(loginUser.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload?.message || "Login failed.";
    })

    // GOOGLE LOGIN — FIXED
    .addCase(googleLogin.pending, (s) => { s.loading = true; s.error = null; })
    .addCase(googleLogin.fulfilled, (s, a) => {
      s.loading = false;
      s.user = a.payload.user;
      s.accessToken = a.payload.access;
      s.refreshToken = a.payload.refresh;
      s.successMessage = a.payload.message || "Google login successful.";

      if (typeof window !== "undefined") {
        localStorage.setItem("access", a.payload.access);
        localStorage.setItem("refresh", a.payload.refresh);
      }
    })
    .addCase(googleLogin.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload?.message || "Google login failed.";
    });
}
})


export const { logout, resetStatus, updateAccessToken } = userSlice.actions;
export default userSlice.reducer;


// why50@comfythings.com
