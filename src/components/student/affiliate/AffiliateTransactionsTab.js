import { formatDate, formatRupiah } from "@/lib/client-utils";
import {
  DataTableCard,
  QuickMetricCard,
  statusLabelMap,
} from "@/components/student/affiliate/AffiliateShared";

export default function AffiliateTransactionsTab({ transactions, metrics }) {
  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-3'>
        <QuickMetricCard
          title='Total transaksi referral'
          value={String(metrics?.transactions || 0)}
        />
        <QuickMetricCard
          title='Total reward'
          value={formatRupiah(metrics?.rewardTotal || 0)}
        />
        <QuickMetricCard
          title='Akan diproses payout'
          value={formatRupiah(metrics?.rewardReady || 0)}
        />
      </div>

      <DataTableCard
        rows={transactions.length}
        emptyMessage='Belum ada transaksi yang menggunakan kode referral Anda.'
      >
        <table className='min-w-full text-sm'>
          <thead className='text-left text-gray-500 dark:text-gray-400'>
            <tr className='border-b border-gray-100 dark:border-gray-800'>
              <th className='px-4 py-3 font-medium'>Transaksi</th>
              <th className='px-4 py-3 font-medium'>Pembeli</th>
              <th className='px-4 py-3 font-medium'>Item</th>
              <th className='px-4 py-3 font-medium'>Nominal</th>
              <th className='px-4 py-3 font-medium'>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr
                key={item.id}
                className='border-b border-gray-100 dark:border-gray-800 last:border-0'
              >
                <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>
                  <div className='font-semibold text-gray-900 dark:text-white'>
                    {item.transactionCode}
                  </div>
                  <div className='text-xs text-gray-400'>
                    {item.completedAt
                      ? formatDate(item.completedAt)
                      : item.createdAt
                        ? formatDate(item.createdAt)
                        : "-"}
                  </div>
                </td>
                <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>
                  <div>{item.buyerName}</div>
                  <div className='text-xs text-gray-400'>{item.buyerEmail}</div>
                </td>
                <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>
                  <div className='font-medium text-gray-900 dark:text-white'>
                    {item.itemName}
                  </div>
                  <div className='text-xs text-gray-400'>{item.itemType}</div>
                </td>
                <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-medium text-gray-400 dark:text-gray-500'>
                        Harga
                      </span>
                      <span>{formatRupiah(item.price)}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-medium text-gray-400 dark:text-gray-500'>
                        Reward
                      </span>
                      <span className='font-semibold text-emerald-600 dark:text-emerald-400'>
                        {formatRupiah(item.rewardAmount)}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-medium text-gray-400 dark:text-gray-500'>
                        Payout
                      </span>
                      <span className='font-semibold text-amber-600 dark:text-amber-400'>
                        {formatRupiah(item.payoutAmount)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className='px-4 py-3'>
                  <div className='flex flex-col gap-2'>
                    <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200'>
                      {statusLabelMap[item.status] || item.status}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.refundStatus !== "none"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      }`}
                    >
                      {item.payoutStatus}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableCard>
    </div>
  );
}
