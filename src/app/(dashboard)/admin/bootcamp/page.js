import BootcampTabs from "@/components/admin/bootcamp/BootcampTabs";
import {
  getBootcampExercises,
  getBootcampParticipants,
} from "@/actions/bootcamp-actions";
import { GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBootcamp() {
  const [participantsRes, exercisesRes] = await Promise.all([
    getBootcampParticipants(),
    getBootcampExercises(),
  ]);

  return (
    <div className='space-y-6 max-w-7xl mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors'>
        <div className='flex items-center gap-4 mb-4 sm:mb-0'>
          <div className='p-3 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl hidden sm:block'>
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className='text-xl font-bold text-zinc-900 dark:text-zinc-100'>
              Manajemen Bootcamp
            </h1>
            <p className='text-zinc-500 dark:text-zinc-400 text-sm'>
              Kelola peserta dan latihan untuk program bootcamp.
            </p>
          </div>
        </div>
      </div>

      <BootcampTabs
        participants={participantsRes?.data || []}
        exercises={exercisesRes?.data || []}
      />
    </div>
  );
}
