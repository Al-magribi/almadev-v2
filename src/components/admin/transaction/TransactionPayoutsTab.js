"use client";

import { formatRupiah } from "@/lib/client-utils";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function TransactionPayoutsTab({ payoutRows = [] }) {
  return (
    <div className='overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
      <div className='border-b border-zinc-200 px-6 py-5 dark:border-zinc-800'>
        <h2 className='text-lg font-bold text-zinc-900 dark:text-zinc-50'>
          Data Payout Affiliate
        </h2>
        <p className='text-sm text-zinc-500 dark:text-zinc-400'>
          Pantau nominal payout per user, total yang sudah dibayar, dan sisa reward siap proses.
        </p>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500 dark:bg-zinc-950/50 dark:text-zinc-400'>
            <tr>
              <th className='px-6 py-4'>Affiliate</th>
              <th className='px-6 py-4'>Bank Tujuan</th>
              <th className='px-6 py-4'>Reward Siap Payout</th>
              <th className='px-6 py-4'>Scheduled / Draft</th>
              <th className='px-6 py-4'>Sudah Dibayar</th>
              <th className='px-6 py-4'>Jumlah Payout</th>
              <th className='px-6 py-4'>Pembayaran Terakhir</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-zinc-100 dark:divide-zinc-800'>
            {payoutRows.length > 0 ? (
              payoutRows.map((row) => (
                <tr key={row.id}>
                  <td className='px-6 py-4'>
                    <div className='font-semibold text-zinc-900 dark:text-zinc-100'>
                      {row.name}
                    </div>
                    <div className='text-xs text-zinc-500'>{row.email}</div>
                    <div className='text-xs font-mono text-zinc-400'>
                      {row.referralCode}
                    </div>
                  </td>
                  <td className='px-6 py-4 text-zinc-600 dark:text-zinc-300'>
                    <div>{row.bankInfo?.bankName || "-"}</div>
                    <div className='text-xs text-zinc-500'>
                      {row.bankInfo?.accountName || "-"}
                    </div>
                    <div className='text-xs text-zinc-400'>
                      {row.bankInfo?.accountNumber || "-"}
                    </div>
                  </td>
                  <td className='px-6 py-4 font-semibold text-amber-600 dark:text-amber-400'>
                    {formatRupiah(row.rewardReady || 0)}
                  </td>
                  <td className='px-6 py-4 text-zinc-900 dark:text-zinc-100'>
                    {formatRupiah(row.scheduledAmount || 0)}
                  </td>
                  <td className='px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400'>
                    {formatRupiah(row.paidAmount || 0)}
                  </td>
                  <td className='px-6 py-4 text-zinc-900 dark:text-zinc-100'>
                    <div className='font-semibold'>{row.payoutCount}</div>
                    <div className='text-xs text-zinc-500'>
                      Total {formatRupiah(row.totalPayoutAmount || 0)}
                    </div>
                  </td>
                  <td className='px-6 py-4 text-zinc-600 dark:text-zinc-300'>
                    {formatDate(row.lastPaidAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='7' className='px-6 py-12 text-center text-zinc-500'>
                  Belum ada data payout affiliate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
