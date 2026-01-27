import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { ThemeProvider } from "next-themes"; // Import langsung dari library jika provider Anda wrapper

export default function HomeLayout({ children }) {
  return (
    // forcedTheme="light" akan memaksa seluruh anak komponen menjadi light mode
    <ThemeProvider forcedTheme='light' attribute='class' enableSystem={false}>
      <div className='flex flex-col min-h-screen bg-white text-slate-900'>
        <Navbar />
        <main className='flex-1'>{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
