"use client";

import { useState } from "react";
import { Edit, Trash2, Tag, FileImage } from "lucide-react";
import Image from "next/image";
import ProductForm from "./ProductForm";
import { deleteProduct } from "@/actions/product-actions";

export default function ProductList({ products }) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (confirm("Apakah anda yakin ingin menghapus produk ini?")) {
      setIsDeleting(id);
      await deleteProduct(id);
      setIsDeleting(null);
    }
  };

  // Helper untuk warna status (Updated for Dark Mode)
  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "archived":
        return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
      default: // draft
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
    }
  };

  return (
    <>
      {products.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 px-4 bg-white dark:bg-zinc-900/50 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl text-center transition-colors'>
          <div className='bg-gray-50 dark:bg-zinc-800 p-4 rounded-full mb-3'>
            <FileImage className='w-8 h-8 text-gray-400 dark:text-zinc-500' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 dark:text-zinc-100'>
            Belum ada produk
          </h3>
          <p className='text-gray-500 dark:text-zinc-400 max-w-sm mt-1'>
            Mulailah dengan menambahkan produk baru untuk ditampilkan di
            katalog.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {products.map((product) => (
            <div
              key={product._id}
              className='group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col'
            >
              {/* Bagian Gambar */}
              <div className='relative h-48 w-full bg-gray-100 dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800'>
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className='object-cover group-hover:scale-105 transition-transform duration-500'
                  />
                ) : (
                  <div className='flex flex-col items-center justify-center h-full text-gray-400 dark:text-zinc-600'>
                    <FileImage className='w-10 h-10 mb-2 opacity-50' />
                    <span className='text-xs font-medium'>No Image</span>
                  </div>
                )}

                {/* Badge Status (Overlay di gambar) */}
                <div className='absolute top-3 right-3'>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize border shadow-sm backdrop-blur-sm ${getStatusColor(
                      product.status,
                    )}`}
                  >
                    {product.status}
                  </span>
                </div>
              </div>

              {/* Bagian Konten */}
              <div className='p-4 flex flex-col flex-1'>
                {/* Kategori */}
                <div className='flex items-center gap-2 mb-2'>
                  <span className='inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 uppercase tracking-wider'>
                    <Tag className='w-3 h-3' />
                    {product.category}
                  </span>
                </div>

                {/* Judul & Harga */}
                <div className='mb-3'>
                  <h3 className='font-bold text-gray-900 dark:text-zinc-100 line-clamp-1 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                    {product.name}
                  </h3>
                  <p className='text-sm text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2 h-10 leading-relaxed'>
                    {product.description}
                  </p>
                </div>

                <div className='mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between'>
                  <span className='text-lg font-bold text-gray-900 dark:text-zinc-100'>
                    Rp {product.price.toLocaleString("id-ID")}
                  </span>

                  {/* Action Buttons */}
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => setEditingProduct(product)}
                      className='p-2 text-gray-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30'
                      title='Edit Produk'
                    >
                      <Edit className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={isDeleting === product._id}
                      className='p-2 text-gray-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition border border-transparent hover:border-red-100 dark:hover:border-red-900/30 disabled:opacity-50'
                      title='Hapus Produk'
                    >
                      {isDeleting === product._id ? (
                        <span className='w-4 h-4 block rounded-full border-2 border-red-600 border-t-transparent animate-spin'></span>
                      ) : (
                        <Trash2 className='w-4 h-4' />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Edit tetap sama */}
      {editingProduct && (
        <ProductForm
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          initialData={editingProduct}
        />
      )}
    </>
  );
}
