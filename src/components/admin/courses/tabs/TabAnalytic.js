"use client";

import { useEffect, useState } from "react";
import { getAnalyticData } from "@/actions/dataview-actions";
import {
  TrendingUp,
  Users,
  DollarSign,
  MousePointer2,
  Loader2,
  BarChart3,
} from "lucide-react";
import { formatRupiah } from "@/lib/client-utils";

export default function TabAnalytic({ courseId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await getAnalyticData(courseId);
      setStats(res);
      setLoading(false);
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

  const cards = [
    {
      label: "Total Pengunjung",
      value: stats.totalViews,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
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
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Pendapatan",
      value: formatRupiah(stats.totalRevenue),
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
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

      {/* Traffic Source Table */}
      <div className='bg-white rounded-2xl border border-zinc-200 overflow-hidden'>
        <div className='p-6 border-b border-zinc-100 flex items-center gap-2'>
          <BarChart3 size={20} className='text-zinc-400' />
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
              {stats.sourceStats.map((item, idx) => (
                <tr key={idx} className='hover:bg-zinc-50 transition-colors'>
                  <td className='px-6 py-4 font-medium text-zinc-700'>
                    {item.source || "Organic/Direct"}
                  </td>
                  <td className='px-6 py-4 text-right text-zinc-900 font-semibold'>
                    {item.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
