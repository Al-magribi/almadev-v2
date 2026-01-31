// components/course/tabs/landing/HeroSection.js
import React from "react";

export default function HeroSection({ hero, handleHeroChange }) {
  return (
    <section className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5'>
      <div className='flex items-center gap-3 mb-2'>
        <span className='w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm'>
          1
        </span>
        <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
          Bagian Hero (Atas)
        </h3>
      </div>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
            Headline Utama
          </label>
          <input
            value={hero?.headline || ""}
            onChange={(e) => handleHeroChange("headline", e.target.value)}
            placeholder='misal: Menjadi Desainer Pro'
            className='w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:border-violet-500'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
            Subjudul
          </label>
          <textarea
            value={hero?.customSubtitle || ""}
            onChange={(e) => handleHeroChange("customSubtitle", e.target.value)}
            rows={3}
            placeholder='Jelaskan nilai utama kursus Anda...'
            className='w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:border-violet-500 resize-none'
          />
        </div>
      </div>
    </section>
  );
}
