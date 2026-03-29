"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Receipt,
  BookOpen,
  Package,
  CreditCard,
  Calendar,
  Copy,
  BadgeCheck,
  Clock,
  XCircle,
  RefreshCcw,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { formatDate, formatRupiah } from "@/lib/client-utils";
import {
  getTransactionsByUser,
  submitRefundRequest,
} from "@/actions/transaction-actions";
import RefundRequestModal from "@/components/student/transactions/RefundRequestModal";

const statusStyles = {
  pending:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  completed:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  failed:
    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
  cancelled:
    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  refunded:
    "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800",
  expired:
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
};

const statusMeta = {
  pending: { label: "Pending", icon: Clock },
  completed: { label: "Completed", icon: BadgeCheck },
  failed: { label: "Failed", icon: XCircle },
  cancelled: { label: "Cancelled", icon: XCircle },
  refunded: { label: "Refunded", icon: RefreshCcw },
  expired: { label: "Expired", icon: Clock },
};

const paymentLabels = {
  credit_card: "Kartu Kredit",
  bank_transfer: "Transfer Bank",
  gopay: "GoPay",
  shopeepay: "ShopeePay",
  qris: "QRIS",
  akulaku: "Akulaku",
  kredivo: "Kredivo",
  alfamart: "Alfamart",
  indomart: "Indomart",
  cstore: "Convenience Store",
  echannel: "Mandiri E-Channel",
  permata_va: "Permata VA",
  bca_klikpay: "BCA KlikPay",
  bri_epay: "BRI ePay",
  other_qris: "QRIS Lainnya",
  other_va: "VA Lainnya",
  unknown: "Metode Lainnya",
};

const containerMotion = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.06, ease: "easeOut" },
  },
};

const itemMotion = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function StatCard({ title, value, icon: Icon, tone }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${tone}`}
    >
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400'>
            {title}
          </p>
          <p className='mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
            {value}
          </p>
        </div>
        <div className='rounded-2xl bg-zinc-100 p-2 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'>
          <Icon className='h-5 w-5' />
        </div>
      </div>
    </div>
  );
}

export default function TransactionList({ userId }) {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState([]);
  const [bankInfo, setBankInfo] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterType, setFilterType] = React.useState("all");
  const [selectedRefundTransaction, setSelectedRefundTransaction] =
    React.useState(null);
  const [refundError, setRefundError] = React.useState("");
  const [refundSuccess, setRefundSuccess] = React.useState("");
  const [isSubmittingRefund, setIsSubmittingRefund] = React.useState(false);

  const loadTransactions = React.useCallback(async () => {
    setLoading(true);
    try {
      if (!userId) {
        setItems([]);
        setBankInfo(null);
        return;
      }

      const data = await getTransactionsByUser(userId);
      setItems(Array.isArray(data?.items) ? data.items : []);
      setBankInfo(data?.bankInfo || null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    let active = true;

    async function run() {
      if (!active) return;
      await loadTransactions();
    }

    run();
    return () => {
      active = false;
    };
  }, [loadTransactions]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((t) => {
      const matchesQuery =
        !q ||
        t.transactionCode?.toLowerCase().includes(q) ||
        t.item?.name?.toLowerCase().includes(q) ||
        t.itemType?.toLowerCase().includes(q);
      const matchesStatus =
        filterStatus === "all" ? true : t.status === filterStatus;
      const matchesType =
        filterType === "all" ? true : t.itemType === filterType;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [items, query, filterStatus, filterType]);

  const stats = React.useMemo(() => {
    const total = items.length;
    const completed = items.filter((t) => t.status === "completed").length;
    const pending = items.filter((t) => t.status === "pending").length;
    const totalSpent = items.reduce(
      (acc, cur) =>
        acc + Math.max(0, Number(cur.price || 0) - Number(cur.refundAmount || 0)),
      0,
    );
    return { total, completed, pending, totalSpent };
  }, [items]);

  const handleRefundSubmit = async (form) => {
    if (!selectedRefundTransaction?.id) return;

    setRefundError("");
    setRefundSuccess("");
    setIsSubmittingRefund(true);

    try {
      const result = await submitRefundRequest({
        transactionId: selectedRefundTransaction.id,
        ...form,
      });

      if (!result?.success) {
        setRefundError(result?.error || "Pengajuan refund gagal diproses.");
        return;
      }

      setRefundSuccess(result?.message || "Pengajuan refund berhasil dikirim.");
      setSelectedRefundTransaction(null);
      await loadTransactions();
    } catch (error) {
      console.error("submit refund error:", error);
      setRefundError("Terjadi kesalahan sistem saat mengirim refund.");
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  return (
    <div className='mx-auto w-full max-w-6xl'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='flex items-start gap-3'>
          <div className='rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
            <Receipt className='h-6 w-6 text-zinc-900 dark:text-zinc-100' />
          </div>
          <div>
            <h1 className='text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl'>
              Transaksi Saya
            </h1>
            <p className='mt-1 text-sm text-zinc-600 dark:text-zinc-400'>
              Pantau status pembayaran, detail item, histori transaksi, dan
              pengajuan refund kamu.
            </p>
          </div>
        </div>

        <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row'>
          <div className='relative w-full sm:w-64'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500' />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Cari kode atau item...'
              className='h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-500 focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/60'
            />
          </div>
          <div className='relative w-full sm:w-44'>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='h-11 w-full appearance-none rounded-2xl border border-zinc-200 bg-white pl-3 pr-8 text-sm text-zinc-700 shadow-sm outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/60'
            >
              <option value='all'>Semua Status</option>
              <option value='pending'>Pending</option>
              <option value='completed'>Completed</option>
              <option value='failed'>Failed</option>
              <option value='cancelled'>Cancelled</option>
              <option value='refunded'>Refunded</option>
              <option value='expired'>Expired</option>
            </select>
            <Filter className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
          </div>
          <div className='relative w-full sm:w-40'>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className='h-11 w-full appearance-none rounded-2xl border border-zinc-200 bg-white pl-3 pr-8 text-sm text-zinc-700 shadow-sm outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/60'
            >
              <option value='all'>Semua Item</option>
              <option value='Course'>Kursus</option>
              <option value='Product'>Produk</option>
            </select>
            <Filter className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
          </div>
        </div>
      </div>

      {!userId && (
        <div className='mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'>
          Kamu belum login / userId tidak ditemukan. Pastikan halaman ini
          menerima <span className='font-medium'>userId</span> dari session.
        </div>
      )}

      {userId && (
        <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <StatCard
            title='Total Transaksi'
            value={stats.total}
            icon={Receipt}
          />
          <StatCard
            title='Transaksi Sukses'
            value={stats.completed}
            icon={ShieldCheck}
          />
          <StatCard title='Menunggu' value={stats.pending} icon={Clock} />
          <StatCard
            title='Total Pengeluaran'
            value={formatRupiah(stats.totalSpent)}
            icon={CreditCard}
          />
        </div>
      )}

      {(refundError || refundSuccess) && (
        <div
          className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
            refundError
              ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200"
          }`}
        >
          {refundError || refundSuccess}
        </div>
      )}

      {userId && loading && (
        <div className='mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className='overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900'
            >
              <div className='h-32 animate-pulse bg-zinc-100 dark:bg-zinc-800' />
              <div className='space-y-3 p-4'>
                <div className='h-4 w-3/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800' />
                <div className='h-3 w-1/2 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800' />
                <div className='h-3 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800' />
              </div>
            </div>
          ))}
        </div>
      )}

      {userId && !loading && filtered.length === 0 && (
        <div className='mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950'>
            <Receipt className='h-6 w-6 text-zinc-600 dark:text-zinc-300' />
          </div>
          <h3 className='mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100'>
            Belum ada transaksi
          </h3>
          <p className='mt-2 text-sm text-zinc-600 dark:text-zinc-400'>
            Setelah kamu melakukan pembayaran, detail transaksi akan tampil di
            sini.
          </p>
        </div>
      )}

      {userId && !loading && filtered.length > 0 && (
        <motion.div
          variants={containerMotion}
          initial='hidden'
          animate='show'
          className='mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2'
        >
          {filtered.map((trx) => {
            const StatusIcon = statusMeta[trx.status]?.icon || Clock;
            const imgSrc =
              trx.item?.image && trx.item.image.startsWith("http")
                ? trx.item.image
                : trx.item?.image
                  ? trx.item.image
                  : "/placeholder.png";
            const isCourse = trx.itemType === "Course";
            const refundEligibility = trx.refundEligibility || {};
            const refundDisplayAmount =
              trx.refundAmount || (trx.refundRequest ? trx.price : 0);
            const netAmount = Math.max(
              0,
              Number(trx.price || 0) - Number(trx.refundAmount || 0),
            );

            return (
              <motion.div
                key={trx.id}
                variants={itemMotion}
                className='group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900'
              >
                <div className='flex flex-col gap-4 p-4 sm:flex-row sm:items-start'>
                  <div className='relative h-24 w-full shrink-0 overflow-hidden rounded-2xl bg-zinc-100 sm:h-24 sm:w-32 dark:bg-zinc-800'>
                    <Image
                      src={imgSrc}
                      alt={trx.item?.name || trx.itemName || "Item"}
                      fill
                      className='object-cover transition duration-300 group-hover:scale-[1.03]'
                      sizes='(max-width: 640px) 100vw, 128px'
                    />
                    <div className='absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-zinc-700 backdrop-blur dark:bg-zinc-900/80 dark:text-zinc-200'>
                      {isCourse ? (
                        <BookOpen className='h-3 w-3' />
                      ) : (
                        <Package className='h-3 w-3' />
                      )}
                      {trx.itemType}
                    </div>
                  </div>

                  <div className='flex-1'>
                    <div className='flex flex-wrap items-start justify-between gap-2'>
                      <div>
                        <h3 className='line-clamp-1 text-base font-semibold text-zinc-900 dark:text-zinc-100'>
                          {trx.item?.name || trx.itemName || "Item tidak ada"}
                        </h3>
                        <p className='mt-1 text-xs text-zinc-500 dark:text-zinc-400'>
                          {trx.transactionCode}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[trx.status] || statusStyles.cancelled}`}
                      >
                        <StatusIcon className='h-3.5 w-3.5' />
                        {statusMeta[trx.status]?.label || trx.status}
                      </span>
                    </div>

                    <div className='mt-3 grid grid-cols-1 gap-2 text-xs text-zinc-600 dark:text-zinc-400 sm:grid-cols-2'>
                      <div className='flex items-center gap-2'>
                        <CreditCard className='h-4 w-4' />
                        <span>
                          {paymentLabels[trx.paymentMethod] || "Metode Lainnya"}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4' />
                        <span>{formatDate(trx.createdAt)}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Receipt className='h-4 w-4' />
                        <div>
                          <span className='font-semibold text-zinc-900 dark:text-zinc-100'>
                            {formatRupiah(netAmount)}
                          </span>
                          {trx.refundRequest?.status ? (
                            <div className='text-[11px] text-zinc-500 dark:text-zinc-400'>
                              Harga awal {formatRupiah(trx.price)}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {trx.utmSource && (
                        <div className='flex items-center gap-2'>
                          <ShieldCheck className='h-4 w-4' />
                          <span>UTM: {trx.utmSource}</span>
                        </div>
                      )}
                    </div>

                    {(trx.refundAmount || trx.refundRequest) && (
                      <div className='mt-3 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-700 dark:border-violet-900/40 dark:bg-violet-900/20 dark:text-violet-200'>
                        <div>
                          Refund {formatRupiah(refundDisplayAmount)}
                          {trx.refundRequest?.status
                            ? ` - ${trx.refundRequest.status}`
                            : ""}
                        </div>
                        {trx.refundRequest?.refundProof ? (
                          <div className='mt-2'>
                            <a
                              href={trx.refundRequest.refundProof}
                              target='_blank'
                              rel='noreferrer'
                              className='font-semibold text-blue-600 dark:text-blue-300'
                            >
                              Lihat bukti refund
                            </a>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {!trx.refundRequest?.status &&
                    trx.status === "completed" ? (
                      <div className='mt-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300'>
                        {trx.itemType === "Course" ? (
                          <div>
                            Progress belajar:{" "}
                            <span className='font-semibold text-zinc-900 dark:text-zinc-100'>
                              {refundEligibility.progressPercent || 0}%
                            </span>
                          </div>
                        ) : null}
                        <div>
                          Batas refund:{" "}
                          <span className='font-semibold text-zinc-900 dark:text-zinc-100'>
                            {refundEligibility.deadlineAt
                              ? formatDate(refundEligibility.deadlineAt)
                              : "-"}
                          </span>
                        </div>
                        {!refundEligibility.eligible &&
                        refundEligibility.reason ? (
                          <div className='mt-1 text-amber-700 dark:text-amber-300'>
                            {refundEligibility.reason}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <div className='mt-4 flex flex-wrap items-center gap-2'>
                      <button
                        type='button'
                        className='inline-flex h-9 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'
                        onClick={() => {
                          navigator.clipboard?.writeText(trx.transactionCode);
                        }}
                      >
                        <Copy className='h-4 w-4' />
                        Copy Kode
                      </button>

                      {refundEligibility.eligible ? (
                        <button
                          type='button'
                          className='inline-flex h-9 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-3 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-violet-600 dark:hover:bg-violet-500'
                          onClick={() => {
                            setRefundError("");
                            setRefundSuccess("");
                            setSelectedRefundTransaction(trx);
                          }}
                        >
                          <RotateCcw className='h-4 w-4' />
                          Ajukan Refund
                        </button>
                      ) : null}

                      <div className='inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'>
                        <span>
                          Item:{" "}
                          <span className='font-medium text-zinc-700 dark:text-zinc-200'>
                            {trx.itemType}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <RefundRequestModal
        open={Boolean(selectedRefundTransaction)}
        transaction={selectedRefundTransaction}
        initialBankInfo={bankInfo}
        onClose={() => {
          if (isSubmittingRefund) return;
          setSelectedRefundTransaction(null);
        }}
        onSubmit={handleRefundSubmit}
        isSubmitting={isSubmittingRefund}
      />
    </div>
  );
}
