// File: app/admin/courses/page.js
import { getCourses } from "@/actions/course-actions";
import Create from "./create/Create";
import CourseList from "@/components/admin/courses/CourseList";

export const dynamic = "force-dynamic"; // Memastikan data selalu update saat di-refresh

export default async function CoursesPage() {
  // Ambil data di Server (ini yang mencegah error .map)
  const courses = await getCourses();

  // Lempar data ke Client Component
  return (
    <div className='space-y-6'>
      <Create />

      <CourseList courses={courses} />
    </div>
  );
}
