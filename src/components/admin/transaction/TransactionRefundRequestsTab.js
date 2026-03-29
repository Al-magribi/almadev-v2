"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Loader2, Upload, X } from "lucide-react";
import { formatRupiah } from "@/lib/client-utils";
import { updateRefundRequestByAdmin } from "@/actions/transaction-actions";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const refundStatusStyles = {
  diajukan:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  diproses:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  selesai:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  ditolak:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function TransactionRefundRequestsTab({ refundRequests = [] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formState, setFormState] = useState({});
  const [feedback, setFeedback] = useState({});

  const sortedRequests = useMemo(
    () =>
      [...refundRequests].sort((a, b) => {
        const aTime = new Date(a.refundRequest?.requestedAt || 0).getTime();
        const bTime = new Date(b.refundRequest?.requestedAt || 0).getTime();
        return bTime - aTime;
      }),
    [refundRequests],
  );

  const handleFieldChange = (rowId, patch) => {
    setFormState((prev) => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || {}),
        ...patch,
      },
    }));
  };

  const openModal = (row) => {
    setSelectedRequest(row);
    setFormState((prev) => ({
      ...prev,
      [row.id]: {
        adminNotes:
          prev[row.id]?.adminNotes ?? row.refundRequest?.adminNotes ?? "",
        refundProof: prev[row.id]?.refundProof ?? null,
      },
    }));
  };

  const handleAction = (row, nextStatus) => {
    startTransition(async () => {
      const currentForm = formState[row.id] || {};
      const fd = new FormData();
      fd.append("transactionId", row.id);
      fd.append("status", nextStatus);
      fd.append("adminNotes", currentForm.adminNotes || "");

      if (currentForm.refundProof) {
        fd.append("refundProof", currentForm.refundProof);
      }

      const result = await updateRefundRequestByAdmin(fd);
      setFeedback((prev) => ({
        ...prev,
        [row.id]: result?.success
          ? { type: "success", message: result.message }
          : { type: "error", message: result?.error || "Update refund gagal." },
      }));

      if (result?.success) {
        router.refresh();
      }
    });
  };

  const modalForm = selectedRequest ? formState[selectedRequest.id] || {} : {};
  const modalFeedback = selectedRequest ? feedback[selectedRequest.id] : null;

  return (
    <div className='overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
      <div className='border-b border-zinc-200 px-6 py-5 dark:border-zinc-800'>
        <h2 className='text-lg font-bold text-zinc-900 dark:text-zinc-50'>
          Pengajuan Refund
        </h2>
        <p className='text-sm text-zinc-500 dark:text-zinc-400'>
          Admin dapat memproses refund, upload bukti transfer, dan memantau status pengajuan.
        </p>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500 dark:bg-zinc-950/50 dark:text-zinc-400'>
            <tr>
              <th className='px-6 py-4'>Transaksi</th>
              <th className='px-6 py-4'>Student</th>
              <th className='px-6 py-4'>Item / Nominal</th>
              <th className='px-6 py-4'>Status</th>
              <th className='px-6 py-4 text-right'>Aksi</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-zinc-100 dark:divide-zinc-800'>
            {sortedRequests.length > 0 ? (
              sortedRequests.map((row) => (
                <tr key={row.id}>
                  <td className='px-6 py-4 align-top'>
                    <div className='font-mono font-semibold text-zinc-900 dark:text-zinc-100'>
                      {row.transactionCode}
                    </div>
                    <div className='text-xs text-zinc-500'>
                      Transaksi {row.transactionStatus}
                    </div>
                    <div className='text-xs text-zinc-400'>
                      Dibeli {formatDateTime(row.createdAt)}
                    </div>
                    <div className='mt-1 text-xs text-zinc-400'>
                      Diajukan {formatDateTime(row.refundRequest?.requestedAt)}
                    </div>
                  </td>
                  <td className='px-6 py-4 align-top'>
                    <div className='font-semibold text-zinc-900 dark:text-zinc-100'>
                      {row.user?.name || "User"}
                    </div>
                    <div className='text-xs text-zinc-500'>
                      {row.user?.email || "-"}
                    </div>
                    <div className='text-xs text-zinc-400'>
                      {row.user?.phone || "-"}
                    </div>
                  </td>
                  <td className='px-6 py-4 align-top'>
                    <div className='font-semibold text-zinc-900 dark:text-zinc-100'>
                      {row.itemName}
                    </div>
                    <div className='text-xs text-zinc-500'>{row.itemType}</div>
                    <div className='mt-2 font-semibold text-zinc-900 dark:text-zinc-100'>
                      {formatRupiah(row.price || 0)}
                    </div>
                    {row.refundRequest?.reason ? (
                      <div className='mt-1 text-xs text-zinc-400'>
                        {row.refundRequest.reason}
                      </div>
                    ) : null}
                  </td>
                  <td className='px-6 py-4 align-top'>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        refundStatusStyles[row.refundRequest?.status] ||
                        "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {row.refundRequest?.status || "-"}
                    </span>
                    {row.refundRequest?.refundProof ? (
                      <div className='mt-2 text-xs font-medium text-blue-600 dark:text-blue-400'>
                        Bukti tersedia
                      </div>
                    ) : null}
                  </td>
                  <td className='px-6 py-4 align-top text-right'>
                    <button
                      type='button'
                      onClick={() => openModal(row)}
                      className='inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800'
                    >
                      <Eye className='h-4 w-4' />
                      Kelola Refund
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='5' className='px-6 py-12 text-center text-zinc-500'>
                  Belum ada pengajuan refund.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedRequest ? (
          <motion.div
            className='fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (isPending) return;
              setSelectedRequest(null);
            }}
          >
            <div className='flex min-h-full items-center justify-center'>
              <motion.div
                className='w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900'
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className='flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-5 dark:border-zinc-800'>
                  <div>
                    <div className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                      Kelola Refund
                    </div>
                    <h3 className='mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100'>
                      {selectedRequest.itemName}
                    </h3>
                    <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                      {selectedRequest.transactionCode} • {formatRupiah(selectedRequest.price || 0)}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      if (isPending) return;
                      setSelectedRequest(null);
                    }}
                    className='rounded-full border border-zinc-200 p-2 text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>

                <div className='grid gap-6 px-6 py-5 lg:grid-cols-[1.1fr_0.9fr]'>
                  <div className='space-y-4'>
                    <div className='rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950'>
                      <div className='text-xs font-semibold uppercase tracking-wide text-zinc-500'>
                        Data Student
                      </div>
                      <div className='mt-3 space-y-1 text-sm text-zinc-700 dark:text-zinc-300'>
                        <div className='font-semibold text-zinc-900 dark:text-zinc-100'>
                          {selectedRequest.user?.name || "User"}
                        </div>
                        <div>{selectedRequest.user?.email || "-"}</div>
                        <div>{selectedRequest.user?.phone || "-"}</div>
                      </div>
                    </div>

                    <div className='rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950'>
                      <div className='text-xs font-semibold uppercase tracking-wide text-zinc-500'>
                        Rekening Refund
                      </div>
                      <div className='mt-3 space-y-1 text-sm text-zinc-700 dark:text-zinc-300'>
                        <div>{selectedRequest.refundRequest?.bankName || "-"}</div>
                        <div>{selectedRequest.refundRequest?.accountNumber || "-"}</div>
                        <div>{selectedRequest.refundRequest?.accountName || "-"}</div>
                      </div>
                    </div>

                    <div className='rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950'>
                      <div className='text-xs font-semibold uppercase tracking-wide text-zinc-500'>
                        Catatan User
                      </div>
                      <div className='mt-3 text-sm text-zinc-700 dark:text-zinc-300'>
                        {selectedRequest.refundRequest?.reason || "-"}
                      </div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
                        Catatan Admin
                      </label>
                      <textarea
                        value={modalForm.adminNotes || ""}
                        onChange={(event) =>
                          handleFieldChange(selectedRequest.id, {
                            adminNotes: event.target.value,
                          })
                        }
                        placeholder='Tambahkan catatan internal refund'
                        className='min-h-28 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/50'
                      />
                    </div>

                    <div>
                      <label className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
                        Bukti Refund
                      </label>
                      <label className='flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900'>
                        <Upload className='h-4 w-4' />
                        <span>
                          {modalForm.refundProof?.name || "Pilih gambar bukti refund"}
                        </span>
                        <input
                          type='file'
                          accept='image/*'
                          className='hidden'
                          onChange={(event) =>
                            handleFieldChange(selectedRequest.id, {
                              refundProof: event.target.files?.[0] || null,
                            })
                          }
                        />
                      </label>
                    </div>

                    {selectedRequest.refundRequest?.refundProof ? (
                      <div className='rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950'>
                        <div className='mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300'>
                          Bukti refund saat ini
                        </div>
                        <div className='relative h-40 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'>
                          <Image
                            src={selectedRequest.refundRequest.refundProof}
                            alt='Bukti refund'
                            fill
                            className='object-cover'
                          />
                        </div>
                        <a
                          href={selectedRequest.refundRequest.refundProof}
                          target='_blank'
                          rel='noreferrer'
                          className='mt-3 inline-block text-sm font-medium text-blue-600 dark:text-blue-400'
                        >
                          Buka gambar penuh
                        </a>
                      </div>
                    ) : null}

                    {modalFeedback?.message ? (
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm ${
                          modalFeedback.type === "success"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
                        }`}
                      >
                        {modalFeedback.message}
                      </div>
                    ) : null}

                    <div className='flex flex-wrap gap-2 pt-2'>
                      {selectedRequest.refundRequest?.status === "diajukan" ? (
                        <>
                          <button
                            type='button'
                            disabled={isPending}
                            onClick={() => handleAction(selectedRequest, "diproses")}
                            className='inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60'
                          >
                            {isPending ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : null}
                            Proses Refund
                          </button>
                          <button
                            type='button'
                            disabled={isPending}
                            onClick={() => handleAction(selectedRequest, "ditolak")}
                            className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300'
                          >
                            Tolak Refund
                          </button>
                        </>
                      ) : null}

                      {selectedRequest.refundRequest?.status === "diproses" ? (
                        <button
                          type='button'
                          disabled={isPending}
                          onClick={() => handleAction(selectedRequest, "selesai")}
                          className='inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60'
                        >
                          {isPending ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : null}
                          Tandai Selesai
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
