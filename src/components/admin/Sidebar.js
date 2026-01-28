"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/actions/auth-action"; // Pastikan path import sesuai lokasi file Anda
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Package,
  UserCircle,
  Settings,
  CreditCard,
  X,
  GraduationCap,
  LogOut, // Import icon LogOut
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { name: "Kursus", icon: BookOpen, href: "/admin/courses" },
  { name: "Produk Digital", icon: Package, href: "/admin/products" },
  { name: "Peserta", icon: Users, href: "/admin/participants" },
  { name: "Pesan", icon: Users, href: "/admin/messages" },
  { name: "Transaksi", icon: CreditCard, href: "/admin/transactions" },
  { name: "Pengaturan", icon: Settings, href: "/admin/settings" },
  { name: "Akun", icon: UserCircle, href: "/admin/account" },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();

  // Handler untuk Logout
  const handleLogout = async () => {
    // Bisa tambahkan konfirmasi jika perlu: if (!confirm("Keluar?")) return;
    await logoutUser();
  };

  return (
    <>
      {/* Overlay Mobile */}
      <div
        className={`fixed inset-0 z-20 bg-zinc-900/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 
          bg-white dark:bg-zinc-900 
          border-r border-zinc-200 dark:border-zinc-800 
          transform transition-transform duration-300 ease-in-out
          shadow-2xl md:shadow-none flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:inset-auto
        `}
      >
        <div className='flex items-center justify-between h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0'>
          <div className='flex items-center gap-2 text-violet-600 dark:text-violet-400'>
            <GraduationCap size={24} />
            <span className='text-xl font-bold tracking-tight'>LMS Admin</span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className='md:hidden p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500'
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List - Menggunakan flex-1 agar mengisi ruang kosong */}
        <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium text-sm ${
                    isActive
                      ? "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <item.icon
                    size={20}
                    className={`${
                      isActive
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* --- TOMBOL LOGOUT (Fixed at Bottom) --- */}
        <div className='p-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0'>
          <button
            onClick={handleLogout}
            className='w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 group'
          >
            <LogOut
              size={20}
              className='text-red-500 dark:text-red-400 group-hover:text-red-600'
            />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
