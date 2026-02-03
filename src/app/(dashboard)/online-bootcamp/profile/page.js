import StudentProfilePage from "@/components/student/profile/StudentProfilePage";
import { getUserProfile } from "@/actions/user-actions";

export default async function BootcampProfilePage() {
  const result = await getUserProfile();
  const user = result?.success ? result.data : null;

  return <StudentProfilePage user={user} />;
}
