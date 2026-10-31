import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Origin of the API server (NEXT_PUBLIC_API_URL is e.g. https://api.host/api/)
function apiOrigin() {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL).origin;
  } catch {
    return "";
  }
}

/**
 * Absolute URL for an uploaded file. The API usually returns absolute URLs
 * already; relative paths ("/media/x.png" or "x.png") are resolved against
 * the configured API origin instead of a hard-coded localhost.
 */
export function mediaUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith("/media/")) return `${apiOrigin()}${path}`;
  return `${apiOrigin()}/media/${path.replace(/^\/+/, "")}`;
}

export function formatFileSize(bytes) {
  if (bytes === 0 || bytes == null) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
