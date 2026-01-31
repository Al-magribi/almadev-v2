"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function AdminClientLayout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname(); // Digunakan sebagai key agar animasi terpicu tiap pindah route

  return (
    <div className='h-screen flex overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300'>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className='flex-1 flex flex-col min-w-0'>
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />

        {/* Container Utama untuk Scroll */}
        <main className='flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth focus:outline-none'>
          <div className='max-w-7xl mx-auto'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={pathname} // Memaksa re-render animasi saat path berubah
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
