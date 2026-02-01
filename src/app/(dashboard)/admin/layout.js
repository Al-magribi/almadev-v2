import { getUserProfile } from "@/actions/user-actions";
import AdminClientLayout from "@/components/admin/AdminClientLayout"; // Import komponen baru tadi
import { redirect } from "next/navigation";

// Hapus "use client" agar bisa jadi async Server Component
export default async function AdminLayout({ children }) {
  // Fetch data di sisi server
  const { success, data: user } = await getUserProfile();

  const currentUser = success ? user : null;
  if (!currentUser) {
    redirect("/signin");
  }
  if (currentUser.role !== "admin") {
    redirect("/student");
  }

  // Render Client Layout dan oper datanya
  return <AdminClientLayout user={currentUser}>{children}</AdminClientLayout>;
}
