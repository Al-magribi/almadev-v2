import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Star } from "lucide-react";
import { getCourses } from "@/actions/course-actions";
import { formatRupiah } from "@/lib/client-utils";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className='bg-white text-slate-900'>
      <section className='container mx-auto px-4 py-16 md:py-20'>
        <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>
              Kursus
            </p>
            <h1 className='text-3xl md:text-4xl font-extrabold text-slate-900 mt-2'>
              Semua Kursus
            </h1>
            <p className='text-slate-500 text-sm mt-2 max-w-2xl'>
              Kumpulan materi terstruktur untuk membantu Anda belajar lebih
              cepat dan fokus.
            </p>
          </div>
          <Link
            href='/'
            className='inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900 transition'
          >
            Kembali ke Beranda
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {courses.length === 0 ? (
          <p className='text-slate-500 text-center py-16'>
            Belum ada kursus yang tersedia.
          </p>
        ) : (
          <div className='grid grid-cols-1 gap-6 pt-10 md:grid-cols-2 lg:grid-cols-3'>
            {courses.map((course) => (
              <Link
                key={course._id}
                href={`/courses/${course._id}`}
                className='group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl'
              >
                <div className='relative aspect-[4/3] w-full overflow-hidden bg-slate-100'>
                  {course.image ? (
                    <Image
                      src={course.image}
                      alt={course.name}
                      fill
                      className='object-cover transition duration-500 group-hover:scale-105'
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    />
                  ) : (
                    <div className='absolute inset-0 bg-linear-to-br from-slate-200 via-slate-100 to-white' />
                  )}
                </div>

                <div className='flex flex-1 flex-col gap-3 p-6'>
                  <div className='flex items-center justify-between text-xs uppercase tracking-widest text-slate-400'>
                    <span>{course.type || "Kursus"}</span>
                    <span className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600'>
                      <Star size={12} className='text-amber-500' />
                      {(course.rating || 0).toFixed(1)}
                    </span>
                  </div>

                  <h3 className='text-lg font-bold text-slate-900 line-clamp-2 min-h-[3rem] group-hover:text-blue-600 transition-colors'>
                    {course.name}
                  </h3>

                  <p className='text-sm text-slate-500 line-clamp-2'>
                    {course.description}
                  </p>

                  <div className='mt-auto flex items-center justify-between pt-4'>
                    <span className='text-lg font-extrabold text-slate-900'>
                      {formatRupiah(course.price || 0)}
                    </span>
                    <span className='inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white'>
                      Detail
                      <ArrowUpRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
