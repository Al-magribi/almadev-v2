import { getCourseDetail } from "@/actions/course-actions";
import Link from "next/link";
import Image from "next/image"; // IMPORT PENTING: Untuk optimasi gambar LCP
import { notFound } from "next/navigation";
import { formatRupiah } from "@/lib/client-utils";
// Import Component Client yang baru dibuat
import ProjectShowcase from "@/components/marketing/ProjectShowcase";

import {
  PlayCircle,
  CheckCircle2,
  Star,
  Users,
  Award,
  ChevronDown,
  HelpCircle,
  Quote,
} from "lucide-react";
import CurriculumList from "@/components/marketing/CurriculumList";
import Footer from "@/components/shared/Footer";

// --- METADATA ---
export async function generateMetadata({ params }) {
  const { courseId } = await params;
  const data = await getCourseDetail(courseId);
  return {
    title:
      data?.landing?.hero?.headline || data?.course?.name || "Detail Kursus",
    description:
      data?.landing?.hero?.customSubtitle || "Belajar skill baru hari ini.",
  };
}

// --- KOMPONEN UTAMA (SERVER COMPONENT) ---
export default async function CourseLandingPage({ params }) {
  const { courseId } = await params;
  const data = await getCourseDetail(courseId);

  if (!data || !data.course) return notFound();

  const { course, landing } = data;

  // --- 1. DATA PREPARATION & SANITIZATION ---

  const heroData = {
    headline: landing?.hero?.headline || course.name,
    subtitle: landing?.hero?.customSubtitle || course.description,
    image: course.image || "/placeholder-course.jpg",
  };

  const features = landing?.features?.items || [];
  const objectives = course.objectives || [];

  // [CRITICAL FIX] Sanitasi data Gallery sebelum dikirim ke Client Component
  // Masalah sebelumnya: Next.js tidak bisa mengirim object MongoDB (ObjectId) langsung ke Client Component.
  // Solusi: Kita map array dan convert _id menjadi string.
  const gallery = (landing?.gallery?.items || []).map((item) => ({
    ...item,
    _id: item._id?.toString() || "", // Convert ObjectId to String
    images: item.images || [], // Pastikan array images aman
  }));

  const sanitizedCurriculum = (course.curriculum || []).map((module) => ({
    ...module,
    _id: module._id ? module._id.toString() : "", // Convert Module _id
    lessons: (module.lessons || []).map((lesson) => ({
      ...lesson,
      _id: lesson._id ? lesson._id.toString() : "", // Convert Lesson _id
    })),
  }));

  const testimonials = landing?.testimonials?.items || [];
  const pricings = landing?.pricing?.items || [];
  const faqs = landing?.faqs?.items || [];

  // Hitung statistik (Fallback ke default jika kosong)
  const rating = landing?.instructor?.customRating || course.rating || 4.8;
  const students =
    landing?.instructor?.customStudents || course.totalReviews * 10 || 120;

  return (
    <div className='bg-white text-slate-900 font-sans selection:bg-violet-100 selection:text-violet-900'>
      {/* =========================================================
          SECTION 1: HERO (ATTENTION) - Optimized with next/image
      ========================================================== */}
      <section className='relative bg-slate-950 pt-24 pb-32 overflow-hidden mx-auto'>
        {/* Background Decor (Blur dikurangi ke 3xl agar performa ringan di HP) */}
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none'>
          <div className='absolute top-20 left-10 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl mix-blend-screen animate-pulse' />
          <div className='absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl mix-blend-screen' />
        </div>

        <div className='container mx-auto px-4 relative z-10'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            {/* Left: Copywriting */}
            <div className='space-y-6 text-center lg:text-left order-2 lg:order-1'>
              <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-violet-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md'>
                <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                Kelas Online Terstruktur
              </div>

              <h1 className='text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] tracking-tight'>
                {heroData.headline}
              </h1>

              <p className='text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0'>
                {heroData.subtitle}
              </p>

              {/* CTA Buttons */}
              <div className='flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start'>
                <a
                  href='#pricing'
                  className='w-full sm:w-auto px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-600/25 hover:-translate-y-1 text-center'
                >
                  Mulai Belajar Sekarang
                </a>
                <a
                  href='#curriculum'
                  className='w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-2'
                >
                  <PlayCircle size={20} />
                  Lihat Kurikulum
                </a>
              </div>
            </div>

            {/* Right: Media/Image (OPTIMIZED) */}
            <div className='relative group order-1 lg:order-2'>
              <div className='absolute -inset-1 bg-linear-to-r from-violet-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000'></div>
              <div className='relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl'>
                {/* MENGGUNAKAN NEXT/IMAGE 
                    - fill: agar responsif mengikuti container
                    - priority: load gambar ini duluan (mengatasi LCP merah)
                    - sizes: membantu browser memilih ukuran gambar yang tepat
                */}
                {heroData.image ? (
                  <Image
                    src={heroData.image}
                    alt={heroData.headline}
                    fill
                    priority
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    className='object-cover transform group-hover:scale-105 transition duration-700 ease-out'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-slate-600'>
                    Preview Video
                  </div>
                )}

                {/* Play Button Overlay */}
                {course.video && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-all cursor-pointer z-10'>
                    <div className='w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform'>
                      <PlayCircle
                        size={32}
                        className='text-white fill-white/20'
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 2: FEATURES & OBJECTIVES (INTEREST)
      ========================================================== */}

      {features.length > 0 && (
        <div className='bg-slate-50 border-b border-slate-200'>
          <div className='container mx-auto px-4 py-12'>
            <div className='grid md:grid-cols-3 gap-6'>
              {features.map((item, idx) => (
                <div
                  key={idx}
                  className='flex items-start gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300'
                >
                  <div className='w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0'>
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className='font-semibold text-slate-900 mb-1'>
                      Benefit #{idx + 1}
                    </h3>
                    <p className='text-slate-600 text-sm leading-relaxed'>
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {objectives.length > 0 && (
        <section className='py-20 bg-white'>
          <div className='container mx-auto px-4 max-w-5xl'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl font-bold text-slate-900'>
                Apa yang Akan Anda Pelajari?
              </h2>
              <p className='text-slate-500 mt-2'>
                Target pencapaian setelah mengikuti kelas ini
              </p>
            </div>

            <div className='grid md:grid-cols-2 gap-4'>
              {objectives.map((obj, idx) => (
                <div
                  key={idx}
                  className='flex items-start gap-3 p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-violet-200 transition-colors'
                >
                  <CheckCircle2
                    className='text-green-500 shrink-0 mt-0.5'
                    size={20}
                  />
                  <span className='text-slate-700 font-medium'>
                    {obj.objective}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          SECTION 3: SHOWCASE (DESIRE) - Client Component
      ========================================================== */}

      {/* Kita memanggil component client di sini. 
          Karena data 'gallery' sudah disanitasi di atas, error serialization hilang.
      */}
      <ProjectShowcase
        projects={gallery}
        customTitle={landing?.gallery?.customTitle}
        customSubtitle={landing?.gallery?.customSubtitle}
      />

      {/* =========================================================
          SECTION 4: CURRICULUM, TESTIMONIALS, PRICING, FAQ
      ========================================================== */}

      {/* Curriculum */}
      <section id='curriculum' className='py-24 bg-slate-50'>
        <div className='container mx-auto px-4 max-w-4xl'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold text-slate-900 mb-4'>
              Kurikulum Terstruktur
            </h2>
            <p className='text-slate-600'>
              Materi disusun sistematis dari dasar hingga mahir.
            </p>
          </div>

          <CurriculumList curriculum={sanitizedCurriculum} />
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className='py-24 bg-white border-t border-slate-100'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-center mb-12'>
              Kata Alumni Kami
            </h2>

            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {testimonials.map((item, idx) => (
                <div
                  key={idx}
                  className='bg-slate-50 p-6 rounded-2xl border border-slate-100 relative'
                >
                  <Quote
                    className='absolute top-6 right-6 text-slate-200 rotate-180'
                    size={40}
                  />

                  <div className='flex gap-1 mb-4'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${i < (item.rating || 5) ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`}
                      />
                    ))}
                  </div>

                  <p className='text-slate-700 mb-6 italic relative z-10'>
                    "{item.comment}"
                  </p>

                  <div className='flex items-center gap-3 mt-auto'>
                    <div className='w-10 h-10 rounded-full bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm'>
                      {item.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h4 className='font-bold text-sm text-slate-900'>
                        {item.name}
                      </h4>
                      <p className='text-xs text-slate-500'>{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section id='pricing' className='py-24 bg-slate-900 text-white relative'>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-500px h-500px bg-violet-600/20 rounded-full blur-[120px] pointer-events-none' />

        <div className='container mx-auto px-4 relative z-10'>
          <div className='text-center max-w-2xl mx-auto mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              {landing?.pricing?.customTitle || "Investasi Belajar Terbaik"}
            </h2>
            <p className='text-slate-400 text-lg'>
              {landing?.pricing?.customSubtitle ||
                "Pilih paket yang sesuai dengan kebutuhan Anda."}
            </p>
          </div>

          <div
            className={`grid gap-8 max-w-5xl mx-auto ${pricings.length === 1 ? "grid-cols-1 md:w-1/2" : "md:grid-cols-2 lg:grid-cols-3"}`}
          >
            {pricings.length >= 0 &&
              pricings.map((plan, idx) => (
                <div
                  key={idx}
                  className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 ${
                    plan.isRecommended
                      ? "bg-violet-600 text-white scale-105 shadow-2xl shadow-violet-900/50 border-0 z-10"
                      : "bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {plan.isRecommended && (
                    <div className='absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg'>
                      Rekomendasi
                    </div>
                  )}

                  <h3
                    className={`text-lg font-bold mb-2 ${plan.isRecommended ? "text-violet-100" : "text-slate-300"}`}
                  >
                    {plan.name}
                  </h3>
                  <div className='text-4xl font-extrabold mb-6'>
                    {plan.price === 0 ? "Gratis" : formatRupiah(plan.price)}
                  </div>

                  <div
                    className={`h-px w-full mb-6 ${plan.isRecommended ? "bg-violet-500" : "bg-slate-700"}`}
                  />

                  <ul className='space-y-4 mb-8 flex-1'>
                    {plan.benefits?.map((benefit, bIdx) => (
                      <li key={bIdx} className='flex gap-3 text-sm'>
                        <CheckCircle2
                          size={18}
                          className={`${plan.isRecommended ? "text-white" : "text-violet-400"} shrink-0`}
                        />
                        <span
                          className={
                            plan.isRecommended
                              ? "text-violet-50"
                              : "text-slate-300"
                          }
                        >
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/checkout/${course._id}?plan=${idx}`}
                    className={`block w-full py-4 text-center rounded-xl font-bold transition-transform active:scale-95 ${
                      plan.isRecommended
                        ? "bg-white text-violet-700 hover:bg-slate-100"
                        : "bg-slate-700 text-white hover:bg-slate-600"
                    }`}
                  >
                    Pilih {plan.name}
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className='py-24 bg-white'>
          <div className='container mx-auto px-4 max-w-3xl'>
            <h2 className='text-2xl font-bold text-center mb-12 text-slate-900'>
              Pertanyaan Umum
            </h2>
            <div className='space-y-4'>
              {faqs.map((item, idx) => (
                <details
                  key={idx}
                  className='group bg-white rounded-xl border border-slate-200 overflow-hidden'
                >
                  <summary className='flex justify-between items-center p-5 cursor-pointer list-none hover:bg-slate-50 transition-colors'>
                    <span className='font-semibold text-slate-800 flex items-center gap-3'>
                      <HelpCircle size={18} className='text-violet-500' />
                      {item.question}
                    </span>
                    <ChevronDown className='text-slate-400 group-open:rotate-180 transition-transform' />
                  </summary>
                  <div className='px-5 pb-5 pt-0 text-slate-600 ml-7 border-t border-transparent group-open:border-slate-100 group-open:mt-2 transition-all'>
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />

      {/* Sticky Mobile CTA */}
      <div className='fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 md:hidden z-50 flex items-center justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.05)]'>
        <div>
          <p className='text-xs text-slate-500 uppercase font-bold'>
            Total Harga
          </p>
          <p className='text-lg font-bold text-violet-600'>
            {course.price === 0 ? "Gratis" : formatRupiah(course.price)}
          </p>
        </div>
        <a
          href='#pricing'
          className='bg-violet-600 text-white px-6 py-3 rounded-lg font-bold text-sm shadow-lg shadow-violet-600/30'
        >
          Beli Sekarang
        </a>
      </div>
    </div>
  );
}
