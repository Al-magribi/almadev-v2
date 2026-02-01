import Image from "next/image";
import { notFound } from "next/navigation";
import { BadgeCheck, CheckCircle2, ShieldCheck, Star } from "lucide-react";
import { getProductDetail } from "@/actions/product-actions";
import { getCurrentUser } from "@/lib/auth-service";
import { formatRupiah } from "@/lib/client-utils";
import ProductCheckoutButton from "@/components/marketing/checkout/ProductCheckoutButton";

export async function generateMetadata({ params }) {
  const { productId } = await params;
  const product = await getProductDetail(productId);

  return {
    title: product?.name || "Detail Produk",
    description:
      product?.description ||
      "Produk digital siap pakai untuk mempercepat karir Anda.",
  };
}

export default async function ProductDetailPage({ params, searchParams }) {
  const { productId } = await params;
  const sParams = await searchParams;

  const product = await getProductDetail(productId);
  if (!product) return notFound();

  const user = await getCurrentUser();

  const utmData = {
    utm_source: sParams?.utm_source || null,
    utm_medium: sParams?.utm_medium || null,
    utm_campaign: sParams?.utm_campaign || null,
    utm_term: sParams?.utm_term || null,
    utm_content: sParams?.utm_content || null,
  };

  return (
    <div className='bg-white text-slate-900'>
      <section className='border-b border-slate-100 bg-slate-950 text-white'>
        <div className='container mx-auto px-4 py-14 lg:py-20'>
          <div className='grid gap-10 lg:grid-cols-12 items-center'>
            <div className='lg:col-span-6'>
              <div className='relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl'>
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    priority
                    className='object-cover'
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw'
                  />
                ) : (
                  <div className='absolute inset-0 bg-linear-to-br from-slate-800 via-slate-900 to-black' />
                )}
              </div>
            </div>

            <div className='lg:col-span-6 space-y-6'>
              <div className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-100'>
                <BadgeCheck size={14} />
                Produk Digital
              </div>

              <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>
                {product.name}
              </h1>

              <p className='text-slate-300 text-base md:text-lg max-w-2xl'>
                {product.description}
              </p>

              <div className='flex flex-wrap items-center gap-4 text-sm text-slate-300'>
                <span className='inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1'>
                  <Star size={14} className='text-amber-400' />
                  {Number(product.rating || 0).toFixed(1)} dari{" "}
                  {product.totalReviews || 0} ulasan
                </span>
                <span className='inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1'>
                  Kategori: {product.category || "Digital"}
                </span>
              </div>

              <div className='text-3xl font-extrabold text-white'>
                {formatRupiah(product.price)}
              </div>

              <div className='flex flex-col sm:flex-row gap-3'>
                <ProductCheckoutButton
                  product={product}
                  user={user}
                  utmData={utmData}
                  className='inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition w-full sm:w-auto'
                />
                <a
                  href='#detail'
                  className='inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition w-full sm:w-auto'
                >
                  Lihat Detail
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id='detail' className='py-14'>
        <div className='container mx-auto px-4'>
          <div className='grid gap-10 lg:grid-cols-12'>
            <div className='lg:col-span-7 space-y-6'>
              <div className='rounded-3xl border border-slate-100 p-6 md:p-8'>
                <h2 className='text-2xl font-bold text-slate-900 mb-4'>
                  Deskripsi Produk
                </h2>
                <p className='text-slate-600 leading-relaxed'>
                  {product.description}
                </p>
              </div>

              <div className='rounded-3xl border border-slate-100 p-6 md:p-8'>
                <h3 className='text-lg font-semibold text-slate-900 mb-4'>
                  Yang Anda Dapatkan
                </h3>
                <div className='grid gap-3'>
                  {[
                    "Akses instan setelah pembayaran terverifikasi.",
                    "File/asset siap pakai untuk kebutuhan proyek.",
                    "Panduan penggunaan singkat agar cepat dipraktikkan.",
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className='flex items-start gap-3 text-slate-600 text-sm'
                    >
                      <CheckCircle2
                        className='text-green-500 mt-0.5'
                        size={18}
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='lg:col-span-5'>
              <div className='sticky top-24 space-y-4 rounded-3xl border border-slate-200 p-6 shadow-sm'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-semibold text-slate-500 uppercase tracking-wider'>
                    Total Harga
                  </p>
                  <p className='text-2xl font-extrabold text-slate-900'>
                    {formatRupiah(product.price)}
                  </p>
                </div>

                <ProductCheckoutButton
                  product={product}
                  user={user}
                  utmData={utmData}
                  className='inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white hover:bg-slate-800 transition'
                  label='Beli Sekarang'
                />

                <div className='rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600'>
                  <div className='flex items-center gap-2'>
                    <ShieldCheck size={14} className='text-emerald-500' />
                    Pembayaran aman & terverifikasi.
                  </div>
                  <div className='mt-2 flex items-center gap-2'>
                    <BadgeCheck size={14} className='text-blue-500' />
                    Akses file dikirim otomatis setelah pembayaran selesai.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
