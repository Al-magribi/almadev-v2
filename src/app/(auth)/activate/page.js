import { activateUser } from "@/actions/auth-action";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

// Helper untuk render status UI
const StatusIcon = ({ status }) => {
  if (status === "success") {
    return (
      <div className='rounded-full bg-green-500/10 p-4 mb-4 animate-bounce'>
        <CheckCircle2 className='w-16 h-16 text-green-500' />
      </div>
    );
  } else if (status === "error") {
    return (
      <div className='rounded-full bg-red-500/10 p-4 mb-4'>
        <XCircle className='w-16 h-16 text-red-500 animate-pulse' />
      </div>
    );
  } else {
    return (
      <div className='rounded-full bg-yellow-500/10 p-4 mb-4'>
        <ShieldAlert className='w-16 h-16 text-yellow-500' />
      </div>
    );
  }
};

export default async function ActivatePage({ searchParams }) {
  // 1. Await params (Wajib di Next.js 15)
  const resolvedParams = await searchParams;
  const token = resolvedParams?.token;

  // --- KONDISI 1: TOKEN TIDAK DITEMUKAN ---
  if (!token) {
    return (
      <div className='min-h-screen w-full flex items-center justify-center bg-gray-950 p-4 relative overflow-hidden'>
        {/* Background Effect */}
        <div className='absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]' />

        <div className='max-w-md w-full bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl p-8 text-center shadow-2xl transform transition-all hover:scale-[1.01]'>
          <div className='flex justify-center'>
            <StatusIcon status='warning' />
          </div>
          <h1 className='text-2xl font-bold text-white mb-2'>
            Link Tidak Valid
          </h1>
          <p className='text-gray-400 mb-8'>
            Token aktivasi tidak ditemukan atau URL yang Anda akses salah.
          </p>
          <Link
            href='/'
            className='w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-700'
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // 2. Panggil Server Action
  const result = await activateUser(token);
  const isSuccess = result.success;

  // --- KONDISI 2 & 3: SUKSES ATAU GAGAL ---
  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-gray-950 p-4 relative overflow-hidden'>
      {/* Background Decor */}
      <div
        className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] ${isSuccess ? "bg-green-900/20" : "bg-red-900/20"}`}
      />

      <div className='max-w-md w-full bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl p-8 text-center shadow-2xl'>
        {/* Icon Section */}
        <div className='flex justify-center'>
          <StatusIcon status={isSuccess ? "success" : "error"} />
        </div>

        {/* Text Section */}
        <h1
          className={`text-3xl font-bold mb-3 ${isSuccess ? "text-white" : "text-white"}`}
        >
          {isSuccess ? "Akun Aktif!" : "Aktivasi Gagal"}
        </h1>

        <p
          className={`mb-8 leading-relaxed ${isSuccess ? "text-gray-300" : "text-red-400"}`}
        >
          {result.message}
        </p>

        {/* Action Button */}
        {isSuccess ? (
          <Link
            href='/signin'
            className='w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 group'
          >
            Login Sekarang
            <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
          </Link>
        ) : (
          <div className='space-y-3'>
            <Link
              href='/signup'
              className='w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-700'
            >
              Daftar Ulang
            </Link>
            <p className='text-xs text-gray-500 mt-4'>
              Butuh bantuan?{" "}
              <a href='#' className='text-blue-500 hover:underline'>
                Hubungi Support
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
