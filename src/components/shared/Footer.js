export default function Footer() {
  return (
    <footer className='bg-gray-100 py-8 mt-10'>
      <div className='container mx-auto px-4 text-center text-gray-500'>
        &copy; {new Date().getFullYear()} ALMADEV
      </div>
    </footer>
  );
}
