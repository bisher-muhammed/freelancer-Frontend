// store/store.js
"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import userReducer from "./slices/userSlice";
import clientProfileReducer from "./slices/clientProfileSlice";
import freelancerProfileReducer from "./slices/freelancerProfileSlice"

// Combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
  clientProfile: clientProfileReducer,
  freelancerProfile:freelancerProfileReducer

});

// Persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // only persist user slice
  version: 1,
};

// Wrap with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);
