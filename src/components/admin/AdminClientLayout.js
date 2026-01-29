"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AdminClientLayout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // h-screen memaksa container tidak lebih tinggi dari layar
    <div className='h-screen flex overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300'>
      {/* Sidebar tetap di kiri karena md:static di Sidebar.js */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Area Kanan (Header + Main Content) */}
      <div className='flex-1 flex flex-col min-w-0'>
        {/* Header tetap di atas */}
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />

        {/* Hanya area ini yang boleh scroll */}
        <main className='flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth focus:outline-none'>
          <div className='max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
