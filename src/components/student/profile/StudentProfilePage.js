"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Landmark,
  Save,
  Shield,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { updateUserProfile, changeUserPassword } from "@/actions/user-actions";
import ProfileAvatarCard from "@/components/admin/account/ProfileAvatarCard";

const sectionMotion = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const getErrorText = (error) => {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const firstKey = Object.keys(error)[0];
    if (firstKey && Array.isArray(error[firstKey])) {
      return error[firstKey][0] || "";
    }
  }
  return "";
};

export default function StudentProfilePage({ user }) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [profileState, profileAction] = React.useActionState(
    updateUserProfile,
    {
      success: false,
      error: null,
      message: "",
    },
  );

  const [passwordState, passwordAction] = React.useActionState(
    changeUserPassword,
    {
      success: false,
      error: null,
      message: "",
    },
  );

  const avatarSrc =
    user?.avatar && user.avatar.startsWith("http")
      ? user.avatar
      : user?.avatar
        ? user.avatar
        : "/placeholder.png";

  return (
    <div className='mx-auto w-full max-w-5xl'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100'>
            Profil Saya
          </h1>
          <p className='mt-1 text-sm text-zinc-600 dark:text-zinc-400'>
            Kelola informasi akun, foto profil, dan keamanan password.
          </p>
        </div>
        <div className='inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'>
          <Shield className='h-4 w-4' />
          Profil student
        </div>
      </div>

      {!user && (
        <div className='mt-6 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'>
          Sesi tidak ditemukan. Silakan login kembali untuk mengakses profil.
        </div>
      )}

      <form action={profileAction}>
        <div className='mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <motion.div
            variants={sectionMotion}
            initial='hidden'
            animate='show'
            className='lg:col-span-1'
          >
            {user ? (
              <ProfileAvatarCard user={user} />
            ) : (
              <div className='rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-2xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-950'>
                    <User className='h-5 w-5 text-zinc-700 dark:text-zinc-200' />
                  </div>
                  <div>
                    <h2 className='text-base font-semibold text-zinc-900 dark:text-zinc-100'>
                      Foto Profil
                    </h2>
                    <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                      Ukuran disarankan 400x400
                    </p>
                  </div>
                </div>

                <div className='mt-6 flex flex-col items-center'>
                  <div className='relative h-28 w-28 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800'>
                    <Image
                      src={avatarSrc}
                      alt='Avatar'
                      fill
                      className='object-cover'
                      sizes='112px'
                    />
                  </div>
                  <p className='mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-100'>
                    Student
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            variants={sectionMotion}
            initial='hidden'
            animate='show'
            className='rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2'
          >
            <div className='flex items-center gap-3'>
              <div className='rounded-2xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-950'>
                <User className='h-5 w-5 text-zinc-700 dark:text-zinc-200' />
              </div>
              <div>
                <h2 className='text-base font-semibold text-zinc-900 dark:text-zinc-100'>
                  Informasi Akun
                </h2>
                <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                  Pastikan data selalu terbaru.
                </p>
              </div>
            </div>

            <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <label className='flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400'>
                Nama lengkap
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
                  <input
                    name='name'
                    type='text'
                    defaultValue={user?.name || ""}
                    placeholder='Nama lengkap'
                    className='h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/60'
                    required
                  />
                </div>
              </label>

              <label className='flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400'>
                Email
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
                  <input
                    name='email'
                    type='email'
                    defaultValue={user?.email || ""}
                    placeholder='Email'
                    className='h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/60'
                    required
                  />
                </div>
              </label>

              <label className='flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400'>
                Nomor WhatsApp
                <div className='relative'>
                  <Phone className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
                  <input
                    name='phone'
                    type='tel'
                    defaultValue={user?.phone || ""}
                    placeholder='08xxxxxxxxxx'
                    className='h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/60'
                    required
                  />
                </div>
              </label>
            </div>

            <div className='mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800'>
              <div className='flex items-center gap-3'>
                <div className='rounded-2xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-950'>
                  <Landmark className='h-5 w-5 text-zinc-700 dark:text-zinc-200' />
                </div>
                <div>
                  <h2 className='text-base font-semibold text-zinc-900 dark:text-zinc-100'>
                    Data Bank
                  </h2>
                  <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                    Informasi rekening untuk kebutuhan administrasi.
                  </p>
                </div>
              </div>

              <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3'>
                <label className='flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400'>
                  Nama Bank
                  <input
                    name='bankName'
                    type='text'
                    defaultValue={user?.bankInfo?.bankName || ""}
                    placeholder='Contoh: BCA'
                    className='h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/60'
                  />
                </label>

                <label className='flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400'>
                  Nomor Rekening
                  <input
                    name='accountNumber'
                    type='text'
                    defaultValue={user?.bankInfo?.accountNumber || ""}
                    placeholder='Nomor rekening'
                    className='h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/60'
                  />
                </label>

                <label className='flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400'>
                  Atas Nama
                  <input
                    name='accountName'
                    type='text'
                    defaultValue={user?.bankInfo?.accountName || ""}
                    placeholder='Nama pemilik rekening'
                    className='h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/60'
                  />
                </label>
              </div>
            </div>

            <div className='mt-6'>
              {profileState?.success && (
                <div className='mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200'>
                  {profileState.message || "Profil berhasil diperbarui."}
                </div>
              )}
              {profileState?.error && (
                <div className='mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200'>
                  {getErrorText(profileState.error)}
                </div>
              )}

              <button
                type='submit'
                className='inline-flex h-11 items-center gap-2 rounded-2xl bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-200 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:focus:ring-zinc-700'
              >
                <Save className='h-4 w-4' />
                Simpan perubahan
              </button>
            </div>
          </motion.div>
        </div>
      </form>

      <motion.div
        variants={sectionMotion}
        initial='hidden'
        animate='show'
        className='mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'
      >
        <div className='flex items-center gap-3'>
          <div className='rounded-2xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-950'>
            <Lock className='h-5 w-5 text-zinc-700 dark:text-zinc-200' />
          </div>
          <div>
            <h2 className='text-base font-semibold text-zinc-900 dark:text-zinc-100'>
              Keamanan Password
            </h2>
            <p className='text-xs text-zinc-500 dark:text-zinc-400'>
              Gunakan kombinasi kuat untuk melindungi akun.
            </p>
          </div>
        </div>

        <form
          action={passwordAction}
          className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3'
        >
          <label className='flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400'>
            Password saat ini
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
              <input
                name='currentPassword'
                type={showPassword ? "text" : "password"}
                placeholder='Masukkan password'
                className='h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-10 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/60'
                required
              />
              <button
                type='button'
                onClick={() => setShowPassword((prev) => !prev)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600'
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
          </label>

          <label className='flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400'>
            Password baru
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
              <input
                name='newPassword'
                type={showNewPassword ? "text" : "password"}
                placeholder='Minimal 6 karakter'
                className='h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-10 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/60'
                required
              />
              <button
                type='button'
                onClick={() => setShowNewPassword((prev) => !prev)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600'
              >
                {showNewPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
          </label>

          <label className='flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400'>
            Konfirmasi password
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
              <input
                name='confirmPassword'
                type={showConfirmPassword ? "text" : "password"}
                placeholder='Ulangi password baru'
                className='h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-10 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-700 dark:focus:ring-zinc-700/60'
                required
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600'
              >
                {showConfirmPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
          </label>

          <div className='sm:col-span-3'>
            {passwordState?.success && (
              <div className='mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200'>
                {passwordState.message || "Password berhasil diperbarui."}
              </div>
            )}
            {passwordState?.error && (
              <div className='mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200'>
                {getErrorText(passwordState.error)}
              </div>
            )}

            <button
              type='submit'
              className='inline-flex h-11 items-center gap-2 rounded-2xl bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-200 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:focus:ring-zinc-700'
            >
              <Save className='h-4 w-4' />
              Ubah password
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
