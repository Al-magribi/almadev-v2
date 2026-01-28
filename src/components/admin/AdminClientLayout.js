"use client"; // Wajib ada

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AdminClientLayout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen flex bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300'>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user} // Data user diterima dari props
        />
        <main className='flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth'>
          <div className='max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
