// app/admin/layout.js
"use client";
import { useState } from "react";
import Header from "@/components/admin/Header";
import Footer from "@/components/admin/Footer";
import Sidebar from "@/components/admin/sidebar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header – fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header onMenuClick={() => setSidebarOpen((v) => !v)} />
      </div>

      {/* Body: sidebar + main */}
      <div className="flex flex-1 pt-16">
        {/*
          Sidebar
          ─ Mobile:  fixed, slides in/out via translate, sits above overlay (z-40)
          ─ Desktop: static (back in flex flow), always visible (lg:translate-x-0)
                     Width transitions are handled inside <Sidebar> itself (w-64 ↔ w-[68px])
        */}
        <div
          className={`
            fixed left-0 top-16 bottom-0 z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:static lg:z-auto lg:h-auto
          `}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/*
          Main content
          ─ ✅ FIXED: removed `lg:ml-16` — sidebar is lg:static so flex
            already constrains main to the remaining width automatically.
            The old ml-16 (64 px) was always wrong: it didn't match the
            expanded sidebar (256 px) and was unnecessary when collapsed.
        */}
        <main className="flex-1 min-w-0 relative z-10">
          <div className="p-4 lg:p-6 pb-8">{children}</div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
