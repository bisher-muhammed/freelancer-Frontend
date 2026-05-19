"use client";

import { Provider } from "react-redux";

import { PersistGate } from "redux-persist/integration/react";

import {
  store,
  persistor,
} from "./store/store";

import {
  NotificationsProvider,
} from "@/lib/providers/NotificationsProvider";

// -------------------------------
// Providers Wrapper
// -------------------------------
export function Providers({ children }) {

  return (

    <Provider store={store}>

      <PersistGate persistor={persistor}>

        <NotificationsProvider>

          {children}

        </NotificationsProvider>

      </PersistGate>

    </Provider>
  );
}
