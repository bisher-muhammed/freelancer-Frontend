// app/freelancer/layout.js
"use client";
import { useState } from "react";
import FreelanceHeader from '../../components/freelancer/Header';
import FreelanceFooter from '../../components/freelancer/Footer';
import Sidebar from '../../components/freelancer/Sidebar';

export default function ClientLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <FreelanceHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      <div className="flex flex-1 pt-16 min-h-[calc(100vh-4rem)]">
        <div
          className={`
            fixed left-0 top-16 bottom-0 z-40 transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:static lg:z-auto lg:transform-none
          `}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 relative pb-8">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      <div className="relative z-40 mt-auto">
        <FreelanceFooter />
      </div>
    </div>
  );
}
