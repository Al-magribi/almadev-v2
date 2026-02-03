"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Code,
  Database,
  Hexagon,
  KeyRound,
  ShieldUser,
  TrendingUp,
} from "lucide-react";
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
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,#2563eb12,transparent_55%)] -z-10'></div>

      <div className='absolute inset-0 z-0 pointer-events-none'>
        <motion.div
          className='absolute top-6 left-6 sm:top-10 sm:left-10 text-blue-500/35'
          animate={{ y: [0, -16, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Database className='h-12 w-12 sm:h-16 sm:w-16' strokeWidth={1.2} />
        </motion.div>
        <motion.div
          className='absolute top-16 right-6 sm:top-20 sm:right-10 text-indigo-500/30'
          animate={{ y: [0, 18, 0], rotate: [0, -6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <ShieldUser className='h-14 w-14 sm:h-20 sm:w-20' strokeWidth={1.2} />
        </motion.div>
        <motion.div
          className='absolute bottom-10 left-6 sm:bottom-16 sm:left-12 text-sky-500/30'
          animate={{ y: [0, 14, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Code className='h-14 w-14 sm:h-20 sm:w-20' strokeWidth={1.2} />
        </motion.div>
        <motion.div
          className='absolute bottom-16 right-8 sm:bottom-24 sm:right-32 text-blue-400/25'
          animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Hexagon className='h-12 w-12 sm:h-20 sm:w-20' strokeWidth={1.2} />
        </motion.div>
        <motion.div
          className='absolute top-40 left-1/2 -translate-x-1/2 text-indigo-400/25'
          animate={{ y: [0, 16, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <KeyRound className='h-12 w-12 sm:h-16 sm:w-16' strokeWidth={1.2} />
        </motion.div>
      </div>

      <div className='relative z-10 max-w-6xl mx-auto px-4 text-center'>
        <motion.div {...fadeIn}>
          <span className='inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-blue-600 uppercase bg-blue-50 rounded-full'>
            <TrendingUp size={14} className='text-blue-500' />
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
