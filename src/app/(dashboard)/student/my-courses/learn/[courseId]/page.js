import { notFound } from "next/navigation";
import { getCourseDetail } from "@/actions/course-actions";
import LearningViewClient from "./LearningViewClient";
import { getCurrentUser } from "@/lib/auth-service";
import dbConnect from "@/lib/db";
import Progress from "@/models/Progress";
import Qna from "@/models/Qna";

export default async function LearnCourse({ params }) {
  const { courseId } = (await params) || {};
  const user = await getCurrentUser();
  const data = await getCourseDetail(courseId);

  if (!data?.course) {
    notFound();
  }

  if (!user) {
    return (
      <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6'>
        <p className='text-gray-500 dark:text-gray-400 text-sm'>
          Anda harus login untuk melihat materi kursus ini.
        </p>
      </div>
    );
  }

  await dbConnect();

  const curriculum = data.course.curriculum || [];
  const totalLessons = curriculum.reduce(
    (acc, section) => acc + (section.lessons?.length || 0),
    0,
  );

  const [
    completedLessons,
    startedLessons,
    lastProgress,
    qnaItems,
    completedIds,
    progressDocs,
  ] = await Promise.all([
    Progress.countDocuments({
      userId: user.userId,
      courseId,
      isCompleted: true,
    }),
    Progress.countDocuments({ userId: user.userId, courseId }),
    Progress.findOne({ userId: user.userId, courseId })
      .sort({ lastWatchedAt: -1 })
      .lean(),
    Qna.find({ courseId })
      .populate("user", "name")
      .populate("replies.user", "name")
      .sort({ isPinned: -1, createdAt: -1 })
      .lean(),
    Progress.find({ userId: user.userId, courseId, isCompleted: true })
      .select("lessonId")
      .lean(),
    Progress.find({ userId: user.userId, courseId })
      .select("lessonId watchDuration totalDuration isCompleted")
      .lean(),
  ]);

  const percent =
    totalLessons > 0
      ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
      : 0;

  const lastLessonTitle = lastProgress?.lessonId
    ? curriculum
        .flatMap((section) => section.lessons || [])
        .find((lesson) => String(lesson._id) === String(lastProgress.lessonId))
        ?.title || null
    : null;

  const course = {
    ...JSON.parse(JSON.stringify(data.course)),
    reviews: (data.course.reviews || []).map((review) => ({
      name: review.name,
      review: review.review,
      rating: review.rating,
      createdAt: review.createdAt ? review.createdAt.toISOString() : null,
    })),
  };

  const getLessonContext = (lessonId) => {
    if (!lessonId) return { moduleTitle: null, lessonTitle: null };
    for (const section of course.curriculum || []) {
      const lesson = (section.lessons || []).find(
        (item) => String(item._id) === String(lessonId),
      );
      if (lesson) {
        return {
          moduleTitle: section.title || null,
          lessonTitle: lesson.title || null,
        };
      }
    }
    return { moduleTitle: null, lessonTitle: null };
  };

  const qnaList = qnaItems.map((item) => {
    const context = getLessonContext(item.lessonId);
    return {
      id: String(item._id),
      title: item.title,
      content: item.content,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      repliesCount: item.replies?.length || 0,
      isResolved: item.isResolved,
      isPinned: item.isPinned,
      isInstructor: item.isInstructor,
      user: item.user
        ? { id: String(item.user._id), name: item.user.name }
        : null,
      course: { id: String(course._id), name: course.name },
      moduleTitle: context.moduleTitle,
      lessonTitle: context.lessonTitle,
      replies: (item.replies || []).map((reply) => ({
        id: String(reply._id),
        content: reply.content,
        createdAt: reply.createdAt ? reply.createdAt.toISOString() : null,
        isInstructor: reply.isInstructor,
        likesCount: reply.likes?.length || 0,
        liked: reply.likes?.some(
          (like) => String(like.user) === String(user.userId),
        ),
        user: reply.user
          ? { id: String(reply.user._id), name: reply.user.name }
          : null,
      })),
    };
  });

  return (
    <LearningViewClient
      course={course}
      currentUser={{
        id: String(user.userId),
        name: user.name || "User",
      }}
      progressSummary={{
        percent,
        completedLessons,
        startedLessons,
        totalLessons,
        lastLessonTitle,
        lastWatchedAt: lastProgress?.lastWatchedAt
          ? lastProgress.lastWatchedAt.toISOString()
          : null,
        completedLessonIds: completedIds.map((item) => String(item.lessonId)),
        lessonProgress: progressDocs.map((item) => ({
          lessonId: String(item.lessonId),
          watchDuration: item.watchDuration || 0,
          totalDuration: item.totalDuration || 0,
          isCompleted: Boolean(item.isCompleted),
        })),
      }}
      qnaList={qnaList}
    />
  );
}
