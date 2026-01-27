"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutGrid,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";

export default function ProjectShowcase({
  projects,
  customTitle,
  customSubtitle,
}) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Buka Modal
  const openModal = (project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
    document.body.style.overflow = "hidden"; // Disable scroll body
  };

  // Tutup Modal
  const closeModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = "auto"; // Enable scroll body
  };

  // Next Image
  const nextImage = useCallback(
    (e) => {
      e?.stopPropagation();
      if (!selectedProject) return;
      setCurrentImageIndex((prev) =>
        prev === selectedProject.images.length - 1 ? 0 : prev + 1,
      );
    },
    [selectedProject],
  );

  // Prev Image
  const prevImage = useCallback(
    (e) => {
      e?.stopPropagation();
      if (!selectedProject) return;
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProject.images.length - 1 : prev - 1,
      );
    },
    [selectedProject],
  );

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedProject) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject, nextImage, prevImage]);

  if (!projects || projects.length === 0) return null;

  return (
    <section className='py-20 bg-slate-900 text-white overflow-hidden'>
      <div className='container mx-auto px-4'>
        {/* Header Section */}
        <div className='mb-12'>
          <h2 className='text-3xl font-bold mb-2'>
            {customTitle || "Project Showcase"}
          </h2>
          <p className='text-slate-400'>
            {customSubtitle || "Hasil karya nyata yang akan Anda buat."}
          </p>
        </div>

        {/* Grid Gallery */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {projects.map((project, idx) => (
            <div
              key={idx}
              className='group bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-violet-500/50 transition-all hover:-translate-y-1 cursor-pointer flex flex-col h-full'
              onClick={() => openModal(project)}
            >
              {/* Image Thumbnail */}
              <div className='aspect-4/3 bg-slate-950 relative overflow-hidden'>
                {project.images && project.images.length > 0 ? (
                  <>
                    <Image
                      src={project.images[0]}
                      alt={project.title}
                      fill
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                      className='object-cover group-hover:scale-105 transition duration-700 opacity-90 group-hover:opacity-100'
                    />
                    {/* Overlay Icon */}
                    <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                      <div className='bg-white/10 backdrop-blur-md p-3 rounded-full text-white'>
                        <ZoomIn size={24} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-slate-700'>
                    <LayoutGrid size={40} />
                  </div>
                )}

                {/* Badge Image Count */}
                {project.images?.length > 1 && (
                  <div className='absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-xs font-bold text-white z-10'>
                    +{project.images.length - 1} Images
                  </div>
                )}
              </div>

              <div className='p-6 flex-1 flex flex-col'>
                <h3 className='text-xl font-bold text-white mb-2'>
                  {project.title}
                </h3>
                <p className='text-slate-400 text-sm line-clamp-3'>
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- LIGHTBOX MODAL --- */}
      {selectedProject && (
        <div
          className='fixed inset-0 z-9999 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200'
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className='absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50'
          >
            <X size={24} />
          </button>

          <div
            className='relative w-full h-full max-w-7xl mx-auto flex flex-col items-center justify-center p-4'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Image Container */}
            <div className='relative w-full h-[60vh] md:h-[80vh]'>
              {selectedProject.images && selectedProject.images.length > 0 ? (
                <Image
                  key={currentImageIndex}
                  src={selectedProject.images[currentImageIndex]}
                  alt={`Slide ${currentImageIndex}`}
                  fill
                  className='object-contain animate-in zoom-in-95 duration-300'
                  priority // Load priority for modal image
                />
              ) : (
                <div className='flex items-center justify-center h-full text-slate-500'>
                  <ImageIcon size={48} />
                </div>
              )}
            </div>

            {/* Caption */}
            <div className='mt-6 text-center space-y-1 relative z-50'>
              <h3 className='text-xl font-bold text-white'>
                {selectedProject.title}
              </h3>
              <p className='text-sm text-slate-400'>
                Gambar {currentImageIndex + 1} dari{" "}
                {selectedProject.images.length}
              </p>
            </div>

            {/* Navigation Buttons */}
            {selectedProject.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className='absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all hover:scale-110 z-50'
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={nextImage}
                  className='absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all hover:scale-110 z-50'
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
