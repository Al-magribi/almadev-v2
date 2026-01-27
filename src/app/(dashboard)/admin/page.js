import { getCurrentUser } from "@/lib/auth-service";
import {
  Users,
  BookOpen,
  DollarSign,
  Activity,
  TrendingUp,
} from "lucide-react";

// Komponen Card Updated
function StatCard({ title, value, change, icon: Icon, bgClass, textClass }) {
  return (
    <div className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 group'>
      <div className='flex items-start justify-between'>
        <div>
          <p className='text-sm font-medium text-zinc-500 dark:text-zinc-400'>
            {title}
          </p>
          <h3 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2'>
            {value}
          </h3>
          {change && (
            <div className='flex items-center gap-1 mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
              <TrendingUp size={12} />
              <span>{change}</span>
            </div>
          )}
        </div>

        {/* PERBAIKAN DISINI: 
          1. Menggunakan class opacity modifier (/10 dan /20) langsung pada bg color.
          2. Class text ditulis eksplisit via props.
        */}
        <div
          className={`p-3 rounded-xl ${bgClass} group-hover:scale-110 transition-transform`}
        >
          <Icon className={`w-6 h-6 ${textClass}`} />
        </div>
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  const user = await getCurrentUser();

  // PERBAIKAN DATA:
  // Definisikan class secara eksplisit agar Tailwind JIT membacanya.
  // Gunakan format color/opacity (misal: bg-blue-500/10) agar background transparan.
  const stats = [
    {
      title: "Total Students",
      value: "1,204",
      change: "+12% from last month",
      icon: Users,
      bgClass: "bg-blue-500/10 dark:bg-blue-500/20", // Background transparan
      textClass: "text-blue-600 dark:text-blue-400", // Icon Solid
    },
    {
      title: "Active Courses",
      value: "12",
      change: "+2 new this week",
      icon: BookOpen,
      bgClass: "bg-violet-500/10 dark:bg-violet-500/20",
      textClass: "text-violet-600 dark:text-violet-400",
    },
    {
      title: "Total Revenue",
      value: "Rp 128jt",
      change: "+8.1% from last month",
      icon: DollarSign,
      bgClass: "bg-emerald-500/10 dark:bg-emerald-500/20",
      textClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Engagement",
      value: "84%",
      change: "+4% daily average",
      icon: Activity,
      bgClass: "bg-orange-500/10 dark:bg-orange-500/20",
      textClass: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className='space-y-8'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50'>
            Dashboard
          </h1>
          <p className='text-zinc-500 dark:text-zinc-400 mt-1'>
            Welcome back,{" "}
            <span className='font-semibold text-violet-600 dark:text-violet-400'>
              {user?.email || "Administrator"}
            </span>
          </p>
        </div>
        <button className='px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm'>
          Download Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Content Area Dummy */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 min-h-300px flex flex-col'>
          <h3 className='font-bold text-zinc-900 dark:text-zinc-100 mb-4'>
            Revenue Overview
          </h3>
          <div className='flex-1 flex items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950/50'>
            <span className='text-zinc-400 text-sm'>
              Chart Visualization Component
            </span>
          </div>
        </div>
        <div className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 min-h-300px flex flex-col'>
          <h3 className='font-bold text-zinc-900 dark:text-zinc-100 mb-4'>
            Recent Activity
          </h3>
          <div className='space-y-4'>
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className='flex gap-4 items-start pb-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0'
              >
                <div className='w-2 h-2 mt-2 rounded-full bg-violet-500 shrink-0' />
                <div>
                  <p className='text-sm text-zinc-800 dark:text-zinc-200 font-medium'>
                    New student enrolled in "React Mastery"
                  </p>
                  <p className='text-xs text-zinc-500 dark:text-zinc-500'>
                    2 minutes ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
