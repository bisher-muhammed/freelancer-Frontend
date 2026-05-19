// lib/apiPublic.js

import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export const apiPublic = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,

  withCredentials: true, 

  headers: {
    "Content-Type": "application/json",
  },
});

