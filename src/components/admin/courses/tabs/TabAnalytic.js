"use client";

import { useEffect, useState } from "react";
import { getAnalyticData } from "@/actions/dataview-actions";
import {
  TrendingUp,
  Users,
  UserRound,
  DollarSign,
  MousePointer2,
  Receipt,
  BadgePercent,
  CreditCard,
  RotateCcw,
  Loader2,
  BarChart3,
} from "lucide-react";
import { formatRupiah } from "@/lib/client-utils";

export default function TabAnalytic({ courseId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getAnalyticData(courseId);
        setStats(res);
      } catch (err) {
        setError("Gagal memuat data analitik. Coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId]);

  if (loading)
    return (
      <div className='flex flex-col items-center justify-center py-20 text-zinc-400'>
        <Loader2 className='animate-spin mb-2' size={32} />
        <p>Memuat data analitik...</p>
      </div>
    );

  if (error)
    return (
      <div className='flex flex-col items-center justify-center py-20 text-zinc-400'>
        <p className='text-sm'>{error}</p>
      </div>
    );

  const cards = [
    {
      label: "Total Pengunjung",
      value: stats.totalViews,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pengunjung Unik",
      value: stats.uniqueVisitors,
      icon: UserRound,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: "Total Penjualan",
      value: stats.totalSales,
      icon: MousePointer2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Konversi",
      value: `${stats.conversionRate}%`,
      icon: BadgePercent,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Pendapatan (Gross)",
      value: formatRupiah(stats.totalRevenue),
      icon: Receipt,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Pendapatan Bersih",
      value: formatRupiah(stats.netRevenue),
      icon: DollarSign,
      color: "text-lime-600",
      bg: "bg-lime-50",
    },
  ];

  const maxViews = Math.max(1, ...stats.dailyViews.map((d) => d.count));
  const maxSales = Math.max(1, ...stats.dailySales.map((d) => d.count));

  return (
    <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {cards.map((card, i) => (
          <div
            key={i}
            className='bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow'
          >
            <div
              className={`w-12 h-12 ${card.bg} ${card.color} rounded-xl flex items-center justify-center mb-4`}
            >
              <card.icon size={24} />
            </div>
            <p className='text-sm font-medium text-zinc-500'>{card.label}</p>
            <h3 className='text-2xl font-bold text-zinc-900 mt-1'>
              {card.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Highlights */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        <div className='bg-white rounded-2xl border border-zinc-200 p-6'>
          <div className='flex items-center gap-2 text-zinc-500 text-sm'>
            <TrendingUp size={18} />
            Ringkasan Performa
          </div>
          <div className='mt-4 space-y-3'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-zinc-500'>Rata-rata Order (AOV)</span>
              <span className='font-semibold text-zinc-900'>
                {formatRupiah(stats.avgOrderValue || 0)}
              </span>
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-zinc-500'>Refund</span>
              <span className='font-semibold text-zinc-900'>
                {formatRupiah(stats.refundAmount || 0)} ({stats.refundCount || 0}
                )
              </span>
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-zinc-500'>Rasio Konversi</span>
              <span className='font-semibold text-zinc-900'>
                {stats.conversionRate}%
              </span>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl border border-zinc-200 p-6 lg:col-span-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-zinc-500 text-sm'>
              <BarChart3 size={18} />
              Tren 14 Hari Terakhir
            </div>
            <span className='text-xs text-zinc-400'>Views vs Sales</span>
          </div>
          <div className='mt-4 space-y-4'>
            <div>
              <div className='flex items-center gap-2 text-xs text-zinc-500 mb-2'>
                <span className='w-2 h-2 rounded-full bg-blue-500' />
                Pengunjung
              </div>
              <div className='flex items-end gap-1'>
                {stats.dailyViews.map((item) => {
                  return (
                    <div key={item.date} className='flex-1 flex flex-col'>
                      <div className='h-16 md:h-20 flex items-end'>
                        <div
                          className='w-full rounded-md bg-blue-500/70'
                          style={{
                            height: `${(item.count / maxViews) * 100}%`,
                          }}
                        />
                      </div>
                      <span className='text-[10px] text-zinc-400 text-center mt-1'>
                        {item.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div className='flex items-center gap-2 text-xs text-zinc-500 mb-2'>
                <span className='w-2 h-2 rounded-full bg-emerald-500' />
                Penjualan
              </div>
              <div className='flex items-end gap-1'>
                {stats.dailySales.map((item) => {
                  return (
                    <div key={item.date} className='flex-1 flex flex-col'>
                      <div className='h-16 md:h-20 flex items-end'>
                        <div
                          className='w-full rounded-md bg-emerald-500/70'
                          style={{
                            height: `${(item.count / maxSales) * 100}%`,
                          }}
                        />
                      </div>
                      <span className='text-[10px] text-zinc-400 text-center mt-1'>
                        {item.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
        <div className='bg-white rounded-2xl border border-zinc-200 overflow-hidden'>
          <div className='p-6 border-b border-zinc-100 flex items-center gap-2'>
            <BarChart3 size={18} className='text-zinc-400' />
            <h3 className='font-bold text-zinc-900'>
              Sumber Trafik (UTM Source)
            </h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead className='bg-zinc-50 text-zinc-500 text-xs uppercase font-bold'>
                <tr>
                  <th className='px-6 py-4'>Source</th>
                  <th className='px-6 py-4 text-right'>Kunjungan</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-zinc-100'>
                {stats.sourceStats.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className='px-6 py-6 text-center text-zinc-400 text-sm'
                    >
                      Belum ada data
                    </td>
                  </tr>
                ) : (
                  stats.sourceStats.map((item, idx) => (
                    <tr key={idx} className='hover:bg-zinc-50 transition-colors'>
                      <td className='px-6 py-4 font-medium text-zinc-700'>
                        {item.source || "Organic/Direct"}
                      </td>
                      <td className='px-6 py-4 text-right text-zinc-900 font-semibold'>
                        {item.count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className='bg-white rounded-2xl border border-zinc-200 overflow-hidden'>
          <div className='p-6 border-b border-zinc-100 flex items-center gap-2'>
            <BarChart3 size={18} className='text-zinc-400' />
            <h3 className='font-bold text-zinc-900'>
              UTM Medium Teratas
            </h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead className='bg-zinc-50 text-zinc-500 text-xs uppercase font-bold'>
                <tr>
                  <th className='px-6 py-4'>Medium</th>
                  <th className='px-6 py-4 text-right'>Kunjungan</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-zinc-100'>
                {stats.mediumStats.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className='px-6 py-6 text-center text-zinc-400 text-sm'
                    >
                      Belum ada data
                    </td>
                  </tr>
                ) : (
                  stats.mediumStats.map((item, idx) => (
                    <tr key={idx} className='hover:bg-zinc-50 transition-colors'>
                      <td className='px-6 py-4 font-medium text-zinc-700'>
                        {item.medium || "Unknown"}
                      </td>
                      <td className='px-6 py-4 text-right text-zinc-900 font-semibold'>
                        {item.count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
        <div className='bg-white rounded-2xl border border-zinc-200 overflow-hidden'>
          <div className='p-6 border-b border-zinc-100 flex items-center gap-2'>
            <CreditCard size={18} className='text-zinc-400' />
            <h3 className='font-bold text-zinc-900'>Metode Pembayaran</h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead className='bg-zinc-50 text-zinc-500 text-xs uppercase font-bold'>
                <tr>
                  <th className='px-6 py-4'>Metode</th>
                  <th className='px-6 py-4 text-right'>Transaksi</th>
                  <th className='px-6 py-4 text-right'>Pendapatan</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-zinc-100'>
                {stats.paymentMethodStats.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className='px-6 py-6 text-center text-zinc-400 text-sm'
                    >
                      Belum ada data
                    </td>
                  </tr>
                ) : (
                  stats.paymentMethodStats.map((item, idx) => (
                    <tr key={idx} className='hover:bg-zinc-50 transition-colors'>
                      <td className='px-6 py-4 font-medium text-zinc-700'>
                        {item.method || "unknown"}
                      </td>
                      <td className='px-6 py-4 text-right text-zinc-900 font-semibold'>
                        {item.count}
                      </td>
                      <td className='px-6 py-4 text-right text-zinc-900 font-semibold'>
                        {formatRupiah(item.revenue || 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className='bg-white rounded-2xl border border-zinc-200 overflow-hidden'>
          <div className='p-6 border-b border-zinc-100 flex items-center gap-2'>
            <RotateCcw size={18} className='text-zinc-400' />
            <h3 className='font-bold text-zinc-900'>Status Transaksi</h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead className='bg-zinc-50 text-zinc-500 text-xs uppercase font-bold'>
                <tr>
                  <th className='px-6 py-4'>Status</th>
                  <th className='px-6 py-4 text-right'>Jumlah</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-zinc-100'>
                {stats.statusStats.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className='px-6 py-6 text-center text-zinc-400 text-sm'
                    >
                      Belum ada data
                    </td>
                  </tr>
                ) : (
                  stats.statusStats.map((item, idx) => (
                    <tr key={idx} className='hover:bg-zinc-50 transition-colors'>
                      <td className='px-6 py-4 font-medium text-zinc-700'>
                        {item.status}
                      </td>
                      <td className='px-6 py-4 text-right text-zinc-900 font-semibold'>
                        {item.count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
