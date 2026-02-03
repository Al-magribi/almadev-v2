import { getUserProfile } from "@/actions/user-actions";
import BootcampShell from "@/components/bootcamp/BootcampShell";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BootcampLayout({ children }) {
  const { success, data: user } = await getUserProfile();
  const currentUser = success ? user : null;

  if (!currentUser) {
    redirect("/signin");
  }
  if (currentUser.role !== "bootcamp") {
    redirect(currentUser.role === "admin" ? "/admin" : "/student");
  }

  return <BootcampShell user={currentUser}>{children}</BootcampShell>;
}
