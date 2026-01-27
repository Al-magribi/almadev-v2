import { useState } from "react";
import {
  Plus,
  GripVertical,
  Trash2,
  Video,
  ChevronDown,
  ChevronRight,
  GripHorizontal,
  AlertCircle,
  ExternalLink,
  Clock, // Icon tambahan untuk durasi
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// --- HELPER: Ekstrak YouTube ID (Industry Standard Regex) ---
// Menangani format: youtu.be, youtube.com/watch?v=, embed, short, dll.
const getYouTubeId = (url) => {
  if (!url || typeof url !== "string") return null;
  const regExp =
    /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:(?:watch)?\?(?:.*&)?v(?:i)?=|(?:embed|v|vi|user)\/))([a-zA-Z0-9\_\-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

export default function TabCurriculum({ course, setCourse }) {
  // State untuk toggle accordion (membuka/menutup chapter)
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (idx) => {
    setExpandedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // --- LOGIKA CHAPTER / BAB ---

  const addSection = () => {
    const newSection = { title: "Bab Baru", lessons: [] };
    setCourse((prev) => ({
      ...prev,
      curriculum: [...(prev.curriculum || []), newSection],
    }));
  };

  const updateSectionTitle = (index, newTitle) => {
    const newCurriculum = [...course.curriculum];
    newCurriculum[index].title = newTitle;
    setCourse((prev) => ({ ...prev, curriculum: newCurriculum }));
  };

  const deleteSection = (index) => {
    if (!confirm("Hapus bab ini beserta semua pelajarannya?")) return;
    const newCurriculum = course.curriculum.filter((_, i) => i !== index);
    setCourse((prev) => ({ ...prev, curriculum: newCurriculum }));
  };

  // --- LOGIKA LESSON / PELAJARAN ---

  const addLesson = (sectionIndex) => {
    const newLesson = {
      title: "Pelajaran Baru",
      video: "",
      duration: "",
      description: "",
    };

    setCourse((prev) => {
      const newCurriculum = [...(prev.curriculum || [])];
      // Deep copy level 1 untuk memutus referensi lama
      newCurriculum[sectionIndex] = {
        ...newCurriculum[sectionIndex],
        lessons: [...(newCurriculum[sectionIndex].lessons || []), newLesson],
      };
      return { ...prev, curriculum: newCurriculum };
    });

    // Otomatis buka accordion saat tambah pelajaran
    setExpandedSections((prev) => ({ ...prev, [sectionIndex]: true }));
  };

  const updateLesson = (sectionIndex, lessonIndex, field, value) => {
    setCourse((prev) => {
      const newCurriculum = [...prev.curriculum];
      const targetSection = { ...newCurriculum[sectionIndex] };
      const targetLessons = [...(targetSection.lessons || [])];

      targetLessons[lessonIndex] = {
        ...targetLessons[lessonIndex],
        [field]: value,
      };

      targetSection.lessons = targetLessons;
      newCurriculum[sectionIndex] = targetSection;

      return { ...prev, curriculum: newCurriculum };
    });
  };

  const deleteLesson = (sectionIndex, lessonIndex) => {
    setCourse((prev) => {
      const newCurriculum = [...prev.curriculum];
      newCurriculum[sectionIndex] = {
        ...newCurriculum[sectionIndex],
        lessons: newCurriculum[sectionIndex].lessons.filter(
          (_, i) => i !== lessonIndex,
        ),
      };
      return { ...prev, curriculum: newCurriculum };
    });
  };

  // --- LOGIKA DRAG AND DROP ---

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    // 1. Reorder Chapter (Bab)
    if (type === "COLUMN") {
      const newCurriculum = [...course.curriculum];
      const [moved] = newCurriculum.splice(source.index, 1);
      newCurriculum.splice(destination.index, 0, moved);
      setCourse((prev) => ({ ...prev, curriculum: newCurriculum }));
      return;
    }

    // 2. Reorder Lesson (Pelajaran)
    if (type === "TASK") {
      const sourceSectionIndex = parseInt(source.droppableId);
      const destSectionIndex = parseInt(destination.droppableId);

      const newCurriculum = [...course.curriculum];
      const sourceLessons = [...newCurriculum[sourceSectionIndex].lessons];
      const [movedLesson] = sourceLessons.splice(source.index, 1);

      if (sourceSectionIndex === destSectionIndex) {
        sourceLessons.splice(destination.index, 0, movedLesson);
        newCurriculum[sourceSectionIndex].lessons = sourceLessons;
      } else {
        const destLessons = [...newCurriculum[destSectionIndex].lessons];
        destLessons.splice(destination.index, 0, movedLesson);
        newCurriculum[sourceSectionIndex].lessons = sourceLessons;
        newCurriculum[destSectionIndex].lessons = destLessons;
      }

      setCourse((prev) => ({ ...prev, curriculum: newCurriculum }));
    }
  };

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6'>
        <div>
          <h2 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>
            Kurikulum
          </h2>
          <p className='text-zinc-500 text-sm mt-1'>
            Drag & drop untuk mengatur urutan bab dan pelajaran.
          </p>
        </div>
        <button
          onClick={addSection}
          className='flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90 transition-all'
        >
          <Plus size={16} /> Tambah Bab
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='curriculum-list' type='COLUMN'>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className='space-y-4'
            >
              {course.curriculum?.map((section, sectionIndex) => (
                <Draggable
                  key={`section-${sectionIndex}`}
                  draggableId={`section-${sectionIndex}`}
                  index={sectionIndex}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm'
                    >
                      {/* HEADER BAB */}
                      <div className='flex items-center gap-3 p-4 bg-zinc-50/50 dark:bg-zinc-800/30'>
                        <div
                          {...provided.dragHandleProps}
                          className='cursor-move text-zinc-400 hover:text-zinc-600'
                        >
                          <GripVertical size={20} />
                        </div>

                        <button
                          onClick={() => toggleSection(sectionIndex)}
                          className='text-zinc-400 hover:text-zinc-600'
                        >
                          {expandedSections[sectionIndex] ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </button>

                        <div className='flex-1'>
                          <input
                            value={section.title}
                            onChange={(e) =>
                              updateSectionTitle(sectionIndex, e.target.value)
                            }
                            className='w-full bg-transparent border-none p-0 text-base font-bold text-zinc-900 dark:text-zinc-100 focus:ring-0 placeholder:text-zinc-400'
                            placeholder='Judul Bab (misal: Pendahuluan)'
                          />
                        </div>

                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => addLesson(sectionIndex)}
                            className='p-1.5 text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-md text-xs font-semibold flex items-center gap-1 transition-all'
                          >
                            <Plus size={14} /> Pelajaran
                          </button>
                          <button
                            onClick={() => deleteSection(sectionIndex)}
                            className='p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all'
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* LIST PELAJARAN */}
                      {expandedSections[sectionIndex] && (
                        <Droppable droppableId={`${sectionIndex}`} type='TASK'>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className='p-4 space-y-3 bg-white dark:bg-zinc-900'
                            >
                              {section.lessons?.length === 0 && (
                                <div className='text-center py-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg'>
                                  <p className='text-sm text-zinc-500'>
                                    Belum ada pelajaran di bab ini.
                                  </p>
                                  <button
                                    onClick={() => addLesson(sectionIndex)}
                                    className='text-xs text-violet-600 font-medium hover:underline mt-1'
                                  >
                                    Tambah Pelajaran Pertama
                                  </button>
                                </div>
                              )}

                              {section.lessons?.map((lesson, lessonIndex) => {
                                // LOGIKA UTAMA PLAYER VIDEO
                                const videoId = getYouTubeId(lesson.video);
                                const hasLink = lesson.video?.length > 0;
                                const isInvalidLink = hasLink && !videoId;

                                return (
                                  <Draggable
                                    key={`lesson-${sectionIndex}-${lessonIndex}`}
                                    draggableId={`lesson-${sectionIndex}-${lessonIndex}`}
                                    index={lessonIndex}
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className='group flex flex-col gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 bg-zinc-50 dark:bg-zinc-900/50 transition-all'
                                      >
                                        <div className='flex items-start gap-3'>
                                          <div
                                            {...provided.dragHandleProps}
                                            className='cursor-move text-zinc-300 hover:text-zinc-600 mt-2'
                                          >
                                            <GripHorizontal size={18} />
                                          </div>

                                          <div className='flex-1 space-y-4'>
                                            {/* Baris 1: Judul Pelajaran */}
                                            <div className='flex items-center gap-3'>
                                              <div className='p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded text-violet-600 dark:text-violet-400'>
                                                <Video size={16} />
                                              </div>
                                              <input
                                                value={lesson.title}
                                                onChange={(e) =>
                                                  updateLesson(
                                                    sectionIndex,
                                                    lessonIndex,
                                                    "title",
                                                    e.target.value,
                                                  )
                                                }
                                                className='flex-1 bg-transparent border-none p-0 text-sm font-semibold text-zinc-800 dark:text-zinc-200 focus:ring-0 placeholder:text-zinc-400'
                                                placeholder='Judul Pelajaran'
                                              />
                                              <button
                                                onClick={() =>
                                                  deleteLesson(
                                                    sectionIndex,
                                                    lessonIndex,
                                                  )
                                                }
                                                className='text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity'
                                                title='Hapus Pelajaran'
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            </div>

                                            <div className='h-px bg-zinc-200 dark:bg-zinc-800 w-full' />

                                            {/* Baris 2: Input URL dan Durasi */}
                                            <div className='grid grid-cols-1 md:grid-cols-[1fr_120px] gap-3'>
                                              {/* Input Video URL */}
                                              <div>
                                                <label className='text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1 block'>
                                                  YouTube URL
                                                </label>
                                                <div className='relative'>
                                                  <input
                                                    value={lesson.video || ""}
                                                    onChange={(e) =>
                                                      updateLesson(
                                                        sectionIndex,
                                                        lessonIndex,
                                                        "video",
                                                        e.target.value,
                                                      )
                                                    }
                                                    placeholder='Contoh: https://www.youtube.com/watch?v=...'
                                                    className={`w-full text-xs bg-white dark:bg-zinc-950 border ${
                                                      isInvalidLink
                                                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                                                        : "border-zinc-200 dark:border-zinc-700 focus:border-violet-500 focus:ring-violet-500"
                                                    } rounded-lg pl-3 pr-8 py-2 transition-colors`}
                                                  />
                                                  {hasLink && (
                                                    <div className='absolute right-3 top-2 text-zinc-400'>
                                                      {isInvalidLink ? (
                                                        <AlertCircle
                                                          size={14}
                                                          className='text-rose-500'
                                                        />
                                                      ) : (
                                                        <ExternalLink
                                                          size={14}
                                                        />
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Input Durasi */}
                                              <div>
                                                <label className='text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1  flex items-center gap-1'>
                                                  <Clock size={10} /> Durasi
                                                </label>
                                                <input
                                                  value={lesson.duration || ""}
                                                  onChange={(e) =>
                                                    updateLesson(
                                                      sectionIndex,
                                                      lessonIndex,
                                                      "duration",
                                                      e.target.value,
                                                    )
                                                  }
                                                  placeholder='10:05'
                                                  className='w-full text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 focus:border-violet-500 focus:ring-1 focus:ring-violet-500'
                                                />
                                              </div>
                                            </div>

                                            {/* --- VIDEO PREVIEW / PLAYER --- */}
                                            {/* Render logika: Jika ada link -> Cek validitas -> Render Player atau Error */}
                                            {hasLink && (
                                              <div className='mt-2 animate-in fade-in duration-300'>
                                                {videoId ? (
                                                  <div className='relative w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black aspect-video shadow-sm'>
                                                    <iframe
                                                      src={`https://www.youtube.com/embed/${videoId}`}
                                                      title={`Preview: ${lesson.title}`}
                                                      className='absolute top-0 left-0 w-full h-full'
                                                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                                      allowFullScreen
                                                      loading='lazy' // Penting untuk performa list panjang
                                                    />
                                                  </div>
                                                ) : (
                                                  <div className='flex items-center gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs'>
                                                    <AlertCircle
                                                      size={18}
                                                      className='shrink-0'
                                                    />
                                                    <div>
                                                      <p className='font-semibold'>
                                                        Link Video Tidak Valid
                                                      </p>
                                                      <p className='opacity-80 mt-0.5'>
                                                        Pastikan Anda memasukkan
                                                        link YouTube yang benar
                                                        (contoh:
                                                        https://youtube.com/watch?v=dQw...)
                                                      </p>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
