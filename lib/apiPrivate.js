// lib/apiPrivate.js

import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("API URL not configured");
}

export const apiPrivate = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiPrivate.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true;

      try {

        await axios.post(
          `${BASE_URL}refresh-token/`,
          {},
          {
            withCredentials: true,
          }
        );

        return apiPrivate(originalRequest);

      } catch (refreshError) {

        // DO NOT IMPORT STORE/PERSISTOR HERE

        if (typeof window !== "undefined") {

          // Optional cleanup
          localStorage.clear();

          window.location.replace("/login");
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);