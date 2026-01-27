import React from "react";
import Sidebar from "@/components/student/Sidebar";

export default function StudentLayout({ children }) {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-950 flex text-gray-900 dark:text-white font-sans transition-colors duration-300'>
      {/* Sidebar (Hidden on Mobile, Visible on Desktop) */}
      <div className='hidden md:block'>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      {/* ml-64 memberikan margin kiri sebesar lebar sidebar agar konten tidak tertumpuk */}
      <main className='flex-1 md:ml-64 min-h-screen relative'>
        {/* Header Mobile (Optional - bisa ditambahkan nanti) */}

        {/* Content Wrapper */}
        <div className='p-6 md:p-8 max-w-7xl mx-auto'>{children}</div>
      </main>
    </div>
  );
}
