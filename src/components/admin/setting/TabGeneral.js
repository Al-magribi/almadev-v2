"use client";

import { useEffect, useState } from "react";
import InputGroup from "./InputGroup";
import { AlertTriangle, ImageUp, ImageIcon, Link2 } from "lucide-react";

export default function TabGeneral({ formData, handleChange }) {
  const [logoPreview, setLogoPreview] = useState("");
  const [faviconPreview, setFaviconPreview] = useState("");

  useEffect(() => {
    if (!formData.websiteLogo) {
      setLogoPreview("");
      return;
    }
    if (typeof formData.websiteLogo === "string") {
      setLogoPreview(formData.websiteLogo);
      return;
    }
    const objectUrl = URL.createObjectURL(formData.websiteLogo);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [formData.websiteLogo]);

  useEffect(() => {
    if (!formData.websiteFavicon) {
      setFaviconPreview("");
      return;
    }
    if (typeof formData.websiteFavicon === "string") {
      setFaviconPreview(formData.websiteFavicon);
      return;
    }
    const objectUrl = URL.createObjectURL(formData.websiteFavicon);
    setFaviconPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [formData.websiteFavicon]);

  return (
    <div className='space-y-6 animate-in fade-in duration-300'>
      <div className='grid md:grid-cols-2 gap-6'>
        <InputGroup
          label='Nama Website'
          name='websiteName'
          value={formData.websiteName}
          onChange={handleChange}
          placeholder='Contoh: My Academy'
        />

        <InputGroup
          label='Domain'
          name='domain'
          value={formData.domain}
          onChange={handleChange}
          placeholder='domain.com'
        />
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
                Logo Website
              </p>
              <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                PNG/JPG/WEBP/SVG, rekomendasi 512px.
              </p>
            </div>
            <label className='inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition'>
              <ImageUp size={16} />
              Upload Logo
              <input
                type='file'
                name='websiteLogo'
                accept='image/png,image/jpeg,image/webp,image/svg+xml'
                className='sr-only'
                onChange={handleChange}
              />
            </label>
          </div>
          <div className='mt-4 flex items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-6'>
            {logoPreview ? (
              <img
                src={logoPreview}
                alt='Preview Logo'
                className='max-h-20 w-auto object-contain'
              />
            ) : (
              <div className='flex flex-col items-center gap-2 text-zinc-400'>
                <ImageIcon size={26} />
                <span className='text-xs'>Belum ada logo</span>
              </div>
            )}
          </div>
        </div>

        <div className='rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
                Favicon
              </p>
              <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                PNG/ICO/WEBP, rekomendasi 64px.
              </p>
            </div>
            <label className='inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition'>
              <ImageUp size={16} />
              Upload Favicon
              <input
                type='file'
                name='websiteFavicon'
                accept='image/png,image/jpeg,image/webp,image/x-icon'
                className='sr-only'
                onChange={handleChange}
              />
            </label>
          </div>
          <div className='mt-4 flex items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-6'>
            {faviconPreview ? (
              <img
                src={faviconPreview}
                alt='Preview Favicon'
                className='h-12 w-12 object-contain'
              />
            ) : (
              <div className='flex flex-col items-center gap-2 text-zinc-400'>
                <ImageIcon size={26} />
                <span className='text-xs'>Belum ada favicon</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <InputGroup
          label='Link YouTube Road Map'
          name='youtubeRoadmapLink'
          value={formData.youtubeRoadmapLink}
          onChange={handleChange}
          placeholder='https://youtu.be/...'
          helper='Link ini dipakai saat tombol Road Map di home diklik.'
        />
        <div className='rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm flex items-center gap-3'>
          <div className='h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-300'>
            <Link2 size={18} />
          </div>
          <div>
            <p className='text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
              Road Map di Home
            </p>
            <p className='text-xs text-zinc-500 dark:text-zinc-400'>
              Pastikan link YouTube valid agar video terbuka di tab baru.
            </p>
          </div>
        </div>
      </div>

      <div className='pt-4 border-t border-zinc-100 dark:border-zinc-800'>
        <div className='flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl'>
          <AlertTriangle className='text-amber-600 shrink-0' size={20} />
          <div>
            <h4 className='text-sm font-semibold text-amber-800 dark:text-amber-400'>
              Maintenance Mode
            </h4>
            <p className='text-xs text-amber-700 dark:text-amber-500 mt-1 mb-3'>
              Jika diaktifkan, pengunjung tidak bisa mengakses halaman kursus.
            </p>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                name='maintenanceMode'
                checked={formData.maintenanceMode}
                onChange={handleChange}
                className='sr-only peer'
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-2px after:left-2px after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
