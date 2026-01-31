import React from "react";
import {
  LayoutGrid,
  Trash2,
  Upload,
  Link as LinkIcon,
  Plus,
} from "lucide-react";

export default function GallerySection({
  items,
  addProject,
  removeProject,
  updateProject,
  handleMultipleImageUpload,
  removeProjectImage,
}) {
  return (
    <section className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <span className='w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm'>
            5
          </span>
          <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
            Gallery / Project
          </h3>
        </div>
        <button
          onClick={addProject}
          className='flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg transition-transform active:scale-95'
        >
          <Plus size={14} /> Tambah Project
        </button>
      </div>

      <div className='grid gap-6'>
        {items?.map((project, i) => (
          <div
            key={i}
            className='p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm'
          >
            {/* Header Project */}
            <div className='flex justify-between items-start mb-4 border-b pb-3 border-zinc-100 dark:border-zinc-800'>
              <div className='flex items-center gap-2 text-violet-600'>
                <LayoutGrid size={18} />
                <span className='text-xs font-bold uppercase text-zinc-400'>
                  Project #{i + 1}
                </span>
              </div>
              <button
                onClick={() => removeProject(i)}
                className='text-zinc-300 hover:text-rose-500 transition-colors'
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
              {/* Sisi Kiri: Detail Text */}
              <div className='space-y-4'>
                <div>
                  <label className='text-[10px] font-bold uppercase text-zinc-400 ml-1'>
                    Judul
                  </label>
                  <input
                    value={project.title}
                    onChange={(e) => updateProject(i, "title", e.target.value)}
                    placeholder='Judul Project'
                    className='w-full font-bold text-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 transition-all'
                  />
                </div>

                <div>
                  <label className='text-[10px] font-bold uppercase text-zinc-400 ml-1'>
                    Link Project
                  </label>
                  <div className='relative'>
                    <div className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'>
                      <LinkIcon size={14} />
                    </div>
                    <input
                      value={project.link || ""}
                      onChange={(e) => updateProject(i, "link", e.target.value)}
                      placeholder='https://github.com/username/project'
                      className='w-full text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-violet-500 transition-all'
                    />
                  </div>
                </div>

                <div>
                  <label className='text-[10px] font-bold uppercase text-zinc-400 ml-1'>
                    Deskripsi
                  </label>
                  <textarea
                    value={project.description}
                    onChange={(e) =>
                      updateProject(i, "description", e.target.value)
                    }
                    rows={3}
                    placeholder='Ceritakan singkat tentang project ini...'
                    className='w-full text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-violet-500 transition-all'
                  />
                </div>
              </div>

              {/* Sisi Kanan: Upload Media */}
              <div className='space-y-3'>
                <label className='cursor-pointer flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 hover:text-violet-500 hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-500/5 transition-all'>
                  <Upload size={24} />
                  <span className='text-xs font-bold'>
                    Upload Gambar Project
                  </span>
                  <input
                    type='file'
                    className='hidden'
                    accept='image/*'
                    multiple
                    onChange={(e) => handleMultipleImageUpload(e, i)}
                  />
                </label>

                {/* Grid Preview Gambar */}
                <div className='grid grid-cols-3 gap-2'>
                  {project.images?.map((imgUrl, imgIndex) => (
                    <div
                      key={imgIndex}
                      className='relative aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 group'
                    >
                      <img
                        src={imgUrl}
                        alt=''
                        className='w-full h-full object-cover'
                      />
                      <button
                        onClick={() => removeProjectImage(i, imgIndex)}
                        className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity'
                      >
                        <Trash2 size={16} className='text-white' />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items?.length === 0 && (
        <div className='text-center py-10 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl'>
          <p className='text-zinc-400 text-sm'>
            Belum ada project yang ditambahkan.
          </p>
        </div>
      )}
    </section>
  );
}
