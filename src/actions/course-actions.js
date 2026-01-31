// File: app/actions/course-actions.js
"use server";

import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Landing from "@/models/Landing";
import Qna from "@/models/Qna";
import { revalidatePath } from "next/cache";
import {
  createCourseSchema,
  deleteFile,
  uploadImage,
} from "@/lib/server-utils";
import Transaction from "@/models/Transaction";

// 1. LIST COURSES
export async function getCourses() {
  await dbConnect();
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 }).lean();

    // --- PERBAIKAN: DEEP SANITIZATION ---
    // Menggunakan JSON.parse(JSON.stringify()) memaksa seluruh data
    // (termasuk nested array di dalam curriculum) menjadi plain object.
    // Ini otomatis memperbaiki error "Only plain objects..." untuk semua level kedalaman.
    const plainCourses = JSON.parse(JSON.stringify(courses));

    return plainCourses;
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}
// 2. CREATE COURSE
export async function createCourse(prevState, formData) {
  // Ambil raw data
  const rawName = formData.get("name");
  const rawVideo = formData.get("video");
  const rawImage = formData.get("image");

  // SANITASI DATA:
  // Ubah null (karena input tidak ada di form) menjadi undefined
  // agar Zod menganggapnya sebagai field opsional yang kosong.
  const rawData = {
    name: rawName,
    video: rawVideo === null ? undefined : rawVideo,
    image: rawImage === null ? undefined : rawImage,
  };

  // Validasi Zod
  const validatedFields = createCourseSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error(
      "Validation Errors:",
      validatedFields.error.flatten().fieldErrors,
    );
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validasi gagal. Mohon periksa input Anda.",
    };
  }

  const { name, video, image } = validatedFields.data;

  try {
    await dbConnect();

    // Upload Gambar (Hanya jika file valid ada)
    let imagePath = "";
    if (image && image.size > 0) {
      imagePath = await uploadImage(image, "thumbnails");
    }

    // Simpan ke DB
    const newCourse = await Course.create({
      name,
      price: 0,
      image: imagePath || "",
      video: video || "",
      description: "Draft description...",
      isActive: false,
      curriculum: [],
    });

    // Buat Landing Page
    await Landing.create({
      name: name,
      type: "Course",
      courseId: newCourse._id,
      hero: { headline: name },
    });

    revalidatePath("/admin/courses");

    return {
      success: true,
      message: "Course berhasil dibuat",
      redirectUrl: `/admin/courses/${newCourse._id}`,
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      message: "Gagal menyimpan ke database.",
    };
  }
}

// 3. UPDATE COURSE (BARU)
export async function updateCourse(courseId, formData) {
  try {
    await dbConnect();

    // 1. Extract Data Dasar Course
    const name = formData.get("name");
    const price = formData.get("price");
    const description = formData.get("description");
    const video = formData.get("video"); // YouTube Link
    const imageFile = formData.get("image"); // File Gambar Thumbnail Utama
    const isActive = formData.get("isActive") === "true";

    // 2. Extract Data JSON kompleks
    const curriculum = JSON.parse(formData.get("curriculum") || "[]");
    const objectives = JSON.parse(formData.get("objectives") || "[]");

    // Ambil Data Landing Page
    const landingData = JSON.parse(formData.get("landingData") || "{}");

    // 3. Handle Upload Thumbnail Course (Jika ada file baru)
    let imagePath;
    if (imageFile && imageFile.size > 0 && imageFile !== "undefined") {
      imagePath = await uploadImage(imageFile, "thumbnails");
    }

    // 4. --- LOGIKA BARU: Handle Upload Gambar Gallery ---
    // Kita harus loop object gallery untuk mencari marker "__UPLOAD__:"
    if (landingData.gallery?.items) {
      // Loop setiap Project
      for (let pIdx = 0; pIdx < landingData.gallery.items.length; pIdx++) {
        const project = landingData.gallery.items[pIdx];

        // Loop setiap Gambar di dalam Project
        if (project.images && Array.isArray(project.images)) {
          for (let imgIdx = 0; imgIdx < project.images.length; imgIdx++) {
            const imgStr = project.images[imgIdx];

            // Cek apakah string URL diawali marker upload khusus
            if (
              imgStr &&
              typeof imgStr === "string" &&
              imgStr.startsWith("__UPLOAD__:")
            ) {
              // Extract key FormData, contoh: "gallery_upload_0_0"
              const fileKey = imgStr.split(":")[1];

              // Ambil file fisik dari FormData
              const file = formData.get(fileKey);

              if (file && file.size > 0) {
                // Upload ke folder 'gallery'
                const uploadedUrl = await uploadImage(file, "gallery");

                // Ganti marker di JSON dengan URL asli hasil upload
                landingData.gallery.items[pIdx].images[imgIdx] = uploadedUrl;
              } else {
                // Jika file gagal diambil/kosong, hapus entry atau biarkan string kosong
                landingData.gallery.items[pIdx].images[imgIdx] = "";
              }
            }
          }
          // Filter URL kosong agar array bersih (opsional)
          project.images = project.images.filter((url) => url !== "");
        }
      }
    }
    // ----------------------------------------------------

    // 5. Update Data Utama Course ke Database
    const updatePayload = {
      name,
      price: Number(price),
      description,
      video,
      isActive,
      curriculum,
      objectives,
    };

    // Jika ada thumbnail baru, update field image
    if (imagePath) {
      updatePayload.image = imagePath;
    }

    await Course.findByIdAndUpdate(courseId, updatePayload);

    // 6. Update Data Landing Page (Termasuk Gallery yang sudah diproses URL-nya)
    await Landing.findOneAndUpdate(
      { courseId: courseId },
      {
        $set: {
          "hero.headline": landingData.hero?.headline,
          "hero.customSubtitle": landingData.hero?.customSubtitle,

          "pricing.items": landingData.pricing?.items,

          "testimonials.items": landingData.testimonials?.items,

          "faqs.items": landingData.faqs?.items,

          // Simpan gallery yang URL-nya sudah diganti dari marker menjadi URL asli
          "gallery.items": landingData.gallery?.items,
        },
      },
      { upsert: true }, // Buat document landing baru jika belum ada
    );

    // 7. Revalidate Cache
    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}`);

    return { success: true, message: "Perubahan berhasil disimpan!" };
  } catch (error) {
    console.error("Update Error:", error);
    return {
      success: false,
      message: "Gagal menyimpan perubahan: " + error.message,
    };
  }
}

// ... Fungsi deleteCourse dan getCourseDetail dibiarkan sama ...
export async function deleteCourse(courseId) {
  try {
    await dbConnect();

    // 1. Cari Course dulu untuk ambil path gambarnya
    const course = await Course.findById(courseId);

    if (!course) {
      return { success: false, message: "Course tidak ditemukan" };
    }

    // 2. Hapus file gambar thumbnail Course
    if (course.image) {
      await deleteFile(course.image);
    }

    // (Opsional) Jika Anda ingin menghapus gambar-gambar di Gallery Landing page juga:
    // Anda perlu mencari document Landing, meloop array gallery, dan memanggil deleteFile satu per satu.
    // Untuk saat ini, kita fokus ke thumbnail utama course agar aman.

    // 3. Hapus data dari Database
    await Course.findByIdAndDelete(courseId);
    await Landing.findOneAndDelete({ courseId });

    // Hapus juga QnA terkait jika perlu (Good Practice untuk kebersihan DB)
    await Qna.deleteMany({ courseId });

    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("Delete Course Error:", error);
    return { success: false, message: "Gagal menghapus data" };
  }
}

export async function getCourseDetail(courseId) {
  await dbConnect();
  try {
    const course = await Course.findById(courseId).lean();
    if (!course) return null;

    const landing = await Landing.findOne({ courseId }).lean();
    const qnas = await Qna.find({ courseId }).lean();

    return {
      // Perbaiki Object Course
      course: {
        ...course,
        _id: course._id.toString(),
        // Konversi Date ke String ISO agar aman dikirim ke client
        createdAt: course.createdAt ? course.createdAt.toISOString() : null,
        updatedAt: course.updatedAt ? course.updatedAt.toISOString() : null,
      },
      // Perbaiki Object Landing
      landing: landing
        ? {
            ...landing,
            _id: landing._id.toString(),
            // PERBAIKAN UTAMA: convert courseId dari ObjectId ke string
            courseId: landing.courseId.toString(),
            // Konversi Date ke String ISO
            createdAt: landing.createdAt
              ? landing.createdAt.toISOString()
              : null,
            updatedAt: landing.updatedAt
              ? landing.updatedAt.toISOString()
              : null,
          }
        : null,
      qnaCount: qnas ? qnas.length : 0,
    };
  } catch (error) {
    console.error("Get Detail Error:", error);
    return null;
  }
}

// ✅ MY COURSES: LIST KURSUS YANG SUDAH DIBELI USER
export async function getPurchasedCoursesByUser(userId) {
  await dbConnect();
  if (!userId) return [];

  try {
    const txs = await Transaction.find({
      userId, // boleh string atau ObjectId, mongoose akan cast
      status: "completed",
      itemType: "Course",
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "item", // ✅ ini yang benar: virtual "item"
        select:
          "name image description rating totalReviews type isActive price", // optional
      })
      .lean({ virtuals: true });

    const plain = JSON.parse(JSON.stringify(txs));

    return plain
      .filter((t) => t.item) // ✅ sekarang terisi
      .map((t) => ({
        transactionCode: t.transactionCode,
        purchasedAt: t.createdAt,
        price: t.price,
        status: t.status,
        course: {
          _id: t.item._id,
          name: t.item.name,
          image: t.item.image,
          description: t.item.description,
          rating: t.item.rating,
          totalReviews: t.item.totalReviews,
          type: t.item.type,
          isActive: t.item.isActive,
        },
      }));
  } catch (e) {
    console.error("getPurchasedCoursesByUser error:", e);
    return [];
  }
}
