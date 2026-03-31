import Image from "next/image";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { formatRupiah } from "@/lib/client-utils";
import ProjectShowcase from "@/components/marketing/ProjectShowcase";
import ProductCheckoutSummary from "@/components/marketing/ProductCheckoutSummary";
import { normalizeImageSrc, shouldUnoptimizeImage } from "@/lib/image-utils";

const DEFAULT_BENEFITS = [
  "Akses instan setelah pembayaran terverifikasi.",
  "Siap dipakai untuk kebutuhan kerja dan proyek.",
  "Format file rapi dan mudah diimplementasikan.",
];

const DEFAULT_FAQS = [
  {
    question: "Kapan akses produk diberikan?",
    answer: "Akses dikirim otomatis setelah pembayaran berhasil diverifikasi.",
  },
  {
    question: "Apakah produk ini bisa langsung dipakai?",
    answer:
      "Ya. Produk dirancang agar bisa langsung digunakan atau disesuaikan dengan kebutuhan Anda.",
  },
  {
    question: "Apakah saya akan mendapatkan update?",
    answer:
      "Detail update mengikuti kebijakan produk. Jika ada pembaruan, akses akan mengikuti file yang tersedia.",
  },
];

function toParagraphs(value = "") {
  return String(value || "")
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProductLandingPage({
  product,
  landing,
  user,
  utmData,
  metaPixelId,
}) {
  const heroTitle =
    landing?.hero?.headline || landing?.hero?.customTitle || product?.name;
  const heroSubtitle = landing?.hero?.customSubtitle || product?.description;
  const detailParagraphs = toParagraphs(product?.description);
  const pricingPlans = Array.isArray(landing?.pricing?.items)
    ? landing.pricing.items
        .filter((item) => item?.isActive !== false)
        .map((item) => ({
          ...item,
          _id: item?._id?.toString?.() || "",
          benefits: Array.isArray(item?.benefits)
            ? item.benefits.filter(Boolean)
            : [],
        }))
    : [];
  const productBenefits = Array.isArray(product?.benefits)
    ? product.benefits.filter(Boolean)
    : [];
  const landingBenefits = Array.isArray(pricingPlans?.[0]?.benefits)
    ? pricingPlans[0].benefits.filter(Boolean)
    : [];
  const benefits =
    productBenefits.length > 0
      ? productBenefits.slice(0, 6)
      : landingBenefits.length > 0
        ? landingBenefits.slice(0, 6)
        : DEFAULT_BENEFITS;
  const reviews = Array.isArray(product?.reviews) ? product.reviews : [];
  const testimonials = Array.isArray(landing?.testimonials?.items)
    ? landing.testimonials.items.filter((item) => item?.isActive !== false)
    : reviews;
  const faqs = Array.isArray(landing?.faqs?.items)
    ? landing.faqs.items.filter((item) => item?.isActive !== false)
    : DEFAULT_FAQS;
  const gallery = (landing?.gallery?.items || [])
    .filter((item) => item?.isActive !== false)
    .map((item) => ({
      ...item,
      _id: item?._id?.toString?.() || "",
      images: Array.isArray(item?.images) ? item.images.filter(Boolean) : [],
    }));
  const testimonialRatings = testimonials
    .map((item) => Math.max(0, Math.min(5, Number(item?.rating) || 0)))
    .filter((value) => Number.isFinite(value) && value > 0);
  const rating =
    testimonialRatings.length > 0
      ? testimonialRatings.reduce((sum, value) => sum + value, 0) /
        testimonialRatings.length
      : Number(product?.displayRating || product?.rating || 0);
  const totalReviews =
    testimonialRatings.length > 0
      ? testimonialRatings.length
      : Number(
          product?.displayReviews || product?.totalReviews || reviews.length || 0,
        );
  const manualBuyers = Math.max(
    0,
    Number(landing?.instructor?.customStudents) || 0,
  );
  const soldCount =
    manualBuyers + Math.max(0, Number(product?.salesCount) || 0);
  const heroImageSrc = normalizeImageSrc(product?.image);

  return (
    <div className='bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900'>
      <section className='relative overflow-hidden bg-slate-950 text-white'>
        <div className='absolute inset-0'>
          <div className='absolute left-[-8%] top-10 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl' />
          <div className='absolute bottom-[-4rem] right-[-2rem] h-80 w-80 rounded-full bg-blue-600/20 blur-3xl' />
        </div>

        <div className='container relative mx-auto px-4 py-20 lg:py-24'>
          <div className='grid items-center gap-12 lg:grid-cols-12'>
            <div className='space-y-7 lg:col-span-6'>
              <div className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100 backdrop-blur'>
                <Sparkles size={14} />
                {product?.name}
              </div>

              <div className='space-y-4'>
                <h1 className='max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl'>
                  {heroTitle}
                </h1>
                <p className='max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg'>
                  {heroSubtitle}
                </p>
              </div>

              <div className='flex flex-wrap items-center gap-3'>
                <div className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/70 border border-slate-700/80 text-slate-100'>
                  <Users size={16} className='text-cyan-300' />
                  <span className='text-sm font-semibold'>
                    {soldCount.toLocaleString("id-ID")} Terjual
                  </span>
                </div>
                <div className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/70 border border-slate-700/80 text-slate-100'>
                  <Star size={16} className='text-yellow-400 fill-yellow-400' />
                  <span className='text-sm font-semibold'>
                    {rating > 0 ? rating.toFixed(1) : "Baru"} ({totalReviews}{" "}
                    ulasan)
                  </span>
                </div>
              </div>

              <div className='flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'>
                    Investasi
                  </p>
                  <p className='mt-2 text-3xl font-extrabold text-white md:text-4xl'>
                    {formatRupiah(product?.price || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className='lg:col-span-6'>
              <div className='relative overflow-hidden rounded-[1rem] border border-white/10 bg-slate-900 shadow-2xl shadow-blue-950/40'>
                <div className='relative aspect-[4/3] pt-12'>
                  {heroImageSrc ? (
                    <Image
                      src={heroImageSrc}
                      alt={product.name}
                      fill
                      priority
                      unoptimized={shouldUnoptimizeImage(heroImageSrc)}
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw'
                      className='object-cover'
                    />
                  ) : (
                    <div className='absolute inset-0 bg-linear-to-br from-slate-800 via-slate-900 to-black' />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='border-b border-slate-200 bg-slate-50'>
        <div className='container mx-auto grid gap-4 px-4 py-12 md:grid-cols-3'>
          {benefits.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100'
            >
              <div className='mb-4 inline-flex rounded-2xl bg-cyan-50 p-3 text-cyan-700'>
                <CheckCircle2 size={20} />
              </div>
              <h2 className='mb-2 text-base font-bold text-slate-900'>
                Benefit {index + 1}
              </h2>
              <p className='text-sm leading-relaxed text-slate-600'>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section id='detail' className='py-20'>
        <div className='container mx-auto grid gap-8 px-4 lg:grid-cols-12'>
          <div className='space-y-8 lg:col-span-7'>
            <div className='rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 md:p-8'>
              <p className='text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700'>
                Detail Product
              </p>
              <h2 className='mt-3 text-3xl font-bold tracking-tight text-slate-900'>
                Dirancang untuk langsung dipakai
              </h2>
              <div className='mt-6 space-y-4 text-base leading-relaxed text-slate-600'>
                {(detailParagraphs.length > 0
                  ? detailParagraphs
                  : [product?.description || "Belum ada deskripsi produk."]
                ).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {gallery.length > 0 && (
              <ProjectShowcase
                projects={gallery}
                customTitle={landing?.gallery?.customTitle || "Preview Asset"}
                customSubtitle={
                  landing?.gallery?.customSubtitle ||
                  "Lihat tampilan hasil, contoh penggunaan, dan aset yang Anda dapatkan."
                }
              />
            )}

            {testimonials.length > 0 && (
              <div className='space-y-5'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700'>
                    Social Proof
                  </p>
                  <h3 className='mt-2 text-3xl font-bold tracking-tight text-slate-900'>
                    Testimoni Pembeli
                  </h3>
                </div>

                <div className='grid gap-5 md:grid-cols-2'>
                  {testimonials.slice(0, 4).map((item, index) => (
                    <div
                      key={item?._id || `${item?.name || "review"}-${index}`}
                      className='rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6'
                    >
                      <div className='mb-4 flex gap-1'>
                        {[...Array(5)].map((_, starIndex) => (
                          <Star
                            key={starIndex}
                            size={16}
                            className={
                              starIndex < Number(item?.rating || 5)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }
                          />
                        ))}
                      </div>
                      <p className='text-sm leading-relaxed text-slate-600'>
                        &quot;
                        {item?.comment ||
                          item?.review ||
                          "Produk sangat membantu workflow saya."}
                        &quot;
                      </p>
                      <div className='mt-5 flex items-center gap-3'>
                        <div className='flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white'>
                          {(item?.name || "U").charAt(0)}
                        </div>
                        <div>
                          <p className='font-semibold text-slate-900'>
                            {item?.name || "Pembeli"}
                          </p>
                          <p className='text-xs text-slate-500'>
                            {item?.role || "Verified buyer"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {faqs.length > 0 && (
              <div className='space-y-4'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700'>
                    FAQ
                  </p>
                  <h3 className='mt-2 text-3xl font-bold tracking-tight text-slate-900'>
                    Pertanyaan Umum
                  </h3>
                </div>

                {faqs.slice(0, 6).map((item, index) => (
                  <details
                    key={`${item?.question || "faq"}-${index}`}
                    className='group overflow-hidden rounded-2xl border border-slate-200 bg-white'
                  >
                    <summary className='flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left'>
                      <span className='font-semibold text-slate-900'>
                        {item?.question}
                      </span>
                      <ChevronDown className='text-slate-400 transition group-open:rotate-180' />
                    </summary>
                    <div className='px-5 pb-5 text-sm leading-relaxed text-slate-600'>
                      {item?.answer}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>

          <div className='lg:col-span-5'>
            <ProductCheckoutSummary
              product={product}
              pricingPlans={pricingPlans}
              user={user}
              utmData={utmData}
              metaPixelId={metaPixelId}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
