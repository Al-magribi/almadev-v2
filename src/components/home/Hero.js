"use client";

import { FileDown, MessagesSquare, TrendingUp } from "lucide-react";

export default function Hero() {
  const whatsapp = () => {
    window.open("https://wa.me/6287720776871", "_blank");
  };

  return (
    <section className='relative bg-slate-950 text-white py-20 md:py-32 overflow-hidden border-b border-white/10'>
      {/* --- ANIMATED BACKGROUND --- */}
      <div className='absolute inset-0 w-full h-full'>
        {/* Blob 1: Biru Utama */}
        <div className='absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob'></div>

        {/* Blob 2: Ungu */}
        <div className='absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000'></div>

        {/* Blob 3: Indigo */}
        <div className='absolute -bottom-32 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000'></div>
      </div>

      {/* Grid Pattern Overlay (Tetap ada agar terlihat teknis) */}
      <div className='absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size:24px_24px'></div>

      {/* --- CONTENT --- */}
      <div className='container relative z-10 mx-auto px-6 text-center'>
        {/* Badge Kecil */}
        <div className='inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300 mb-6 backdrop-blur-sm'>
          <TrendingUp size={18} className='animate-pulse mr-2' />
          Upgrade Skill. Upgrade Income.
        </div>

        <h1 className='text-3xl sm:text-4xl md:text-6xl font-extrabold mb-6 tracking-tight font-sans'>
          Siap Jadi Web Developer
          <br className='hidden md:block' />
          <span className='text-blue-600'> Dalam 3 Bulan?</span>
        </h1>

        <p className='text-base sm:text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-mono'>
          Tidak perlu background IT. Kami bimbing Anda dari nol baris kode
          hingga mahir Full Stack JavaScript dengan kurikulum intensif yang
          dirancang khusus untuk pemula.
        </p>

        <div className='flex flex-col md:flex-row justify-center items-center gap-4 w-full max-w-md mx-auto md:max-w-none'>
          <button className='font-mono flex gap-2 w-full md:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-blue-500 transition shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] cursor-pointer justify-center items-center'>
            <FileDown size={20} />
            Road Map
          </button>
          <button
            onClick={whatsapp}
            className='font-mono flex gap-2 w-full md:w-auto bg-slate-800 text-white border border-slate-700 px-8 py-3.5 rounded-full font-bold hover:bg-slate-700 transition cursor-pointer justify-center items-center'
          >
            <MessagesSquare size={20} />
            Konsultasi Gratis
          </button>
        </div>
      </div>
    </section>
  );
}
