import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Schema Validasi Course
export const createCourseSchema = z.object({
  name: z.string().min(3, { message: "Nama course minimal 3 karakter." }),

  // VIDEO: Boleh null, undefined, atau string kosong. Jika ada isi, baru cek URL.
  video: z
    .string()
    .nullable() // Izinkan null
    .optional() // Izinkan undefined
    .or(z.literal("")) // Izinkan string kosong
    .refine(
      (val) => {
        // Jika null/undefined/kosong, lolos validasi
        if (!val) return true;
        // Jika ada isi, validasi URL Youtube
        try {
          const url = new URL(val);
          return (
            url.hostname.includes("youtube.com") ||
            url.hostname.includes("youtu.be")
          );
        } catch {
          return false;
        }
      },
      { message: "Harus berupa link YouTube valid." },
    ),

  // IMAGE: Boleh null/undefined.
  image: z
    .any()
    .nullable() // Izinkan null
    .optional() // Izinkan undefined
    .refine(
      (file) => {
        // Jika tidak ada file (null/undefined/size 0), lolos validasi
        if (!file || file.size === 0 || file === "undefined") return true;
        // Jika file ada, cek size
        return file.size <= MAX_FILE_SIZE;
      },
      { message: "Ukuran gambar maksimal 5MB." },
    )
    .refine(
      (file) => {
        // Jika tidak ada file, lolos validasi
        if (!file || file.size === 0 || file === "undefined") return true;
        // Jika file ada, cek tipe
        return ACCEPTED_IMAGE_TYPES.includes(file.type);
      },
      { message: "Format gambar harus .jpg, .png, atau .webp." },
    ),
});

// Helper Upload Image (Sama seperti sebelumnya)
export async function uploadImage(file, folder = "courses") {
  if (!file || file.size === 0 || file === "undefined") return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name ? file.name.split(".").pop() : "jpg";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${folder}-${uniqueSuffix}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public/uploads", folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    return `/uploads/${folder}/${filename}`;
  } catch (error) {
    console.error("Upload Error:", error);
    return null;
  }
}
