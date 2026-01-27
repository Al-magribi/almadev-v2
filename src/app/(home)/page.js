import Hero from "@/components/home/Hero";
import Courses from "@/components/home/Courses";
import Products from "@/components/home/Products";
import { getCourses } from "@/actions/course-actions"; //

export const dynamic = "force-dynamic"; // Pastikan data selalu fresh

export default async function Homepage() {
  // 1. Fetch data dari database (Server Side)
  const courses = await getCourses();

  return (
    <div className='pb-20'>
      <Hero />

      {/* 2. Oper data courses ke komponen */}
      <Courses data={courses} />

      <Products />
    </div>
  );
}
