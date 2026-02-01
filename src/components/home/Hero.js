"use client";

import { FileDown, MessagesSquare, TrendingUp } from "lucide-react";

export default function Hero() {
  const whatsapp = () => {
    window.open("https://wa.me/6287720776871", "_blank");
  };

  return (
    <section className='h-screen relative flex items-center bg-slate-950 text-white overflow-hidden border-b border-white/10'>
      {/* --- ANIMATED BACKGROUND --- */}
      <div className='absolute inset-0 w-full h-full'>
        <div className='absolute -top-24 -left-10 h-80 w-80 rounded-full bg-blue-500/40 blur-3xl animate-blob'></div>
        <div className='absolute -top-16 right-0 h-72 w-72 rounded-full bg-indigo-500/40 blur-3xl animate-blob animation-delay-2000'></div>
        <div className='absolute -bottom-40 left-24 h-96 w-96 rounded-full bg-sky-400/30 blur-3xl animate-blob animation-delay-4000'></div>
      </div>

      {/* Grid Pattern Overlay (Tetap ada agar terlihat teknis) */}
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,#1e3a8a20,transparent_45%),linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[length:100%_100%,26px_26px,26px_26px]'></div>

      {/* --- CONTENT --- */}
      <div className='container relative z-10 mx-auto px-6 mt-16 lg:mt-0 h-full flex items-center'>
        <div className='grid w-full items-center gap-8 lg:grid-cols-12'>
          <div className='text-center lg:col-span-7 lg:text-left'>
            <div className='inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200 uppercase tracking-widest mb-6'>
              <TrendingUp size={14} className='text-blue-300' />
              Upgrade Skill. Upgrade Income.
            </div>

            <h1 className='text-3xl sm:text-4xl md:text-6xl font-extrabold mb-5 tracking-tight'>
              Siap Jadi Web Developer
              <br className='hidden md:block' />
              <span className='text-blue-500'> Dalam 3 Bulan?</span>
            </h1>

            <p className='text-base sm:text-lg md:text-xl text-slate-300 mb-7 max-w-2xl mx-auto lg:mx-0'>
              Tidak perlu background IT. Kami bimbing Anda dari nol baris kode
              hingga mahir Full Stack JavaScript dengan kurikulum intensif yang
              dirancang khusus untuk pemula.
            </p>

            <div className='flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3 sm:gap-4 w-full max-w-md mx-auto lg:mx-0'>
              <button className='flex gap-2 w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-blue-500 transition shadow-[0_12px_30px_-16px_rgba(37,99,235,0.9)] cursor-pointer justify-center items-center'>
                <FileDown size={18} />
                Road Map
              </button>
              <button
                onClick={whatsapp}
                className='flex gap-2 w-full sm:w-auto bg-slate-900 text-white border border-slate-700 px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition cursor-pointer justify-center items-center'
              >
                <MessagesSquare size={18} />
                Konsultasi Gratis
              </button>
            </div>
          </div>

          <div className='lg:col-span-5'>
            <div className='rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur'>
              <p className='text-xs uppercase tracking-[0.28em] text-slate-400'>
                Program Highlights
              </p>
              <h2 className='mt-3 text-xl font-semibold text-white'>
                Full Stack JavaScript Intensif
              </h2>
              <div className='mt-5 space-y-3 text-sm text-slate-300'>
                <div className='flex items-start gap-3'>
                  <span className='mt-1 h-2 w-2 rounded-full bg-blue-500'></span>
                  <p>Mentor aktif, review tugas mingguan.</p>
                </div>
                <div className='flex items-start gap-3'>
                  <span className='mt-1 h-2 w-2 rounded-full bg-blue-500'></span>
                  <p>Project real-world untuk portofolio yang kredibel.</p>
                </div>
                <div className='flex items-start gap-3'>
                  <span className='mt-1 h-2 w-2 rounded-full bg-blue-500'></span>
                  <p>Belajar terarah: roadmap, modul, dan komunitas.</p>
                </div>
              </div>

              <div className='mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-xs text-slate-200'>
                <span>Mulai dari nol</span>
                <span className='text-blue-300'>12 Minggu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
