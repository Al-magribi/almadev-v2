"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  Banknote,
  BarChart3,
  BookOpenCheck,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Landmark,
  MessageCircle,
  QrCode,
  School,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  X,
} from "lucide-react";

const defaultWhatsappNumber = "6287720776871";
const contacts = {
  indah: "6281382221393",
  fery: "6281211643087",
};

const whatsappText = encodeURIComponent(
  "Halo ALMADEV, saya ingin konsultasi penawaran aplikasi Educore.",
);

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const heroStats = [
  { label: "Modul Inti", value: "4+" },
  { label: "Skema Lisensi", value: "1 Sekolah" },
  { label: "Biaya Langganan", value: "0" },
];

const featureGroups = [
  {
    icon: BrainCircuit,
    title: "Smart CBT & AI Assistant",
    accent: "text-blue-600 bg-blue-50 border-blue-100",
    items: [
      "AI Question Generator untuk membuat bank soal berbagai mata pelajaran dalam beberapa klik.",
      "AI Essay Grader membantu koreksi esai otomatis dengan analisis cerdas.",
      "Mendukung pilihan ganda tunggal, multi, menjodohkan, uraian singkat, dan esai.",
      "Soal berbasis gambar dan audio untuk ujian bahasa atau praktik.",
    ],
  },
  {
    icon: WalletCards,
    title: "Keuangan & Tabungan Digital",
    accent: "text-emerald-600 bg-emerald-50 border-emerald-100",
    items: [
      "Tabungan siswa untuk membangun kebiasaan menabung sejak dini.",
      "Kas kelas yang transparan dan mudah dipantau oleh wali kelas.",
      "Pembayaran SPP cashless via bank dan QRIS tanpa antre di sekolah.",
      "Laporan arus kas lintas periode untuk membaca kesehatan keuangan sekolah.",
    ],
  },
  {
    icon: BookOpenCheck,
    title: "Monitoring Tahfidz Al-Quran",
    accent: "text-amber-600 bg-amber-50 border-amber-100",
    items: [
      "Database Juz, Surat, dan Ayat yang terstruktur rapi.",
      "Progress tracker setoran harian dan grafik pencapaian target siswa.",
      "Dashboard wali murid untuk memantau progres hafalan anak secara langsung.",
    ],
  },
  {
    icon: ClipboardCheck,
    title: "Administrasi & LMS Lengkap",
    accent: "text-rose-600 bg-rose-50 border-rose-100",
    items: [
      "Presensi digital guru dan siswa yang terhubung ke laporan bulanan.",
      "Manajemen poin prestasi dan pelanggaran siswa secara objektif.",
      "Struktur data Dapodik-ready untuk memudahkan operator sekolah.",
      "Jurnal mengajar dan jadwal piket yang terdokumentasi rapi.",
    ],
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Aset Milik Sendiri",
    text: "Skema 1 source code untuk 1 sekolah. Sekolah memegang kendali penuh atas sistemnya.",
  },
  {
    icon: BadgeDollarSign,
    title: "Investasi Terjangkau",
    text: "One-time payment untuk ekosistem sekolah yang lengkap tanpa biaya bulanan.",
  },
  {
    icon: Server,
    title: "Fleksibel Online atau Offline",
    text: "Dapat dipasang di server lokal maupun cloud sesuai kesiapan infrastruktur sekolah.",
  },
];

const modules = [
  { icon: Bot, label: "AI Assistant" },
  { icon: QrCode, label: "QRIS Payment" },
  { icon: Landmark, label: "Bank Transfer" },
  { icon: FileText, label: "LMS & Jurnal" },
  { icon: Users, label: "Wali Murid" },
  { icon: BarChart3, label: "Laporan" },
];

const educoreGalleryImages = Array.from({ length: 21 }, (_, index) => {
  const number = index + 1;
  return {
    src: `/uploads/educore/${number}.png`,
    alt: `Tampilan Educore ${number}`,
  };
});

function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, amount: 0.4 }}
      variants={fadeUp}
      transition={{ duration: 0.55 }}
      className='mx-auto max-w-3xl text-center'
    >
      <p className='text-xs font-bold uppercase tracking-[0.32em] text-blue-600'>
        {eyebrow}
      </p>
      <h2 className='mt-3 text-3xl font-extrabold tracking-tight text-slate-950 md:text-5xl'>
        {title}
      </h2>
      <p className='mt-5 text-base leading-8 text-slate-600 md:text-lg'>
        {description}
      </p>
    </motion.div>
  );
}

function GallerySection({ images }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];
  const count = images.length;

  const close = useCallback(() => setActiveIndex(null), []);

  const goPrev = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return 0;
      return (current - 1 + count) % count;
    });
  }, [count]);

  const goNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return 0;
      return (current + 1) % count;
    });
  }, [count]);

  useEffect(() => {
    if (activeIndex === null) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, close, goNext, goPrev]);

  return (
    <section id='galeri' className='bg-slate-50 px-4 py-20 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-6xl'>
        <SectionHeading
          eyebrow='Galeri'
          title='Cuplikan tampilan Educore'
          description='Berikut beberapa contoh halaman utama yang biasa dipakai guru, operator, dan wali murid.'
        />

        <div className='mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
          {images.map((image, index) => (
            <motion.button
              key={image.src}
              type='button'
              onClick={() => setActiveIndex(index)}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className='group rounded-lg border border-slate-200 bg-white p-2 text-left shadow-sm transition hover:shadow-xl hover:shadow-slate-200/70'
            >
              <div className='relative aspect-[4/3] overflow-hidden rounded-md bg-slate-100'>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
                  className='object-cover transition duration-300 group-hover:scale-[1.03]'
                />
              </div>
              <div className='mt-2 flex items-center justify-between gap-2'>
                <p className='text-xs font-semibold text-slate-600'>
                  {image.alt}
                </p>
                <span className='text-xs font-bold text-slate-400'>
                  {index + 1}/{count}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeImage ? (
          <motion.div
            className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              className='relative w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-2xl shadow-slate-950/60'
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className='flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white'>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-bold'>{activeImage.alt}</p>
                  <p className='text-xs font-semibold text-white/60'>
                    {activeIndex + 1} dari {count}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={close}
                  className='inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white transition hover:bg-white/10'
                  aria-label='Tutup'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>

              <div className='relative aspect-[16/10] w-full bg-slate-900'>
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  sizes='(max-width: 1024px) 100vw, 1024px'
                  className='object-contain'
                  priority
                />

                <div className='absolute inset-y-0 left-0 flex items-center px-2'>
                  <button
                    type='button'
                    onClick={goPrev}
                    className='inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white transition hover:bg-white/10'
                    aria-label='Sebelumnya'
                  >
                    <ChevronLeft className='h-5 w-5' />
                  </button>
                </div>
                <div className='absolute inset-y-0 right-0 flex items-center px-2'>
                  <button
                    type='button'
                    onClick={goNext}
                    className='inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white transition hover:bg-white/10'
                    aria-label='Berikutnya'
                  >
                    <ChevronRight className='h-5 w-5' />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function HeroDashboard() {
  return (
    <div className='absolute inset-0 overflow-hidden'>
      <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,252,0.78),rgba(255,255,255,0.94)_52%,#ffffff_100%)]' />
      <div className='absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:48px_48px]' />

      <motion.div
        aria-hidden='true'
        className='absolute left-1/2 top-24 hidden w-[980px] -translate-x-1/2 grid-cols-12 gap-4 opacity-80 md:grid'
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className='col-span-4 h-44 rounded-lg border border-slate-200 bg-white/75 p-4 shadow-xl shadow-slate-200/50 backdrop-blur'
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className='flex items-center justify-between'>
            <div className='h-3 w-24 rounded-full bg-slate-200' />
            <BrainCircuit className='h-5 w-5 text-blue-500' />
          </div>
          <div className='mt-6 space-y-3'>
            <div className='h-4 w-4/5 rounded-full bg-blue-100' />
            <div className='h-4 w-3/5 rounded-full bg-slate-100' />
            <div className='h-16 rounded-md border border-blue-100 bg-blue-50/80' />
          </div>
        </motion.div>

        <motion.div
          className='col-span-5 mt-10 h-56 rounded-lg border border-slate-200 bg-white/85 p-4 shadow-2xl shadow-slate-300/50 backdrop-blur'
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className='flex items-center gap-3 border-b border-slate-100 pb-3'>
            <School className='h-5 w-5 text-slate-700' />
            <div className='h-3 w-28 rounded-full bg-slate-200' />
          </div>
          <div className='grid grid-cols-3 gap-3 pt-4'>
            {["bg-emerald-100", "bg-amber-100", "bg-rose-100"].map((color) => (
              <div key={color} className={`h-20 rounded-md ${color}`} />
            ))}
          </div>
          <div className='mt-4 h-12 rounded-md bg-slate-100' />
        </motion.div>

        <motion.div
          className='col-span-3 h-48 rounded-lg border border-slate-200 bg-white/75 p-4 shadow-xl shadow-slate-200/50 backdrop-blur'
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className='flex items-center justify-between'>
            <div className='h-3 w-20 rounded-full bg-slate-200' />
            <WalletCards className='h-5 w-5 text-emerald-500' />
          </div>
          <div className='mt-6 h-24 rounded-md bg-[linear-gradient(135deg,#d1fae5,#fef3c7)]' />
        </motion.div>
      </motion.div>
    </div>
  );
}

function EducoreContent() {
  const searchParams = useSearchParams();
  const cp = searchParams.get("cp");
  const whatsappNumber = contacts[cp?.toLowerCase()] || defaultWhatsappNumber;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;
  const galleryImages = useMemo(() => educoreGalleryImages, []);

  return (
    <div className='bg-white text-slate-950'>
      <section className='relative isolate flex min-h-[calc(100vh-72px)] items-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8'>
        <HeroDashboard />
        <div className='relative z-10 mx-auto max-w-6xl text-center'>
          <motion.div
            initial='hidden'
            animate='visible'
            variants={stagger}
            className='mx-auto max-w-5xl'
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.55 }}
              className='inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm backdrop-blur'
            >
              <Sparkles className='h-4 w-4' />
              Solusi Manajemen Sekolah Terpadu Berbasis AI
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className='mt-7 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl md:text-7xl'
            >
              Modernkan Sekolah Anda dengan Ekosistem Digital Cerdas{" "}
              <span className='text-blue-600'>EDUCORE</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.65 }}
              className='mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-xl md:leading-9'
            >
              Integrasi tanpa batas antara Administrasi, Keuangan, LMS, dan
              Tahfidz. Didukung AI Assistant untuk efisiensi guru dan
              transparansi orang tua dalam satu platform mandiri yang Anda
              miliki sepenuhnya.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.7 }}
              className='mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row'
            >
              <Link
                href={whatsappUrl}
                target='_blank'
                rel='noreferrer'
                className='inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 md:text-base'
              >
                Coba Demo Gratis
                <ArrowRight className='h-4 w-4' />
              </Link>
              <Link
                href={whatsappUrl}
                target='_blank'
                rel='noreferrer'
                className='inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 md:text-base'
              >
                Konsultasi Penawaran
                <MessageCircle className='h-4 w-4' />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial='hidden'
            animate='visible'
            variants={stagger}
            className='mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3'
          >
            {heroStats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                transition={{ duration: 0.55 }}
                className='rounded-lg border border-slate-200 bg-white/82 px-5 py-4 text-left shadow-sm backdrop-blur'
              >
                <div className='text-3xl font-extrabold text-slate-950'>
                  {stat.value}
                </div>
                <div className='mt-1 text-sm font-medium text-slate-500'>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id='fitur' className='px-4 py-20 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-6xl'>
          <SectionHeading
            eyebrow='Fitur Unggulan'
            title='Semua kebutuhan sekolah modern dalam satu sistem'
            description='Educore menyatukan workflow akademik, operasional, keuangan, dan komunikasi orang tua sehingga pekerjaan harian sekolah lebih cepat, terukur, dan transparan.'
          />

          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, amount: 0.18 }}
            variants={stagger}
            className='mt-14 grid gap-5 md:grid-cols-2'
          >
            {featureGroups.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  variants={fadeUp}
                  transition={{ duration: 0.55 }}
                  className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70'
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-lg border ${feature.accent}`}
                  >
                    <Icon className='h-6 w-6' />
                  </div>
                  <h3 className='mt-5 text-xl font-extrabold text-slate-950'>
                    {feature.title}
                  </h3>
                  <ul className='mt-5 space-y-3'>
                    {feature.items.map((item) => (
                      <li
                        key={item}
                        className='flex gap-3 text-sm leading-6 text-slate-600'
                      >
                        <CheckCircle2 className='mt-1 h-4 w-4 shrink-0 text-emerald-500' />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <GallerySection images={galleryImages} />

      <section className='bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8'>
        <div className='mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]'>
          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, amount: 0.35 }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            <p className='text-xs font-bold uppercase tracking-[0.32em] text-sky-300'>
              AI dan Keuangan
            </p>
            <h2 className='mt-4 text-3xl font-extrabold tracking-tight md:text-5xl'>
              Efisiensi guru bertemu transparansi keuangan sekolah.
            </h2>
            <p className='mt-5 text-base leading-8 text-slate-300 md:text-lg'>
              AI Assistant membantu guru membuat soal dan menilai esai lebih
              cepat, sementara modul pembayaran, tabungan siswa, kas kelas, dan
              laporan lintas periode membantu manajemen sekolah membaca kondisi
              finansial dengan jelas.
            </p>
            <div className='mt-8 grid gap-3 sm:grid-cols-2'>
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <div
                    key={module.label}
                    className='flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3'
                  >
                    <Icon className='h-5 w-5 text-sky-300' />
                    <span className='text-sm font-semibold text-slate-100'>
                      {module.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65 }}
            className='rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-blue-950/40'
          >
            <div className='rounded-md bg-white p-5 text-slate-950'>
              <div className='flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <p className='text-sm font-bold text-slate-400'>
                    Dashboard Keuangan
                  </p>
                  <h3 className='mt-1 text-xl font-extrabold'>
                    Arus Kas Sekolah
                  </h3>
                </div>
                <div className='inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700'>
                  <Banknote className='h-4 w-4' />
                  Cashless Ready
                </div>
              </div>

              <div className='mt-5 grid gap-3 sm:grid-cols-3'>
                {[
                  ["SPP Masuk", "92%", "bg-emerald-500"],
                  ["Kas Kelas", "18 Kelas", "bg-blue-500"],
                  ["Tabungan", "1.240 Siswa", "bg-amber-500"],
                ].map(([label, value, color]) => (
                  <div key={label} className='rounded-md bg-slate-50 p-4'>
                    <div className={`h-2 w-10 rounded-full ${color}`} />
                    <p className='mt-4 text-xs font-bold uppercase tracking-widest text-slate-400'>
                      {label}
                    </p>
                    <p className='mt-1 text-lg font-extrabold'>{value}</p>
                  </div>
                ))}
              </div>

              <div className='mt-5 space-y-3'>
                {[
                  ["AI Essay Grader", "Menghemat waktu koreksi guru"],
                  ["QRIS dan Bank", "Pembayaran orang tua lebih praktis"],
                  ["Laporan Periodik", "Analisis kas dari tahun ke tahun"],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className='flex items-center justify-between gap-4 rounded-md border border-slate-100 px-4 py-3'
                  >
                    <div>
                      <p className='font-bold text-slate-900'>{title}</p>
                      <p className='text-sm text-slate-500'>{text}</p>
                    </div>
                    <ChevronRight className='h-5 w-5 shrink-0 text-slate-300' />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className='bg-slate-50 px-4 py-20 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-6xl'>
          <SectionHeading
            eyebrow='Mengapa Educore'
            title='Dibangun untuk sekolah yang ingin mandiri secara digital'
            description='Educore bukan sekadar aplikasi langganan. Sistem ini dirancang sebagai aset sekolah yang bisa dikembangkan, dipasang sesuai kebutuhan, dan digunakan jangka panjang.'
          />

          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className='mt-14 grid gap-5 md:grid-cols-3'
          >
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  variants={fadeUp}
                  transition={{ duration: 0.55 }}
                  className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm'
                >
                  <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white'>
                    <Icon className='h-6 w-6' />
                  </div>
                  <h3 className='mt-5 text-lg font-extrabold text-slate-950'>
                    {benefit.title}
                  </h3>
                  <p className='mt-3 text-sm leading-7 text-slate-600'>
                    {benefit.text}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className='px-4 py-20 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65 }}
          className='mx-auto max-w-6xl overflow-hidden rounded-lg bg-slate-950 text-white shadow-2xl shadow-slate-300'
        >
          <div className='grid lg:grid-cols-[1.05fr_0.95fr]'>
            <div className='p-6 sm:p-10 lg:p-12'>
              <div className='inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-sky-200'>
                <GraduationCap className='h-4 w-4' />
                Siap Memulai Transformasi Digital?
              </div>
              <h2 className='mt-6 text-3xl font-extrabold tracking-tight md:text-5xl'>
                Jangan biarkan administrasi manual menghambat kemajuan sekolah.
              </h2>
              <p className='mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg'>
                Bergabunglah dengan sekolah modern lainnya bersama Educore:
                profesional, transparan, dan inovatif.
              </p>
              <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
                <Link
                  href={whatsappUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100'
                >
                  Hubungi WhatsApp Sekarang
                  <MessageCircle className='h-4 w-4' />
                </Link>
                <Link
                  href='#fitur'
                  className='inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/15 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10'
                >
                  Lihat Detail Fitur
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </div>
            </div>

            <div className='border-t border-white/10 bg-white/[0.04] p-6 sm:p-10 lg:border-l lg:border-t-0 lg:p-12'>
              <p className='text-sm font-bold uppercase tracking-[0.28em] text-slate-400'>
                Paket Implementasi
              </p>
              <div className='mt-6'>
                <p className='text-sm font-semibold text-slate-300'>
                  One-time payment
                </p>
                <div className='mt-2 flex flex-wrap items-end gap-2'>
                  <span className='text-4xl font-extrabold md:text-5xl'>
                    Hubungi Kami
                  </span>
                  <span className='pb-1 text-sm font-semibold text-slate-400'>
                    untuk penawaran terbaik
                  </span>
                </div>
              </div>

              <div className='mt-8 space-y-4'>
                {[
                  "1 source code untuk 1 sekolah",
                  "Tanpa biaya langganan bulanan",
                  "Instalasi cloud atau server lokal",
                  "Modul AI, keuangan, LMS, administrasi, dan tahfidz",
                ].map((item) => (
                  <div key={item} className='flex gap-3 text-sm text-slate-200'>
                    <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-emerald-300' />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default function EducorePage() {
  return (
    <Suspense fallback={<div className='min-h-screen bg-white' />}>
      <EducoreContent />
    </Suspense>
  );
}
