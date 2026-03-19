import { getStudents } from "@/actions/user-actions";
import AdminParticipantsClient from "@/components/admin/participants/AdminParticipantsClient";

export default async function AdminStudents() {
  const { success, data: students } = await getStudents();

  if (!success) {
    return (
      <div className='p-4 text-red-500 dark:text-red-400'>
        Gagal memuat data siswa.
      </div>
    );
  }

  return <AdminParticipantsClient students={students} />;
}
