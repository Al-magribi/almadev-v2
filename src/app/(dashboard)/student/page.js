// src/app/page.js (atau lokasi student dashboard Anda)
import { getCurrentUser } from "@/lib/auth-service";
import { PlayCircle, Clock, Trophy, TrendingUp, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function StudentDashboard() {
  const user = await getCurrentUser();

  const stats = [
    {
      label: "Kursus Aktif",
      value: "3",
      icon: PlayCircle,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Jam Belajar",
      value: "12.5",
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Sertifikat",
      value: "1",
      icon: Trophy,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
  ];

  const continueLearning = [
    {
      id: 1,
      title: "Full Stack JavaScript Developer",
      progress: 65,
      lastLesson: "Membuat API dengan Express",
      image: "bg-gradient-to-br from-blue-900 to-slate-900",
    },
    {
      id: 2,
      title: "Mastering React.js & Next.js",
      progress: 20,
      lastLesson: "Konsep Server Component",
      image: "bg-gradient-to-br from-purple-900 to-slate-900",
    },
  ];

  return (
    <div className='space-y-8 animate-in fade-in duration-500'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          {/* UBAH: text-gray-900 untuk light, text-white untuk dark */}
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Dashboard
          </h1>
          <p className='text-gray-500 dark:text-gray-400 mt-1'>
            Selamat datang kembali,{" "}
            <span className='text-blue-600 dark:text-blue-400 font-semibold'>
              {user?.name || user?.email}
            </span>
            ! 👋
          </p>
        </div>
        {/* Card Status: bg-white untuk light, bg-gray-900 untuk dark */}
        <div className='px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 shadow-sm'>
          <TrendingUp className='w-4 h-4 text-green-500' />
          Status Akun:{" "}
          <span className='text-green-600 dark:text-green-400 font-medium'>
            Active Student
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {stats.map((stat, index) => (
          <div
            key={index}
            // UBAH: Card style dinamis
            className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl flex items-center gap-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors shadow-sm'
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className='text-gray-500 dark:text-gray-400 text-sm'>
                {stat.label}
              </p>
              <h3 className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Learning Section */}
      <div>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            Lanjutkan Belajar
          </h2>
          <Link
            href='/student/my-courses'
            className='text-sm text-blue-600 dark:text-blue-500 hover:underline'
          >
            Lihat Semua
          </Link>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {continueLearning.map((course) => (
            <div
              key={course.id}
              // UBAH: Card style dinamis
              className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all group cursor-pointer relative overflow-hidden shadow-sm'
            >
              <div className='flex gap-5'>
                <div
                  className={`w-24 h-24 rounded-xl shrink-0 ${course.image} flex items-center justify-center`}
                >
                  <BookOpen className='text-white/20 w-8 h-8' />
                </div>

                <div className='flex-1'>
                  {/* UBAH: Text color dinamis */}
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1'>
                    {course.title}
                  </h3>
                  <p className='text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4'>
                    Topik: {course.lastLesson}
                  </p>

                  <div className='space-y-2'>
                    <div className='flex justify-between text-xs'>
                      <span className='text-gray-500 dark:text-gray-400'>
                        {course.progress}% Selesai
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden'>
                      <div
                        className='bg-blue-600 h-full rounded-full transition-all duration-500'
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
