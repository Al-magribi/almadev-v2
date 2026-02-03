"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  User,
  LogOut,
  X,
} from "lucide-react";
import { logoutUser } from "@/actions/auth-action";
import Image from "next/image";

const menuItems = [
  { name: "Dashboard", href: "/online-bootcamp", icon: LayoutDashboard },
  { name: "Latihan", href: "/online-bootcamp/latihan", icon: ClipboardCheck },
  { name: "Profil Saya", href: "/online-bootcamp/profile", icon: User },
];

export default function BootcampSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-zinc-900/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none flex flex-col h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}
      >
        <div className='flex items-center justify-between h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0'>
          <Link href='/' className='flex items-center gap-3'>
            <span className='relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900'>
              <Image
                src='/logo.svg'
                alt='logo_almadev'
                width={22}
                height={22}
              />
            </span>

            <p className='text-lg font-extrabold tracking-tight text-slate-900'>
              ALMA<span className='text-blue-600'>DEV</span>
            </p>
          </Link>

          <button
            onClick={() => setIsOpen(false)}
            className='md:hidden p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500'
          >
            <X size={20} />
          </button>
        </div>

        <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/online-bootcamp" &&
                pathname.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium text-sm ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <item.icon
                    size={20}
                    className={`${
                      isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

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
