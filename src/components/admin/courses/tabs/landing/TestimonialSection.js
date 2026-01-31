import React from "react";
import { MessageSquareQuote, User, Trash2, Star, Plus } from "lucide-react";

export default function TestimonialSection({
  items,
  addTestimonial,
  removeTestimonial,
  updateTestimonial,
}) {
  return (
    <section className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <span className='w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm'>
            3
          </span>
          <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
            Testimoni Siswa
          </h3>
        </div>
        <button
          onClick={addTestimonial}
          className='flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg'
        >
          <Plus size={14} /> Tambah
        </button>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {items?.map((testi, i) => (
          <div
            key={i}
            className='p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/50'
          >
            <div className='flex justify-between mb-3'>
              <MessageSquareQuote size={18} className='text-violet-600' />
              <button
                onClick={() => removeTestimonial(i)}
                className='text-zinc-300 hover:text-rose-500'
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className='space-y-3'>
              <div className='grid grid-cols-2 gap-3'>
                <div className='flex items-center gap-2 bg-white dark:bg-zinc-950 border border-zinc-200 rounded-lg px-2 py-1.5'>
                  <User size={14} className='text-zinc-400' />
                  <input
                    value={testi.name}
                    onChange={(e) =>
                      updateTestimonial(i, "name", e.target.value)
                    }
                    placeholder='Nama'
                    className='w-full text-xs bg-transparent border-none focus:outline-none focus:ring-0'
                  />
                </div>
                <input
                  value={testi.role}
                  onChange={(e) => updateTestimonial(i, "role", e.target.value)}
                  placeholder='Role'
                  className='text-xs bg-white dark:bg-zinc-950 border border-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-0'
                />
              </div>
              <textarea
                value={testi.comment}
                onChange={(e) =>
                  updateTestimonial(i, "comment", e.target.value)
                }
                rows={2}
                placeholder='Komentar'
                className='w-full text-sm bg-white dark:bg-zinc-950 border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-0'
              />
              <div className='flex gap-1'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => updateTestimonial(i, "rating", star)}
                    className={
                      testi.rating >= star ? "text-yellow-400" : "text-zinc-300"
                    }
                  >
                    <Star
                      size={14}
                      fill={testi.rating >= star ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
