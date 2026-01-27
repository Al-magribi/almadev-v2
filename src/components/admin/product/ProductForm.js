// components/admin/product/ProductForm.js
"use client";

import { useState, useEffect } from "react";
import { X, Save, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { saveProduct } from "@/actions/product-actions";
import toast from "react-hot-toast";

export default function ProductForm({ isOpen, onClose, initialData = null }) {
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form saat modal dibuka/data berubah
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setPreview(initialData.image);
      } else {
        setPreview(null);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);

    // Jika edit, append ID
    if (initialData?._id) {
      formData.append("id", initialData._id);
      // Jika user tidak upload file baru, kirim URL gambar lama agar validasi lolos
      const fileInput = event.currentTarget.querySelector(
        'input[name="image"]',
      );
      if (fileInput.files.length === 0 && initialData.image) {
        formData.set("image", initialData.image);
      }
    }

    const result = await saveProduct(null, formData);

    setIsLoading(false);

    if (result.success) {
      onClose(); // Tutup modal
      // Opsional: Tampilkan toast notification disini
      toast.success(result.message);
    } else {
      if (result.errors) {
        setErrors(result.errors);
      } else {
        toast.error(result.message);
      }
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10'>
          <h2 className='text-xl font-bold text-gray-800'>
            {initialData ? "Edit Produk" : "Tambah Produk Baru"}
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full transition'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          {/* Image Upload */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Gambar Produk
            </label>
            <div className='flex items-center gap-4'>
              <div className='relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50'>
                {preview ? (
                  <Image
                    src={preview}
                    alt='Preview'
                    fill
                    className='object-cover'
                  />
                ) : (
                  <Upload className='w-8 h-8 text-gray-400' />
                )}
              </div>
              <input
                type='file'
                name='image'
                accept='image/*'
                onChange={handleImageChange}
                className='text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
              />
            </div>
            {errors.image && (
              <p className='text-red-500 text-xs'>{errors.image}</p>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Nama */}
            <div className='space-y-1'>
              <label className='text-sm font-medium text-gray-700'>
                Nama Produk
              </label>
              <input
                type='text'
                name='name'
                defaultValue={initialData?.name}
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                placeholder='Contoh: Kursus React'
              />
              {errors.name && (
                <p className='text-red-500 text-xs'>{errors.name}</p>
              )}
            </div>

            {/* Kategori */}
            <div className='space-y-1'>
              <label className='text-sm font-medium text-gray-700'>
                Kategori
              </label>
              <select
                name='category'
                defaultValue={initialData?.category}
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white'
              >
                <option value=''>Pilih Kategori</option>
                <option value='app'>Aplikasi</option>
                <option value='ebook'>E-Book</option>
                <option value='template'>Template</option>
              </select>
              {errors.category && (
                <p className='text-red-500 text-xs'>{errors.category}</p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Harga */}
            <div className='space-y-1'>
              <label className='text-sm font-medium text-gray-700'>
                Harga (Rp)
              </label>
              <input
                type='number'
                name='price'
                defaultValue={initialData?.price}
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                placeholder='0'
              />
              {errors.price && (
                <p className='text-red-500 text-xs'>{errors.price}</p>
              )}
            </div>

            {/* Status */}
            <div className='space-y-1'>
              <label className='text-sm font-medium text-gray-700'>
                Status
              </label>
              <select
                name='status'
                defaultValue={initialData?.status || "draft"}
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white'
              >
                <option value='draft'>Draft</option>
                <option value='published'>Published</option>
                <option value='archived'>Archived</option>
              </select>
            </div>
          </div>

          {/* Deskripsi */}
          <div className='space-y-1'>
            <label className='text-sm font-medium text-gray-700'>
              Deskripsi
            </label>
            <textarea
              name='description'
              rows='3'
              defaultValue={initialData?.description}
              className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
              placeholder='Jelaskan produk anda...'
            ></textarea>
            {errors.description && (
              <p className='text-red-500 text-xs'>{errors.description}</p>
            )}
          </div>

          {/* Links (Optional) */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <label className='text-sm font-medium text-gray-700'>
                Link File (Opsional)
              </label>
              <input
                type='text'
                name='fileLink'
                defaultValue={initialData?.fileLink}
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                placeholder='Google Drive / Dropbox URL'
              />
            </div>
            <div className='space-y-1'>
              <label className='text-sm font-medium text-gray-700'>
                Link Video Preview (Opsional)
              </label>
              <input
                type='text'
                name='videoLink'
                defaultValue={initialData?.videoLink}
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                placeholder='YouTube URL'
              />
            </div>
          </div>

          <div className='space-y-1'>
            <label className='text-sm font-medium text-gray-700'>
              Catatan Internal
            </label>
            <textarea
              name='note'
              rows='2'
              defaultValue={initialData?.note}
              className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
              placeholder='Catatan khusus admin...'
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className='flex items-center justify-end gap-3 pt-4 border-t mt-4'>
            <button
              type='button'
              onClick={onClose}
              disabled={isLoading}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition'
            >
              Batal
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50'
            >
              {isLoading && <Loader2 className='w-4 h-4 animate-spin' />}
              {initialData ? "Simpan Perubahan" : "Buat Produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
