import CourseList from "@/components/student/myCourses/CourseList";
import { getCurrentUser } from "@/lib/auth-service";
import React from "react";

export default async function myCoursesPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <CourseList userId={user?.userId} />
    </div>
  );
}
