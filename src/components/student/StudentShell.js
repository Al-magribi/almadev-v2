"use client";

import React, { useState } from "react";
import Sidebar from "@/components/student/Sidebar";
import StudentHeader from "@/components/student/StudentHeader";

export default function StudentShell({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log(user);

  return (
    <div className='h-screen flex overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300'>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className='flex-1 flex flex-col min-w-0'>
        <StudentHeader
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />

        <main className='flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth focus:outline-none'>
          <div className='max-w-7xl mx-auto'>{children}</div>
        </main>
      </div>
    </div>
  );
}
