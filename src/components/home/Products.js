import Link from "next/link";
import { formatRupiah } from "@/lib/client-utils"; // Pastikan path utils benar

const PRODUCTS = [
  {
    title: "Ebook Panduan Freelance Pemula",
    price: 50000,
    slug: "ebook-freelance",
  },
  {
    title: "Template CV ATS Friendly (Word)",
    price: 25000,
    slug: "template-cv",
  },
  {
    title: "Source Code LMS Fullstack",
    price: 500000,
    slug: "source-code-lms",
  },
];

export default function Products() {
  return (
    <section className='container mx-auto px-4 mt-20 mb-20'>
      <div className='bg-gradient-to- from-blue-50 to-white border border-blue-100 py-12 px-6 rounded-3xl relative overflow-hidden'>
        {/* Hiasan background abstrak */}
        <div className='absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-30'></div>

        <div className='flex justify-between items-end mb-8 border-b border-gray-100 pb-8 relative z-10'>
          <div>
            <h2 className='text-2xl font-bold text-slate-900'>
              Produk Digital
            </h2>
            <p className='text-slate-500 text-sm mt-1'>
              Tools siap pakai untuk mempercepat karir
            </p>
          </div>
          <Link
            href='/products'
            className='text-blue-600 font-semibold hover:text-blue-700 text-sm'
          >
            Lihat Semua &rarr;
          </Link>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10'>
          {PRODUCTS.map((product, index) => (
            <div
              key={index}
              className='group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300'
            >
              <div className='h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' />
                  <polyline points='14 2 14 8 20 8' />
                </svg>
              </div>
              <h3 className='font-bold text-slate-900 line-clamp-2 h-12 mb-2 group-hover:text-blue-600 transition-colors'>
                {product.title}
              </h3>
              <p className='text-slate-700 font-bold text-lg'>
                {formatRupiah(product.price)}
              </p>
              <button className='mt-4 w-full bg-slate-50 text-slate-900 border border-slate-200 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all'>
                Detail Produk
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
