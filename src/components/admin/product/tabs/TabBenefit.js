"use client";

import { Check, Plus, X } from "lucide-react";
import { motion } from "framer-motion";

export default function TabBenefit({ benefits = [], setProduct }) {
  const safeBenefits = Array.isArray(benefits) ? benefits : [];

  const addBenefit = () => {
    setProduct((prev) => ({
      ...prev,
      benefits: [...(Array.isArray(prev?.benefits) ? prev.benefits : []), ""],
    }));
  };

  const updateBenefit = (index, value) => {
    const nextBenefits = [...safeBenefits];
    nextBenefits[index] = value;
    setProduct((prev) => ({ ...prev, benefits: nextBenefits }));
  };

  const removeBenefit = (index) => {
    const nextBenefits = safeBenefits.filter(
      (_, currentIndex) => currentIndex !== index,
    );
    setProduct((prev) => ({ ...prev, benefits: nextBenefits }));
  };

  return (
    <motion.div
      key='benefit'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className='max-w-3xl mx-auto space-y-8'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>
            Benefit Produk
          </h2>
          <p className='text-zinc-500 mt-2'>
            Tulis poin manfaat utama yang akan tampil di landing page produk.
          </p>
        </div>

        <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 shadow-sm overflow-hidden'>
          <div className='p-6 bg-sky-50/60 border-b border-zinc-100'>
            <h3 className='font-semibold text-sky-900'>Yang didapat pembeli</h3>
          </div>

          {safeBenefits.length === 0 ? (
            <div className='px-6 py-8 text-sm text-zinc-500'>
              Belum ada benefit. Tambahkan poin manfaat agar tampil di landing page produk.
            </div>
          ) : (
            <ul className='divide-y divide-zinc-100'>
              {safeBenefits.map((benefit, index) => (
                <li
                  key={index}
                  className='group flex items-start gap-4 p-5 hover:bg-zinc-50 transition-colors'
                >
                  <div className='mt-1 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200'>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <div className='flex-1'>
                    <input
                      value={benefit}
                      onChange={(event) =>
                        updateBenefit(index, event.target.value)
                      }
                      className='w-full bg-transparent border-none p-0 text-sm text-zinc-700 focus:ring-0 placeholder:text-zinc-300 font-medium'
                      placeholder='misal: File siap pakai untuk kebutuhan client'
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => removeBenefit(index)}
                    className='p-2 text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all'
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className='p-4 bg-zinc-50 border-t border-zinc-100'>
            <button
              type='button'
              onClick={addBenefit}
              className='flex items-center gap-2 text-sm font-semibold text-sky-600 hover:bg-sky-100 px-4 py-2 rounded-lg transition-all'
            >
              <Plus size={16} />
              Tambah Benefit
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
