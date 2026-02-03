"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  AlertTriangle,
  CreditCard,
  BadgeCheck,
  Wallet,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/client-utils";

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const getStatusConfig = (paid) => {
  if (paid) {
    return {
      label: "Sudah Dibayar",
      badge: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle,
    };
  }
  return {
    label: "Belum Dibayar",
    badge: "bg-amber-100 text-amber-700",
    icon: AlertTriangle,
  };
};

export default function BootcampDashboard({
  user,
  participant,
  paymentItems = [],
}) {
  const allPaid = paymentItems.every((item) => item.paid);

  return (
    <motion.div
      className='space-y-8'
      variants={containerVariants}
      initial='hidden'
      animate='show'
    >
      <motion.div
        variants={itemVariants}
        className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'
      >
        <div>
          <p className='text-sm text-zinc-500 dark:text-zinc-400'>
            Halo, {user?.name || "Peserta Bootcamp"}
          </p>
          <h1 className='text-3xl font-bold text-zinc-900 dark:text-white mt-1'>
            Dashboard Bootcamp
          </h1>
          <p className='text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xl'>
            Pantau status pembayaran dan akses latihan bootcamp secara terpusat
            agar progres belajarmu tetap konsisten.
          </p>
        </div>
        <div className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-3'>
          <div className='h-11 w-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center'>
            <BadgeCheck className='w-5 h-5' />
          </div>
          <div>
            <p className='text-xs text-zinc-500 dark:text-zinc-400'>
              Status Program
            </p>
            <p className='text-sm font-semibold text-zinc-900 dark:text-white'>
              {participant?.status === "active"
                ? "Aktif"
                : participant?.status === "pending"
                  ? "Menunggu Aktivasi"
                  : "Perlu Konfirmasi"}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className='grid grid-cols-1 lg:grid-cols-3 gap-6'
      >
        <div className='bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl p-6 shadow-lg'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-white/80'>Ringkasan Pembayaran</p>
            <Wallet className='w-5 h-5 text-white/90' />
          </div>
          <p className='text-3xl font-bold mt-4'>
            {allPaid ? "Lunas" : "Belum Lunas"}
          </p>
          <p className='text-sm text-white/80 mt-2'>
            {allPaid
              ? "Seluruh pembayaran bootcamp sudah diterima."
              : "Selesaikan pembayaran agar akses penuh aktif."}
          </p>
        </div>

        <div className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm lg:col-span-2'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-zinc-900 dark:text-white'>
              Pembayaran Bootcamp
            </h2>
            <CreditCard className='w-5 h-5 text-zinc-400' />
          </div>
          <p className='text-sm text-zinc-500 dark:text-zinc-400 mt-1'>
            Cek status pembayaran pendaftaran dan biaya kelas.
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className='grid grid-cols-1 lg:grid-cols-2 gap-6'
      >
        {paymentItems.map((item) => {
          const statusConfig = getStatusConfig(item.paid);
          const StatusIcon = statusConfig.icon;
          return (
            <div
              key={item.id}
              className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <h3 className='text-lg font-semibold text-zinc-900 dark:text-white'>
                    {item.title}
                  </h3>
                  <p className='text-sm text-zinc-500 dark:text-zinc-400 mt-1'>
                    {item.description}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.badge}`}
                >
                  <StatusIcon className='w-4 h-4' />
                  {statusConfig.label}
                </span>
              </div>

              <div className='mt-6 flex items-center justify-between'>
                <div>
                  <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                    Total Tagihan
                  </p>
                  <p className='text-2xl font-bold text-zinc-900 dark:text-white'>
                    {formatRupiah(item.amount)}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                    Status
                  </p>
                  <p className='text-sm font-semibold text-zinc-700 dark:text-zinc-200'>
                    {item.paidAt
                      ? `Dibayar ${formatDate(item.paidAt)}`
                      : "Belum ada pembayaran"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
