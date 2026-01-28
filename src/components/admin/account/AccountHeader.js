import { UserRoundCog } from "lucide-react";
import React from "react";

export default function AccountHeader({ role }) {
  return (
    <div className='flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors'>
      <div className='flex items-center gap-4 mb-4 sm:mb-0'>
        <div className='p-3 bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl hidden sm:block'>
          <UserRoundCog size={24} />
        </div>

        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight'>
            Pengaturan Akun
          </h1>
          <p className='text-gray-500 dark:text-zinc-400 mt-2'>
            Kelola informasi profil dan detail profesional Anda.
          </p>
        </div>
      </div>

      <div
        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
          role === "admin"
            ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
            : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
        }`}
      >
        {role}
      </div>
    </div>
  );
}
