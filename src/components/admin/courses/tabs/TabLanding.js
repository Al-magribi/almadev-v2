import React from "react";
import { motion } from "framer-motion";
import HeroSection from "./landing/HeroSection";
import PricingSection from "./landing/PricingSection";
import TestimonialSection from "./landing/TestimonialSection";
import FaqSection from "./landing/FaqSection";
import GallerySection from "./landing/GallerySection";

export default function TabLanding({
  landing,
  setLanding,
  galleryFiles,
  setGalleryFiles,
}) {
  // --- HANDLERS (LOGIC ASLI) ---
  const handleHeroChange = (field, value) => {
    setLanding((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

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

  const removePricingTier = (index) => {
    const currentItems = landing?.pricing?.items || []; // Tambahkan fallback []
    const newItems = currentItems.filter((_, i) => i !== index);
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

  const addTestimonial = () => {
    const newTesti = { name: "", role: "Siswa", comment: "", rating: 5 };
    setLanding((prev) => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        items: [...(prev.testimonials?.items || []), newTesti],
      },
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

  const removeTestimonial = (index) => {
    setLanding((prev) => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        items: prev.testimonials.items.filter((_, i) => i !== index),
      },
    }));
  };

  const addFaq = () => {
    setLanding((prev) => ({
      ...prev,
      faqs: {
        ...prev.faqs,
        items: [...(prev.faqs?.items || []), { question: "", answer: "" }],
      },
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

  const removeFaq = (index) => {
    setLanding((prev) => ({
      ...prev,
      faqs: {
        ...prev.faqs,
        items: prev.faqs.items.filter((_, i) => i !== index),
      },
    }));
  };

  const addProject = () => {
    const newProject = {
      title: "Project Baru",
      description: "",
      link: "",
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

  const updateProject = (index, field, value) => {
    const newItems = [...(landing.gallery?.items || [])];
    newItems[index][field] = value;
    setLanding((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, items: newItems },
    }));
  };

  const removeProject = (index) => {
    setLanding((prev) => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        items: prev.gallery.items.filter((_, i) => i !== index),
      },
    }));
  };

  const handleMultipleImageUpload = (e, projectIndex) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFilesMap = { ...galleryFiles };
    const newImageUrls = [];
    Array.from(files).forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      newFilesMap[previewUrl] = file;
      newImageUrls.push(previewUrl);
    });
    setGalleryFiles(newFilesMap);
    const newItems = [...(landing.gallery?.items || [])];
    if (!newItems[projectIndex].images) newItems[projectIndex].images = [];
    newItems[projectIndex].images = [
      ...newItems[projectIndex].images,
      ...newImageUrls,
    ];
    setLanding((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, items: newItems },
    }));
    e.target.value = null;
  };

  const removeProjectImage = (pIdx, iIdx) => {
    const newItems = [...(landing.gallery?.items || [])];
    newItems[pIdx].images = newItems[pIdx].images.filter((_, i) => i !== iIdx);
    setLanding((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, items: newItems },
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className='space-y-8'>
        <div className='pb-4 border-b border-zinc-200 dark:border-zinc-800'>
          <h2 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>
            Editor Landing Page
          </h2>
        </div>

        <HeroSection hero={landing?.hero} handleHeroChange={handleHeroChange} />

        <PricingSection
          items={landing?.pricing?.items || []}
          addPricingTier={addPricingTier}
          updatePricingTier={updatePricingTier}
          removePricingTier={removePricingTier}
          toggleRecommended={toggleRecommended}
        />

        <TestimonialSection
          items={landing?.testimonials?.items}
          addTestimonial={addTestimonial}
          removeTestimonial={removeTestimonial}
          updateTestimonial={updateTestimonial}
        />

        <FaqSection
          items={landing?.faqs?.items}
          addFaq={addFaq}
          removeFaq={removeFaq}
          updateFaq={updateFaq}
        />

        <GallerySection
          items={landing?.gallery?.items}
          addProject={addProject}
          removeProject={removeProject}
          updateProject={updateProject}
          handleMultipleImageUpload={handleMultipleImageUpload}
          removeProjectImage={removeProjectImage}
        />
      </div>
    </motion.div>
  );
}
