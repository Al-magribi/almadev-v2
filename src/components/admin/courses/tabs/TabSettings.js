import { Image as ImageIcon, Upload, AlertOctagon } from "lucide-react";

export default function TabSettings({
  course,
  setCourse,
  newImageFile,
  setNewImageFile,
}) {
  // Handler perubahan input teks biasa
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));
  };

  // Handler pilih file gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
    }
  };

  return (
    <div className='max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      {/* INFORMASI DASAR */}
      <section className='space-y-5'>
        <div className='flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800'>
          <h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100'>
            Informasi Dasar
          </h3>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <label className='text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
              Judul Kursus
            </label>
            <input
              name='name'
              value={course.name}
              onChange={handleChange}
              className='w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm'
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
              Harga (IDR)
            </label>
            <div className='relative'>
              <span className='absolute left-4 top-2.5 text-zinc-400 text-sm font-medium'>
                Rp
              </span>
              <input
                type='number'
                name='price'
                value={course.price}
                onChange={handleChange}
                className='w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm'
              />
            </div>
          </div>

          {/* FITUR VIDEO YOUTUBE */}
          <div className='col-span-2 space-y-2'>
            <label className='text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
              Link Video Preview (YouTube)
            </label>
            <input
              name='video'
              placeholder='https://youtube.com/watch?v=...'
              value={course.video || ""}
              onChange={handleChange}
              className='w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm'
            />
            <p className='text-xs text-zinc-500'>
              Masukkan URL lengkap YouTube.
            </p>
          </div>

          <div className='col-span-2 space-y-2'>
            <label className='text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
              Deskripsi
            </label>
            <textarea
              name='description'
              rows={5}
              value={course.description}
              onChange={handleChange}
              className='w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm resize-none'
            />
          </div>
        </div>
      </section>

      {/* MEDIA GAMBAR */}
      <section className='space-y-5'>
        <div className='flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800'>
          <h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100'>
            Media Kursus
          </h3>
        </div>

        <div className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-8 items-start'>
          <div className='w-full md:w-72 aspect-video bg-zinc-100 dark:bg-zinc-950 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden relative'>
            {/* Logic Preview: Prioritaskan file baru, jika tidak ada pakai gambar dari DB */}
            {newImageFile ? (
              <img
                src={URL.createObjectURL(newImageFile)}
                alt='Preview'
                className='w-full h-full object-cover'
              />
            ) : course.image ? (
              <img
                src={course.image}
                alt='Thumbnail'
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='text-center'>
                <ImageIcon className='h-10 w-10 text-zinc-300 mx-auto mb-2' />
                <span className='text-xs text-zinc-400'>Belum ada gambar</span>
              </div>
            )}
          </div>

          <div className='flex-1 space-y-4'>
            <div>
              <h4 className='font-medium text-zinc-900 dark:text-zinc-100'>
                Thumbnail Image
              </h4>
              <p className='text-sm text-zinc-500 mt-1 leading-relaxed'>
                Upload gambar cover kursus di sini. Disarankan ukuran 1200x800
                pixel.
              </p>
            </div>
            <div className='flex gap-3'>
              <label className='flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 cursor-pointer transition-all'>
                <Upload size={16} />
                Pilih File
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                  className='hidden'
                />
              </label>
              {newImageFile && (
                <button
                  onClick={() => setNewImageFile(null)}
                  className='px-4 py-2 text-rose-600 text-sm font-medium'
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ZONE BAHAYA */}
      <section className='pt-6'>
        <div className='bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl p-6 flex items-start justify-between gap-6'>
          <div className='space-y-1'>
            <h4 className='text-rose-700 dark:text-rose-400 font-bold flex items-center gap-2'>
              <AlertOctagon size={18} />
              Hapus Kursus
            </h4>
            <p className='text-sm text-rose-600/80 dark:text-rose-400/70'>
              Tindakan ini tidak dapat dibatalkan. Semua data akan hilang
              selamanya.
            </p>
          </div>
          <button className='px-5 py-2.5 bg-white border border-rose-200 text-rose-600 text-sm font-bold rounded-lg hover:bg-rose-600 hover:text-white transition-all'>
            Hapus Kursus
          </button>
        </div>
      </section>
    </div>
  );
}
