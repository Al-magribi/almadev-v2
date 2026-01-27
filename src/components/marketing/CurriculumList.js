"use client";

import { useState } from "react";
import { ChevronDown, PlayCircle, ChevronUp } from "lucide-react";

export default function CurriculumList({ curriculum }) {
  const [showAll, setShowAll] = useState(false);

  // Jika data kosong/undefined, return null
  if (!curriculum || curriculum.length === 0) {
    return (
      <div className='text-center py-10 bg-white border border-dashed border-slate-300 rounded-xl text-slate-500'>
        Kurikulum sedang disusun oleh instruktur.
      </div>
    );
  }

  // Tentukan item mana yang ditampilkan
  const initialLimit = 5;
  const visibleItems = showAll ? curriculum : curriculum.slice(0, initialLimit);
  const hasMore = curriculum.length > initialLimit;

  return (
    <div className='space-y-4'>
      {/* LIST MODULES */}
      {visibleItems.map((module, idx) => (
        <details
          key={idx}
          className='group bg-white rounded-xl border border-slate-200 overflow-hidden open:ring-2 open:ring-violet-500/20 open:border-violet-500 transition-all duration-300'
        >
          <summary className='flex justify-between items-center p-6 cursor-pointer list-none select-none hover:bg-slate-50 transition-colors'>
            <div className='flex items-center gap-4'>
              <span className='flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold group-open:bg-violet-600 group-open:text-white transition-colors'>
                {idx + 1}
              </span>
              <h3 className='font-semibold text-lg text-slate-800 text-left'>
                {module.title}
              </h3>
            </div>
            <ChevronDown className='text-slate-400 group-open:rotate-180 transition-transform duration-300 shrink-0 ml-4' />
          </summary>

          <div className='px-6 pb-6 pt-0 border-t border-slate-100'>
            <ul className='space-y-3 mt-4'>
              {module.lessons?.map((lesson, lIdx) => (
                <li
                  key={lIdx}
                  className='flex items-center justify-between text-sm text-slate-600 pl-12 py-1'
                >
                  <div className='flex items-center gap-3'>
                    <PlayCircle
                      size={16}
                      className='text-violet-500 shrink-0'
                    />
                    <span>{lesson.title}</span>
                  </div>
                  <span className='text-slate-400 text-xs shrink-0 ml-4'>
                    {lesson.duration || "10m"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </details>
      ))}

      {/* TOMBOL SHOW MORE / LESS */}
      {hasMore && (
        <div className='pt-4 flex justify-center'>
          <button
            onClick={() => setShowAll(!showAll)}
            className='flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold text-sm hover:border-violet-500 hover:text-violet-600 hover:bg-violet-50 transition-all shadow-sm'
          >
            {showAll ? (
              <>
                <ChevronUp size={16} /> Tampilkan Lebih Sedikit
              </>
            ) : (
              <>
                <ChevronDown size={16} /> Tampilkan{" "}
                {curriculum.length - initialLimit} Materi Lainnya
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
