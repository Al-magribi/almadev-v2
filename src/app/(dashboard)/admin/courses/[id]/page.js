// src/app/(dashboard)/admin/courses/[courseId]/page.js
import { getCourseDetail } from "@/actions/course-actions";
import CourseManager from "@/components/admin/courses/CourseManager";

export default async function CourseDetailPage({ params }) {
  // Await params sesuai aturan Next.js 15
  const resolvedParams = await params;
  const id = resolvedParams.id; // Pastikan sesuai nama folder ([id] atau [courseId])

  // Panggil data dari database
  const rawData = await getCourseDetail(id);

  if (!rawData) return <div>Course not found</div>;

  // PERBAIKAN UTAMA DISINI:
  // Kita melakukan trik JSON.stringify lalu JSON.parse.
  // Ini akan memaksa semua object MongoDB (_id, Date, dll) berubah menjadi
  // string/JSON murni sehingga aman diterima oleh Client Component.
  const cleanData = JSON.parse(JSON.stringify(rawData));

  return <CourseManager initialData={cleanData} />;
}
