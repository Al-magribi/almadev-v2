"use client";

import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, PlayCircle } from "lucide-react";

const getYouTubeId = (url) => {
  if (!url || typeof url !== "string") return null;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
};

export default function RoadmapModal({ isOpen, onClose, url }) {
  const videoId = useMemo(() => getYouTubeId(url), [url]);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !videoId || !playerContainerRef.current) return;

    let cancelled = false;

    const loadYouTubeApi = () =>
      new Promise((resolve) => {
        if (window.YT?.Player) {
          resolve(window.YT);
          return;
        }
        const existing = document.getElementById("youtube-iframe-api");
        if (!existing) {
          const script = document.createElement("script");
          script.id = "youtube-iframe-api";
          script.src = "https://www.youtube.com/iframe_api";
          document.body.appendChild(script);
        }
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prev) prev();
          resolve(window.YT);
        };
      });

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      if (!playerRef.current) {
        playerRef.current = new YT.Player(playerContainerRef.current, {
          videoId,
          playerVars: { rel: 0, modestbranding: 1 },
        });
      } else {
        playerRef.current.loadVideoById(videoId);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, videoId]);

  useEffect(() => {
    if (isOpen) return;
    if (playerRef.current?.destroy) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 py-8'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className='relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl'
            initial={{ y: 40, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className='flex items-center justify-between border-b border-white/10 px-5 py-4'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-blue-300'>
                  <PlayCircle size={20} />
                </div>
                <div>
                  <p className='text-sm font-semibold text-white'>
                    Road Map Video
                  </p>
                  <p className='text-xs text-slate-400'>
                    Tonton roadmap langsung tanpa keluar halaman.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className='rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white'
                aria-label='Tutup modal'
              >
                <X size={18} />
              </button>
            </div>

            <div className='aspect-video w-full bg-black'>
              {videoId ? (
                <div ref={playerContainerRef} className='h-full w-full' />
              ) : (
                <div className='flex h-full w-full flex-col items-center justify-center gap-3 text-slate-300'>
                  <PlayCircle size={36} />
                  <p className='text-sm'>Link YouTube belum valid.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
