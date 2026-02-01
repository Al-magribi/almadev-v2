"use client";

import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react"; // TAMBAHKAN Loader2 DISINI
import Image from "next/image";
import { useActionState, useEffect } from "react"; // React 19 / Next.js 15
import { signinUser } from "@/actions/auth-action";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default function SignInPage() {
  const [state, action] = useActionState(signinUser, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message, { duration: 3000 });
        const targetUrl = state.redirectUrl || "/";

        router.replace(targetUrl);
        router.refresh();
      } else {
        toast.error(state.message);
      }
    }
  }, [state, router]);

  return (
    <div className='p-8'>
      <div className='flex gap-3 items-center mb-8'>
        <Link href={"/"}>
          <Image src={"/logo.svg"} width={65} height={65} alt='logo_almadev' />
        </Link>

        <div className='text-start'>
          <h1 className='text-2xl font-bold text-white mb-2'>
            Selamat Datang Kembali
          </h1>
          <p className='text-gray-400 text-sm'>
            Masuk untuk melanjutkan pembelajaran Anda
          </p>
        </div>
      </div>

      <form action={action} className='space-y-6'>
        {/* Email Input */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-300'>Email</label>
          <div className='relative'>
            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500' />
            <input
              name='email'
              type='email'
              placeholder='nama@email.com'
              className='w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-gray-600'
            />
          </div>
        </div>

        {/* Password Input */}
        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <label className='text-sm font-medium text-gray-300'>
              Password
            </label>
            <Link href='/forgot' className='text-xs text-blue-500 hover:text-blue-400'>
              Lupa password?
            </Link>
          </div>
          <div className='relative'>
            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500' />
            <input
              name='password'
              type='password'
              placeholder='••••••••'
              className='w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-gray-600'
            />
          </div>
        </div>

        {/* --- 2. PANGGIL COMPONENT TOMBOL DI SINI --- */}
        <SubmitButton label={"Signin"} icon={ArrowRight} iconPosition='right' />
      </form>

      {/* Footer */}
      <div className='mt-8 pt-6 border-t border-gray-800 text-center'>
        <p className='text-gray-400 text-sm'>
          Belum punya akun?{" "}
          <Link
            href='/signup'
            className='text-blue-500 hover:text-blue-400 font-medium hover:underline'
          >
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
