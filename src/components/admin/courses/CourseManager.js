"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Globe,
  Users,
  Settings,
  ChevronLeft,
  Save,
  Loader2,
  AlertCircle,
  ChartNoAxesCombined,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateCourse } from "@/actions/course-actions"; // Pastikan path ini benar
import toast from "react-hot-toast";

// Import Components
import TabCurriculum from "./tabs/TabCurriculum";
import TabLanding from "./tabs/TabLanding";
import TabSettings from "./tabs/TabSettings";
import TabLearners from "./tabs/TabLearners";
import TabAnalytic from "./tabs/TabAnalytic";

export default function CourseManager({ initialData }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("curriculum");
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // State untuk mendeteksi perubahan
  const [isDirty, setIsDirty] = useState(false);

  const [courseData, setCourseData] = useState(() =>
    JSON.parse(JSON.stringify(initialData.course)),
  );

  const [landingData, setLandingData] = useState(() =>
    JSON.parse(JSON.stringify(initialData.landing || {})),
  );

  const [newImageFile, setNewImageFile] = useState(null);

  const [galleryFiles, setGalleryFiles] = useState({});

  useEffect(() => {
    // Logika ini sekarang akan bekerja akurat karena initialData.course
    // tidak akan pernah tersentuh oleh mutasi di TabCurriculum
    const currentCourseState = JSON.stringify(courseData);
    const initialCourseState = JSON.stringify(initialData.course); // Ambil dari props langsung

    const currentLandingState = JSON.stringify(landingData);
    const initialLandingState = JSON.stringify(initialData.landing || {});

    if (
      currentCourseState !== initialCourseState ||
      currentLandingState !== initialLandingState ||
      newImageFile !== null
    ) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [courseData, landingData, newImageFile, initialData]);

  // -------------------------------------------------------------
  // TAMBAHAN BARU: Sinkronisasi State saat Data Server Berubah
  // -------------------------------------------------------------
  useEffect(() => {
    // Setiap kali router.refresh() selesai dan initialData berubah,
    // kita harus mereset state lokal agar sama persis dengan data server baru.

    setCourseData(JSON.parse(JSON.stringify(initialData.course)));
    setLandingData(JSON.parse(JSON.stringify(initialData.landing || {})));

    // Paksa isDirty jadi false karena data baru saja sinkron
    setIsDirty(false);

    // Reset file gambar jika ada
    setNewImageFile(null);
  }, [initialData]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const tabs = [
    { id: "curriculum", label: "Kurikulum", icon: BookOpen },
    { id: "landing", label: "Landing Page", icon: Globe },
    { id: "learners", label: "Target Peserta", icon: Users },
    { id: "settings", label: "Pengaturan", icon: Settings },
    { id: "analytic", label: "Analisis", icon: ChartNoAxesCombined },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();

      // Append data dasar (tetap sama)
      formData.append("name", courseData.name);
      formData.append("price", courseData.price || 0);
      formData.append("description", courseData.description || "");
      formData.append("video", courseData.video || "");
      formData.append("isActive", courseData.isActive);
      formData.append("curriculum", JSON.stringify(courseData.curriculum));
      formData.append("objectives", JSON.stringify(courseData.objectives));

      if (newImageFile) {
        formData.append("image", newImageFile);
      }

      // --- LOGIKA BARU UNTUK LANDING DATA & GALLERY ---

      // Clone landingData agar tidak mengubah state asli saat modifikasi
      const payloadLanding = JSON.parse(JSON.stringify(landingData));

      // Scan Gallery Items untuk mencari gambar baru (blob)
      if (payloadLanding.gallery?.items) {
        payloadLanding.gallery.items.forEach((project, pIdx) => {
          if (project.images) {
            project.images.forEach((imgUrl, imgIdx) => {
              // Jika URL adalah blob (artinya file baru dari komputer user)
              if (imgUrl && imgUrl.startsWith("blob:")) {
                const file = galleryFiles[imgUrl];
                if (file) {
                  // Buat key unik untuk FormData
                  const key = `gallery_upload_${pIdx}_${imgIdx}`;
                  formData.append(key, file);

                  // Ganti URL blob di JSON dengan marker khusus agar backend tahu
                  project.images[imgIdx] = `__UPLOAD__:${key}`;
                }
              }
            });
          }
        });
      }

      // Append modified landingData
      formData.append("landingData", JSON.stringify(payloadLanding));

      // ------------------------------------------------

      const result = await updateCourse(courseData._id, formData);

      if (result.success) {
        toast.success(result.message);
        setNewImageFile(null);
        setGalleryFiles({}); // Reset file staging
        router.refresh();
        setIsDirty(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Gagal menyimpan: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20'>
      {/* Header */}
      <header className='py-3 rounded-2xl top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800'>
        {/* UBAH 1: Hapus h-16, ganti py-3 agar tinggi fleksibel. Tambah min-h-[4rem] untuk desktop */}
        <div className='max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-0 min-h-4rem flex flex-col md:flex-row md:items-center justify-between gap-4'>
          {/* BAGIAN KIRI (Back + Judul) */}
          <div className='flex items-start gap-3 md:gap-4 w-full md:w-auto'>
            <Link
              href='/admin/courses'
              // mt-0.5 agar sejajar optik dengan text baris pertama
              className='p-2 -ml-2 mt-0.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 rounded-full transition-colors shrink-0'
            >
              <ChevronLeft size={20} />
            </Link>

            <div className='flex flex-col gap-2'>
              {/* UBAH 2: text-base di mobile agar tidak terlalu besar, md:text-lg di desktop */}
              <h1 className='text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug wrap-break-words'>
                {courseData.name}
              </h1>

              <div className='flex flex-wrap items-center gap-2'>
                <span
                  className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                    courseData.isActive
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-amber-100 text-amber-700 border-amber-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      courseData.isActive ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {courseData.isActive ? "Terbit" : "Draf"}
                </span>

                {isDirty && (
                  <span className='flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse'>
                    <AlertCircle size={10} />
                    <span className='whitespace-nowrap'>Belum Disimpan</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* BAGIAN KANAN (Tombol Simpan) */}
          {/* UBAH 3: w-full di mobile agar tombol memanjang, md:w-auto di desktop */}
          <div className='flex items-center gap-3 w-full md:w-auto'>
            <button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              // UBAH 4: justify-center agar icon & teks di tengah saat mode mobile (full width)
              className={`w-full md:w-auto justify-center cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDirty
                  ? "bg-violet-600 text-white hover:bg-violet-700 shadow-violet-200"
                  : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
              }`}
            >
              {isSaving ? (
                <Loader2 size={16} className='animate-spin' />
              ) : (
                <Save size={16} />
              )}
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Tidak perlu banyak ubahan, hanya padding container) */}
        <div className='max-w-6xl mx-auto px-4 md:px-6'>
          <nav className='flex space-x-1 overflow-x-auto no-scrollbar pt-1 md:pt-2'>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all rounded-t-lg whitespace-nowrap ${
                    isActive
                      ? "text-violet-700 bg-violet-50/50 dark:text-violet-400 dark:bg-violet-500/10"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  <Icon
                    size={16}
                    className={
                      isActive
                        ? "text-violet-600"
                        : "text-zinc-400 group-hover:text-zinc-600"
                    }
                  />
                  {tab.label}
                  {isActive && (
                    <span className='absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 rounded-t-full' />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className='max-w-5xl mx-auto px-6 py-8'>
        {activeTab === "curriculum" && (
          <TabCurriculum course={courseData} setCourse={setCourseData} />
        )}
        {activeTab === "landing" && (
          <TabLanding
            landing={landingData}
            setLanding={setLandingData}
            // PASS PROPS BARU KE SINI
            galleryFiles={galleryFiles}
            setGalleryFiles={setGalleryFiles}
          />
        )}
        {activeTab === "learners" && (
          <TabLearners
            objectives={courseData.objectives}
            setCourse={setCourseData}
          />
        )}
        {activeTab === "settings" && (
          <TabSettings
            course={courseData}
            setCourse={setCourseData}
            newImageFile={newImageFile}
            setNewImageFile={setNewImageFile}
          />
        )}

        {activeTab === "analytic" && <TabAnalytic courseId={courseData._id} />}
      </main>
    </div>
  );
}
