import React from "react";
import { HelpCircle, Trash2, Plus } from "lucide-react";

export default function FaqSection({ items, addFaq, removeFaq, updateFaq }) {
  return (
    <section className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <span className='w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm'>
            4
          </span>
          <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
            FAQ
          </h3>
        </div>
        <button
          onClick={addFaq}
          className='flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg'
        >
          <Plus size={14} /> Tambah
        </button>
      </div>
      <div className='space-y-4'>
        {items?.map((faq, i) => (
          <div
            key={i}
            className='flex gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50'
          >
            <HelpCircle size={20} className='mt-1 text-violet-400' />
            <div className='flex-1 space-y-2'>
              <input
                value={faq.question}
                onChange={(e) => updateFaq(i, "question", e.target.value)}
                placeholder='Pertanyaan...'
                className='w-full font-medium bg-transparent border-b border-zinc-200 text-sm focus:outline-none focus:ring-0'
              />
              <textarea
                value={faq.answer}
                onChange={(e) => updateFaq(i, "answer", e.target.value)}
                rows={2}
                placeholder='Jawaban...'
                className='w-full text-sm text-zinc-600 bg-transparent border-none p-0 focus:outline-none focus:ring-0 resize-none'
              />
            </div>
            <button
              onClick={() => removeFaq(i)}
              className='text-zinc-300 hover:text-rose-500'
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
