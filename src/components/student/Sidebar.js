"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Package,
  Receipt,
  User,
  LogOut,
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { logoutUser } from "@/actions/auth-action";

const menuItems = [
  { name: "Dashboard", href: "/student", icon: LayoutDashboard },
  { name: "Kursus Saya", href: "/student/my-courses", icon: BookOpen },
  { name: "Produk Saya", href: "/student/my-products", icon: Package },
  { name: "Transaksi", href: "/student/transactions", icon: Receipt },
  { name: "Profil Saya", href: "/student/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    // UBAH 1: bg-white untuk light, dark:bg-gray-900 untuk dark
    // UBAH 2: border-gray-200 untuk light, dark:border-gray-800 untuk dark
    <aside className='w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col fixed left-0 top-0 z-50 transition-colors duration-300'>
      {/* Logo Area */}
      <div className='p-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white'>
            A
          </div>
          {/* UBAH 3: text-gray-900 (hitam) untuk light, dark:text-white untuk dark */}
          <span className='text-xl font-bold text-gray-900 dark:text-white tracking-tight'>
            AlmaDev
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${
                  isActive
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white"
                }`}
              />
              <span className='font-medium text-sm'>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Area dengan Theme Toggle */}
      <div className='p-4 border-t border-gray-200 dark:border-gray-800 space-y-4'>
        {/* Masukkan Tombol Toggle Disini */}
        <div className='flex items-center justify-between px-4'>
          <span className='text-sm font-medium text-gray-500 dark:text-gray-400'>
            Tema
          </span>
          <ThemeToggle />
        </div>

        <button
          onClick={handleLogout}
          className='flex w-full items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 rounded-xl transition-all'
        >
          <LogOut size={20} className='w-5 h-5' />
          <span className='font-medium text-sm'>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
