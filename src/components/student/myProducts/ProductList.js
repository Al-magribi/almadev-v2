"use client";

import React from "react";
import Image from "next/image";
import {
  Package,
  Search,
  Calendar,
  Receipt,
  Star,
  Download,
  PlayCircle,
  Copy,
  StickyNote,
  X,
} from "lucide-react";
import { formatDate, formatRupiah } from "@/lib/client-utils";
import { getPurchasedProductsByUser } from "@/actions/transaction-actions";

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

export default function ProductList({ userId }) {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState([]);
  const [query, setQuery] = React.useState("");
  const [noteModal, setNoteModal] = React.useState({
    open: false,
    title: "",
    text: "",
  });

  React.useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      try {
        if (!userId) {
          if (mounted) setItems([]);
          return;
        }
        const data = await getPurchasedProductsByUser(userId);
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
    return items.filter((it) => {
      const p = it.product || {};
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  const openNote = (title, text) => {
    setNoteModal({ open: true, title: title || "Catatan", text: text || "" });
  };

  const closeNote = () => {
    setNoteModal({ open: false, title: "", text: "" });
  };

  return (
    <div className='mx-auto w-full max-w-6xl  '>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='flex items-start gap-3'>
          <div className='rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm'>
            <Package className='h-6 w-6 text-zinc-900' />
          </div>
          <div>
            <h1 className='text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl'>
              Produk Saya
            </h1>
            <p className='mt-1 text-sm text-zinc-600'>
              Semua produk digital yang sudah kamu beli ada di sini.
            </p>
          </div>
        </div>

        <div className='relative w-full sm:w-360px'>
          <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500' />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Cari produk atau kategori...'
            className='h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-500 focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60'
          />
        </div>
      </div>

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
              <Package className='h-6 w-6 text-zinc-700' />
            </div>
            <h3 className='mt-4 text-base font-semibold text-zinc-900'>
              Belum ada produk
            </h3>
            <p className='mt-1 text-sm text-zinc-600'>
              Setelah kamu membeli produk dan statusnya completed, produk akan
              tampil di sini.
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
                produk
              </p>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {filtered.map((it) => {
                const p = it.product || {};
                const imgSrc =
                  p.image && p.image.startsWith("http")
                    ? p.image
                    : p.image
                      ? p.image
                      : "/placeholder.png";
                const downloadUrl = p.filePath || p.fileLink || "";

                return (
                  <div
                    key={`${it.transactionCode}-${p._id}`}
                    className='group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md'
                  >
                    <div className='relative aspect-video w-full bg-zinc-100'>
                      <div className='absolute left-3 top-3 z-10 rounded-full border border-zinc-200 bg-white/90 px-3 py-1 text-xs font-medium text-zinc-800 backdrop-blur'>
                        Purchased
                      </div>

                      <Image
                        src={imgSrc}
                        alt={p.name || "Product thumbnail"}
                        fill
                        className='object-cover transition group-hover:scale-[1.02]'
                        sizes='(max-width: 1024px) 100vw, 33vw'
                        priority={false}
                      />
                    </div>

                    <div className='p-4'>
                      <div className='flex items-center gap-2'>
                        {p.category && (
                          <span className='rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700'>
                            {p.category}
                          </span>
                        )}
                      </div>

                      <h3 className='mt-3 line-clamp-2 text-base font-semibold text-zinc-900'>
                        {p.name}
                      </h3>

                      <p className='mt-2 line-clamp-2 text-sm text-zinc-600'>
                        {p.description || "Tidak ada deskripsi."}
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
                            {Number(p.rating || 0).toFixed(1)} / 5 (
                            {p.totalReviews || 0} ulasan)
                          </span>
                        </div>
                      </div>

                      <div className='mt-4 flex flex-wrap items-center gap-2'>
                        {downloadUrl ? (
                          <a
                            href={downloadUrl}
                            target='_blank'
                            rel='noreferrer'
                            download
                            className='inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-200'
                          >
                            <Download className='h-4 w-4' />
                            Unduh
                          </a>
                        ) : (
                          <button
                            type='button'
                            className='inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-400 shadow-sm'
                            disabled
                          >
                            <Download className='h-4 w-4' />
                            Unduh
                          </button>
                        )}

                        {p.videoLink ? (
                          <a
                            href={p.videoLink}
                            target='_blank'
                            rel='noreferrer'
                            className='inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-200'
                          >
                            <PlayCircle className='h-4 w-4' />
                            Tonton
                          </a>
                        ) : (
                          <button
                            type='button'
                            className='inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-400 shadow-sm'
                            disabled
                          >
                            <PlayCircle className='h-4 w-4' />
                            Tonton
                          </button>
                        )}

                        <button
                          type='button'
                          className='inline-flex h-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-200'
                          onClick={() => {
                            navigator.clipboard?.writeText(it.transactionCode);
                          }}
                          title='Copy kode transaksi'
                        >
                          <Copy className='h-4 w-4' />
                        </button>
                      </div>

                      <div className='mt-3 text-[11px] text-zinc-500'>
                        Transaction:{" "}
                        <span className='font-medium text-zinc-700'>
                          {it.transactionCode}
                        </span>
                      </div>

                      {p.note ? (
                        <button
                          type='button'
                          onClick={() => openNote(p.name, p.note)}
                          className='mt-3 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100'
                        >
                          <StickyNote className='h-3.5 w-3.5' />
                          Lihat Catatan
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {noteModal.open && (
        <div className='fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4'>
          <div className='flex min-h-full items-center justify-center'>
            <div className='w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white shadow-xl'>
            <div className='flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4'>
              <div>
                <div className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                  Catatan Produk
                </div>
                <h3 className='mt-1 text-base font-semibold text-zinc-900'>
                  {noteModal.title || "Catatan"}
                </h3>
              </div>
              <button
                type='button'
                onClick={closeNote}
                className='rounded-full border border-zinc-200 p-2 text-zinc-600 transition hover:bg-zinc-50'
                aria-label='Tutup'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            <div className='px-5 py-4'>
              <div className='max-h-[60vh] overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 whitespace-pre-wrap'>
                {noteModal.text}
              </div>
            </div>

            <div className='flex flex-col-reverse gap-2 border-t border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-end'>
              <button
                type='button'
                onClick={closeNote}
                className='inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50'
              >
                Tutup
              </button>
              <button
                type='button'
                onClick={() => {
                  navigator.clipboard?.writeText(noteModal.text || "");
                }}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800'
              >
                <Copy className='h-4 w-4' />
                Salin Catatan
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
