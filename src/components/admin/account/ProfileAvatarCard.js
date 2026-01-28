"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { User, Camera } from "lucide-react";

export default function ProfileAvatarCard({ user, onAvatarChange }) {
  const [preview, setPreview] = useState(user.avatar || null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        alert("Ukuran file maksimal 5MB");
        return;
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
      if (onAvatarChange) onAvatarChange(e); // Propagate event if needed
    }
  };

  return (
    <div className='bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/50 dark:shadow-black/20 flex flex-col items-center text-center relative overflow-hidden transition-colors duration-300'>
      {/* Background decoration */}
      <div className='absolute top-0 left-0 w-full h-24 bg-linear-to-r from-blue-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-800/50 z-0'></div>

      <div
        className='relative group cursor-pointer z-10 mt-4'
        onClick={() => fileInputRef.current?.click()}
      >
        <div className='w-40 h-40 rounded-full overflow-hidden border-[6px] border-white dark:border-zinc-900 shadow-2xl relative bg-gray-100 dark:bg-zinc-800 transition-transform duration-300 group-hover:scale-105'>
          {preview ? (
            <Image src={preview} alt='Avatar' fill className='object-cover' />
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-gray-50 dark:bg-zinc-800 text-gray-300 dark:text-zinc-600'>
              <User size={64} />
            </div>
          )}

          {/* Overlay Upload */}
          <div className='absolute inset-0 bg-black/30 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]'>
            <Camera className='text-white w-8 h-8 mb-1' />
            <span className='text-white text-xs font-medium'>Ubah Foto</span>
          </div>
        </div>

        {/* Tombol Edit Floating */}
        <div className='absolute bottom-2 right-2 bg-white dark:bg-zinc-800 p-2.5 rounded-full shadow-lg border border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors z-20'>
          <Camera size={18} />
        </div>
      </div>

      <input
        type='file'
        name='avatar'
        ref={fileInputRef}
        onChange={handleImageChange}
        accept='image/png, image/jpeg, image/jpg, image/webp'
        className='hidden'
      />

      <div className='z-10 mt-6'>
        <h2 className='font-bold text-xl text-gray-900 dark:text-zinc-100'>
          {user.name}
        </h2>
        <p className='text-sm text-gray-500 dark:text-zinc-400 mt-1'>
          {user.email}
        </p>
      </div>

      <div className='w-full border-t border-gray-100 dark:border-zinc-800 mt-6 pt-6 grid grid-cols-2 gap-4 z-10'>
        <div className='text-center'>
          <p className='text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-wide'>
            Bergabung
          </p>
          <p className='text-sm font-semibold text-gray-700 dark:text-zinc-300 mt-1'>
            {new Date(user.createdAt).toLocaleDateString("id-ID", {
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className='text-center border-l border-gray-100 dark:border-zinc-800'>
          <p className='text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-wide'>
            Status
          </p>
          <div className='flex items-center justify-center mt-1'>
            <span className='inline-block w-2.5 h-2.5 bg-green-500 rounded-full mr-1'></span>
            <span className='text-sm font-semibold text-gray-700 dark:text-zinc-300'>
              Aktif
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
