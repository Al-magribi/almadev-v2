// File: components/course/tabs/TabLanding.js
import {
  Smartphone,
  Monitor,
  CheckCircle2,
  Plus,
  Trash2,
  DollarSign,
  Star,
  HelpCircle,
  LayoutGrid,
  // --- IMPORT TAMBAHAN YANG SEBELUMNYA HILANG ---
  MessageSquareQuote,
  User,
  Upload,
  ImageIcon,
  // ----------------------------------------------
} from "lucide-react";

export default function TabLanding({
  landing,
  setLanding,
  galleryFiles,
  setGalleryFiles,
}) {
  // --- HANDLER HERO ---
  const handleHeroChange = (field, value) => {
    setLanding((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }));
  };

  // --- HANDLER FEATURES ---
  const handleFeatureChange = (index, value) => {
    const newItems = [...(landing.features?.items || [])];
    newItems[index].text = value;
    setLanding((prev) => ({
      ...prev,
      features: { ...prev.features, items: newItems },
    }));
  };

  // --- HANDLER PRICING ---
  const addPricingTier = () => {
    const newTier = {
      name: "Paket Baru",
      price: 0,
      benefits: ["Akses Selamanya", "Update Materi"],
      isRecommended: false,
    };
    setLanding((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        items: [...(prev.pricing?.items || []), newTier],
      },
    }));
  };

  const removePricingTier = (index) => {
    const newItems = landing.pricing.items.filter((_, i) => i !== index);
    setLanding((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, items: newItems },
    }));
  };

  const updatePricingTier = (index, field, value) => {
    const newItems = [...(landing.pricing?.items || [])];
    if (field === "benefits") {
      newItems[index][field] = value.split("\n");
    } else {
      newItems[index][field] = value;
    }
    setLanding((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, items: newItems },
    }));
  };

  const toggleRecommended = (index) => {
    const newItems = [...(landing.pricing?.items || [])];
    newItems[index].isRecommended = !newItems[index].isRecommended;
    setLanding((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, items: newItems },
    }));
  };

  // --- HANDLER TESTIMONI ---
  const addTestimonial = () => {
    const newTesti = {
      name: "",
      role: "Siswa",
      comment: "",
      rating: 5,
    };
    setLanding((prev) => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        items: [...(prev.testimonials?.items || []), newTesti],
      },
    }));
  };

  const removeTestimonial = (index) => {
    const newItems = landing.testimonials.items.filter((_, i) => i !== index);
    setLanding((prev) => ({
      ...prev,
      testimonials: { ...prev.testimonials, items: newItems },
    }));
  };

  const updateTestimonial = (index, field, value) => {
    const newItems = [...(landing.testimonials?.items || [])];
    newItems[index][field] = value;
    setLanding((prev) => ({
      ...prev,
      testimonials: { ...prev.testimonials, items: newItems },
    }));
  };

  // --- HANDLER FAQ ---
  const addFaq = () => {
    const newFaq = { question: "", answer: "" };
    setLanding((prev) => ({
      ...prev,
      faqs: { ...prev.faqs, items: [...(prev.faqs?.items || []), newFaq] },
    }));
  };

  const removeFaq = (index) => {
    const newItems = landing.faqs.items.filter((_, i) => i !== index);
    setLanding((prev) => ({
      ...prev,
      faqs: { ...prev.faqs, items: newItems },
    }));
  };

  const updateFaq = (index, field, value) => {
    const newItems = [...(landing.faqs?.items || [])];
    newItems[index][field] = value;
    setLanding((prev) => ({
      ...prev,
      faqs: { ...prev.faqs, items: newItems },
    }));
  };

  // --- HANDLER GALLERY ---
  // --- HANDLER GALLERY ---
  const addProject = () => {
    const newProject = {
      title: "Project Baru",
      description: "",
      images: [],
    };
    setLanding((prev) => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        items: [...(prev.gallery?.items || []), newProject],
      },
    }));
  };

  const removeProject = (index) => {
    const newItems = landing.gallery.items.filter((_, i) => i !== index);
    setLanding((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, items: newItems },
    }));
  };

  const updateProject = (index, field, value) => {
    const newItems = [...(landing.gallery?.items || [])];
    newItems[index][field] = value;
    setLanding((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, items: newItems },
    }));
  };

  // --- REVISI: HANDLER MULTIPLE IMAGE UPLOAD ---

  const handleMultipleImageUpload = (e, projectIndex) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFilesMap = { ...galleryFiles };
    const newImageUrls = [];

    // Loop semua file yang dipilih
    Array.from(files).forEach((file) => {
      // Buat URL preview
      const previewUrl = URL.createObjectURL(file);

      // Simpan file asli ke state staging (menggunakan URL sebagai key)
      newFilesMap[previewUrl] = file;

      // Masukkan URL ke array sementara
      newImageUrls.push(previewUrl);
    });

    // 1. Update State File Staging
    setGalleryFiles(newFilesMap);

    // 2. Update State Landing (Push gambar baru ke array images yang ada)
    const newItems = [...(landing.gallery?.items || [])];
    // Pastikan array images ada
    if (!newItems[projectIndex].images) {
      newItems[projectIndex].images = [];
    }

    // Gabungkan gambar lama dengan gambar baru
    newItems[projectIndex].images = [
      ...newItems[projectIndex].images,
      ...newImageUrls,
    ];

    setLanding((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, items: newItems },
    }));

    // Reset input value agar bisa upload file yang sama jika dihapus lalu diupload lagi
    e.target.value = null;
  };

  const removeProjectImage = (projectIndex, imgIndex) => {
    const newItems = [...(landing.gallery?.items || [])];
    // Hapus item dari array
    newItems[projectIndex].images = newItems[projectIndex].images.filter(
      (_, i) => i !== imgIndex,
    );
    setLanding((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, items: newItems },
    }));
    // Note: Blob URL di galleryFiles akan menjadi orphan (sampah), tidak masalah karena akan hilang saat refresh/save
  };

  return (
    <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      <div className='flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800'>
        <h2 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>
          Editor Landing Page
        </h2>
      </div>

      {/* 1. HERO SECTION */}
      <section className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5'>
        <div className='flex items-center gap-3 mb-2'>
          <span className='w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm'>
            1
          </span>
          <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
            Bagian Hero (Atas)
          </h3>
        </div>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Headline Utama
            </label>
            <input
              value={landing?.hero?.headline || ""}
              onChange={(e) => handleHeroChange("headline", e.target.value)}
              placeholder='misal: Menjadi Desainer Pro'
              className='w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:border-violet-500'
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Subjudul
            </label>
            <textarea
              value={landing?.hero?.customSubtitle || ""}
              onChange={(e) =>
                handleHeroChange("customSubtitle", e.target.value)
              }
              rows={3}
              placeholder='Jelaskan nilai utama kursus Anda...'
              className='w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:border-violet-500 resize-none'
            />
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5'>
        <div className='flex items-center gap-3 mb-2'>
          <span className='w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm'>
            2
          </span>
          <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
            Fitur Kunci
          </h3>
        </div>
        <div className='grid gap-3'>
          {landing?.features?.items?.map((item, i) => (
            <div key={i} className='flex gap-3'>
              <div className='mt-2 text-violet-500'>
                <CheckCircle2 size={18} />
              </div>
              <input
                value={item.text}
                onChange={(e) => handleFeatureChange(i, e.target.value)}
                className='flex-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:border-violet-500'
              />
            </div>
          ))}
        </div>
      </section>

      {/* 3. PRICING SECTION */}
      <section className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm'>
              3
            </span>
            <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
              Penawaran Harga
            </h3>
          </div>
          <button
            onClick={addPricingTier}
            className='flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg hover:opacity-90'
          >
            <Plus size={14} /> Tambah Paket
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {landing?.pricing?.items?.map((plan, i) => (
            <div
              key={i}
              className={`relative flex flex-col gap-4 p-5 rounded-xl border-2 transition-all ${
                plan.isRecommended
                  ? "border-violet-500 bg-violet-50/10 dark:bg-violet-900/10"
                  : "border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50"
              }`}
            >
              <div className='flex justify-between items-start'>
                <button
                  onClick={() => toggleRecommended(i)}
                  className={`p-1.5 rounded-full transition-colors ${
                    plan.isRecommended
                      ? "text-yellow-500 bg-yellow-100 hover:bg-yellow-200"
                      : "text-zinc-300 hover:text-yellow-500 hover:bg-zinc-100"
                  }`}
                >
                  <Star
                    size={16}
                    fill={plan.isRecommended ? "currentColor" : "none"}
                  />
                </button>
                <button
                  onClick={() => removePricingTier(i)}
                  className='text-zinc-300 hover:text-rose-500 transition-colors'
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className='space-y-1'>
                <label className='text-xs font-semibold text-zinc-500 uppercase'>
                  Nama Paket
                </label>
                <input
                  value={plan.name}
                  onChange={(e) => updatePricingTier(i, "name", e.target.value)}
                  placeholder='Contoh: Paket Basic'
                  className='w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-violet-500 px-0 py-1 font-bold text-lg focus:ring-0'
                />
              </div>

              <div className='space-y-1'>
                <label className='text-xs font-semibold text-zinc-500 uppercase'>
                  Harga (IDR)
                </label>
                <div className='flex items-center gap-2'>
                  <DollarSign size={16} className='text-zinc-400' />
                  <input
                    type='number'
                    value={plan.price}
                    onChange={(e) =>
                      updatePricingTier(i, "price", e.target.value)
                    }
                    placeholder='500000'
                    className='w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-violet-500 px-0 py-1 font-mono text-lg focus:ring-0'
                  />
                </div>
              </div>

              <div className='space-y-1 flex-1'>
                <label className='text-xs font-semibold text-zinc-500 uppercase'>
                  Benefit
                </label>
                <p className='text-[10px] text-zinc-400'>
                  Tekan <strong>Enter</strong> untuk poin baru.
                </p>
                <textarea
                  value={plan.benefits?.join("\n") || ""}
                  onChange={(e) =>
                    updatePricingTier(i, "benefits", e.target.value)
                  }
                  rows={5}
                  className='w-full mt-1 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:border-violet-500 resize-none'
                />
              </div>
            </div>
          ))}
          {(!landing?.pricing?.items || landing.pricing.items.length === 0) && (
            <div className='col-span-1 md:col-span-2 py-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl'>
              <p className='text-zinc-500 text-sm'>Belum ada paket harga.</p>
              <button
                onClick={addPricingTier}
                className='text-violet-600 font-bold text-sm mt-2'
              >
                Tambah Paket
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. TESTIMONI SECTION */}
      <section className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm'>
              4
            </span>
            <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
              Testimoni Siswa
            </h3>
          </div>
          <button
            onClick={addTestimonial}
            className='flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg hover:opacity-90'
          >
            <Plus size={14} /> Tambah Testimoni
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {landing?.testimonials?.items?.map((testi, i) => (
            <div
              key={i}
              className='group relative p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/50 hover:border-violet-300 transition-all'
            >
              <div className='flex justify-between items-start mb-3'>
                <div className='flex items-center gap-2 text-violet-600'>
                  {/* FIXED: Icon MessageSquareQuote sekarang sudah diimport */}
                  <MessageSquareQuote size={18} />
                  <span className='text-xs font-semibold uppercase tracking-wider text-zinc-400'>
                    Review #{i + 1}
                  </span>
                </div>
                <button
                  onClick={() => removeTestimonial(i)}
                  className='text-zinc-300 hover:text-rose-500 transition-colors'
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className='space-y-3'>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <label className='text-[10px] font-bold text-zinc-500 uppercase'>
                      Nama
                    </label>
                    <div className='flex items-center gap-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5'>
                      {/* FIXED: Icon User sekarang sudah diimport */}
                      <User size={14} className='text-zinc-400' />
                      <input
                        value={testi.name}
                        onChange={(e) =>
                          updateTestimonial(i, "name", e.target.value)
                        }
                        placeholder='Nama Siswa'
                        className='w-full text-xs bg-transparent border-none p-0 focus:ring-0'
                      />
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <label className='text-[10px] font-bold text-zinc-500 uppercase'>
                      Role
                    </label>
                    <input
                      value={testi.role}
                      onChange={(e) =>
                        updateTestimonial(i, "role", e.target.value)
                      }
                      placeholder='Frontend Dev'
                      className='w-full text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 focus:border-violet-500'
                    />
                  </div>
                </div>

                <div className='space-y-1'>
                  <label className='text-[10px] font-bold text-zinc-500 uppercase'>
                    Komentar
                  </label>
                  <textarea
                    value={testi.comment}
                    onChange={(e) =>
                      updateTestimonial(i, "comment", e.target.value)
                    }
                    rows={2}
                    placeholder='Apa kata mereka?'
                    className='w-full text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 focus:border-violet-500 resize-none'
                  />
                </div>

                <div className='flex items-center gap-1'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => updateTestimonial(i, "rating", star)}
                      className={`${testi.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-zinc-300"}`}
                    >
                      <Star
                        size={14}
                        fill={testi.rating >= star ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {(!landing?.testimonials?.items ||
            landing.testimonials.items.length === 0) && (
            <div className='col-span-1 md:col-span-2 py-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl'>
              <p className='text-zinc-500 text-sm'>Belum ada testimoni.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm'>
              5
            </span>
            <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
              FAQ
            </h3>
          </div>
          <button
            onClick={addFaq}
            className='flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg hover:opacity-90'
          >
            <Plus size={14} /> Tambah
          </button>
        </div>

        <div className='space-y-4'>
          {landing?.faqs?.items?.map((faq, i) => (
            <div
              key={i}
              className='flex gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30'
            >
              <div className='mt-2 text-violet-400'>
                <HelpCircle size={20} />
              </div>
              <div className='flex-1 space-y-3'>
                <input
                  value={faq.question}
                  onChange={(e) => updateFaq(i, "question", e.target.value)}
                  placeholder='Pertanyaan...'
                  className='w-full font-medium bg-transparent border-b border-zinc-200 dark:border-zinc-700 px-0 py-1 text-sm focus:ring-0'
                />
                <textarea
                  value={faq.answer}
                  onChange={(e) => updateFaq(i, "answer", e.target.value)}
                  rows={2}
                  placeholder='Jawaban...'
                  className='w-full text-sm text-zinc-600 dark:text-zinc-400 bg-transparent border-none p-0 focus:ring-0 resize-none'
                />
              </div>
              <button
                onClick={() => removeFaq(i)}
                className='text-zinc-300 hover:text-rose-500 h-fit'
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {(!landing?.faqs?.items || landing.faqs.items.length === 0) && (
            <div className='py-6 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl'>
              <p className='text-zinc-500 text-sm'>Belum ada FAQ.</p>
            </div>
          )}
        </div>
      </section>

      {/* 6. GALLERY SECTION */}
      <section className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm'>
              6
            </span>
            <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
              Gallery / Project
            </h3>
          </div>
          <button
            onClick={addProject}
            className='flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg hover:opacity-90'
          >
            <Plus size={14} /> Tambah Project
          </button>
        </div>

        <div className='grid gap-6'>
          {landing?.gallery?.items?.map((project, i) => (
            <div
              key={i}
              className='relative p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'
            >
              <div className='flex justify-between items-start mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3'>
                <div className='flex items-center gap-2 text-violet-600'>
                  <LayoutGrid size={18} />
                  <span className='text-xs font-bold uppercase tracking-wider text-zinc-400'>
                    Project #{i + 1}
                  </span>
                </div>
                <button
                  onClick={() => removeProject(i)}
                  className='text-zinc-300 hover:text-rose-500'
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className='grid md:grid-cols-2 gap-6'>
                {/* Kolom Kiri: Info Project */}
                <div className='space-y-4'>
                  <div className='space-y-1'>
                    <label className='text-[10px] font-bold text-zinc-500 uppercase'>
                      Judul Project
                    </label>
                    <input
                      value={project.title}
                      onChange={(e) =>
                        updateProject(i, "title", e.target.value)
                      }
                      className='w-full font-bold text-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 focus:border-violet-500'
                    />
                  </div>
                  <div className='space-y-1'>
                    <label className='text-[10px] font-bold text-zinc-500 uppercase'>
                      Deskripsi
                    </label>
                    <textarea
                      value={project.description}
                      onChange={(e) =>
                        updateProject(i, "description", e.target.value)
                      }
                      rows={4}
                      className='w-full text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 resize-none focus:border-violet-500'
                    />
                  </div>
                </div>

                {/* Kolom Kanan: Gambar Project (DIPERBARUI) */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <label className='text-[10px] font-bold text-zinc-500 uppercase'>
                      Gambar Project
                    </label>

                    {/* BUTTON UPLOAD MULTIPLE */}
                    <label className='cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-600 hover:bg-violet-100 rounded-lg text-xs font-bold transition-colors'>
                      <Upload size={14} />
                      Upload Gambar
                      <input
                        type='file'
                        className='hidden'
                        accept='image/*'
                        multiple // SUPPORT BANYAK FILE
                        onChange={(e) => handleMultipleImageUpload(e, i)}
                      />
                    </label>
                  </div>

                  {/* GRID PREVIEW GAMBAR */}
                  <div className='grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar'>
                    {project.images?.map((imgUrl, imgIndex) => (
                      <div
                        key={imgIndex}
                        className='group relative aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100'
                      >
                        <img
                          src={imgUrl}
                          alt=''
                          className='w-full h-full object-cover'
                        />
                        {/* Overlay Delete Button */}
                        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                          <button
                            onClick={() => removeProjectImage(i, imgIndex)}
                            className='p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-transform hover:scale-110'
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Placeholder jika kosong */}
                    {(!project.images || project.images.length === 0) && (
                      <div className='col-span-3 py-8 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg'>
                        <ImageIcon size={24} className='mb-2 opacity-50' />
                        <p className='text-xs italic'>Belum ada gambar.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {(!landing?.gallery?.items || landing.gallery.items.length === 0) && (
            <div className='py-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl'>
              <p className='text-zinc-500 text-sm'>
                Belum ada project showcase.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
