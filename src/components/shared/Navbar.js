import { getCurrentUser } from "@/lib/auth-service";
import Image from "next/image";
import Link from "next/link";

const Navbar = async () => {
  const user = await getCurrentUser();
  return (
    <div className='sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur'>
      <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
        <Link href='/' className='flex items-center gap-3'>
          <span className='relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900'>
            <Image src='/logo.svg' alt='logo_almadev' width={22} height={22} />
          </span>

          <p className='text-lg font-extrabold tracking-tight text-slate-900'>
            ALMA<span className='text-blue-600'>DEV</span>
          </p>
        </Link>

        <div className='flex items-center gap-3 sm:gap-4'>
          {user ? (
            // TAMPILAN JIKA SUDAH LOGIN
            <Link
              href='/student'
              className='rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 transition'
            >
              Dashboard
            </Link>
          ) : (
            // TAMPILAN JIKA BELUM LOGIN
            <>
              <Link
                href='/signin'
                className='text-sm font-semibold text-slate-600 hover:text-slate-900 transition'
              >
                Masuk
              </Link>
              <Link
                href='/signup'
                className='rounded-full bg-blue-600 text-white px-5 py-2 text-sm font-semibold hover:bg-blue-500 transition shadow-[0_8px_20px_-12px_rgba(37,99,235,0.8)]'
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
