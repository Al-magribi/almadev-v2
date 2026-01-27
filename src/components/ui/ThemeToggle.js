// src/components/ui/ThemeToggle.js
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react"; // Install lucide-react jika belum

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <div className='w-20 h-8 rounded bg-gray-200 dark:bg-gray-800 animate-pulse' />
    );

  return (
    <div className='flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md transition-all flex items-center gap-2 ${
          theme === "light"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
        }`}
        aria-label='Light Mode'
      >
        <Sun className='w-4 h-4' />
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md transition-all flex items-center gap-2 ${
          theme === "dark"
            ? "bg-gray-700 text-white shadow-sm"
            : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
        }`}
        aria-label='Dark Mode'
      >
        <Moon className='w-4 h-4' />
      </button>
    </div>
  );
}
