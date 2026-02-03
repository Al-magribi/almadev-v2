"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  ArrowUpRight,
  Book,
  Package,
  User,
  X,
  CreditCard,
  Calendar,
  Mail,
  Phone,
  BadgeCheck,
  Tags,
  Landmark,
  Hash,
  Receipt,
} from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

// Helper Status Color
const getStatusBadge = (status) => {
  const styles = {
    pending:
      "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    completed:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    failed:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    cancelled:
      "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
    refunded:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  };
  return styles[status] || styles.cancelled;
};

export default function TransactionList({ transactions = [] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(null);

  // Filtering Logic
  const filteredData = useMemo(
    () =>
      transactions.filter((t) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          t.transactionCode?.toLowerCase().includes(searchLower) ||
          t.userId?.name?.toLowerCase().includes(searchLower) ||
          t.userId?.email?.toLowerCase().includes(searchLower) ||
          t.item?.name?.toLowerCase().includes(searchLower) || // Product Name
          t.item?.title?.toLowerCase().includes(searchLower); // Course Title

        const matchesStatus =
          filterStatus === "all" ? true : t.status === filterStatus;

        return matchesSearch && matchesStatus;
      }),
    [transactions, search, filterStatus],
  );

  const toIDR = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  const formatDateTime = (value) => {
    if (!value) return "-";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getItemLabel = (trx) => {
    if (trx.itemType === "BootcampParticipant") {
      return trx.bootcampFeeType === "class"
        ? "Bootcamp - Biaya Kelas"
        : "Bootcamp - Biaya Pendaftaran";
    }
    return trx.item ? trx.item.name || trx.item.title : trx.itemName || "-";
  };

  const getItemTypeLabel = (trx) =>
    trx.itemType === "BootcampParticipant" ? "Bootcamp" : trx.itemType;

  return (
    <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden'>
      {/* Header & Filters */}
      <div className='p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h2 className='text-lg font-bold text-zinc-900 dark:text-zinc-50'>
            Riwayat Transaksi
          </h2>
          <p className='text-sm text-zinc-500 dark:text-zinc-400'>
            Kelola semua pembayaran masuk.
          </p>
        </div>

        <div className='flex gap-2'>
          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4' />
            <input
              type='text'
              placeholder='Cari kode, user, atau item...'
              className='pl-9 pr-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all w-full sm:w-64'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Status */}
          <div className='relative'>
            <select
              className='pl-3 pr-8 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer'
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value='all'>Semua Status</option>
              <option value='pending'>Pending</option>
              <option value='completed'>Completed</option>
              <option value='failed'>Failed</option>
            </select>
            <Filter className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-3 h-3 pointer-events-none' />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full text-sm text-left'>
          <thead className='bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400 uppercase text-xs font-semibold border-b border-zinc-200 dark:border-zinc-800'>
            <tr>
              <th className='px-6 py-4'>Kode / Tanggal</th>
              <th className='px-6 py-4'>User</th>
              <th className='px-6 py-4'>Item (Produk/Course)</th>
              <th className='px-6 py-4'>Harga</th>
              <th className='px-6 py-4'>Status</th>
              <th className='px-6 py-4 text-center'>Aksi</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-zinc-100 dark:divide-zinc-800'>
            {filteredData.length > 0 ? (
              filteredData.map((trx) => (
                <tr
                  key={trx._id}
                  className='hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group'
                >
                  {/* Kode & Tanggal */}
                  <td className='px-6 py-4'>
                    <div className='flex flex-col'>
                      <span className='font-mono font-medium text-zinc-900 dark:text-zinc-200'>
                        {trx.transactionCode}
                      </span>
                      <span className='text-xs text-zinc-500'>
                        {new Date(trx.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {trx.utmSource && (
                        <span className='mt-1 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded w-fit'>
                          via {trx.utmSource}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* User Info */}
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0'>
                        {trx.userId?.avatar ? (
                          <Image
                            src={trx.userId.avatar}
                            alt='avatar'
                            width={32}
                            height={32}
                            className='rounded-full object-cover'
                          />
                        ) : (
                          <User size={14} />
                        )}
                      </div>
                      <div className='flex flex-col max-w-150px'>
                        <span className='font-medium text-zinc-900 dark:text-zinc-100 truncate'>
                          {trx.userId?.name || "User Deleted"}
                        </span>
                        <span className='text-xs text-zinc-500 truncate'>
                          {trx.userId?.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Item Info (Polymorphic) */}
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          trx.itemType === "Course"
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                            : trx.itemType === "BootcampParticipant"
                              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                              : "bg-orange-50 dark:bg-orange-900/20 text-orange-600"
                        }`}
                      >
                        {trx.itemType === "Course" ? (
                          <Book size={16} />
                        ) : trx.itemType === "BootcampParticipant" ? (
                          <Landmark size={16} />
                        ) : (
                          <Package size={16} />
                        )}
                      </div>
                      <div className='flex flex-col max-w-200px'>
                        <span className='font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1'>
                          {getItemLabel(trx)}
                        </span>
                        <span className='text-xs text-zinc-500 capitalize'>
                          {getItemTypeLabel(trx)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Harga */}
                  <td className='px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100'>
                    {toIDR(trx.price)}
                  </td>

                  {/* Status */}
                  <td className='px-6 py-4'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(trx.status)}`}
                    >
                      {trx.status}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className='px-6 py-4 text-center'>
                    <button
                      className='p-2 text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors'
                      title='Lihat Detail'
                      onClick={() => setSelected(trx)}
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='6' className='px-6 py-12 text-center'>
                  <div className='flex flex-col items-center justify-center text-zinc-400'>
                    <Filter className='w-10 h-10 mb-2 opacity-20' />
                    <p>Tidak ada transaksi yang ditemukan.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination (Visual Only for now) */}
      <div className='p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30 flex justify-between items-center text-xs text-zinc-500'>
        <span>
          Menampilkan {filteredData.length} dari {transactions.length} data
        </span>
        <div className='flex gap-1'>
          {/* Pagination controls would go here */}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className='fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <div className='flex min-h-full items-center justify-center'>
              <motion.div
                className='w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white shadow-xl'
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className='flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4'>
                  <div>
                    <div className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                      Detail Transaksi
                    </div>
                    <div className='mt-1 flex items-center gap-2'>
                      <span className='font-mono text-sm font-semibold text-zinc-900'>
                        {selected.transactionCode}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadge(selected.status)}`}
                      >
                        {selected.status}
                      </span>
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={() => setSelected(null)}
                    className='rounded-full border border-zinc-200 p-2 text-zinc-600 transition hover:bg-zinc-50'
                    aria-label='Tutup'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>

                <div className='px-5 py-4 space-y-6'>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <div className='rounded-2xl border border-zinc-200 bg-zinc-50 p-4'>
                      <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500'>
                        <Receipt className='h-4 w-4' />
                        Ringkasan
                      </div>
                      <div className='mt-3 space-y-2 text-sm text-zinc-700'>
                        <div className='flex items-center gap-2'>
                          <Hash className='h-4 w-4 text-zinc-400' />
                          <span className='font-medium text-zinc-900'>
                            {selected.transactionCode}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-zinc-400' />
                          <span>{formatDateTime(selected.createdAt)}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <CreditCard className='h-4 w-4 text-zinc-400' />
                          <span className='capitalize'>
                            {selected.paymentMethod || "unknown"}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Landmark className='h-4 w-4 text-zinc-400' />
                          <span>{toIDR(selected.price)}</span>
                        </div>
                        {selected.utmSource && (
                          <div className='flex items-center gap-2'>
                            <Tags className='h-4 w-4 text-zinc-400' />
                            <span>UTM: {selected.utmSource}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='rounded-2xl border border-zinc-200 bg-white p-4'>
                      <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500'>
                        <User className='h-4 w-4' />
                        Pelanggan
                      </div>
                      <div className='mt-3 flex items-center gap-3'>
                        <div className='h-10 w-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center'>
                          {selected.userId?.avatar ? (
                            <Image
                              src={selected.userId.avatar}
                              alt='avatar'
                              width={40}
                              height={40}
                              className='rounded-full object-cover'
                            />
                          ) : (
                            <User size={16} />
                          )}
                        </div>
                        <div className='min-w-0'>
                          <div className='text-sm font-semibold text-zinc-900'>
                            {selected.userId?.name || "User Deleted"}
                          </div>
                          <div className='text-xs text-zinc-500'>
                            {selected.userId?.role || "user"}
                          </div>
                        </div>
                      </div>
                      <div className='mt-3 space-y-2 text-sm text-zinc-700'>
                        <div className='flex items-center gap-2'>
                          <Mail className='h-4 w-4 text-zinc-400' />
                          <span className='truncate'>
                            {selected.userId?.email || "-"}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Phone className='h-4 w-4 text-zinc-400' />
                          <span>{selected.userId?.phone || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='rounded-2xl border border-zinc-200 bg-white p-4'>
                    <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500'>
                      <Package className='h-4 w-4' />
                      Item
                    </div>
                    <div className='mt-3 flex flex-col gap-2 text-sm text-zinc-700'>
                      <div className='flex items-center gap-2'>
                        <BadgeCheck className='h-4 w-4 text-zinc-400' />
                        <span className='font-semibold text-zinc-900'>
                          {getItemLabel(selected)}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Tags className='h-4 w-4 text-zinc-400' />
                        <span className='capitalize'>
                          {getItemTypeLabel(selected)}
                        </span>
                      </div>
                      {selected.item?.category && (
                        <div className='flex items-center gap-2'>
                          <Tags className='h-4 w-4 text-zinc-400' />
                          <span>{selected.item.category}</span>
                        </div>
                      )}
                      {selected.itemType === "BootcampParticipant" && (
                        <div className='mt-2 grid grid-cols-1 gap-2 text-sm text-zinc-700 sm:grid-cols-2'>
                          <div className='rounded-xl border border-zinc-200 bg-zinc-50 p-3'>
                            <div className='text-xs text-zinc-500'>
                              Peserta
                            </div>
                            <div className='font-semibold text-zinc-900'>
                              {selected.item?.name || "-"}
                            </div>
                            <div className='text-xs text-zinc-500'>
                              {selected.item?.email || "-"}
                            </div>
                          </div>
                          <div className='rounded-xl border border-zinc-200 bg-zinc-50 p-3'>
                            <div className='text-xs text-zinc-500'>
                              Status Peserta
                            </div>
                            <div className='font-semibold text-zinc-900 capitalize'>
                              {selected.item?.status || "-"}
                            </div>
                            <div className='text-xs text-zinc-500'>
                              Midtrans: {selected.item?.midtransStatus || "-"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-4'>
                  <button
                    type='button'
                    onClick={() => setSelected(null)}
                    className='inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50'
                  >
                    Tutup
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
