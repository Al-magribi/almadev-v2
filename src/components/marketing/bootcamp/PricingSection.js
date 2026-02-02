export default function PricingSection() {
  return (
    <section id='daftar' className='py-24 bg-white'>
      <div className='max-w-6xl mx-auto px-4 text-center'>
        <h2 className='text-3xl font-bold mb-8 text-slate-900 italic'>
          "Build your future, Deploy your dream."
        </h2>
        <div className='bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row text-left'>
          <div className='p-12 md:w-1/2 text-white border-b md:border-b-0 md:border-r border-slate-700'>
            <h2 className='text-3xl font-bold mb-6 italic'>
              Batch 1 - Online Bootcamp
            </h2>
            <p className='text-slate-400 mb-8 leading-relaxed'>
              Jadwal Intensif: Senin - Rabu | 09.00 - 15.00 WIB via Google Meet.
              Dimulai pada 6 Juli 2026 - 23 September 2026.
            </p>
            <p className='text-sm font-medium p-4 bg-slate-800 rounded-lg border border-slate-600'>
              ⚠️ Kelas dimulai jika peserta mencapai 10 - 20 orang. Uang
              pendaftaran direfund sepenuhnya jika kuota tidak terpenuhi.
            </p>
          </div>
          <div className='p-12 md:w-1/2 bg-blue-600 text-white flex flex-col justify-center'>
            <div className='mb-6'>
              <span className='text-3xl md:text-5xl font-extrabold'>
                Rp 3.000.000
              </span>
              <p className='mt-2 opacity-80 italic'>
                Biaya Pendaftaran: Rp 100.000
              </p>
            </div>
            <button className='w-full py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-slate-100 transition-all text-lg'>
              Amankan Slot Batch 1
            </button>
            <p className='mt-4 text-xs text-center opacity-70'>
              Pelunasan dilakukan 2 minggu sebelum kelas dimulai.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
