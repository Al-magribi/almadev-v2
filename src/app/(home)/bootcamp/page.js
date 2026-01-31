import HeroSection from "@/components/marketing/bootcamp/HeroSection";
import CurriculumSection from "@/components/marketing/bootcamp/CurriculumSection";
import PricingSection from "@/components/marketing/bootcamp/PricingSection";
import ConsultationSection from "@/components/marketing/bootcamp/ConsultationSection";

export const metadata = {
  title: "Bootcamp JavaScript Full Stack Web Developer | ALMADEV",
  description:
    "Transformasi karir Anda dalam 3 bulan. Kuasai React JS, Node.js, dan Database dengan proyek riil berstandar industri bersama Mujaddid Al Magribi.",
  keywords: [
    "bootcamp coding",
    "full stack developer",
    "belajar javascript",
    "almadev",
    "web development indonesia",
  ],
  openGraph: {
    title: "Bootcamp JavaScript Full Stack Web Developer | ALMADEV",
    description: "Program intensif Build & Deploy. Daftar Batch 1 sekarang!",
    url: "https://jadidalmagribi.com/bootcamp", // Sesuaikan dengan domain Anda
    siteName: "ALMADEV",
    images: [
      {
        url: "/logo.svg", // Pastikan file gambar ini ada di folder public
        width: 1200,
        height: 630,
        alt: "ALMADEV Bootcamp Preview",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bootcamp JavaScript Full Stack Web Developer | ALMADEV",
    description: "Kuasai JavaScript dari zero to hero dalam 3 bulan.",
    images: ["/logo.svg"],
  },
};

export default function BootcampPage() {
  return (
    <div className='bg-slate-50 text-slate-900 font-sans selection:bg-blue-100'>
      <HeroSection />
      <CurriculumSection />
      <ConsultationSection />
      <PricingSection />
    </div>
  );
}
