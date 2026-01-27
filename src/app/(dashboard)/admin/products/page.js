// page.js
import Create from "@/components/admin/product/Create";
import ProductList from "@/components/admin/product/ProductList";
import { getProducts } from "@/actions/product-actions"; // Sesuaikan path
import { LayoutGrid } from "lucide-react";

// Tambahkan : export const dynamic = 'force-dynamic' jika ingin selalu real-time tanpa cache
export const dynamic = "force-dynamic";

export default async function AdminProduct() {
  // Fetch data langsung di Server Component
  const products = await getProducts();

  return (
    <div className='space-y-6 max-w-7xl mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors'>
        <div className='flex items-center gap-4 mb-4 sm:mb-0'>
          <div className='p-3 bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl hidden sm:block'>
            <LayoutGrid size={24} />
          </div>
          <div>
            <h1 className='text-xl font-bold text-zinc-900 dark:text-zinc-100'>
              Manajemen Produk
            </h1>
            <p className='text-zinc-500 dark:text-zinc-400 text-sm'>
              Kelola daftar produk, harga, dan status.
            </p>
          </div>
        </div>

        <Create />
      </div>

      <ProductList products={products} />
    </div>
  );
}
