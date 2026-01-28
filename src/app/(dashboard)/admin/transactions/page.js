import {
  getAllTransactions,
  getTransactionAnalytics,
} from "@/actions/transaction-actions";
import TransactionAnalysis from "@/components/admin/transaction/TransactionAnalysis";
import TransactionList from "@/components/admin/transaction/TransactionList";
import { Landmark, RefreshCcw } from "lucide-react";

export const dynamic = "force-dynamic"; // Pastikan data selalu fresh

export default async function AdminTransactions() {
  // Fetch data secara parallel untuk performa
  const [listData, analyticsData] = await Promise.all([
    getAllTransactions(),
    getTransactionAnalytics(),
  ]);

  const transactions = listData.success ? listData.data : [];
  const analytics = analyticsData.success ? analyticsData.data : null;

  return (
    <div className='max-w-7xl mx-auto space-y-8 pb-10'>
      {/* Header Halaman */}

      <div className='flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors'>
        <div className='flex items-center gap-4 mb-4 sm:mb-0'>
          <div className='p-3 bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl hidden sm:block'>
            <Landmark size={24} />
          </div>

          <div>
            <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight'>
              Dashboard Transaksi
            </h1>
            <p className='text-zinc-500 dark:text-zinc-400 mt-1'>
              Analisa pendapatan dan kelola riwayat pembayaran siswa.
            </p>
          </div>
        </div>

        {/* Tombol Refresh/Action (Optional) */}
        <button className='flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm'>
          <RefreshCcw size={14} />
          Refresh Data
        </button>
      </div>

      {/* Analytics Section */}
      <section>
        <TransactionAnalysis analytics={analytics} />
      </section>

      {/* List Section */}
      <section>
        <TransactionList transactions={transactions} />
      </section>
    </div>
  );
}
