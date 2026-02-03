// components/admin/product/ProductForm.js
"use client";

import { useState, useEffect } from "react";
import {
  X,
  Upload,
  Loader2,
  FileText,
  Sparkles,
  BadgeCheck,
  Tag,
  Banknote,
  Layers,
  PlayCircle,
} from "lucide-react";
import Image from "next/image";
import { saveProduct } from "@/actions/product-actions";
import toast from "react-hot-toast";

export default function ProductForm({ isOpen, onClose, initialData = null }) {
  const [preview, setPreview] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form saat modal dibuka/data berubah
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setPreview(initialData.image);
        setFileInfo(
          initialData.filePath
            ? { name: initialData.filePath.split("/").pop() }
            : null,
        );
      } else {
        setPreview(null);
        setFileInfo(null);
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
      const productFileInput = event.currentTarget.querySelector(
        'input[name="filePath"]',
      );
      if (productFileInput?.files?.length === 0 && initialData.filePath) {
        formData.set("filePath", initialData.filePath);
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
        console.log(result.errors);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFileInfo(null);
      return;
    }
    setFileInfo({ name: file.name, size: file.size });
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto border border-zinc-200'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4 p-4 sm:p-6 border-b border-zinc-200 sticky top-0 bg-white z-10'>
          <div className='flex items-start gap-4'>
            <div className='flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600'>
              <Sparkles className='h-5 w-5' />
            </div>
            <div>
              <h2 className='text-lg sm:text-xl font-bold text-gray-900'>
                {initialData ? "Edit Produk" : "Tambah Produk Baru"}
              </h2>
              <p className='text-xs sm:text-sm text-gray-500'>
                Lengkapi informasi produk agar terlihat profesional.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full transition'
            aria-label='Tutup'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          encType='multipart/form-data'
          className='p-4 sm:p-6 space-y-6'
        >
          <div className='grid grid-cols-1 gap-6 '>
            <div className='space-y-5 sm:space-y-6 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm font-semibold text-gray-900'>
                  <BadgeCheck className='h-4 w-4 text-blue-600' />
                  Informasi Utama
                </div>
                <p className='text-xs text-gray-500'>
                  Data ini tampil di katalog produk siswa.
                </p>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {/* Nama */}
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-gray-700'>
                    Nama Produk
                  </label>
                  <div className='relative'>
                    <Tag className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                    <input
                      type='text'
                      name='name'
                      defaultValue={initialData?.name}
                      className='w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      placeholder='Contoh: Template Portfolio'
                    />
                  </div>
                  {errors.name && (
                    <p className='text-red-500 text-xs'>{errors.name}</p>
                  )}
                </div>

                {/* Kategori */}
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-gray-700'>
                    Kategori
                  </label>
                  <div className='relative'>
                    <Layers className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                    <select
                      name='category'
                      defaultValue={initialData?.category}
                      className='w-full appearance-none rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    >
                      <option value=''>Pilih Kategori</option>
                      <option value='app'>Aplikasi</option>
                      <option value='ebook'>E-Book</option>
                      <option value='template'>Template</option>
                    </select>
                  </div>
                  {errors.category && (
                    <p className='text-red-500 text-xs'>{errors.category}</p>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {/* Harga */}
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-gray-700'>
                    Harga (Rp)
                  </label>
                  <div className='relative'>
                    <Banknote className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                    <input
                      type='number'
                      name='price'
                      defaultValue={initialData?.price}
                      className='w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      placeholder='0'
                    />
                  </div>
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
                    className='w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
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
                  rows='8'
                  defaultValue={initialData?.description}
                  className='w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                  placeholder='Jelaskan produk anda...'
                ></textarea>
                {errors.description && (
                  <p className='text-red-500 text-xs'>{errors.description}</p>
                )}
              </div>

              <div className='space-y-1'>
                <label className='text-sm font-medium text-gray-700'>
                  Catatan Internal
                </label>
                <textarea
                  name='note'
                  rows='10'
                  defaultValue={initialData?.note}
                  className='w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                  placeholder='Catatan khusus admin...'
                ></textarea>
              </div>

              <div className='space-y-1'>
                <label className='text-sm font-medium text-gray-700'>
                  Link Video Preview (Opsional)
                </label>
                <div className='relative'>
                  <PlayCircle className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                  <input
                    type='text'
                    name='videoLink'
                    defaultValue={initialData?.videoLink}
                    className='w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    placeholder='YouTube URL'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Gambar Produk
                </label>
                <div className='rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4'>
                  <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
                    <div className='relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-xl bg-white shadow-sm'>
                      {preview ? (
                        <Image
                          src={preview}
                          alt='Preview'
                          fill
                          className='object-cover'
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center text-gray-400'>
                          <Upload className='h-8 w-8' />
                        </div>
                      )}
                    </div>
                    <div className='flex-1 space-y-2'>
                      <p className='text-xs text-gray-500'>
                        Format disarankan JPG/PNG/WEBP, maks 5MB.
                      </p>
                      <div className='flex flex-col items-start gap-2 sm:flex-row sm:items-center'>
                        <label className='inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500'>
                          Pilih Gambar
                          <input
                            type='file'
                            name='image'
                            accept='image/*'
                            onChange={handleImageChange}
                            className='sr-only'
                          />
                        </label>
                        <span className='text-xs text-gray-500'>
                          {preview ? "Gambar siap diunggah" : "Belum dipilih"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {errors.image && (
                  <p className='text-red-500 text-xs'>{errors.image}</p>
                )}
              </div>

              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Upload File Produk
                </label>
                <div className='rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4'>
                  <div className='flex items-start gap-3'>
                    <div className='flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm'>
                      <FileText className='h-6 w-6' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-semibold text-gray-900'>
                        PDF, Word, Excel, ZIP, atau RAR
                      </p>
                      <p className='text-xs text-gray-500'>
                        Maksimal 50MB per file.
                      </p>
                    </div>
                  </div>
                  <div className='mt-3 flex flex-col gap-2'>
                    <div className='flex flex-col items-start gap-2 sm:flex-row sm:items-center'>
                      <label className='inline-flex cursor-pointer items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800'>
                        Pilih File
                        <input
                          type='file'
                          name='filePath'
                          accept='.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/x-zip-compressed,application/x-rar-compressed,application/vnd.rar'
                          onChange={handleFileChange}
                          className='sr-only'
                        />
                      </label>
                      <span className='text-xs text-gray-500'>
                        {fileInfo?.name
                          ? "File siap diunggah"
                          : "Belum dipilih"}
                      </span>
                    </div>
                    <div className='rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600'>
                      {fileInfo?.name
                        ? `File terpilih: ${fileInfo.name}`
                        : initialData?.filePath
                          ? `File tersimpan: ${initialData.filePath
                              .split("/")
                              .pop()}`
                          : "Belum ada file diupload."}
                    </div>
                  </div>
                </div>
                {errors.filePath && (
                  <p className='text-red-500 text-xs'>{errors.filePath}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className='flex flex-col-reverse gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:justify-end'>
            <button
              type='button'
              onClick={onClose}
              disabled={isLoading}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition'
            >
              Batal
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50'
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
