import { formatRupiah } from "@/lib/client-utils";
import Image from "next/image";
import Link from "next/link";

export default function CourseCard({ title, price, image, slug, category }) {
  return (
    <Link
      href={`/courses/${slug}`}
      className='group bg-white overfolw-hidden rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300'
    >
      {/* Placeholder Gambar */}
      <div className='relative h-40 w-full bg-gray-200 rounded-t-2xl overflow-hidden'>
        {/* PERBAIKAN 2: Image Component */}
        <Image
          src={image}
          alt={title} // Wajib ada alt text untuk aksesibilitas & SEO
          fill // Agar gambar memenuhi container parent (h-40)
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' // Optimasi loading gambar
          className='object-cover transform group-hover:scale-105 transition duration-700 ease-out' // Agar gambar tidak gepeng (crop otomatis)
        />
      </div>

      <div className='p-4'>
        <span className='text-xs font-semibold text-blue-600 mb-1 block uppercase tracking-wide'>
          {category}
        </span>
        <h3 className='font-bold text-lg text-gray-900 group-hover:text-blue-600 line-clamp-2 leading-snug'>
          {title}
        </h3>
        <p className='text-gray-700 mt-3 font-bold'>{formatRupiah(price)}</p>
      </div>
    </Link>
  );
}
