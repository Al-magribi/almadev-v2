"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  ArrowUpRight,
  Book,
  Package,
  User,
} from "lucide-react";
import Image from "next/image";

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

  // Filtering Logic
  const filteredData = transactions.filter((t) => {
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
  });

  const toIDR = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

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
                        className={`p-2 rounded-lg shrink-0 ${trx.itemType === "Course" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "bg-orange-50 dark:bg-orange-900/20 text-orange-600"}`}
                      >
                        {trx.itemType === "Course" ? (
                          <Book size={16} />
                        ) : (
                          <Package size={16} />
                        )}
                      </div>
                      <div className='flex flex-col max-w-200px'>
                        <span className='font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1'>
                          {trx.item
                            ? trx.item.name || trx.item.title
                            : "Item Deleted"}
                        </span>
                        <span className='text-xs text-zinc-500 capitalize'>
                          {trx.itemType}
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
    </div>
  );
}
