// File: app/actions/course-actions.js
"use server";

import dbConnect from "@/lib/db";
import Landing from "@/models/Landing";
import Qna from "@/models/Qna";
import { revalidatePath } from "next/cache";
import {
  createCourseSchema,
  deleteFile,
  uploadImage,
} from "@/lib/server-utils";
import Transaction from "@/models/Transaction";
import Progress from "@/models/Progress";
import { getCurrentUser } from "@/lib/auth-service";
import Editor from "@/models/Editor";
import Note from "@/models/Note";
import Course from "@/models/Course";

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

    const normalizedCurriculum = (curriculum || []).map((section, index) => ({
      ...section,
      order: index,
      lessons: (section.lessons || []).map((lesson, lessonIndex) => ({
        ...lesson,
        order: lessonIndex,
      })),
    }));

    const normalizedPricingItems = (landingData.pricing?.items || []).map(
      (item) => ({
        name: item?.name || "",
        subtitle: item?.subtitle || "",
        promoText: item?.promoText || "",
        buttonText: item?.buttonText || "",
        price: Number(item?.price) || 0,
        benefits: Array.isArray(item?.benefits)
          ? item.benefits.filter((benefit) => benefit)
          : [],
        isRecommended: Boolean(item?.isRecommended),
      }),
    );

    // 5. Update Data Utama Course ke Database
    const updatePayload = {
      name,
      price: Number(price),
      description,
      video,
      isActive,
      curriculum: normalizedCurriculum,
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

          "pricing.items": normalizedPricingItems,

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

export async function updateLessonProgress({
  courseId,
  lessonId,
  watchDuration,
  totalDuration,
  isCompleted,
}) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, message: "Unauthorized" };
  if (!courseId || !lessonId) {
    return { success: false, message: "Invalid payload" };
  }

  await dbConnect();

  const now = new Date();
  const safeWatch = Math.max(0, Number(watchDuration) || 0);
  const safeTotal = Math.max(0, Number(totalDuration) || 0);
  const completed = Boolean(isCompleted);

  await Progress.findOneAndUpdate(
    { userId: user.userId, courseId, lessonId },
    {
      $set: {
        userId: user.userId,
        courseId,
        lessonId,
        totalDuration: safeTotal,
        lastWatchedAt: now,
        ...(completed ? { isCompleted: true } : {}),
      },
      $max: { watchDuration: safeWatch },
    },
    { upsert: true },
  );

  return { success: true };
}

export async function getEditorEntries({ courseId, lessonId }) {
  const user = await getCurrentUser();
  if (!user?.userId) return [];
  if (!courseId) return [];

  await dbConnect();

  const entries = await Editor.find({
    user: user.userId,
    courseId,
    lessonId: lessonId || "general",
  })
    .sort({ updatedAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(entries)).map((entry) => ({
    id: String(entry._id),
    title: entry.title,
    language: entry.language,
    code: entry.code,
    createdAt: entry.createdAt ? entry.createdAt.toISOString() : null,
    updatedAt: entry.updatedAt ? entry.updatedAt.toISOString() : null,
  }));
}

export async function createEditorEntry({ courseId, lessonId, title, code }) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, message: "Unauthorized" };
  if (!courseId || !title) {
    return { success: false, message: "Data tidak lengkap" };
  }

  await dbConnect();

  const payload = {
    courseId,
    lessonId: lessonId || "general",
    user: user.userId,
    title,
    language: "web",
    code: typeof code === "string" ? code : JSON.stringify(code || {}),
  };

  const entry = await Editor.create(payload);

  return {
    success: true,
    data: {
      id: String(entry._id),
      title: entry.title,
      language: entry.language,
      code: entry.code,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    },
  };
}

export async function updateEditorEntry({ entryId, title, code }) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, message: "Unauthorized" };
  if (!entryId) return { success: false, message: "Data tidak lengkap" };

  await dbConnect();

  const entry = await Editor.findById(entryId);
  if (!entry) return { success: false, message: "Entry tidak ditemukan" };
  if (String(entry.user) !== String(user.userId)) {
    return { success: false, message: "Tidak diizinkan" };
  }

  if (title) entry.title = title;
  if (code !== undefined) {
    entry.code = typeof code === "string" ? code : JSON.stringify(code || {});
  }
  entry.updatedAt = new Date();
  await entry.save();

  return {
    success: true,
    data: {
      id: String(entry._id),
      title: entry.title,
      language: entry.language,
      code: entry.code,
      updatedAt: entry.updatedAt.toISOString(),
    },
  };
}

export async function deleteEditorEntry({ entryId }) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, message: "Unauthorized" };
  if (!entryId) return { success: false, message: "Data tidak lengkap" };

  await dbConnect();

  const entry = await Editor.findById(entryId);
  if (!entry) return { success: false, message: "Entry tidak ditemukan" };
  if (String(entry.user) !== String(user.userId)) {
    return { success: false, message: "Tidak diizinkan" };
  }

  await Editor.findByIdAndDelete(entryId);
  return { success: true };
}

export async function getNotes({ courseId, lessonId }) {
  const user = await getCurrentUser();
  if (!user?.userId) return [];
  if (!courseId) return [];

  await dbConnect();

  const notes = await Note.find({
    user: user.userId,
    courseId,
    lessonId: lessonId || "general",
  })
    .sort({ updatedAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(notes)).map((note) => ({
    id: String(note._id),
    title: note.title,
    content: note.content,
    createdAt: note.createdAt ? note.createdAt.toISOString() : null,
    updatedAt: note.updatedAt ? note.updatedAt.toISOString() : null,
  }));
}

export async function createNote({ courseId, lessonId, title, content }) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, message: "Unauthorized" };
  if (!courseId || !title || !content) {
    return { success: false, message: "Data tidak lengkap" };
  }

  await dbConnect();

  const note = await Note.create({
    user: user.userId,
    courseId,
    lessonId: lessonId || "general",
    title,
    content,
  });

  return {
    success: true,
    data: {
      id: String(note._id),
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    },
  };
}

export async function updateNote({ noteId, title, content }) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, message: "Unauthorized" };
  if (!noteId) return { success: false, message: "Data tidak lengkap" };

  await dbConnect();

  const note = await Note.findById(noteId);
  if (!note) return { success: false, message: "Catatan tidak ditemukan" };
  if (String(note.user) !== String(user.userId)) {
    return { success: false, message: "Tidak diizinkan" };
  }

  if (title) note.title = title;
  if (content) note.content = content;
  note.updatedAt = new Date();
  await note.save();

  return {
    success: true,
    data: {
      id: String(note._id),
      title: note.title,
      content: note.content,
      updatedAt: note.updatedAt.toISOString(),
    },
  };
}

export async function deleteNote({ noteId }) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, message: "Unauthorized" };
  if (!noteId) return { success: false, message: "Data tidak lengkap" };

  await dbConnect();

  const note = await Note.findById(noteId);
  if (!note) return { success: false, message: "Catatan tidak ditemukan" };
  if (String(note.user) !== String(user.userId)) {
    return { success: false, message: "Tidak diizinkan" };
  }

  await Note.findByIdAndDelete(noteId);
  return { success: true };
}

const extractImageUrls = (html) => {
  if (!html || typeof html !== "string") return [];
  const urls = [];
  const regex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    urls.push(match[1]);
  }
  return urls;
};

const deleteQnaImages = async (contents) => {
  const urls = contents.flatMap((content) => extractImageUrls(content));
  const uniqueUrls = Array.from(new Set(urls));
  await Promise.all(uniqueUrls.map((url) => deleteFile(url)));
};

export async function uploadQnaImage(file) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, message: "Unauthorized" };
  if (!file || file.size === 0) {
    return { success: false, message: "File kosong" };
  }

  await dbConnect();
  const url = await uploadImage(file, "qna");
  if (!url) return { success: false, message: "Upload gagal" };
  return { success: true, url };
}

export async function createQnaQuestion({
  courseId,
  title,
  content,
  lessonId,
}) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, message: "Unauthorized" };
  if (!courseId || !title || !content) {
    return { success: false, message: "Data tidak lengkap" };
  }

  await dbConnect();

  const question = await Qna.create({
    courseId,
    lessonId: lessonId || "general",
    user: user.userId,
    title,
    content,
    isQuestion: true,
    isInstructor: false,
  });

  return {
    success: true,
    data: {
      id: String(question._id),
      title: question.title,
      content: question.content,
      createdAt: question.createdAt.toISOString(),
      repliesCount: 0,
      isResolved: false,
      isPinned: false,
      isInstructor: question.isInstructor,
      user: { id: String(user.userId), name: user.name || "User" },
      replies: [],
    },
  };
}

export async function updateQnaQuestion({ qnaId, title, content }) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, message: "Unauthorized" };
  if (!qnaId) return { success: false, message: "Data tidak lengkap" };

  await dbConnect();
  const qna = await Qna.findById(qnaId);
  if (!qna) return { success: false, message: "QnA tidak ditemukan" };
  if (String(qna.user) !== String(user.userId)) {
    return { success: false, message: "Tidak diizinkan" };
  }

  if (title) qna.title = title;
  if (content) qna.content = content;
  await qna.save();

  return {
    success: true,
    data: {
      id: String(qna._id),
      title: qna.title,
      content: qna.content,
    },
  };
}

export async function deleteQnaQuestion({ qnaId }) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, message: "Unauthorized" };
  if (!qnaId) return { success: false, message: "Data tidak lengkap" };

  await dbConnect();
  const qna = await Qna.findById(qnaId);
  if (!qna) return { success: false, message: "QnA tidak ditemukan" };
  if (String(qna.user) !== String(user.userId)) {
    return { success: false, message: "Tidak diizinkan" };
  }

  const contents = [
    qna.content,
    ...(qna.replies || []).map((reply) => reply.content),
  ];
  await deleteQnaImages(contents);

  await Qna.findByIdAndDelete(qnaId);
  return { success: true };
}

export async function createQnaReply({ qnaId, content }) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, message: "Unauthorized" };
  if (!qnaId || !content) {
    return { success: false, message: "Data tidak lengkap" };
  }

  await dbConnect();
  const qna = await Qna.findById(qnaId);
  if (!qna) return { success: false, message: "QnA tidak ditemukan" };

  qna.replies.push({
    user: user.userId,
    content,
    isInstructor: false,
  });
  await qna.save();

  const reply = qna.replies[qna.replies.length - 1];

  return {
    success: true,
    data: {
      id: String(reply._id),
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
      isInstructor: reply.isInstructor,
      user: { id: String(user.userId), name: user.name || "User" },
      likesCount: reply.likes?.length || 0,
      liked: false,
    },
  };
}

export async function updateQnaReply({ qnaId, replyId, content }) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, message: "Unauthorized" };
  if (!qnaId || !replyId || !content) {
    return { success: false, message: "Data tidak lengkap" };
  }

  await dbConnect();
  const qna = await Qna.findById(qnaId);
  if (!qna) return { success: false, message: "QnA tidak ditemukan" };

  const reply = qna.replies.id(replyId);
  if (!reply) return { success: false, message: "Balasan tidak ditemukan" };
  if (String(reply.user) !== String(user.userId)) {
    return { success: false, message: "Tidak diizinkan" };
  }

  reply.content = content;
  await qna.save();

  return {
    success: true,
    data: {
      id: String(reply._id),
      content: reply.content,
    },
  };
}

export async function deleteQnaReply({ qnaId, replyId }) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, message: "Unauthorized" };
  if (!qnaId || !replyId) {
    return { success: false, message: "Data tidak lengkap" };
  }

  await dbConnect();
  const qna = await Qna.findById(qnaId);
  if (!qna) return { success: false, message: "QnA tidak ditemukan" };

  const reply = qna.replies.id(replyId);
  if (!reply) return { success: false, message: "Balasan tidak ditemukan" };
  if (String(reply.user) !== String(user.userId)) {
    return { success: false, message: "Tidak diizinkan" };
  }

  await deleteQnaImages([reply.content]);

  reply.deleteOne();
  await qna.save();

  return { success: true };
}

export async function toggleQnaReplyLike({ qnaId, replyId }) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, message: "Unauthorized" };
  if (!qnaId || !replyId) {
    return { success: false, message: "Data tidak lengkap" };
  }

  await dbConnect();
  const qna = await Qna.findById(qnaId);
  if (!qna) return { success: false, message: "QnA tidak ditemukan" };

  const reply = qna.replies.id(replyId);
  if (!reply) return { success: false, message: "Balasan tidak ditemukan" };

  if (!Array.isArray(reply.likes)) {
    reply.likes = [];
  }

  const existingIndex = reply.likes.findIndex(
    (like) => String(like.user) === String(user.userId),
  );

  if (existingIndex >= 0) {
    reply.likes.splice(existingIndex, 1);
  } else {
    reply.likes.push({ user: user.userId });
  }

  await qna.save();

  return {
    success: true,
    data: {
      liked: existingIndex < 0,
      likesCount: reply.likes.length,
    },
  };
}

export async function getQnaByCourse({ courseId }) {
  const user = await getCurrentUser();
  if (!user?.userId) return { success: false, data: [] };
  if (!courseId) return { success: false, data: [] };

  await dbConnect();
  const course = await Course.findById(courseId)
    .select("name curriculum")
    .lean();
  const items = await Qna.find({ courseId })
    .populate("user", "name")
    .populate("replies.user", "name")
    .sort({ isPinned: -1, createdAt: -1 })
    .lean();

  const data = items.map((item) => {
    const context = getModuleLessonTitle(course, item.lessonId);
    return {
      id: String(item._id),
      title: item.title,
      content: item.content,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      repliesCount: item.replies?.length || 0,
      isResolved: item.isResolved,
      isPinned: item.isPinned,
      isInstructor: item.isInstructor,
      user: item.user
        ? { id: String(item.user._id), name: item.user.name }
        : null,
      course: course ? { id: String(course._id), name: course.name } : null,
      moduleTitle: context?.moduleTitle || null,
      lessonTitle: context?.lessonTitle || null,
      replies: (item.replies || []).map((reply) => ({
        id: String(reply._id),
        content: reply.content,
        createdAt: reply.createdAt ? reply.createdAt.toISOString() : null,
        isInstructor: reply.isInstructor,
        likesCount: reply.likes?.length || 0,
        liked: reply.likes?.some(
          (like) => String(like.user) === String(user.userId),
        ),
        user: reply.user
          ? { id: String(reply.user._id), name: reply.user.name }
          : null,
      })),
    };
  });

  return { success: true, data };
}

export async function getAdminQna({ page = 1, limit = 20, filter = "all" }) {
  const user = await getCurrentUser();
  if (!user?.userId || user.role !== "admin")
    return { success: false, data: [] };

  await dbConnect();

  const query =
    filter === "solved"
      ? { isResolved: true }
      : filter === "unsolved"
        ? { isResolved: false }
        : {};

  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
  const skip = (Number(page) - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Qna.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("user", "name")
      .populate("replies.user", "name")
      .populate("courseId", "name curriculum")
      .lean(),
    Qna.countDocuments(query),
  ]);

  const data = items.map((item) => {
    const course = item.courseId;
    let moduleNumber = null;
    let lessonNumber = null;
    let moduleTitle = null;
    let lessonTitle = null;

    if (course?.curriculum && item.lessonId) {
      for (let i = 0; i < course.curriculum.length; i++) {
        const section = course.curriculum[i];
        const lessonIndex = (section.lessons || []).findIndex(
          (lesson) => String(lesson._id) === String(item.lessonId),
        );
        if (lessonIndex >= 0) {
          moduleNumber = i + 1;
          lessonNumber = lessonIndex + 1;
          moduleTitle = section.title || null;
          lessonTitle = section.lessons?.[lessonIndex]?.title || null;
          break;
        }
      }
    }

    return {
      id: String(item._id),
      title: item.title,
      content: item.content,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      isResolved: item.isResolved,
      user: item.user
        ? { id: String(item.user._id), name: item.user.name }
        : null,
      course: course ? { id: String(course._id), name: course.name } : null,
      moduleNumber,
      lessonNumber,
      moduleTitle,
      lessonTitle,
      repliesCount: item.replies?.length || 0,
      replies: (item.replies || []).map((reply) => ({
        id: String(reply._id),
        content: reply.content,
        createdAt: reply.createdAt ? reply.createdAt.toISOString() : null,
        isInstructor: reply.isInstructor,
        likesCount: reply.likes?.length || 0,
        liked: reply.likes?.some(
          (like) => String(like.user) === String(user.userId),
        ),
        user: reply.user
          ? { id: String(reply.user._id), name: reply.user.name }
          : null,
      })),
    };
  });

  return {
    success: true,
    data,
    hasMore: skip + data.length < total,
  };
}

function getModuleLessonTitle(course, lessonId) {
  if (!course?.curriculum || !lessonId) return null;
  for (const section of course.curriculum) {
    const lesson = (section.lessons || []).find(
      (item) => String(item._id) === String(lessonId),
    );
    if (lesson) {
      return {
        moduleTitle: section.title || null,
        lessonTitle: lesson.title || null,
      };
    }
  }
  return null;
}

export async function toggleQnaSolvedAdmin({ qnaId, isResolved }) {
  const user = await getCurrentUser();
  if (!user?.userId || user.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }
  if (!qnaId) return { success: false, message: "Data tidak lengkap" };

  await dbConnect();
  const qna = await Qna.findByIdAndUpdate(
    qnaId,
    { isResolved: Boolean(isResolved) },
    { new: true },
  );

  if (!qna) return { success: false, message: "QnA tidak ditemukan" };

  return {
    success: true,
    data: { id: String(qna._id), isResolved: qna.isResolved },
  };
}

export async function deleteQnaAdmin({ qnaId }) {
  const user = await getCurrentUser();
  if (!user?.userId || user.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }
  if (!qnaId) return { success: false, message: "Data tidak lengkap" };

  await dbConnect();
  const qna = await Qna.findById(qnaId);
  if (!qna) return { success: false, message: "QnA tidak ditemukan" };

  const contents = [
    qna.content,
    ...(qna.replies || []).map((reply) => reply.content),
  ];
  await deleteQnaImages(contents);

  await Qna.findByIdAndDelete(qnaId);
  return { success: true };
}

export async function updateQnaQuestionAdmin({ qnaId, title, content }) {
  const user = await getCurrentUser();
  if (!user?.userId || user.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }
  if (!qnaId) return { success: false, message: "Data tidak lengkap" };

  await dbConnect();
  const qna = await Qna.findById(qnaId);
  if (!qna) return { success: false, message: "QnA tidak ditemukan" };

  if (title) qna.title = title;
  if (content) qna.content = content;
  await qna.save();

  return {
    success: true,
    data: {
      id: String(qna._id),
      title: qna.title,
      content: qna.content,
      updatedAt: qna.updatedAt ? qna.updatedAt.toISOString() : null,
    },
  };
}

export async function updateQnaReplyAdmin({ qnaId, replyId, content }) {
  const user = await getCurrentUser();
  if (!user?.userId || user.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }
  if (!qnaId || !replyId || !content) {
    return { success: false, message: "Data tidak lengkap" };
  }

  await dbConnect();
  const qna = await Qna.findById(qnaId);
  if (!qna) return { success: false, message: "QnA tidak ditemukan" };

  const reply = qna.replies.id(replyId);
  if (!reply) return { success: false, message: "Balasan tidak ditemukan" };

  reply.content = content;
  await qna.save();

  return {
    success: true,
    data: {
      id: String(reply._id),
      content: reply.content,
      updatedAt: reply.updatedAt ? reply.updatedAt.toISOString() : null,
    },
  };
}

export async function deleteQnaReplyAdmin({ qnaId, replyId }) {
  const user = await getCurrentUser();
  if (!user?.userId || user.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }
  if (!qnaId || !replyId) {
    return { success: false, message: "Data tidak lengkap" };
  }

  await dbConnect();
  const qna = await Qna.findById(qnaId);
  if (!qna) return { success: false, message: "QnA tidak ditemukan" };

  const reply = qna.replies.id(replyId);
  if (!reply) return { success: false, message: "Balasan tidak ditemukan" };

  await deleteQnaImages([reply.content]);

  reply.deleteOne();
  await qna.save();

  return { success: true };
}

export async function createQnaReplyAdmin({ qnaId, content }) {
  const user = await getCurrentUser();
  if (!user?.userId || user.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }
  if (!qnaId || !content) {
    return { success: false, message: "Data tidak lengkap" };
  }

  await dbConnect();
  const qna = await Qna.findById(qnaId);
  if (!qna) return { success: false, message: "QnA tidak ditemukan" };

  qna.replies.push({
    user: user.userId,
    content,
    isInstructor: true,
  });
  await qna.save();

  const reply = qna.replies[qna.replies.length - 1];

  return {
    success: true,
    data: {
      id: String(reply._id),
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
      isInstructor: reply.isInstructor,
      user: { id: String(user.userId), name: user.name || "Admin" },
      likesCount: reply.likes?.length || 0,
      liked: false,
    },
  };
}
