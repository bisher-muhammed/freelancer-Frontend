// lib/apiPrivate.js

import axios from "axios";
import { persistor } from "@/app/store/store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("API URL not configured");
}

export const apiPrivate = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // IMPORTANT
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto refresh access token using HttpOnly refresh cookie
apiPrivate.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite retry loop
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Browser automatically sends refresh cookie
        await axios.post(
          `${BASE_URL}refresh-token/`,
          {},
          {
            withCredentials: true,
          }
        );

        // Retry original request
        return apiPrivate(originalRequest);

      } catch (refreshError) {

        // Refresh failed -> logout user
        persistor.purge();

        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);