// product-actions.js
"use server";

import dbConnect from "@/lib/db";
import {
  deleteFile,
  productSchema,
  uploadImage,
  uploadProductFile,
} from "@/lib/server-utils";
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

// --- GET PRODUCT DETAIL ---
export async function getProductDetail(id) {
  await dbConnect();
  const product = await Product.findById(id).lean();
  if (!product) return null;
  return {
    ...product,
    _id: product._id.toString(),
    reviews: product.reviews?.map((r) => ({
      ...r,
      _id: r._id.toString(),
      user: r.user?.toString(),
    })),
  };
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
      filePath: formData.get("filePath"),
      videoLink: formData.get("videoLink"),
      image: formData.get("image"), // Bisa File atau String (jika tidak diubah)
    };
    const hasFileUpload =
      rawData.filePath instanceof File && rawData.filePath.size > 0;

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

    const { image, filePath, ...productData } = validatedFields.data;
    let imagePath = undefined;
    let uploadedFilePath = undefined;

    // 3. Handle Image Upload
    // Jika image adalah File (bukan string URL), upload baru
    if (image instanceof File && image.size > 0) {
      const uploadedPath = await uploadImage(image, "products");
      if (uploadedPath) imagePath = uploadedPath;
    } else if (typeof image === "string" && image.length > 0) {
      // Pertahankan gambar lama jika dikirim sebagai string
      imagePath = image;
    }

    if (filePath instanceof File && filePath.size > 0) {
      const uploadedFile = await uploadProductFile(filePath, "product-files");
      if (uploadedFile) uploadedFilePath = uploadedFile;
    } else if (typeof filePath === "string" && filePath.length > 0) {
      uploadedFilePath = filePath;
    }
    if (hasFileUpload && !uploadedFilePath) {
      return {
        success: false,
        message:
          "Upload file gagal. Periksa ukuran dan format file, lalu coba lagi.",
      };
    }

    // 4. Simpan ke Database
    if (id) {
      // --- UPDATE MODE ---
      const updateData = { ...productData };
      if (imagePath) updateData.image = imagePath;
      if (uploadedFilePath) updateData.filePath = uploadedFilePath;

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

      await Product.create({
        ...productData,
        image: imagePath,
        filePath: uploadedFilePath || "",
      });
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

    // 1. Cari produk dulu untuk ambil path gambarnya
    const product = await Product.findById(id);

    if (!product) {
      return { success: false, message: "Produk tidak ditemukan" };
    }

    // 2. Hapus file gambar fisik jika ada
    if (product.image) {
      await deleteFile(product.image);
    }

    // 3. Hapus data dari database
    await Product.findByIdAndDelete(id);

    revalidatePath("/admin/product");
    return { success: true, message: "Produk berhasil dihapus" };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, message: "Gagal menghapus produk" };
  }
}
