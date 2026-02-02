"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import BootcampRegistrationModal from "@/components/marketing/bootcamp/BootcampRegistrationModal";

export default function HeroSection() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };
  const [open, setOpen] = useState(false);

  return (
    <header className='relative min-h-[90vh] flex items-center justify-center bg-white overflow-hidden'>
      <div className='absolute inset-0 bg-grid-slate-100 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10'></div>
      <div className='max-w-6xl mx-auto px-4 text-center'>
        <motion.div {...fadeIn}>
          <span className='inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-blue-600 uppercase bg-blue-50 rounded-full'>
            Pendaftaran Batch 1 Telah Dibuka
          </span>
          <h1 className='text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-700'>
            Transformasi Karir Menjadi <br />
            <span className='text-blue-600'>Full Stack Web Developer</span>
          </h1>
          <p className='max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed'>
            Kuasai ekosistem JavaScript modern mulai dari HTML/CSS , React JS ,
            hingga Node.js dan Database dalam program intensif "Build & Deploy"
            bersama ALMADEV.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button
              type='button'
              onClick={() => setOpen(true)}
              className='px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform hover:-translate-y-1'
            >
              Daftar Sekarang - Rp 100.000
            </button>
          </div>
        </motion.div>
      </div>
      <BootcampRegistrationModal
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </header>
  );
}
