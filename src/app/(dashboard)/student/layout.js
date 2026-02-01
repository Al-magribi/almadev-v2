"use server";

import { getUserProfile } from "@/actions/user-actions";
import StudentShell from "@/components/student/StudentShell";
import { redirect } from "next/navigation";

export default async function StudentLayout({ children }) {
  const { success, data: user } = await getUserProfile();

  const currentUser = success ? user : null;

  if (!user) {
    redirect("/signin");
  }
  if (user.role === "admin") {
    redirect("/admin");
  }

  return <StudentShell user={currentUser}>{children}</StudentShell>;
}
