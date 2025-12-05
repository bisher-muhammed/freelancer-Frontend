// app/admin/layout.js
"use client";
import { useState } from "react";
import Header from '@/components/admin/Header';
import Footer from '@/components/admin/Footer';
import Sidebar from '@/components/admin/sidebar';


export default function AdminLayout({ children }) {
 const [sidebarOpen, setSidebarOpen] = useState(false);
 
   return (
     <div className="min-h-screen bg-gray-50 flex flex-col">
       {/* Header - fixed at top */}
       <div className="fixed top-0 left-0 right-0 z-50">
         <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
       </div>
       
       {/* Main content area with sidebar */}
       <div className="flex flex-1 pt-16 min-h-[calc(100vh-4rem)]">
         {/* Sidebar - fixed position that extends behind footer */}
         <div className={`
           fixed left-0 top-16 bottom-0 z-40 transition-transform duration-300 ease-in-out
           ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
           lg:translate-x-0 lg:static lg:z-30
         `}>
           <Sidebar onClose={() => setSidebarOpen(false)} />
         </div>
         
         {/* Overlay for mobile */}
         {sidebarOpen && (
           <div 
             className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
             onClick={() => setSidebarOpen(false)}
           />
         )}
         
         {/* Main content - with reduced left margin */}
         <main className="flex-1 lg:ml-16 relative z-10 pb-8 w-full">
           <div className="p-4 lg:p-6">
             {children}
           </div>
         </main>
       </div>
       
       {/* Footer - static at bottom */}
       <div className="relative z-40 mt-auto">
         <Footer />
       </div>
     </div>
   );
 }
 
