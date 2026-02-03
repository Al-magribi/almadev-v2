"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, Sparkles } from "lucide-react";

export default function BootcampLatihanPage() {
  return (
    <motion.div
      className='space-y-6'
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm'>
        <div className='flex items-center gap-3 text-emerald-600'>
          <ClipboardCheck className='w-6 h-6' />
          <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>
            Latihan Bootcamp
          </h1>
        </div>
        <p className='text-sm text-zinc-500 dark:text-zinc-400 mt-3 max-w-2xl'>
          Tempat untuk mengerjakan latihan dan tugas bootcamp. Kami sedang
          menyiapkan pengalaman latihan yang lebih terstruktur.
        </p>
      </div>

      <div className='bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-100 dark:border-emerald-800/40 rounded-2xl p-6 flex items-center gap-4'>
        <div className='h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center'>
          <Sparkles className='w-6 h-6' />
        </div>
        <div>
          <p className='text-sm font-semibold text-emerald-700 dark:text-emerald-200'>
            Coming soon
          </p>
          <p className='text-sm text-zinc-600 dark:text-zinc-300 mt-1'>
            Nantikan modul latihan, rubrik penilaian, dan pelacakan progress
            secara realtime.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
