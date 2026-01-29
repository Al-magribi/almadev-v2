import { Database, Download, UploadCloud, HardDrive } from "lucide-react";

export default function TabBackup({ onDownload, onRestore }) {
  return (
    <div className='space-y-8 animate-in fade-in zoom-in-95 duration-300'>
      {/* SEKSI 1: DATABASE BACKUP */}
      <div className='flex flex-col md:flex-row gap-6 items-start p-6 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800'>
        <div className='p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg'>
          <Database size={24} />
        </div>
        <div className='flex-1'>
          <h3 className='font-semibold text-zinc-900 dark:text-zinc-100 text-lg'>
            Backup & Restore Database
          </h3>
          <p className='text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-4'>
            Ekspor semua data tabel dari database ke file JSON.
          </p>
          <div className='flex gap-3 mt-4'>
            <button
              onClick={onDownload}
              className='flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-violet-500 text-sm font-medium transition'
            >
              <Download size={16} /> Download JSON
            </button>
            <label className='flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-violet-500 text-sm font-medium transition cursor-pointer'>
              <UploadCloud size={16} /> Restore JSON
              <input
                type='file'
                accept='.json'
                onChange={onRestore}
                className='hidden'
              />
            </label>
          </div>
        </div>
      </div>

      {/* SEKSI 2: PUBLIC ASSETS BACKUP (TAMBAHAN BARU) */}
      <div className='flex flex-col md:flex-row gap-6 items-start p-6 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800'>
        <div className='p-3 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-lg'>
          <HardDrive size={24} />
        </div>
        <div className='flex-1'>
          <h3 className='font-semibold text-zinc-900 dark:text-zinc-100 text-lg'>
            Backup Public Assets
          </h3>
          <p className='text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-4'>
            Download folder <code>/public</code> (Gambar, Uploads, dsb) dalam
            format .ZIP.
          </p>
          <a
            href='/api/backup/public'
            target='_blank'
            className='inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm'
          >
            <Download size={16} /> Download Assets .ZIP
          </a>
        </div>
      </div>
    </div>
  );
}
