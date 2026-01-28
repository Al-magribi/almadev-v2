import { getStudents } from "@/actions/user-actions";
import { formatDate, formatRupiah } from "@/lib/client-utils";
import { Users } from "lucide-react";
import Image from "next/image"; // Pastikan import Image ada

export default async function AdminStudents() {
  // Fetch data langsung di Server Component
  const { success, data: students } = await getStudents();

  if (!success) {
    return (
      <div className='p-4 text-red-500 dark:text-red-400'>
        Gagal memuat data siswa.
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto space-y-6'>
      {/* Header Halaman */}
      <div className='flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors'>
        <div className='flex items-center gap-4 mb-4 sm:mb-0'>
          <div className='p-3 bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl hidden sm:block'>
            <Users size={24} />
          </div>

          <h1 className='text-xl font-bold text-zinc-900 dark:text-zinc-50'>
            Data Siswa
          </h1>
        </div>

        <span className='bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded'>
          Total: {students.length} Siswa
        </span>
      </div>

      {/* Grid List Siswa */}
      <div className='grid gap-6'>
        {students.map((student) => (
          <div
            key={student.id}
            className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all'
          >
            {/* Header: Info Siswa */}
            <div className='p-4 bg-gray-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <div className='relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-800 border dark:border-zinc-700'>
                  {student.profile.avatar ? (
                    <Image
                      src={student.profile.avatar}
                      alt={student.profile.name}
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <div className='flex items-center justify-center h-full text-gray-500 dark:text-zinc-400 font-bold text-lg'>
                      {student.profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-gray-900 dark:text-zinc-50'>
                    {student.profile.name}
                  </h2>
                  <p className='text-sm text-gray-500 dark:text-zinc-400'>
                    {student.profile.email}
                  </p>
                </div>
              </div>

              <div className='text-right flex flex-col items-end'>
                <p className='text-sm text-gray-500 dark:text-zinc-500'>
                  Bergabung pada
                </p>
                <p className='font-medium text-gray-900 dark:text-zinc-200'>
                  {formatDate(student.joinedAt)}
                </p>
              </div>
            </div>

            {/* Body: Statistik & Transaksi */}
            <div className='p-4'>
              <div className='mb-4 flex gap-4 text-sm'>
                <div className='bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-md border border-green-100 dark:border-green-900/50'>
                  Total Belanja: <b>{formatRupiah(student.stats.totalSpent)}</b>
                </div>
                <div className='bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-md border border-purple-100 dark:border-purple-900/50'>
                  Total Item: <b>{student.stats.totalPurchases}</b>
                </div>
              </div>

              {/* Tabel Transaksi Mini */}
              <div className='mt-4'>
                <h3 className='text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 uppercase tracking-wide'>
                  Riwayat Pembelian
                </h3>
                {student.purchases.length > 0 ? (
                  <div className='overflow-x-auto border rounded-md border-gray-200 dark:border-zinc-800'>
                    <table className='w-full text-sm text-left text-gray-500 dark:text-zinc-400'>
                      <thead className='text-xs text-gray-700 dark:text-zinc-300 uppercase bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-200 dark:border-zinc-800'>
                        <tr>
                          <th className='px-3 py-2'>Tanggal</th>
                          <th className='px-3 py-2'>Item</th>
                          <th className='px-3 py-2'>Tipe</th>
                          <th className='px-3 py-2 text-right'>Harga</th>
                          <th className='px-3 py-2 text-center'>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.purchases.map((purchase) => (
                          <tr
                            key={purchase.id}
                            className='border-b last:border-0 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors'
                          >
                            <td className='px-3 py-2'>
                              {formatDate(purchase.date)}
                            </td>
                            <td className='px-3 py-2 font-medium text-gray-900 dark:text-zinc-200'>
                              {purchase.itemName}
                            </td>
                            <td className='px-3 py-2'>
                              <span
                                className={`px-2 py-0.5 rounded text-xs border ${
                                  purchase.itemType === "Course"
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30"
                                    : "bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 border-orange-100 dark:border-orange-900/30"
                                }`}
                              >
                                {purchase.itemType}
                              </span>
                            </td>
                            <td className='px-3 py-2 text-right'>
                              {formatRupiah(purchase.price)}
                            </td>
                            <td className='px-3 py-2 text-center'>
                              <span className='bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs px-2 py-0.5 rounded-full'>
                                {purchase.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className='text-sm text-gray-400 dark:text-zinc-500 italic'>
                    Belum ada riwayat transaksi.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
