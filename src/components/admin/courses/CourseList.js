"use client";

import { formatRupiah } from "@/lib/client-utils";
import Link from "next/link";
import { Star, Users, Layers, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteCourse } from "@/actions/course-actions";
import DeleteConfirmation from "@/components/ui/DeleteConfirmation";

export default function CourseList({ courses }) {
  // --- STATE MANAGEMENT ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Fungsi saat tombol tong sampah diklik
  const handleDeleteClick = (courseId) => {
    setSelectedCourseId(courseId);
    setIsDeleteModalOpen(true);
  };

  // 2. Fungsi saat tombol "Delete" di modal dikonfirmasi
  const handleConfirmDelete = async () => {
    if (!selectedCourseId) return;

    setIsDeleting(true);
    try {
      const result = await deleteCourse(selectedCourseId);

      if (result.success) {
        // Modal akan tertutup dan list otomatis ter-refresh karena revalidatePath di server action
        setIsDeleteModalOpen(false);
        setSelectedCourseId(null);
      } else {
        alert(result.message || "Gagal menghapus kursus");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {courses.map((course) => (
          <div
            key={course._id}
            className='group flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all duration-300 hover:-translate-y-1'
          >
            {/* Card Image Placeholder */}
            <div className='h-48 bg-zinc-200 dark:bg-zinc-800 relative overflow-hidden'>
              {course.image ? (
                <img
                  src={course.image}
                  alt={course.name}
                  className='w-full h-full object-cover transform group-hover:scale-105 transition duration-700 ease-out'
                />
              ) : (
                <div className='absolute inset-0 bg-linear-to-t from-zinc-900/90 via-zinc-900/40 to-transparent flex items-end p-5'>
                  <div className='w-12 h-12 bg-zinc-800/50 backdrop-blur rounded-lg flex items-center justify-center mb-2'>
                    <Layers className='text-zinc-400' />
                  </div>
                </div>
              )}

              {/* Overlay Title for Better Readability if no image or generic */}
              <div className='absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end p-5'>
                <h3 className='text-white font-bold text-lg leading-tight line-clamp-2'>
                  {course.name}
                </h3>
              </div>
            </div>

            {/* Card Body */}
            <div className='flex-1 p-5 flex flex-col gap-4'>
              <div className='flex justify-between items-center text-sm'>
                <span className='bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-700'>
                  {course.type || "Course"}
                </span>
                <span className='font-semibold text-violet-600 dark:text-violet-400'>
                  {course.price ? formatRupiah(course.price) : "Free"}
                </span>
              </div>

              {/* Stats Grid */}
              <div className='grid grid-cols-3 gap-2 py-3 border-t border-zinc-100 dark:border-zinc-800 mt-auto'>
                <div className='text-center'>
                  <div className='flex items-center justify-center gap-1 font-bold text-zinc-900 dark:text-zinc-100 text-sm'>
                    <Users size={14} className='text-zinc-400' />
                    {course.totalReviews || 0}
                  </div>
                  <div className='text-[10px] text-zinc-500 dark:text-zinc-500 uppercase font-medium mt-0.5'>
                    Students
                  </div>
                </div>
                <div className='text-center border-l border-r border-zinc-100 dark:border-zinc-800'>
                  <div className='flex items-center justify-center gap-1 font-bold text-zinc-900 dark:text-zinc-100 text-sm'>
                    <Star size={14} className='text-amber-400 fill-amber-400' />
                    {course.rating ? course.rating.toFixed(1) : "0.0"}
                  </div>
                  <div className='text-[10px] text-zinc-500 dark:text-zinc-500 uppercase font-medium mt-0.5'>
                    Rating
                  </div>
                </div>
                <div className='text-center'>
                  <div className='flex items-center justify-center gap-1 font-bold text-zinc-900 dark:text-zinc-100 text-sm'>
                    <Layers size={14} className='text-zinc-400' />
                    {course.curriculum?.length || 0}
                  </div>
                  <div className='text-[10px] text-zinc-500 dark:text-zinc-500 uppercase font-medium mt-0.5'>
                    Sections
                  </div>
                </div>
              </div>

              {/* Actions Button */}
              <div className='flex gap-3 pt-2'>
                <Link
                  href={`/admin/courses/${course._id}`}
                  className='flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold transition-all
                  bg-zinc-900 text-white hover:bg-zinc-800 
                  dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm'
                >
                  Manage Course
                </Link>

                {/* Tombol Trash */}
                <button
                  type='button'
                  className='p-2.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 rounded-xl border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-all'
                  title='Delete Course'
                  onClick={() => handleDeleteClick(course._id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {courses.length === 0 && (
          <div className='col-span-full py-24 flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700'>
            <div className='w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4'>
              <Layers className='w-8 h-8 text-zinc-400 dark:text-zinc-500' />
            </div>
            <h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100'>
              No courses yet
            </h3>
            <p className='text-zinc-500 dark:text-zinc-400 max-w-sm mt-1'>
              Get started by creating your first course using the form above.
            </p>
          </div>
        )}
      </div>
      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title='Delete Course'
        description='Apakah kamu yakin akan menghapus kursus ini? Aksi ini tidak dapat dibatalkan.'
      />
    </>
  );
}
