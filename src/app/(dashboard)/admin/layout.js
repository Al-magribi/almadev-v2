import { getUserProfile } from "@/actions/user-actions";
import AdminClientLayout from "@/components/admin/AdminClientLayout"; // Import komponen baru tadi

// Hapus "use client" agar bisa jadi async Server Component
export default async function AdminLayout({ children }) {
  // Fetch data di sisi server
  const { success, data: user } = await getUserProfile();

  const currentUser = success ? user : null;

  // Render Client Layout dan oper datanya
  return <AdminClientLayout user={currentUser}>{children}</AdminClientLayout>;
}
