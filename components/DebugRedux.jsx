// components/DebugRedux.jsx
"use client";
import { useSelector } from "react-redux";

export default function DebugRedux() {
  const user = useSelector(state => state.user);
  const clientProfile = useSelector(state => state.clientProfile);

  console.log('🔍 Redux User State:', user);
  console.log('🔍 Redux ClientProfile State:', clientProfile);
  console.log('🔍 LocalStorage Access:', typeof window !== "undefined" ? localStorage.getItem("access") : 'No window');

  return null;
}
