"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  ListVideo,
  Megaphone,
  MessageCircle,
  NotebookPen,
  PlayCircle,
  Star,
} from "lucide-react";
import { formatDate } from "@/lib/client-utils";
import { updateLessonProgress } from "@/actions/course-actions";
import QnaPanel from "@/components/student/learn/QnaPanel";
import TextEditor from "@/components/student/learn/TextEditor";
import Note from "@/components/student/learn/Note";

const tabs = [
  { id: "qna", label: "QnA", icon: MessageCircle },
  { id: "editor", label: "Text Editor", icon: NotebookPen },
  { id: "notes", label: "Catatan", icon: BookOpen },
];

const getYouTubeEmbedUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const getYouTubeId = (url) => {
  if (!url || typeof url !== "string") return null;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
};

export default function LearningViewClient({
  course,
  currentUser,
  progressSummary,
  qnaList,
}) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(
    getYouTubeId(course?.video),
  );
  const [localProgress, setLocalProgress] = useState({
    percent: progressSummary?.percent ?? 0,
    completedLessons: progressSummary?.completedLessons ?? 0,
    startedLessons: progressSummary?.startedLessons ?? 0,
    totalLessons: progressSummary?.totalLessons ?? 0,
  });
  const [completedLessonIds, setCompletedLessonIds] = useState(
    new Set(progressSummary?.completedLessonIds || []),
  );
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const watchIntervalRef = useRef(null);
  const lastSentRef = useRef(0);

  const curriculum = course?.curriculum || [];
  const reviews = course?.reviews || [];
  const qnas = qnaList || [];
  const summary = useMemo(() => {
    const sectionCount = curriculum.length;
    const lessonCount = curriculum.reduce(
      (acc, section) => acc + (section.lessons?.length || 0),
      0,
    );
    return { sectionCount, lessonCount };
  }, [curriculum]);

  const [lessonProgressMap, setLessonProgressMap] = useState(() => {
    const items = progressSummary?.lessonProgress || [];
    return new Map(
      items.map((item) => [
        String(item.lessonId),
        {
          watchDuration: item.watchDuration || 0,
          totalDuration: item.totalDuration || 0,
          isCompleted: Boolean(item.isCompleted),
        },
      ]),
    );
  });

  const embedUrl = getYouTubeEmbedUrl(activeLesson?.video || course?.video);

  useEffect(() => {
    const items = progressSummary?.lessonProgress || [];
    setLessonProgressMap(
      new Map(
        items.map((item) => [
          String(item.lessonId),
          {
            watchDuration: item.watchDuration || 0,
            totalDuration: item.totalDuration || 0,
            isCompleted: Boolean(item.isCompleted),
          },
        ]),
      ),
    );
  }, [progressSummary?.lessonProgress]);

  useEffect(() => {
    if (activeLesson?.video) {
      setActiveVideoId(getYouTubeId(activeLesson.video));
    } else {
      setActiveVideoId(getYouTubeId(course?.video));
    }
  }, [activeLesson, course?.video]);

  useEffect(() => {
    if (!activeVideoId || !playerContainerRef.current) return;

    let cancelled = false;

    const loadYouTubeApi = () =>
      new Promise((resolve) => {
        if (window.YT?.Player) {
          resolve(window.YT);
          return;
        }
        const existing = document.getElementById("youtube-iframe-api");
        if (!existing) {
          const script = document.createElement("script");
          script.id = "youtube-iframe-api";
          script.src = "https://www.youtube.com/iframe_api";
          document.body.appendChild(script);
        }
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prev) prev();
          resolve(window.YT);
        };
      });

    const stopWatchInterval = () => {
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current);
        watchIntervalRef.current = null;
      }
    };

    const startWatchInterval = () => {
      stopWatchInterval();
      watchIntervalRef.current = setInterval(async () => {
        if (!playerRef.current || !activeLesson?._id) return;
        const currentTime = playerRef.current.getCurrentTime?.() || 0;
        const duration = playerRef.current.getDuration?.() || 0;
        const now = Date.now();
        if (now - lastSentRef.current < 9000) return;
        lastSentRef.current = now;
        const completed = duration > 0 && currentTime >= duration * 0.9;

        // Update local progress bar in real-time
        setLessonProgressMap((prev) => {
          const next = new Map(prev);
          next.set(String(activeLesson._id), {
            watchDuration: Math.floor(currentTime),
            totalDuration: Math.floor(duration),
            isCompleted:
              completed || prev.get(String(activeLesson._id))?.isCompleted,
          });
          return next;
        });

        await updateLessonProgress({
          courseId: course?._id,
          lessonId: activeLesson._id,
          watchDuration: Math.floor(currentTime),
          totalDuration: Math.floor(duration),
          isCompleted: completed,
        });

        if (completed && !completedLessonIds.has(String(activeLesson._id))) {
          setCompletedLessonIds((prev) => {
            const next = new Set(prev);
            next.add(String(activeLesson._id));
            return next;
          });
          setLocalProgress((prev) => {
            const total = prev.totalLessons || 0;
            const nextCompleted = prev.completedLessons + 1;
            const percent =
              total > 0
                ? Math.min(100, Math.round((nextCompleted / total) * 100))
                : 0;
            return { ...prev, completedLessons: nextCompleted, percent };
          });
        }
      }, 2000);
    };

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      if (!playerRef.current) {
        playerRef.current = new YT.Player(playerContainerRef.current, {
          videoId: activeVideoId,
          playerVars: { rel: 0, modestbranding: 1 },
          events: {
            onStateChange: (event) => {
              if (!activeLesson?._id) return;
              if (event.data === YT.PlayerState.PLAYING) {
                startWatchInterval();
              } else if (
                event.data === YT.PlayerState.PAUSED ||
                event.data === YT.PlayerState.ENDED
              ) {
                stopWatchInterval();
              }

              if (event.data === YT.PlayerState.ENDED) {
                const duration = playerRef.current.getDuration?.() || 0;
                updateLessonProgress({
                  courseId: course?._id,
                  lessonId: activeLesson._id,
                  watchDuration: Math.floor(duration),
                  totalDuration: Math.floor(duration),
                  isCompleted: true,
                });
                setLessonProgressMap((prev) => {
                  const next = new Map(prev);
                  next.set(String(activeLesson._id), {
                    watchDuration: Math.floor(duration),
                    totalDuration: Math.floor(duration),
                    isCompleted: true,
                  });
                  return next;
                });
                if (!completedLessonIds.has(String(activeLesson._id))) {
                  setCompletedLessonIds((prev) => {
                    const next = new Set(prev);
                    next.add(String(activeLesson._id));
                    return next;
                  });
                  setLocalProgress((prev) => {
                    const total = prev.totalLessons || 0;
                    const nextCompleted = prev.completedLessons + 1;
                    const percent =
                      total > 0
                        ? Math.min(
                            100,
                            Math.round((nextCompleted / total) * 100),
                          )
                        : 0;
                    return {
                      ...prev,
                      completedLessons: nextCompleted,
                      percent,
                    };
                  });
                }
              }
            },
          },
        });
      } else {
        playerRef.current.loadVideoById(activeVideoId);
      }
    });

    return () => {
      cancelled = true;
      stopWatchInterval();
    };
  }, [activeVideoId, activeLesson, course?._id, completedLessonIds]);

  useEffect(() => {
    return () => {
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current);
      }
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <section className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm'>
        <div className='flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between'>
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 w-fit px-3 py-1 rounded-full'>
              <GraduationCap className='w-4 h-4' />
              Learning Center
            </div>
            <h1 className='text-2xl md:text-3xl font-bold text-gray-900 dark:text-white'>
              {course?.name || "Course Title"}
            </h1>

            <div className='flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400'>
              <div className='flex items-center gap-1'>
                <Layers className='w-4 h-4 text-gray-400' />
                {summary.sectionCount} Modul
              </div>
              <div className='flex items-center gap-1'>
                <ListVideo className='w-4 h-4 text-gray-400' />
                {summary.lessonCount} Video
              </div>
              <div className='flex items-center gap-1'>
                <Clock className='w-4 h-4 text-gray-400' />
                Update terakhir otomatis
              </div>
            </div>
          </div>

          <div className='w-full lg:w-80 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-gray-500 dark:text-gray-400'>
                Progress belajar
              </span>
              <span className='text-gray-900 dark:text-white font-semibold'>
                {localProgress.percent ?? 0}%
              </span>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden'>
              <div
                className='bg-blue-600 h-full rounded-full'
                style={{ width: `${localProgress.percent ?? 0}%` }}
              />
            </div>
            <div className='grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400'>
              <div className='bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3'>
                <p className='font-semibold text-gray-900 dark:text-white'>
                  {localProgress.completedLessons ?? 0}
                </p>
                <p>Lesson selesai</p>
              </div>
              <div className='bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3'>
                <p className='font-semibold text-gray-900 dark:text-white'>
                  {localProgress.startedLessons ?? 0}
                </p>
                <p>Lesson mulai</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className='grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start'>
        <div className='space-y-6'>
          <section className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm'>
            <div className='aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>
              {embedUrl ? (
                <div ref={playerContainerRef} className='w-full h-full' />
              ) : (
                <div className='flex flex-col items-center gap-3 text-gray-400'>
                  <PlayCircle className='w-10 h-10' />
                  <p className='text-sm'>
                    Video pembelajaran akan muncul di sini
                  </p>
                </div>
              )}
            </div>
            <div className='p-5 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Sedang dipelajari
                </p>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {activeLesson?.title ||
                    progressSummary?.lastLessonTitle ||
                    curriculum?.[0]?.lessons?.[0]?.title ||
                    "Pilih materi dari daftar"}
                </h3>
                {progressSummary?.lastWatchedAt ? (
                  <p className='text-xs text-gray-400 mt-1'>
                    Terakhir ditonton:{" "}
                    {formatDate(progressSummary.lastWatchedAt)}
                  </p>
                ) : null}
              </div>
              <button className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition'>
                <PlayCircle className='w-4 h-4' />
                Mulai Belajar
              </button>
            </div>
          </section>

          <section className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm'>
            <div className='flex flex-wrap gap-2 border-b border-gray-100 dark:border-gray-800 pb-4'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type='button'
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId='active-tab'
                      className='absolute inset-0 rounded-full bg-blue-50 dark:bg-blue-500/10'
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 26,
                      }}
                    />
                  )}
                  <tab.icon className='w-4 h-4 relative' />
                  <span className='relative'>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className='pt-5 min-h-220px'>
              <AnimatePresence mode='wait'>
                {activeTab === "qna" && (
                  <motion.div
                    key='qna'
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className='space-y-4'
                  >
                    <QnaPanel
                      courseId={course?._id}
                      currentUser={currentUser}
                      initialQnas={qnas}
                    />
                  </motion.div>
                )}

                {activeTab === "editor" && (
                  <motion.div
                    key='editor'
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className='space-y-4'
                  >
                    <div>
                      <h4 className='text-lg font-semibold text-gray-900 dark:text-white'>
                        Workspace belajar pribadi
                      </h4>
                      <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                        Simpan poin penting agar mudah diakses ketika kamu
                        melanjutkan belajar.
                      </p>
                    </div>
                    <TextEditor
                      courseId={course?._id}
                      lessonId={activeLesson?._id || "general"}
                    />
                  </motion.div>
                )}

                {activeTab === "notes" && (
                  <motion.div
                    key='notes'
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className='space-y-4'
                  >
                    <div>
                      <h4 className='text-lg font-semibold text-gray-900 dark:text-white'>
                        Catatan pembelajaran
                      </h4>
                      <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                        Catatan belajar personal akan tersimpan di sini.
                      </p>
                    </div>
                    <Note
                      courseId={course?._id}
                      lessonId={activeLesson?._id || "general"}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        <aside className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm sticky top-6'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Daftar Materi
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Total {summary.lessonCount} video
              </p>
            </div>
            <button className='text-xs text-blue-600 dark:text-blue-400 font-semibold'>
              Lihat semua
            </button>
          </div>

          <div className='space-y-4 max-h-[60vh] md:max-h-[65vh] overflow-y-auto pr-2 overscroll-contain'>
            {curriculum.length === 0 ? (
              <div className='border border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-4 text-sm text-gray-500'>
                Materi belum tersedia. Silakan cek kembali nanti.
              </div>
            ) : (
              curriculum.map((section, index) => (
                <div
                  key={section._id || section.title || index}
                  className='border border-gray-200 dark:border-gray-800 rounded-xl p-4'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold'>
                        Modul {index + 1}
                      </p>
                      <h4 className='text-sm font-semibold text-gray-900 dark:text-white'>
                        {section.title || "Untitled Module"}
                      </h4>
                      <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                        {section.description || "Ringkasan materi modul."}
                      </p>
                    </div>
                    <span className='text-xs text-gray-400'>
                      {section.lessons?.length || 0} video
                    </span>
                  </div>

                  <div className='mt-4 space-y-3'>
                    {(section.lessons || []).map((lesson, lessonIndex) => {
                      const lessonKey = String(lesson._id || "");
                      const progressData = lessonProgressMap.get(lessonKey);
                      const duration = progressData?.totalDuration || 0;
                      const watched = progressData?.watchDuration || 0;
                      const percent =
                        duration > 0
                          ? Math.min(
                              100,
                              Math.round((watched / duration) * 100),
                            )
                          : 0;
                      const isCompleted =
                        progressData?.isCompleted || percent >= 100;

                      return (
                        <div
                          key={lesson._id || `${section.title}-${lessonIndex}`}
                          className='flex items-start gap-3'
                        >
                          <div className='w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-500'>
                            {lessonIndex + 1}
                          </div>
                          <div className='flex-1'>
                            <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                              {lesson.title || "Untitled Lesson"}
                            </p>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>
                              {lesson.duration || "Durasi fleksibel"}
                            </p>
                            <div className='mt-2'>
                              <div className='flex items-center justify-between text-[11px] text-gray-400'>
                                <span>Progress</span>
                                <span>{percent}%</span>
                              </div>
                              <div className='w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mt-1'>
                                <div
                                  className='bg-blue-600 h-full rounded-full'
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              {isCompleted ? (
                                <span className='inline-flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 font-semibold mt-2'>
                                  <CheckCircle2 className='w-3 h-3' />
                                  Selesai
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setActiveLesson({
                                _id: lesson._id,
                                title: lesson.title,
                                video: lesson.video,
                              })
                            }
                            className='text-xs text-blue-600 dark:text-blue-400 font-semibold'
                          >
                            Putar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
