import { formatDate } from "@/lib/client-utils";
import { DataTableCard } from "@/components/student/affiliate/AffiliateShared";

export default function AffiliateVisitorsTab({
  filteredVisitors,
  visitorQuery,
  setVisitorQuery,
  visitorType,
  setVisitorType,
  visitorStatus,
  setVisitorStatus,
}) {
  return (
    <div className='space-y-6'>
      <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
              Data Pengunjung Referral
            </h2>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Filter visitor berdasarkan path, campaign, tipe item, dan status konversi.
            </p>
          </div>
          <div className='grid gap-3 md:grid-cols-3'>
            <input
              value={visitorQuery}
              onChange={(event) => setVisitorQuery(event.target.value)}
              placeholder='Cari path atau campaign'
              className='rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white'
            />
            <select
              value={visitorType}
              onChange={(event) => setVisitorType(event.target.value)}
              className='rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white'
            >
              <option value='all'>Semua Tipe</option>
              <option value='Course'>Course</option>
              <option value='Product'>Product</option>
            </select>
            <select
              value={visitorStatus}
              onChange={(event) => setVisitorStatus(event.target.value)}
              className='rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white'
            >
              <option value='all'>Semua Status</option>
              <option value='converted'>Sudah Convert</option>
              <option value='pending'>Belum Convert</option>
            </select>
          </div>
        </div>
      </div>

      <DataTableCard
        rows={filteredVisitors.length}
        emptyMessage='Belum ada data visitor referral yang tercatat.'
      >
        <table className='min-w-full text-sm'>
          <thead className='text-left text-gray-500 dark:text-gray-400'>
            <tr className='border-b border-gray-100 dark:border-gray-800'>
              <th className='px-4 py-3 font-medium'>Waktu</th>
              <th className='px-4 py-3 font-medium'>Tipe</th>
              <th className='px-4 py-3 font-medium'>Landing</th>
              <th className='px-4 py-3 font-medium'>Campaign</th>
              <th className='px-4 py-3 font-medium'>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisitors.map((visitor) => (
              <tr
                key={visitor.id}
                className='border-b border-gray-100 dark:border-gray-800 last:border-0'
              >
                <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>
                  {visitor.visitedAt ? formatDate(visitor.visitedAt) : "-"}
                </td>
                <td className='px-4 py-3'>
                  <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200'>
                    {visitor.itemType}
                  </span>
                </td>
                <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>
                  <div className='max-w-xs truncate'>{visitor.landingPath}</div>
                </td>
                <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>
                  {visitor.utmCampaign || "-"}
                </td>
                <td className='px-4 py-3'>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      visitor.converted
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    }`}
                  >
                    {visitor.converted ? "Converted" : "Belum Convert"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableCard>
    </div>
  );
}
