"use client";

import { ArrowRight, Landmark } from "lucide-react";

export const statusLabelMap = {
  pending: "Pending",
  completed: "Selesai",
  failed: "Gagal",
  cancelled: "Dibatalkan",
  refunded: "Refund",
  expired: "Expired",
};

export function BadgePill({ icon: Icon, text, tone = "blue" }) {
  const className =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
      : "border-blue-200 bg-white text-blue-700 dark:border-blue-800 dark:bg-zinc-900 dark:text-blue-300";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${className}`}
    >
      <Icon className='h-4 w-4' />
      {text}
    </div>
  );
}

export function SummaryDarkCard({ label, value }) {
  return (
    <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
      <p className='text-white/55'>{label}</p>
      <p className='mt-1 text-lg font-semibold'>{value}</p>
    </div>
  );
}

export function InfoCard({ title, value }) {
  return (
    <div className='rounded-2xl border border-white/70 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/70'>
      <p className='text-xs uppercase tracking-[0.24em] text-slate-400'>
        {title}
      </p>
      <p className='mt-2 text-sm font-semibold text-slate-900 dark:text-white'>
        {value}
      </p>
    </div>
  );
}

export function QuickInfo({ label, value }) {
  return (
    <div className='rounded-2xl border border-gray-100 p-4 dark:border-gray-800'>
      <p className='text-xs uppercase tracking-[0.18em] text-gray-400'>
        {label}
      </p>
      <p className='mt-2 text-lg font-semibold text-gray-900 dark:text-white'>
        {value}
      </p>
    </div>
  );
}

export function QuickMetricCard({ title, value }) {
  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
      <p className='text-sm text-gray-500 dark:text-gray-400'>{title}</p>
      <p className='mt-2 text-2xl font-bold text-gray-900 dark:text-white'>
        {value}
      </p>
    </div>
  );
}

export function DataTableCard({ rows, emptyMessage, children }) {
  return (
    <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900'>
      {rows > 0 ? (
        <div className='overflow-x-auto'>{children}</div>
      ) : (
        <div className='p-8 text-sm text-gray-500 dark:text-gray-400'>
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

export function BankFormCard({ user, formAction, isPending, mode }) {
  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
      <div className='flex items-center gap-3'>
        <div className='rounded-xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-300'>
          <Landmark className='h-5 w-5' />
        </div>
        <div>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            {mode === "join"
              ? "Daftar Affiliate Sekarang"
              : "Edit Rekening Affiliate"}
          </h2>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {mode === "join"
              ? "Isi data bank Anda, lalu sistem akan membuat kode referral unik."
              : "Perbarui rekening pencairan agar payout masuk ke akun yang benar."}
          </p>
        </div>
      </div>

      <form action={formAction} className='mt-6 space-y-4'>
        <div className='grid gap-4 md:grid-cols-2'>
          <label className='space-y-2'>
            <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>
              Nama Bank
            </span>
            <input
              name='bankName'
              defaultValue={user?.bankInfo?.bankName || ""}
              placeholder='Contoh: BCA'
              className='w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white'
            />
          </label>
          <label className='space-y-2'>
            <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>
              Nomor Rekening
            </span>
            <input
              name='accountNumber'
              defaultValue={user?.bankInfo?.accountNumber || ""}
              placeholder='Nomor rekening pencairan'
              className='w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white'
            />
          </label>
        </div>

        <label className='block space-y-2'>
          <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>
            Nama Pemilik Rekening
          </span>
          <input
            name='accountName'
            defaultValue={user?.bankInfo?.accountName || user?.name || ""}
            placeholder='Nama sesuai buku tabungan'
            className='w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white'
          />
        </label>

        <div className='rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950/60 dark:text-slate-300'>
          {mode === "join"
            ? "Setelah daftar, Anda langsung mendapatkan kode referral unik dan bisa menyalin link untuk semua kursus serta produk yang tersedia."
            : "Perubahan rekening akan dipakai untuk payout affiliate berikutnya."}
        </div>

        <button
          type='submit'
          disabled={isPending}
          className='inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-500'
        >
          {mode === "join" ? "Gabung Program Affiliate" : "Simpan Rekening"}
          <ArrowRight className='h-4 w-4' />
        </button>
      </form>
    </div>
  );
}
