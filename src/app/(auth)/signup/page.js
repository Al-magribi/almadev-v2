"use client";

import Link from "next/link";
import { User, Mail, Lock, Phone, ArrowRight, Loader2 } from "lucide-react";
// PERUBAHAN 1: Import useActionState dari 'react', bukan 'react-dom'
// useFormStatus tetap dari 'react-dom'
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signupUser } from "@/actions/auth-action";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

// Komponen Tombol Submit (Tetap menggunakan useFormStatus)
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type='submit'
      disabled={pending}
      className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:cursor-not-allowed'
    >
      {pending ? (
        <>
          <Loader2 className='h-4 w-4 animate-spin' />
          Memproses...
        </>
      ) : (
        <>
          Ya, Daftar
          <ArrowRight className='h-4 w-4 group-hover:translate-x-1 transition-transform' />
        </>
      )}
    </button>
  );
}

export default function SignUpPage() {
  // PERUBAHAN 2: Ganti useFormState menjadi useActionState
  const [state, action] = useActionState(signupUser, null);

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message, { duration: 5000 });
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <div className='p-8'>
      <div className='flex gap-3 items-center mb-8'>
        <Link href={"/"}>
          <Image src='/logo.svg' alt='logo_almadev' width={65} height={65} />
        </Link>

        <div className='text-start'>
          <h1 className='text-2xl font-bold text-white mb-2'>Buat Akun Baru</h1>
          <p className='text-gray-400 text-sm'>
            Mulai perjalanan menjadi Web Developer
          </p>
        </div>
      </div>

      <form action={action} className='space-y-5'>
        {/* Name Input */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-300'>
            Nama Lengkap
          </label>
          <div className='relative'>
            <User className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500' />
            <input
              name='name'
              type='text'
              required
              placeholder='John Doe'
              className='w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-gray-600'
            />
          </div>
        </div>

        {/* Email Input */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-300'>Email</label>
          <div className='relative'>
            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500' />
            <input
              name='email'
              type='email'
              required
              placeholder='nama@email.com'
              className='w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-gray-600'
            />
          </div>
        </div>

        {/* Phone Input */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-300'>
            WhatsApp / HP
          </label>
          <div className='relative'>
            <Phone className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500' />
            <input
              name='phone'
              type='tel'
              required
              placeholder='08123456789'
              className='w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-gray-600'
            />
          </div>
        </div>

        {/* Password Input */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-300'>Password</label>
          <div className='relative'>
            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500' />
            <input
              name='password'
              type='password'
              required
              placeholder='Buat password kuat'
              className='w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-gray-600'
            />
          </div>
        </div>

        <SubmitButton />
      </form>

      <div className='mt-8 pt-6 border-t border-gray-800 text-center'>
        <p className='text-gray-400 text-sm'>
          Sudah punya akun?{" "}
          <Link
            href='/signin'
            className='text-blue-500 hover:text-blue-400 font-medium hover:underline'
          >
            Masuk Disini
          </Link>
        </p>
      </div>
    </div>
  );
}
