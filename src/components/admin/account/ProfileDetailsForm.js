"use client";

import { useFormStatus } from "react-dom";
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  FileText,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ProfileDetailsForm({ user, state }) {
  return (
    <div className='bg-white dark:bg-zinc-900 p-8 md:p-10 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/50 dark:shadow-black/20 transition-colors duration-300'>
      <h3 className='font-bold text-gray-900 dark:text-zinc-100 mb-8 flex items-center gap-3 text-lg'>
        <div className='p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400'>
          <User className='w-5 h-5' />
        </div>
        Informasi Pribadi
      </h3>

      <div className='grid md:grid-cols-2 gap-x-8 gap-y-6'>
        <InputGroup
          label='Nama Lengkap'
          name='name'
          defaultValue={user.name}
          icon={User}
          error={state?.error?.name}
        />

        <InputGroup
          label='Email Address'
          name='email'
          type='email'
          defaultValue={user.email}
          icon={Mail}
          error={state?.error?.email}
        />

        <InputGroup
          label='Nomor Telepon'
          name='phone'
          type='tel'
          defaultValue={user.phone}
          icon={Phone}
          placeholder='08xxxxxxxxxx'
          error={state?.error?.phone}
        />
      </div>

      {/* Bagian Khusus Admin */}
      {user.role === "admin" && (
        <div className='mt-10 pt-10 border-t border-dashed border-gray-200 dark:border-zinc-800 animate-in fade-in'>
          <h3 className='font-bold text-gray-900 dark:text-zinc-100 mb-8 flex items-center gap-3 text-lg'>
            <div className='p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400'>
              <Briefcase className='w-5 h-5' />
            </div>
            Profil Profesional
          </h3>

          <div className='grid md:grid-cols-2 gap-x-8 gap-y-6 mb-6'>
            <InputGroup
              label='Perusahaan / Instansi'
              name='company'
              defaultValue={user.adminProfile?.company}
              icon={Building}
            />
            <InputGroup
              label='Jabatan'
              name='title'
              defaultValue={user.adminProfile?.title}
              icon={Briefcase}
            />
          </div>

          <div className='space-y-2 group'>
            <label className='text-sm font-semibold text-gray-700 dark:text-zinc-300 ml-1'>
              Bio Singkat
            </label>
            <div className='relative'>
              <FileText className='absolute top-3.5 left-3.5 w-5 h-5 text-gray-400 dark:text-zinc-500 group-focus-within:text-purple-500' />
              <textarea
                name='bio'
                rows='4'
                defaultValue={user.adminProfile?.bio}
                className='w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-purple-500 transition-all outline-none resize-none text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600'
                placeholder='Deskripsikan peran dan keahlian Anda...'
              ></textarea>
            </div>
            <p className='text-xs text-gray-400 dark:text-zinc-600 text-right'>
              Maksimal 500 karakter
            </p>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      <div className='mt-8 space-y-4'>
        {state?.success && (
          <div className='p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-xl flex items-start gap-3 border border-green-200 dark:border-green-800 animate-in slide-in-from-top-2'>
            <CheckCircle2 className='w-5 h-5 mt-0.5 shrink-0' />
            <div>
              <p className='font-semibold'>Berhasil Disimpan</p>
              <p className='text-sm opacity-90'>{state.message}</p>
            </div>
          </div>
        )}

        {state?.error && typeof state.error === "string" && (
          <div className='p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-xl flex items-start gap-3 border border-red-200 dark:border-red-800 animate-in slide-in-from-top-2'>
            <AlertCircle className='w-5 h-5 mt-0.5 shrink-0' />
            <div>
              <p className='font-semibold'>Gagal Menyimpan</p>
              <p className='text-sm opacity-90'>{state.error}</p>
            </div>
          </div>
        )}
      </div>

      <div className='mt-10 flex justify-end'>
        <SubmitButton />
      </div>
    </div>
  );
}

// Sub-components internal untuk form

function InputGroup({
  label,
  name,
  type = "text",
  defaultValue,
  icon: Icon,
  placeholder,
  error,
}) {
  const errorMessage = Array.isArray(error) ? error[0] : error;

  return (
    <div className='space-y-1.5 group'>
      <label className='text-sm font-semibold text-gray-700 dark:text-zinc-300 ml-1 flex justify-between'>
        {label}
        {errorMessage && (
          <span className='text-red-500 text-xs font-normal animate-pulse'>
            {errorMessage}
          </span>
        )}
      </label>
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none'>
          <Icon
            className={`h-5 w-5 transition-colors duration-300 ${
              errorMessage
                ? "text-red-400"
                : "text-gray-400 dark:text-zinc-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400"
            }`}
          />
        </div>
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-950 border rounded-xl text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 transition-all duration-300 ${
            errorMessage
              ? "border-red-300 dark:border-red-800 focus:ring-red-100 dark:focus:ring-red-900/30 focus:border-red-500"
              : "border-gray-200 dark:border-zinc-800 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500"
          }`}
        />
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      className='relative overflow-hidden group flex items-center gap-2 bg-gray-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 px-8 py-3.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none'
    >
      {pending ? (
        <>
          <Loader2 className='w-4 h-4 animate-spin' />
          <span className='text-gray-200 dark:text-zinc-600'>
            Processing...
          </span>
        </>
      ) : (
        <>
          <Save className='w-4 h-4 group-hover:scale-110 transition-transform' />
          <span>Simpan Perubahan</span>
        </>
      )}
    </button>
  );
}
