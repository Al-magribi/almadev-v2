"use client";

import React from "react";
import Image from "next/image";
import {
  BookOpen,
  Search,
  ArrowRight,
  Calendar,
  Receipt,
  Loader2,
  Star,
} from "lucide-react";
import { formatDate, formatRupiah } from "@/lib/client-utils";
import { getPurchasedCoursesByUser } from "@/actions/course-actions";

function SkeletonCard() {
  return (
    <div className='overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm'>
      <div className='aspect-video w-full animate-pulse bg-zinc-100' />
      <div className='p-4'>
        <div className='h-4 w-3/4 animate-pulse rounded bg-zinc-100' />
        <div className='mt-3 h-3 w-full animate-pulse rounded bg-zinc-100' />
        <div className='mt-2 h-3 w-5/6 animate-pulse rounded bg-zinc-100' />
        <div className='mt-4 flex gap-2'>
          <div className='h-8 w-28 animate-pulse rounded-xl bg-zinc-100' />
          <div className='h-8 w-20 animate-pulse rounded-xl bg-zinc-100' />
        </div>
      </div>
    </div>
  );
}

export default function CourseList({ userId }) {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState([]);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      try {
        if (!userId) {
          if (mounted) setItems([]);
          return;
        }
        const data = await getPurchasedCoursesByUser(userId);
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      (it.course?.name || "").toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='flex items-start gap-3'>
          <div className='rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm'>
            <BookOpen className='h-6 w-6 text-zinc-900' />
          </div>
          <div>
            <h1 className='text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl'>
              Kursus Saya
            </h1>
            <p className='mt-1 text-sm text-zinc-600'>
              Semua kursus yang sudah kamu beli akan muncul di sini.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className='relative w-full sm:w-360px'>
          <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500' />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Cari kursus...'
            className='h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-500 focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60'
          />
        </div>
      </div>

      {/* Content */}
      <div className='mt-6'>
        {!userId && (
          <div className='rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm'>
            Kamu belum login / userId tidak ditemukan. Pastikan halaman ini
            menerima <span className='font-medium'>userId</span> dari session.
          </div>
        )}

        {userId && loading && (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {userId && !loading && filtered.length === 0 && (
          <div className='rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm'>
            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50'>
              <Receipt className='h-6 w-6 text-zinc-700' />
            </div>
            <h3 className='mt-4 text-base font-semibold text-zinc-900'>
              Belum ada kursus
            </h3>
            <p className='mt-1 text-sm text-zinc-600'>
              Setelah kamu membeli kursus dan statusnya <b>completed</b>, kursus
              akan tampil di sini.
            </p>
          </div>
        )}

        {userId && !loading && filtered.length > 0 && (
          <>
            <div className='mb-4 flex items-center justify-between'>
              <p className='text-sm text-zinc-600'>
                Menampilkan{" "}
                <span className='font-medium text-zinc-900'>
                  {filtered.length}
                </span>{" "}
                kursus
              </p>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {filtered.map((it) => {
                const c = it.course || {};
                const imgSrc =
                  c.image && c.image.startsWith("http")
                    ? c.image
                    : c.image
                      ? c.image
                      : "/placeholder.png";

                return (
                  <div
                    key={`${it.transactionCode}-${c._id}`}
                    className='group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md'
                  >
                    <div className='relative aspect-video w-full bg-zinc-100'>
                      {/* Badge */}
                      <div className='absolute left-3 top-3 z-10 rounded-full border border-zinc-200 bg-white/90 px-3 py-1 text-xs font-medium text-zinc-800 backdrop-blur'>
                        Purchased
                      </div>

                      <Image
                        src={imgSrc}
                        alt={c.name || "Course thumbnail"}
                        fill
                        className='object-cover transition group-hover:scale-[1.02]'
                        sizes='(max-width: 1024px) 100vw, 33vw'
                        priority={false}
                      />
                    </div>

                    <div className='p-4'>
                      <h3 className='line-clamp-2 text-base font-semibold text-zinc-900'>
                        {c.name}
                      </h3>

                      <p className='mt-2 line-clamp-2 text-sm text-zinc-600'>
                        {c.description || "Tidak ada deskripsi."}
                      </p>

                      <div className='mt-4 space-y-2 text-xs text-zinc-600'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4' />
                          <span>Dibeli: {formatDate(it.purchasedAt)}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Receipt className='h-4 w-4' />
                          <span>{formatRupiah(it.price)}</span>
                        </div>

                        <div className='flex items-center gap-2'>
                          <Star className='h-4 w-4' />
                          <span>
                            {Number(c.rating || 0).toFixed(1)} •{" "}
                            {c.totalReviews || 0} ulasan
                          </span>
                        </div>
                      </div>

                      <div className='mt-4 flex items-center gap-2'>
                        <a
                          href={`/courses/${c._id}`}
                          className='inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-200'
                        >
                          Lanjut Belajar
                          <ArrowRight className='h-4 w-4' />
                        </a>

                        <button
                          type='button'
                          className='inline-flex h-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-200'
                          onClick={() => {
                            navigator.clipboard?.writeText(it.transactionCode);
                          }}
                          title='Copy kode transaksi'
                        >
                          <span className='hidden sm:inline'>Kode</span>
                          <span className='sm:hidden'>#</span>
                        </button>
                      </div>

                      <div className='mt-3 text-[11px] text-zinc-500'>
                        Transaction:{" "}
                        <span className='font-medium text-zinc-700'>
                          {it.transactionCode}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
