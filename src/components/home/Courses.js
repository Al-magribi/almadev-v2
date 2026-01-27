import Link from "next/link";
import CourseCard from "@/components/marketing/CourseCard";
// Hapus DATA DUMMY

export default function Courses({ data = [] }) {
  return (
    <section className='container mx-auto px-4 mt-20'>
      <div className='flex justify-between items-end mb-8 border-b border-gray-100 pb-4'>
        <div>
          <h2 className='text-2xl font-bold text-slate-900'>Kursus Terbaru</h2>
          <p className='text-slate-500 text-sm mt-1'>
            Materi video pembelajaran terstruktur
          </p>
        </div>
        <Link
          href='/courses'
          className='text-blue-600 font-semibold hover:text-blue-700 text-sm flex items-center gap-1'
        >
          Lihat Semua <span>&rarr;</span>
        </Link>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        {data.length > 0 ? (
          data.map((course) => (
            // Pastikan CourseCard menerima props yang sesuai dengan DB Anda
            <CourseCard
              key={course._id}
              title={course.name}
              image={course.image}
              price={course.price}
              category='Web Development' // Default atau ambil dari DB jika ada
              slug={course._id} // Gunakan ID untuk link detail
              {...course}
            />
          ))
        ) : (
          <p className='text-slate-500 col-span-3 text-center py-10'>
            Belum ada kelas yang tersedia.
          </p>
        )}
      </div>
    </section>
  );
}
