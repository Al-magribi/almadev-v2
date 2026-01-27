// src/app/admin/courses/create/Create.js
"use client";

import { createCourse } from "@/actions/course-actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Plus, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";

export default function Create() {
  const router = useRouter();
  const [state, action] = useActionState(createCourse, null);

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message, { duration: 3000 });
        router.replace(state.redirectUrl);
        router.refresh();
      } else {
        toast.error(state.message);
      }
    }
  }, [state, router]);

  return (
    <div className='flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors'>
      <div className='flex items-center gap-4 mb-4 sm:mb-0'>
        <div className='p-3 bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl hidden sm:block'>
          <LayoutGrid size={24} />
        </div>
        <div>
          <h1 className='text-xl font-bold text-zinc-900 dark:text-zinc-100'>
            Courses Manager
          </h1>
          <p className='text-zinc-500 dark:text-zinc-400 text-sm'>
            Manage your curriculum and students
          </p>
        </div>
      </div>

      {/* Form Create Course */}
      <form
        action={action}
        className='flex w-full sm:w-auto items-center gap-3'
      >
        <div className='relative flex-1 sm:w-80'>
          <input
            type='text'
            name='name'
            placeholder='e.g. Advanced React Patterns'
            required
            className='w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600'
          />
        </div>

        <input type='hidden' name='price' value='0' />

        <div className='shrink-0'>
          <SubmitButton label='Create' icon={Plus} />
        </div>
      </form>
    </div>
  );
}
