import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const user = null;
  return (
    <div className='border-b bg-white'>
      <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
        <Link href='/' className='flex items-center gap-2'>
          <Image src='/logo.svg' alt='logo_almadev' width={36} height={36} />

          <p className='text-xl font-bold text-blue-600'>ALMADEV</p>
        </Link>

        <div className='flex items-center gap-4'>
          {user ? (
            // TAMPILAN JIKA SUDAH LOGIN
            <Link
              href='/student'
              className='bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition'
            >
              Dashboard
            </Link>
          ) : (
            // TAMPILAN JIKA BELUM LOGIN
            <>
              <Link
                href='/signin'
                className='text-gray-600 hover:text-black font-medium'
              >
                Masuk
              </Link>
              <Link
                href='/signup'
                className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition'
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
