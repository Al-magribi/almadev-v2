import { formatRupiah } from "@/lib/client-utils";
import {
  TrendingUp,
  Wallet,
  CreditCard,
  Activity,
  Link,
  ShoppingBag,
  BookOpen,
} from "lucide-react";

export default function TransactionAnalysis({ analytics }) {
  if (!analytics) return null;

  const { totalRevenue, statusDistribution, utmSources, typeDistribution } =
    analytics;

  // Hitung total transaksi untuk persentase
  const totalTransactions = statusDistribution.reduce(
    (acc, curr) => acc + curr.count,
    0,
  );
  const successCount =
    statusDistribution.find((s) => s._id === "completed")?.count || 0;
  const successRate =
    totalTransactions > 0
      ? Math.round((successCount / totalTransactions) * 100)
      : 0;

  return (
    <div className='space-y-6 mb-8'>
      {/* 1. Top Cards - Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Total Revenue */}
        <div className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400'>
              <TrendingUp size={20} className='animate-pulse' />
            </div>
            <p className='text-sm font-medium text-zinc-500 dark:text-zinc-400'>
              Total Pendapatan
            </p>
          </div>
          <h3 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50'>
            {formatRupiah(totalRevenue)}
          </h3>
        </div>

        {/* Success Rate */}
        <div className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400'>
              <Activity size={20} className='animate-pulse' />
            </div>
            <p className='text-sm font-medium text-zinc-500 dark:text-zinc-400'>
              Success Rate
            </p>
          </div>
          <h3 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50'>
            {successRate}%
          </h3>
          <p className='text-xs text-zinc-500 mt-1'>
            Dari {totalTransactions} total transaksi
          </p>
        </div>

        {/* Course vs Product Sales */}
        {typeDistribution.map((type) => (
          <div
            key={type._id}
            className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm'
          >
            <div className='flex items-center gap-3 mb-2'>
              <div
                className={`p-2 rounded-lg ${type._id === "Course" ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600" : "bg-orange-100 dark:bg-orange-900/30 text-orange-600"}`}
              >
                {type._id === "Course" ? (
                  <BookOpen size={20} />
                ) : (
                  <ShoppingBag size={20} />
                )}
              </div>
              <p className='text-sm font-medium text-zinc-500 dark:text-zinc-400'>
                Penjualan {type._id}
              </p>
            </div>
            <h3 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50'>
              {type.count}{" "}
              <span className='text-sm font-normal text-zinc-500'>Unit</span>
            </h3>
            <p className='text-xs text-zinc-500 mt-1'>
              {formatRupiah(type.revenue)}
            </p>
          </div>
        ))}
      </div>

      {/* 2. UTM Sources Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm'>
          <div className='flex items-center gap-2 mb-6'>
            <Link className='text-zinc-400' size={20} />
            <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
              Sumber Traffic (UTM)
            </h3>
          </div>

          <div className='space-y-4'>
            {utmSources.map((source, idx) => {
              const maxCount = Math.max(...utmSources.map((s) => s.count));
              const percentage = (source.count / maxCount) * 100;

              return (
                <div key={idx} className='group'>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='font-medium text-zinc-700 dark:text-zinc-300 capitalize'>
                      {source._id || "Direct / Unknown"}
                    </span>
                    <span className='text-zinc-500'>
                      {source.count} Transaksi
                    </span>
                  </div>
                  <div className='h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-violet-600 dark:bg-violet-500 rounded-full transition-all duration-1000 ease-out'
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className='text-xs text-zinc-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                    Revenue: {formatRupiah(source.revenue)}
                  </p>
                </div>
              );
            })}
            {utmSources.length === 0 && (
              <p className='text-sm text-zinc-500 italic'>
                Belum ada data UTM terekam.
              </p>
            )}
          </div>
        </div>

        {/* Placeholder untuk Chart Lain / Distribusi Status yang lebih detail */}
        <div className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center items-center text-center'>
          <div className='p-4 bg-green-50 dark:bg-zinc-800 rounded-full mb-3'>
            <CreditCard className='w-8 h-8 text-green-600 dark:text-green-400 animate-pulse' />
          </div>
          <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
            Distribusi Pembayaran
          </h3>
          <p className='text-sm text-zinc-500 mt-2 max-w-xs'>
            Detail metode pembayaran (Bank Transfer, E-Wallet, dll) akan muncul
            di sini seiring bertambahnya data.
          </p>
        </div>
      </div>
    </div>
  );
}
