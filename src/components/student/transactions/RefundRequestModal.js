"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

export default function RefundRequestModal({
  open,
  transaction,
  initialBankInfo,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const [form, setForm] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    reason: "",
  });

  useEffect(() => {
    if (!open) return;

    setForm({
      bankName: initialBankInfo?.bankName || "",
      accountNumber: initialBankInfo?.accountNumber || "",
      accountName: initialBankInfo?.accountName || "",
      reason: "",
    });
  }, [initialBankInfo, open]);

  if (!open || !transaction) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      onClick={onClose}
    >
      <div
        className='w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900'
        onClick={(event) => event.stopPropagation()}
      >
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>
              Ajukan Refund
            </h3>
            <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
              Lengkapi data rekening untuk transaksi{" "}
              <span className='font-medium'>{transaction.transactionCode}</span>.
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-full border border-zinc-200 p-2 text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <form
          className='mt-6 space-y-4'
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(form);
          }}
        >
          <div>
            <label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Nama Bank
            </label>
            <input
              type='text'
              value={form.bankName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, bankName: event.target.value }))
              }
              className='h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/50'
              placeholder='Contoh: BCA'
              required
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Nomor Rekening
            </label>
            <input
              type='text'
              value={form.accountNumber}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  accountNumber: event.target.value,
                }))
              }
              className='h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/50'
              placeholder='Masukkan nomor rekening'
              required
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Nama Pemilik Rekening
            </label>
            <input
              type='text'
              value={form.accountName}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  accountName: event.target.value,
                }))
              }
              className='h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/50'
              placeholder='Nama sesuai rekening'
              required
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Alasan Refund
            </label>
            <textarea
              value={form.reason}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, reason: event.target.value }))
              }
              className='min-h-28 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/50'
              placeholder='Opsional'
            />
          </div>

          <div className='flex justify-end gap-2 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800'
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type='submit'
              className='inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-violet-600 dark:hover:bg-violet-500'
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
              Kirim Pengajuan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
