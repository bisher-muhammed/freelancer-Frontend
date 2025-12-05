// lib/apiPrivate.js
import axios from "axios";
import { persistor } from "@/app/store/store";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/";

export const apiPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// 🔁 Attach token to every request
apiPrivate.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const access = localStorage.getItem("access");
      if (access) config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔄 Auto-refresh token on 401
apiPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle only 401 errors that haven't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");
      if (!refresh) {
        // No refresh token → clear storage and logout
        persistor.purge();
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        if (typeof window !== "undefined") window.location.replace("/login");
        return Promise.reject(error);
      }

      try {
        // Request new access token using refresh token
        const refreshResponse = await axios.post(
          `${BASE_URL}token/refresh/`,
          { refresh },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccess = refreshResponse.data.access;
        localStorage.setItem("access", newAccess);

        // Retry the original request with new token
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed → force logout
        persistor.purge();
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        if (typeof window !== "undefined") window.location.replace("/login");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

