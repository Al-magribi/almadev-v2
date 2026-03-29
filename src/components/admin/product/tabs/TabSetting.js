"use client";

import { motion } from "framer-motion";
import {
  AlertOctagon,
  FileText,
  Image as ImageIcon,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

function createTempFileId() {
  return `temp-file-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

export default function TabSetting({
  product,
  setProduct,
  landing,
  setLanding,
  newImageFile,
  setNewImageFile,
  productFileUploads,
  setProductFileUploads,
}) {
  const formatThousands = (value) => {
    const digits = String(value ?? "").replace(/\D/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString("id-ID");
  };

  const normalizeNumericInput = (value) =>
    String(value ?? "").replace(/\D/g, "");

  const downloadableFiles = Array.isArray(product?.downloadableFiles)
    ? product.downloadableFiles
    : [];

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCurrencyChange = (name) => (event) => {
    setProduct((prev) => ({
      ...prev,
      [name]: normalizeNumericInput(event.target.value),
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) setNewImageFile(file);
  };

  const handleAddProductFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const nextUploads = {};
    const nextEntries = files.map((file) => {
      const url = URL.createObjectURL(file);
      nextUploads[url] = file;
      return {
        id: createTempFileId(),
        name: file.name || "File Produk",
        url,
      };
    });

    setProduct((prev) => ({
      ...prev,
      downloadableFiles: [...(prev?.downloadableFiles || []), ...nextEntries],
    }));
    setProductFileUploads((prev) => ({ ...prev, ...nextUploads }));
    event.target.value = "";
  };

  const handleDownloadableFileNameChange = (index, value) => {
    setProduct((prev) => ({
      ...prev,
      downloadableFiles: (prev?.downloadableFiles || []).map(
        (item, itemIndex) =>
          itemIndex === index ? { ...item, name: value } : item,
      ),
    }));
  };

  const handleRemoveDownloadableFile = (index) => {
    const target = downloadableFiles[index];
    if (target?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(target.url);
      setProductFileUploads((prev) => {
        const next = { ...prev };
        delete next[target.url];
        return next;
      });
    }

    setProduct((prev) => ({
      ...prev,
      downloadableFiles: (prev?.downloadableFiles || []).filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  const handleManualBuyersChange = (event) => {
    const parsed = Number(event.target.value);
    const manualBuyers = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;

    setLanding((prev) => ({
      ...prev,
      instructor: {
        ...(prev?.instructor || {}),
        customStudents: manualBuyers,
      },
    }));
  };

  return (
    <motion.div
      key='settings'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className='space-y-10'>
        <section className='space-y-5'>
          <div className='flex items-center gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800'>
            <h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100'>
              Informasi Dasar
            </h3>
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
              <label className='text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
                Nama Produk
              </label>
              <input
                name='name'
                value={product.name || ""}
                onChange={handleChange}
                className='w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
                Kategori
              </label>
              <select
                name='category'
                value={product.category || ""}
                onChange={handleChange}
                className='w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900'
              >
                <option value=''>Pilih kategori</option>
                <option value='app'>Aplikasi</option>
                <option value='ebook'>E-Book</option>
                <option value='template'>Template</option>
              </select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
                Harga (IDR)
              </label>
              <div className='relative'>
                <span className='absolute left-4 top-2.5 text-sm font-medium text-zinc-400'>
                  Rp
                </span>
                <input
                  type='text'
                  inputMode='numeric'
                  name='price'
                  value={formatThousands(product.price)}
                  onChange={handleCurrencyChange("price")}
                  className='w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
                Reward Affiliate
              </label>
              <div className='relative'>
                <span className='absolute left-4 top-2.5 text-sm font-medium text-zinc-400'>
                  Rp
                </span>
                <input
                  type='text'
                  inputMode='numeric'
                  name='affiliateRewardAmount'
                  value={formatThousands(product.affiliateRewardAmount)}
                  onChange={handleCurrencyChange("affiliateRewardAmount")}
                  className='w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
                Status
              </label>
              <select
                name='status'
                value={product.status || "draft"}
                onChange={handleChange}
                className='w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900'
              >
                <option value='draft'>Draft</option>
                <option value='published'>Published</option>
                <option value='archived'>Archived</option>
              </select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
                Affiliate
              </label>
              <label className='flex items-center gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200'>
                <input
                  type='checkbox'
                  name='affiliateEnabled'
                  checked={Boolean(product.affiliateEnabled)}
                  onChange={handleChange}
                  className='h-4 w-4 rounded border-zinc-300 text-sky-600 focus:ring-sky-500'
                />
                Aktifkan komisi affiliate untuk produk ini
              </label>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
                Pembeli Manual
              </label>
              <input
                type='number'
                min='0'
                value={landing?.instructor?.customStudents ?? 0}
                onChange={handleManualBuyersChange}
                className='w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900'
              />
              <p className='text-xs text-zinc-500'>
                Nilai ini akan ditambahkan dengan jumlah transaksi product yang
                sudah completed.
              </p>
            </div>

            <div className='col-span-2 space-y-2'>
              <label className='text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
                Deskripsi Produk
              </label>
              <textarea
                name='description'
                rows={5}
                value={product.description || ""}
                onChange={handleChange}
                className='w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900'
              />
            </div>

            <div className='col-span-2 space-y-2'>
              <label className='text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
                Catatan Tambahan
              </label>
              <textarea
                name='note'
                rows={5}
                value={product.note || ""}
                onChange={handleChange}
                className='w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900'
              />
            </div>

            <div className='col-span-2 space-y-2'>
              <label className='text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
                Link Video Preview
              </label>
              <input
                name='videoLink'
                placeholder='https://youtube.com/watch?v=...'
                value={product.videoLink || ""}
                onChange={handleChange}
                className='w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900'
              />
            </div>
          </div>
        </section>

        <section className='space-y-5'>
          <div className='flex items-center gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800'>
            <h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100'>
              Media Produk
            </h3>
          </div>

          <div className='grid gap-6 lg:grid-cols-2'>
            <div className='flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
              <div className='relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950'>
                {newImageFile ? (
                  <img
                    src={URL.createObjectURL(newImageFile)}
                    alt='Preview'
                    className='h-full w-full object-cover'
                  />
                ) : product.image ? (
                  <img
                    src={product.image}
                    alt='Thumbnail'
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div className='text-center'>
                    <ImageIcon className='mx-auto mb-2 h-10 w-10 text-zinc-300' />
                    <span className='text-xs text-zinc-400'>
                      Belum ada gambar
                    </span>
                  </div>
                )}
              </div>

              <div className='space-y-4'>
                <div>
                  <h4 className='font-medium text-zinc-900 dark:text-zinc-100'>
                    Thumbnail Product
                  </h4>
                  <p className='mt-1 text-sm leading-relaxed text-zinc-500'>
                    Upload gambar cover product. Disarankan rasio landscape agar
                    hero tetap rapi.
                  </p>
                </div>
                <div className='flex gap-3'>
                  <label className='flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900'>
                    <Upload size={16} />
                    Pilih Gambar
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleImageChange}
                      className='hidden'
                    />
                  </label>
                  {newImageFile && (
                    <button
                      type='button'
                      onClick={() => setNewImageFile(null)}
                      className='px-4 py-2 text-sm font-medium text-rose-600'
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className='space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
              <div className='flex items-start gap-3'>
                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600'>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className='font-medium text-zinc-900 dark:text-zinc-100'>
                    File Produk
                  </h4>
                  <p className='mt-1 text-sm leading-relaxed text-zinc-500'>
                    Admin bisa upload lebih dari satu file dan memberi nama
                    untuk setiap file sebelum disimpan.
                  </p>
                </div>
              </div>

              <div className='rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/70 p-4 dark:border-zinc-700 dark:bg-zinc-950/60'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <p className='text-sm font-medium text-zinc-900 dark:text-zinc-100'>
                      Tambah file download
                    </p>
                    <p className='mt-1 text-xs text-zinc-500'>
                      Format umum seperti PDF, DOCX, XLSX, ZIP, dan RAR
                      didukung.
                    </p>
                  </div>
                  <label className='inline-flex cursor-pointer items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-sky-700'>
                    <Plus size={16} />
                    File
                    <input
                      type='file'
                      multiple
                      accept='.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/x-zip-compressed,application/x-rar-compressed,application/vnd.rar'
                      onChange={handleAddProductFiles}
                      className='hidden'
                    />
                  </label>
                </div>
              </div>

              <div className='space-y-3'>
                {downloadableFiles.length > 0 ? (
                  downloadableFiles.map((fileItem, index) => {
                    const isNewFile = String(fileItem?.url || "").startsWith(
                      "blob:",
                    );
                    const fileLabel = isNewFile
                      ? productFileUploads[fileItem.url]?.name || fileItem.name
                      : String(fileItem?.url || "")
                          .split("/")
                          .pop() || fileItem.name;

                    return (
                      <div
                        key={fileItem.id || fileItem.url || index}
                        className='rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40'
                      >
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0 flex-1 space-y-3'>
                            <div className='flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100'>
                              <Pencil size={15} className='text-zinc-400' />
                              Nama file yang tampil ke pembeli
                            </div>
                            <input
                              type='text'
                              value={fileItem.name || ""}
                              onChange={(event) =>
                                handleDownloadableFileNameChange(
                                  index,
                                  event.target.value,
                                )
                              }
                              placeholder='Contoh: Ebook Utama PDF'
                              className='w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900'
                            />
                            <p className='text-xs text-zinc-500'>
                              File fisik: {fileLabel}
                            </p>
                          </div>
                          <button
                            type='button'
                            onClick={() => handleRemoveDownloadableFile(index)}
                            className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100'
                            title='Hapus file'
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className='rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/30'>
                    Belum ada file produk yang diupload.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className='pt-6'>
          <div className='flex items-start justify-between gap-6 rounded-xl border border-rose-100 bg-rose-50 p-6 dark:border-rose-900/50 dark:bg-rose-950/20'>
            <div className='space-y-1'>
              <h4 className='flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400'>
                <AlertOctagon size={18} />
                Hapus Produk
              </h4>
              <p className='text-sm text-rose-600/80 dark:text-rose-400/70'>
                Penghapusan masih dilakukan dari halaman daftar produk untuk
                menjaga keamanan.
              </p>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
