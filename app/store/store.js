"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";

import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { persistReducer, persistStore } from "redux-persist";

import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import userReducer from "./slices/userSlice";
import clientProfileReducer from "./slices/clientProfileSlice";
import freelancerProfileReducer from "./slices/freelancerProfileSlice";

/* ----------------------------------------
   FIX STORAGE FOR NEXT.JS (NO NEW MODULE)
---------------------------------------- */

const createNoopStorage = () => ({
  getItem() {
    return Promise.resolve(null);
  },
  setItem(_, value) {
    return Promise.resolve(value);
  },
  removeItem() {
    return Promise.resolve();
  },
});

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

/* ----------------------------------------
   ROOT REDUCER
---------------------------------------- */

const rootReducer = combineReducers({
  user: userReducer,
  clientProfile: clientProfileReducer,
  freelancerProfile: freelancerProfileReducer,
});

/* ----------------------------------------
   PERSIST CONFIG
---------------------------------------- */

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"],
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

/* ----------------------------------------
   STORE
---------------------------------------- */

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    }),
});

export const persistor = persistStore(store);
