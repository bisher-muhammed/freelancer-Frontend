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

// ─────────────────────────────────────────────
// Automatic pagination
// ─────────────────────────────────────────────
// List endpoints are paginated (20 per page) but most pages treat the
// response as the complete list, silently dropping everything after the
// first page. For GET requests that do not ask for a specific page, the
// remaining pages are fetched and merged into `results`. Requests that pass
// `page` / `page_size` (pages with their own pagination UI) are untouched.
const MAX_AUTO_PAGES = 50;

const asksForSpecificPage = (config) => {
  const params = config.params;
  if (params instanceof URLSearchParams) {
    if (params.has("page") || params.has("page_size")) return true;
  } else if (params && (params.page !== undefined || params.page_size !== undefined)) {
    return true;
  }
  return /[?&](page|page_size)=/.test(config.url || "");
};

const isPaginatedList = (data) =>
  data !== null &&
  typeof data === "object" &&
  !Array.isArray(data) &&
  Array.isArray(data.results) &&
  "next" in data &&
  "count" in data;

async function withAllPages(response) {
  const { config, data } = response;

  if (
    (config.method || "get").toLowerCase() !== "get" ||
    config._singlePage ||
    !isPaginatedList(data) ||
    !data.next ||
    asksForSpecificPage(config)
  ) {
    return response;
  }

  let results = [...data.results];
  let next = data.next;
  let page = 2;

  while (next && page <= MAX_AUTO_PAGES) {
    const params =
      config.params instanceof URLSearchParams
        ? Object.fromEntries(config.params)
        : { ...(config.params || {}) };

    const res = await apiPrivate.request({
      ...config,
      params: { ...params, page },
      _singlePage: true,
    });

    results = results.concat(res.data.results || []);
    next = res.data.next;
    page += 1;
  }

  return {
    ...response,
    data: { ...data, results, next: null, previous: null },
  };
}

// Several requests can fail with 401 at once when the access cookie expires;
// share one refresh call between them.
let refreshPromise = null;

const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${BASE_URL}refresh-token/`, {}, { withCredentials: true })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

apiPrivate.interceptors.response.use(

  (response) => withAllPages(response),

  async (error) => {

    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true;

      try {

        await refreshSession();

        return apiPrivate(originalRequest);

      } catch (refreshError) {

        // DO NOT IMPORT STORE/PERSISTOR HERE

        if (typeof window !== "undefined") {

          // Optional cleanup
          localStorage.clear();

          // Avoid a reload loop when already on the login page
          if (!window.location.pathname.startsWith("/login")) {
            window.location.replace("/login");
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);