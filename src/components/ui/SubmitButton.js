"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function SubmitButton({
  label,
  loadingLabel = "Memproses...",
  icon: Icon,
  iconPosition = "left", // Default icon di kiri sesuai gambar Anda (+ Create)
  className = "",
  ...props
}) {
  // Hook ini otomatis mendeteksi status form induknya
  const { pending } = useFormStatus();

  return (
    <button
      type='submit'
      disabled={pending}
      className={`
        relative flex items-center justify-center gap-2 
        w-full rounded-lg px-4 py-2 font-medium text-white transition-all
        bg-blue-600 hover:bg-blue-700 active:bg-blue-800
        disabled:bg-blue-400 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className='h-4 w-4 animate-spin' />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          {/* Render Icon jika posisinya di KIRI */}
          {iconPosition === "left" && Icon && <Icon className='h-5 w-5' />}

          <span>{label}</span>

          {/* Render Icon jika posisinya di KANAN */}
          {iconPosition === "right" && Icon && <Icon className='h-5 w-5' />}
        </>
      )}
    </button>
  );
}
