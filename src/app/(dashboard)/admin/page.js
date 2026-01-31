import { getCurrentUser } from "@/lib/auth-service";
import dbConnect from "@/lib/db";
import { formatDate, formatRupiah } from "@/lib/client-utils";
import Course from "@/models/Course";
import Progress from "@/models/Progress";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import ViewData from "@/models/ViewData";
import {
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  CreditCard,
  BarChart3,
} from "lucide-react";

function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  bgClass,
  textClass,
}) {
  return (
    <div className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 group'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-sm font-medium text-zinc-500 dark:text-zinc-400'>
            {title}
          </p>
          <h3 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2'>
            {value}
          </h3>
          {change && (
            <div className='flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
              <TrendingUp size={12} />
              <span>{change}</span>
              {changeLabel && (
                <span className='text-zinc-400 dark:text-zinc-500'>
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl ${bgClass} group-hover:scale-110 transition-transform`}
        >
          <Icon className={`w-6 h-6 ${textClass}`} />
        </div>
      </div>
    </div>
  );
}

const percentChange = (current, previous) => {
  if (!previous || previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
};

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  await dbConnect();

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  const start30 = new Date(endDate);
  start30.setDate(endDate.getDate() - 29);
  start30.setHours(0, 0, 0, 0);
  const prev30 = new Date(start30);
  prev30.setDate(start30.getDate() - 30);
  const start14 = new Date(endDate);
  start14.setDate(endDate.getDate() - 13);
  start14.setHours(0, 0, 0, 0);
  const start7 = new Date(endDate);
  start7.setDate(endDate.getDate() - 6);
  start7.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    newStudents30,
    previousStudents30,
    totalCourses,
    newCourses30,
    totalViews,
    views30,
    totalSales,
    sales30,
    revenueAgg,
    revenue30Agg,
    revenuePrevAgg,
    activeLearners,
  ] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({
      role: "student",
      createdAt: { $gte: start30, $lte: endDate },
    }),
    User.countDocuments({
      role: "student",
      createdAt: { $gte: prev30, $lt: start30 },
    }),
    Course.countDocuments({ isActive: true }),
    Course.countDocuments({ createdAt: { $gte: start30, $lte: endDate } }),
    ViewData.countDocuments({}),
    ViewData.countDocuments({ createdAt: { $gte: start30, $lte: endDate } }),
    Transaction.countDocuments({ status: "completed" }),
    Transaction.countDocuments({
      status: "completed",
      createdAt: { $gte: start30, $lte: endDate },
    }),
    Transaction.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, revenue: { $sum: "$price" } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: start30, $lte: endDate },
        },
      },
      { $group: { _id: null, revenue: { $sum: "$price" } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: prev30, $lt: start30 },
        },
      },
      { $group: { _id: null, revenue: { $sum: "$price" } } },
    ]),
    Progress.distinct("userId", { lastWatchedAt: { $gte: start7 } }),
  ]);

  const totalRevenue = revenueAgg[0]?.revenue || 0;
  const revenue30 = revenue30Agg[0]?.revenue || 0;
  const revenuePrev = revenuePrevAgg[0]?.revenue || 0;

  const conversionRate =
    views30 > 0 ? Number(((sales30 / views30) * 100).toFixed(2)) : 0;

  const [dailyRevenueAgg, dailySalesAgg] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: start14, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: start14, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const toDailySeries = (list, field) => {
    const map = new Map(list.map((item) => [item._id, item[field]]));
    const result = [];
    for (let i = 0; i < 14; i += 1) {
      const date = new Date(start14);
      date.setDate(start14.getDate() + i);
      const key = date.toISOString().slice(0, 10);
      result.push({ date: key, value: map.get(key) || 0 });
    }
    return result;
  };

  const dailyRevenue = toDailySeries(dailyRevenueAgg, "revenue");
  const dailySales = toDailySeries(dailySalesAgg, "count");
  const maxRevenue = Math.max(1, ...dailyRevenue.map((d) => d.value));
  const maxSales = Math.max(1, ...dailySales.map((d) => d.value));

  const [topCourses, recentTransactions] = await Promise.all([
    Transaction.aggregate([
      { $match: { status: "completed", itemType: "Course" } },
      {
        $group: {
          _id: "$itemId",
          courseName: { $first: "$itemName" },
          revenue: { $sum: "$price" },
          sales: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
    Transaction.find({ status: "completed" })
      .select("itemName price paymentMethod status createdAt transactionCode")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
      change: percentChange(newStudents30, previousStudents30),
      changeLabel: "30 hari",
      icon: Users,
      bgClass: "bg-blue-500/10 dark:bg-blue-500/20",
      textClass: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Active Learners (7d)",
      value: activeLearners.length,
      change: null,
      icon: Activity,
      bgClass: "bg-orange-500/10 dark:bg-orange-500/20",
      textClass: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Revenue (30d)",
      value: formatRupiah(revenue30),
      change: percentChange(revenue30, revenuePrev),
      changeLabel: "vs 30 hari lalu",
      icon: DollarSign,
      bgClass: "bg-emerald-500/10 dark:bg-emerald-500/20",
      textClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Conversion (30d)",
      value: `${conversionRate}%`,
      change: `${sales30} sales`,
      changeLabel: `${views30} views`,
      icon: CreditCard,
      bgClass: "bg-violet-500/10 dark:bg-violet-500/20",
      textClass: "text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className='space-y-8'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50'>
            Dashboard Admin
          </h1>
          <p className='text-zinc-500 dark:text-zinc-400 mt-1'>
            Welcome back,{" "}
            <span className='font-semibold text-violet-600 dark:text-violet-400'>
              {user?.email || "Administrator"}
            </span>
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'>
            Total Revenue:{" "}
            <span className='text-zinc-900 dark:text-zinc-100 font-semibold'>
              {formatRupiah(totalRevenue)}
            </span>
          </div>
          <button className='px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm'>
            Download Report
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 lg:col-span-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm'>
              <BarChart3 size={18} />
              Revenue Overview (14 hari)
            </div>
            <span className='text-xs text-zinc-400'>Sales & Revenue</span>
          </div>
          <div className='mt-6 space-y-6'>
            <div>
              <div className='flex items-center gap-2 text-xs text-zinc-500 mb-2'>
                <span className='w-2 h-2 rounded-full bg-emerald-500' />
                Revenue
              </div>
              <div className='flex items-end gap-1'>
                {dailyRevenue.map((item) => (
                  <div key={item.date} className='flex-1 flex flex-col'>
                    <div className='h-20 flex items-end'>
                      <div
                        className='w-full rounded-md bg-emerald-500/70'
                        style={{ height: `${(item.value / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className='text-[10px] text-zinc-400 text-center mt-1'>
                      {item.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className='flex items-center gap-2 text-xs text-zinc-500 mb-2'>
                <span className='w-2 h-2 rounded-full bg-blue-500' />
                Sales
              </div>
              <div className='flex items-end gap-1'>
                {dailySales.map((item) => (
                  <div key={item.date} className='flex-1 flex flex-col'>
                    <div className='h-16 flex items-end'>
                      <div
                        className='w-full rounded-md bg-blue-500/70'
                        style={{ height: `${(item.value / maxSales) * 100}%` }}
                      />
                    </div>
                    <span className='text-[10px] text-zinc-400 text-center mt-1'>
                      {item.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800'>
          <h3 className='font-bold text-zinc-900 dark:text-zinc-100 mb-4'>
            Top Courses
          </h3>
          <div className='space-y-4'>
            {topCourses.length === 0 ? (
              <p className='text-sm text-zinc-400'>Belum ada data penjualan.</p>
            ) : (
              topCourses.map((course) => (
                <div
                  key={course._id}
                  className='flex items-center justify-between gap-4'
                >
                  <div>
                    <p className='text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1'>
                      {course.courseName || "Untitled Course"}
                    </p>
                    <p className='text-xs text-zinc-500'>
                      {course.sales} transaksi
                    </p>
                  </div>
                  <span className='text-sm font-semibold text-emerald-600 dark:text-emerald-400'>
                    {formatRupiah(course.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        <div className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-bold text-zinc-900 dark:text-zinc-100'>
              Recent Transactions
            </h3>
            <span className='text-xs text-zinc-400'>
              {sales30} transaksi 30 hari terakhir
            </span>
          </div>
          <div className='space-y-4'>
            {recentTransactions.length === 0 ? (
              <p className='text-sm text-zinc-400'>Belum ada transaksi.</p>
            ) : (
              recentTransactions.map((trx) => (
                <div
                  key={trx._id}
                  className='flex items-start justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0'
                >
                  <div>
                    <p className='text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
                      {trx.itemName || "Order"}
                    </p>
                    <p className='text-xs text-zinc-500'>
                      {trx.transactionCode} •{" "}
                      {formatDate(trx.createdAt)}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
                      {formatRupiah(trx.price)}
                    </p>
                    <p className='text-xs text-zinc-500'>
                      {trx.paymentMethod || "unknown"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800'>
          <h3 className='font-bold text-zinc-900 dark:text-zinc-100 mb-4'>
            Product & Audience Snapshot
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='p-4 rounded-xl border border-zinc-100 dark:border-zinc-800'>
              <p className='text-xs text-zinc-500'>Active Courses</p>
              <p className='text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
                {totalCourses}
              </p>
              <p className='text-xs text-zinc-400 mt-1'>
                +{newCourses30} kursus baru (30d)
              </p>
            </div>
            <div className='p-4 rounded-xl border border-zinc-100 dark:border-zinc-800'>
              <p className='text-xs text-zinc-500'>Total Views</p>
              <p className='text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
                {totalViews}
              </p>
              <p className='text-xs text-zinc-400 mt-1'>
                {views30} views (30d)
              </p>
            </div>
            <div className='p-4 rounded-xl border border-zinc-100 dark:border-zinc-800'>
              <p className='text-xs text-zinc-500'>Total Sales</p>
              <p className='text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
                {totalSales}
              </p>
              <p className='text-xs text-zinc-400 mt-1'>
                {sales30} sales (30d)
              </p>
            </div>
            <div className='p-4 rounded-xl border border-zinc-100 dark:border-zinc-800'>
              <p className='text-xs text-zinc-500'>Conversion Rate</p>
              <p className='text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
                {conversionRate}%
              </p>
              <p className='text-xs text-zinc-400 mt-1'>
                dari {views30} views (30d)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
