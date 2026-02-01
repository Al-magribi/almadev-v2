import { getCurrentUser } from "@/lib/auth-service";
import dbConnect from "@/lib/db";
import { formatDate } from "@/lib/client-utils";
import Course from "@/models/Course";
import Progress from "@/models/Progress";
import Transaction from "@/models/Transaction";
import { PlayCircle, Clock, Trophy, TrendingUp, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function StudentDashboard() {
  const user = await getCurrentUser();
  await dbConnect();

  if (!user) {
    return (
      <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6'>
        <p className='text-gray-500 dark:text-gray-400 text-sm'>
          Anda harus login untuk melihat dashboard.
        </p>
      </div>
    );
  }

  const userId = user._id;

  const [
    progressAgg,
    totalWatchAgg,
    completedLessonsCount,
    recentProgress,
    purchasedCourseIds,
  ] = await Promise.all([
    Progress.aggregate([
      { $match: { userId } },
      { $sort: { lastWatchedAt: -1 } },
      {
        $group: {
          _id: "$courseId",
          completedLessons: {
            $sum: { $cond: ["$isCompleted", 1, 0] },
          },
          totalLessons: { $sum: 1 },
          lastWatchedAt: { $first: "$lastWatchedAt" },
          lastLessonId: { $first: "$lessonId" },
        },
      },
      { $sort: { lastWatchedAt: -1 } },
    ]),
    Progress.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalWatch: { $sum: "$watchDuration" } } },
    ]),
    Progress.countDocuments({ userId, isCompleted: true }),
    Progress.find({ userId }).sort({ lastWatchedAt: -1 }).limit(6).lean(),
    Transaction.distinct("itemId", {
      userId,
      status: "completed",
      itemType: "Course",
    }),
  ]);

  const progressCourseIds = progressAgg.map((item) => item._id);
  const allCourseIds = Array.from(
    new Set([
      ...progressCourseIds.map((id) => String(id)),
      ...purchasedCourseIds.map((id) => String(id)),
    ]),
  );
  const courses = await Course.find({ _id: { $in: allCourseIds } })
    .select("name image curriculum")
    .lean();
  const courseMap = new Map(
    courses.map((course) => [String(course._id), course]),
  );

  const countCourseLessons = (course) =>
    (course.curriculum || []).reduce(
      (acc, section) => acc + (section.lessons?.length || 0),
      0,
    );

  const findLessonTitle = (course, lessonId) => {
    if (!course || !lessonId) return null;
    const lessonIdStr = String(lessonId);
    for (const section of course.curriculum || []) {
      for (const lesson of section.lessons || []) {
        if (String(lesson._id) === lessonIdStr) return lesson.title;
      }
    }
    return null;
  };

  const totalWatchSeconds = totalWatchAgg[0]?.totalWatch || 0;
  const totalWatchHours = (totalWatchSeconds / 3600).toFixed(1);

  const enrichedProgress = progressAgg.map((item) => {
    const course = courseMap.get(String(item._id));
    const totalCourseLessons = course ? countCourseLessons(course) : 0;
    const progressPercent =
      totalCourseLessons > 0
        ? Math.min(
            100,
            Math.round((item.completedLessons / totalCourseLessons) * 100),
          )
        : 0;
    return {
      id: String(item._id),
      title: course?.name || "Untitled Course",
      progress: progressPercent,
      lastLesson:
        findLessonTitle(course, item.lastLessonId) || "Lanjutkan materi",
      image: "bg-gradient-to-br from-blue-900 to-slate-900",
      lastWatchedAt: item.lastWatchedAt,
      totalLessons: totalCourseLessons,
      completedLessons: item.completedLessons,
    };
  });

  const completedCoursesCount = enrichedProgress.filter(
    (course) => course.totalLessons > 0 && course.progress >= 100,
  ).length;

  const purchasedCourses = purchasedCourseIds
    .map((id) => courseMap.get(String(id)))
    .filter(Boolean)
    .map((course) => ({
      id: String(course._id),
      title: course.name || "Untitled Course",
      progress: 0,
      lastLesson: "Belum mulai",
      image: "bg-gradient-to-br from-blue-900 to-slate-900",
      lastWatchedAt: null,
      totalLessons: countCourseLessons(course),
      completedLessons: 0,
    }));

  const continueLearning =
    enrichedProgress.length > 0
      ? enrichedProgress.slice(0, 4)
      : purchasedCourses.slice(0, 4);

  const recentActivity = recentProgress.map((item) => {
    const course = courseMap.get(String(item.courseId));
    return {
      id: String(item._id),
      courseTitle: course?.name || "Course",
      lessonTitle: findLessonTitle(course, item.lessonId) || "Lanjutkan materi",
      lastWatchedAt: item.lastWatchedAt,
    };
  });

  const stats = [
    {
      label: "Kursus Aktif",
      value: purchasedCourseIds.length,
      icon: PlayCircle,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Jam Belajar",
      value: totalWatchHours,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Kursus Selesai",
      value: completedCoursesCount,
      icon: Trophy,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
  ];

  return (
    <div className='space-y-8 animate-in fade-in duration-500'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Dashboard
          </h1>
          <p className='text-gray-500 dark:text-gray-400 mt-1'>
            Selamat datang kembali,{" "}
            <span className='text-blue-600 dark:text-blue-400 font-semibold'>
              {user?.name}
            </span>
            !
          </p>
        </div>
        <div className='px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 shadow-sm'>
          <TrendingUp className='w-4 h-4 text-green-500' />
          Status Akun:{" "}
          <span className='text-green-600 dark:text-green-400 font-medium'>
            {user?.isActive ? "Aktif" : "Nonaktif"}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {stats.map((stat, index) => (
          <div
            key={index}
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

        {continueLearning.length === 0 ? (
          <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-sm text-gray-500 dark:text-gray-400'>
            Belum ada progres belajar. Mulai kursus dari halaman kursus Anda.
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {continueLearning.map((course) => (
              <div
                key={course.id}
                className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all group cursor-pointer relative overflow-hidden shadow-sm'
              >
                <div className='flex gap-5'>
                  <div
                    className={`w-24 h-24 rounded-xl shrink-0 ${course.image} flex items-center justify-center`}
                  >
                    <BookOpen className='text-white/20 w-8 h-8' />
                  </div>

                  <div className='flex-1'>
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
                        <span className='text-gray-400'>
                          {course.completedLessons}/{course.totalLessons} lesson
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden'>
                        <div
                          className='bg-blue-600 h-full rounded-full transition-all duration-500'
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <p className='text-[11px] text-gray-400'>
                        {course.lastWatchedAt
                          ? `Terakhir belajar: ${formatDate(
                              course.lastWatchedAt,
                            )}`
                          : "Belum ada aktivitas"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6'>
          <h3 className='font-bold text-gray-900 dark:text-white mb-4'>
            Aktivitas Terbaru
          </h3>
          <div className='space-y-4'>
            {recentActivity.length === 0 ? (
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Belum ada aktivitas belajar.
              </p>
            ) : (
              recentActivity.map((item) => (
                <div
                  key={item.id}
                  className='flex gap-4 items-start pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0'
                >
                  <div className='w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0' />
                  <div>
                    <p className='text-sm text-gray-800 dark:text-gray-200 font-medium'>
                      {item.courseTitle}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-500'>
                      {item.lessonTitle} - {formatDate(item.lastWatchedAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 lg:col-span-2'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-bold text-gray-900 dark:text-white'>
              Ringkasan Pembelajaran
            </h3>
            <span className='text-xs text-gray-400'>
              Kursus dibeli: {purchasedCourseIds.length}
            </span>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-4 rounded-xl border border-gray-100 dark:border-gray-800'>
              <p className='text-xs text-gray-500'>Total Lesson Selesai</p>
              <p className='text-xl font-semibold text-gray-900 dark:text-white'>
                {completedLessonsCount}
              </p>
            </div>
            <div className='p-4 rounded-xl border border-gray-100 dark:border-gray-800'>
              <p className='text-xs text-gray-500'>Total Jam Belajar</p>
              <p className='text-xl font-semibold text-gray-900 dark:text-white'>
                {totalWatchHours} jam
              </p>
            </div>
            <div className='p-4 rounded-xl border border-gray-100 dark:border-gray-800'>
              <p className='text-xs text-gray-500'>Kursus Aktif</p>
              <p className='text-xl font-semibold text-gray-900 dark:text-white'>
                {purchasedCourseIds.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
