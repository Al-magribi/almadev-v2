"use client";

import { useState, useEffect, useActionState } from "react";
import { getUserProfile, updateUserProfile } from "@/actions/user-actions";
import { LogOut } from "lucide-react";

// Import Components
import AccountHeader from "@/components/admin/account/AccountHeader";
import ProfileAvatarCard from "@/components/admin/account/ProfileAvatarCard";
import ProfileDetailsForm from "@/components/admin/account/ProfileDetailsForm";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [formState, formAction] = useActionState(updateUserProfile, null);

  useEffect(() => {
    async function loadData() {
      const res = await getUserProfile();
      if (res.success) {
        setUser(res.data);
      } else {
        setFetchError(res.error);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (fetchError || !user) {
    return (
      <div className='min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 gap-4 transition-colors duration-300'>
        <div className='p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 text-center max-w-md'>
          <div className='w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <LogOut className='text-red-500 w-6 h-6' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2'>
            Akses Ditolak
          </h3>
          <p className='text-gray-500 dark:text-zinc-400 mb-6'>
            {fetchError || "Sesi Anda telah berakhir."}
          </p>
          <a
            href='/login'
            className='inline-flex px-6 py-2.5 bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:bg-black dark:hover:bg-white/90 transition-all font-medium'
          >
            Login Kembali
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50/50 dark:bg-zinc-950  font-sans transition-colors duration-300'>
      <div className='max-w-5xl  space-y-10'>
        {/* Header Component */}
        <AccountHeader role={user.role} />

        {/* Form Container */}
        <form
          action={formAction}
          className='grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100'
        >
          {/* Left Column: Avatar */}
          <div className='lg:col-span-4 space-y-6'>
            <ProfileAvatarCard user={user} />
          </div>

          {/* Right Column: Details */}
          <div className='lg:col-span-8'>
            <ProfileDetailsForm user={user} state={formState} />
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-zinc-950 p-12 flex justify-center transition-colors duration-300'>
      <div className='w-full max-w-5xl space-y-10 animate-pulse'>
        <div className='h-10 bg-gray-200 dark:bg-zinc-800 rounded-lg w-1/3'></div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-10'>
          <div className='h-80 bg-gray-200 dark:bg-zinc-800 rounded-3xl'></div>
          <div className='lg:col-span-2 h-500px bg-gray-200 dark:bg-zinc-800 rounded-3xl'></div>
        </div>
      </div>
    </div>
  );
}
