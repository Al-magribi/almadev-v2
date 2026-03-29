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

export default function TransactionAffiliateMembersTab({ members = [] }) {
  return (
    <div className='overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
      <div className='border-b border-zinc-200 px-6 py-5 dark:border-zinc-800'>
        <h2 className='text-lg font-bold text-zinc-900 dark:text-zinc-50'>
          Member Affiliate
        </h2>
        <p className='text-sm text-zinc-500 dark:text-zinc-400'>
          Daftar user yang sudah bergabung ke program affiliate beserta performa singkatnya.
        </p>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500 dark:bg-zinc-950/50 dark:text-zinc-400'>
            <tr>
              <th className='px-6 py-4'>User</th>
              <th className='px-6 py-4'>Kode Referral</th>
              <th className='px-6 py-4'>Bank</th>
              <th className='px-6 py-4'>Gabung</th>
              <th className='px-6 py-4'>Transaksi</th>
              <th className='px-6 py-4'>Total Reward</th>
              <th className='px-6 py-4'>Siap Payout</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-zinc-100 dark:divide-zinc-800'>
            {members.length > 0 ? (
              members.map((member) => (
                <tr key={member.id}>
                  <td className='px-6 py-4'>
                    <div className='font-semibold text-zinc-900 dark:text-zinc-100'>
                      {member.name}
                    </div>
                    <div className='text-xs text-zinc-500'>{member.email}</div>
                    <div className='text-xs text-zinc-400'>{member.phone}</div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='font-mono font-semibold text-zinc-900 dark:text-zinc-100'>
                      {member.referralCode}
                    </div>
                    <div className='text-xs text-zinc-500 capitalize'>
                      {member.affiliateStatus}
                    </div>
                  </td>
                  <td className='px-6 py-4 text-zinc-600 dark:text-zinc-300'>
                    <div>{member.bankInfo?.bankName || "-"}</div>
                    <div className='text-xs text-zinc-500'>
                      {member.bankInfo?.accountName || "-"}
                    </div>
                    <div className='text-xs text-zinc-400'>
                      {member.bankInfo?.accountNumber || "-"}
                    </div>
                  </td>
                  <td className='px-6 py-4 text-zinc-600 dark:text-zinc-300'>
                    {formatDate(member.affiliateJoinedAt)}
                  </td>
                  <td className='px-6 py-4 text-zinc-900 dark:text-zinc-100'>
                    <div className='font-semibold'>{member.totalTransactions}</div>
                    <div className='text-xs text-zinc-500'>
                      {member.completedTransactions} selesai
                    </div>
                  </td>
                  <td className='px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400'>
                    {formatRupiah(member.rewardTotal || 0)}
                  </td>
                  <td className='px-6 py-4 font-semibold text-amber-600 dark:text-amber-400'>
                    {formatRupiah(member.rewardReady || 0)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='7' className='px-6 py-12 text-center text-zinc-500'>
                  Belum ada member affiliate yang terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
