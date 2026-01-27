// product-actions.js
"use server";

import dbConnect from "@/lib/db";
import { productSchema, uploadImage } from "@/lib/server-utils";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";

// --- GET PRODUCTS ---
export async function getProducts(query = {}) {
  await dbConnect();
  // Mengembalikan plain object agar bisa diserialisasi oleh Next.js client component
  const products = await Product.find(query).sort({ createdAt: -1 }).lean();
  return products.map((product) => ({
    ...product,
    _id: product._id.toString(), // Convert ObjectId ke String
    reviews: product.reviews?.map((r) => ({
      ...r,
      _id: r._id.toString(),
      user: r.user?.toString(),
    })),
  }));
}

// --- CREATE / UPDATE PRODUCT ---
export async function saveProduct(prevState, formData) {
  try {
    await dbConnect();

    // 1. Ambil data dari FormData
    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
      note: formData.get("note"),
      price: formData.get("price"),
      category: formData.get("category"),
      status: formData.get("status"),
      fileLink: formData.get("fileLink"),
      videoLink: formData.get("videoLink"),
      image: formData.get("image"), // Bisa File atau String (jika tidak diubah)
    };

    const id = formData.get("id"); // Jika ada ID, berarti Edit

    // 2. Validasi dengan Zod
    const validatedFields = productSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Validasi Gagal. Periksa input anda.",
      };
    }

    const { image, ...productData } = validatedFields.data;
    let imagePath = undefined;

    // 3. Handle Image Upload
    // Jika image adalah File (bukan string URL), upload baru
    if (image instanceof File && image.size > 0) {
      const uploadedPath = await uploadImage(image, "products");
      if (uploadedPath) imagePath = uploadedPath;
    } else if (typeof image === "string" && image.length > 0) {
      // Pertahankan gambar lama jika dikirim sebagai string
      imagePath = image;
    }

    // 4. Simpan ke Database
    if (id) {
      // --- UPDATE MODE ---
      const updateData = { ...productData };
      if (imagePath) updateData.image = imagePath;

      await Product.findByIdAndUpdate(id, updateData);
      revalidatePath("/admin/product");
      return { success: true, message: "Produk berhasil diperbarui!" };
    } else {
      // --- CREATE MODE ---
      if (!imagePath) {
        return {
          success: false,
          message: "Gambar wajib diupload untuk produk baru.",
        };
      }

      await Product.create({ ...productData, image: imagePath });
      revalidatePath("/admin/product");
      return { success: true, message: "Produk berhasil dibuat!" };
    }
  } catch (error) {
    console.error("Save Product Error:", error);
    return { success: false, message: "Terjadi kesalahan server." };
  }
}

// --- DELETE PRODUCT ---
export async function deleteProduct(id) {
  try {
    await dbConnect();
    await Product.findByIdAndDelete(id);
    revalidatePath("/admin/product");
    return { success: true, message: "Produk berhasil dihapus" };
  } catch (error) {
    return { success: false, message: "Gagal menghapus produk" };
  }
}
