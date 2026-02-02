"use client";

import { Users } from "lucide-react";
import { formatDate, formatRupiah } from "@/lib/client-utils";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-rose-50 text-rose-700 border-rose-100",
  expired: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export default function BootcampParticipantsTable({ participants = [] }) {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors'>
        <div className='flex items-center gap-4 mb-4 sm:mb-0'>
          <div className='p-3 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl hidden sm:block'>
            <Users size={24} />
          </div>
          <div>
            <h1 className='text-xl font-bold text-zinc-900 dark:text-zinc-50'>
              Peserta Bootcamp
            </h1>
            <p className='text-zinc-500 dark:text-zinc-400 text-sm'>
              Biaya pendaftaran Rp 100.000 dan biaya kelas Rp 3.000.000.
            </p>
          </div>
        </div>

        <span className='bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded'>
          Total: {participants.length} Peserta
        </span>
      </div>

      <div className='overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-zinc-900'>
        <table className='w-full text-sm text-left text-gray-500 dark:text-zinc-400'>
          <thead className='text-xs text-gray-700 dark:text-zinc-300 uppercase bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-200 dark:border-zinc-800'>
            <tr>
              <th className='px-4 py-3'>Peserta</th>
              <th className='px-4 py-3'>Kontak</th>
              <th className='px-4 py-3'>Status</th>
              <th className='px-4 py-3 text-right'>Pendaftaran</th>
              <th className='px-4 py-3 text-right'>Biaya Kelas</th>
              <th className='px-4 py-3'>Daftar</th>
            </tr>
          </thead>
          <tbody>
            {participants.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className='px-4 py-6 text-center text-gray-400'
                >
                  Belum ada peserta bootcamp.
                </td>
              </tr>
            ) : (
              participants.map((item) => (
                <tr
                  key={item.id}
                  className='border-b last:border-0 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors'
                >
                  <td className='px-4 py-3'>
                    <div className='font-semibold text-gray-900 dark:text-white'>
                      {item.name}
                    </div>
                    <div className='text-xs text-gray-400'>
                      #{item.transactionCode}
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='text-gray-700 dark:text-zinc-200'>
                      {item.email}
                    </div>
                    <div className='text-xs text-gray-400'>{item.phone}</div>
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs border ${
                        statusStyles[item.status] ||
                        "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-right'>
                    {formatRupiah(item.registrationFee || 0)}
                  </td>
                  <td className='px-4 py-3 text-right'>
                    {formatRupiah(item.classFee || 0)}
                  </td>
                  <td className='px-4 py-3'>
                    {item.createdAt ? formatDate(item.createdAt) : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
