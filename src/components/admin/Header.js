"use client";

import ThemeToggle from "@/components/ui/ThemeToggle";
import { Menu, Bell } from "lucide-react";

const getInitial = (name) => {
  if (!name) return "U";
  const parts = String(name).trim().split(" ");
  const first = parts[0]?.[0] || "";
  const second = parts.length > 1 ? parts[1]?.[0] : "";
  return (first + second).toUpperCase();
};

export default function Header({ toggleSidebar, user }) {
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
        <div className='h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-1'></div>

        <ThemeToggle />

        {/* Profile Avatar with Violet Gradient */}
        <button className='flex items-center gap-2'>
          {user?.avatar ? (
            // OPSI 1: Jika ada Avatar
            <img
              src={user.avatar}
              alt={user.name || "User"}
              className='w-9 h-9 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm ring-2 ring-transparent hover:ring-violet-200 dark:hover:ring-violet-900 transition-all'
            />
          ) : (
            // OPSI 2: Jika tidak ada Avatar (Tampilkan Inisial)
            <div className='w-9 h-9 rounded-full bg-linear-to-tr from-violet-500 to-fuchsia-500 border-2 border-white dark:border-zinc-800 shadow-sm ring-2 ring-transparent hover:ring-violet-200 dark:hover:ring-violet-900 transition-all flex items-center justify-center text-white font-bold text-sm'>
              {getInitial(user?.name)}
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
