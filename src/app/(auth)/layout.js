export default function AuthLayout({ children }) {
  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-gray-700 p-4'>
      {/* Background decoration (optional glow effect) */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[100px]' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[100px]' />
      </div>

      {/* Card Container */}
      <div className='w-full max-w-md bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl shadow-xl overflow-hidden'>
        {children}
      </div>
    </div>
  );
}
