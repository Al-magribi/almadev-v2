"use client";

import { AlertTriangle, X } from "lucide-react";

export default function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  isDeleting = false,
}) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity'>
      <div className='bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-800 transform transition-all scale-100'>
        {/* Header */}
        <div className='flex justify-between items-center p-5 border-b border-zinc-100 dark:border-zinc-800'>
          <h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2'>
            <AlertTriangle className='text-rose-500' size={20} />
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className='text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className='p-5'>
          <p className='text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed'>
            {description}
          </p>
        </div>

        {/* Footer Actions */}
        <div className='p-5 pt-0 flex gap-3 justify-end'>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className='px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors'
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className='px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-200 dark:shadow-rose-900/30 transition-all flex items-center gap-2'
          >
            {isDeleting ? (
              <>
                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
