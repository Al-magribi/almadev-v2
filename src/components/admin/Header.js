"use client";

import ThemeToggle from "@/components/ui/ThemeToggle";
import { Menu, Bell } from "lucide-react";

export default function Header({ toggleSidebar }) {
  return (
    <header className='h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 transition-colors duration-300'>
      <div className='flex items-center gap-4'>
        <button
          onClick={toggleSidebar}
          className='md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
        >
          <Menu size={24} />
        </button>
        <h2 className='text-lg font-bold text-zinc-800 dark:text-zinc-100 hidden sm:block'>
          Dashboard Overview
        </h2>
      </div>

      <div className='flex items-center gap-3 sm:gap-4'>
        <button className='p-2 relative rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors'>
          <Bell size={20} />
          <span className='absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-900'></span>
        </button>

        <div className='h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-1'></div>

        <ThemeToggle />

        {/* Profile Avatar with Violet Gradient */}
        <button className='flex items-center gap-2'>
          <div className='w-9 h-9 rounded-full bg-linear-to-tr from-violet-500 to-fuchsia-500 border-2 border-white dark:border-zinc-800 shadow-sm ring-2 ring-transparent hover:ring-violet-200 dark:hover:ring-violet-900 transition-all' />
        </button>
      </div>
    </header>
  );
}
