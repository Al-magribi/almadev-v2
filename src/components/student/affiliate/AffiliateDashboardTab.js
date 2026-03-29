import { CheckCircle2 } from "lucide-react";
import { formatRupiah } from "@/lib/client-utils";
import { QuickInfo } from "@/components/student/affiliate/AffiliateShared";

export default function AffiliateDashboardTab({
  affiliateCode,
  metrics,
  nextPayoutDate,
}) {
  return (
    <div className='grid gap-6 lg:grid-cols-[1.2fr,0.8fr]'>
      <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
        <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
          Rangkuman Affiliate
        </h2>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
          Gambaran cepat performa affiliate Anda sejauh ini.
        </p>
        <div className='mt-6 grid gap-4 md:grid-cols-2'>
          <QuickInfo label='Kode referral' value={affiliateCode} />
          <QuickInfo label='Jadwal payout berikutnya' value={nextPayoutDate} />
          <QuickInfo
            label='Total reward'
            value={formatRupiah(metrics?.rewardTotal || 0)}
          />
          <QuickInfo
            label='Reward siap proses'
            value={formatRupiah(metrics?.rewardReady || 0)}
          />
          <QuickInfo
            label='Total transaksi referral'
            value={String(metrics?.transactions || 0)}
          />
        </div>
      </div>

      <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
        <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
          Highlight Program
        </h2>
        <div className='mt-5 space-y-4'>
          {[
            "Setiap visitor dari link referral Anda akan tercatat di tab Visitor.",
            "Transaksi yang valid akan tampil di tab Transaksi beserta reward dan status payout.",
            "Katalog memuat semua kursus dan produk dengan tombol copy link referral.",
            "Rekening payout dapat diperbarui kapan saja dari tab Rekening.",
          ].map((item) => (
            <div key={item} className='flex items-start gap-3'>
              <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-emerald-500' />
              <p className='text-sm leading-6 text-gray-600 dark:text-gray-300'>
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
