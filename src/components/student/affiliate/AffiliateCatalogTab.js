import { ArrowRight, Copy } from "lucide-react";
import { formatRupiah } from "@/lib/client-utils";

export default function AffiliateCatalogTab({ catalog, copyText }) {
  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            Katalog Link Referral
          </h2>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Bagikan link langsung ke halaman detail produk atau kursus.
          </p>
        </div>
        <div className='text-sm text-gray-500 dark:text-gray-400'>
          Total item:{" "}
          <span className='font-semibold text-gray-900 dark:text-white'>
            {catalog.length}
          </span>
        </div>
      </div>

      <div className='mt-6 grid gap-4 lg:grid-cols-2'>
        {catalog.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className='rounded-2xl border border-gray-100 bg-gray-50/70 p-5 dark:border-gray-800 dark:bg-gray-950/40'
          >
            <div className='flex items-start justify-between gap-4'>
              <div>
                <div className='inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white dark:bg-slate-100 dark:text-slate-900'>
                  {item.type}
                </div>
                <h3 className='mt-3 text-lg font-bold text-gray-900 dark:text-white'>
                  {item.name}
                </h3>
                <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
                  Reward referral:{" "}
                  <span className='font-semibold text-emerald-600 dark:text-emerald-400'>
                    {formatRupiah(item.rewardAmount)}
                  </span>
                </p>
              </div>
              <div className='rounded-xl bg-amber-500/10 px-3 py-2 text-right'>
                <p className='text-[11px] uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300'>
                  Reward
                </p>
                <p className='text-sm font-bold text-amber-700 dark:text-amber-200'>
                  {formatRupiah(item.rewardAmount)}
                </p>
              </div>
            </div>

            <div className='mt-4 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900'>
              <p className='break-all text-xs leading-6 text-gray-500 dark:text-gray-400'>
                {item.referralLink}
              </p>
            </div>

            <div className='mt-4 flex flex-wrap gap-3'>
              <button
                type='button'
                onClick={() =>
                  copyText(item.referralLink, `Link ${item.name} berhasil disalin.`)
                }
                className='inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500'
              >
                <Copy className='h-4 w-4' />
                Copy Link Referral
              </button>
              <a
                href={item.referralLink}
                target='_blank'
                rel='noreferrer'
                className='inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200'
              >
                Lihat Detail
                <ArrowRight className='h-4 w-4' />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
