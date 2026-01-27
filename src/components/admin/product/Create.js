// Create.js
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import ProductForm from "./ProductForm";

export default function Create() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='inline-flex items-center justify-center px-4 py-2 gap-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition shadow-sm'
      >
        <Plus className='w-4 h-4' />
        Tambah Produk
      </button>

      {/* Render Modal Create */}
      <ProductForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialData={null}
      />
    </>
  );
}
