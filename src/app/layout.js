import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Fira_Sans, Fira_Code } from "next/font/google";
import { ThemeProvider } from "@/components/provider/ThemeProvider"; // Pastikan path import benar
import { getSettings } from "@/actions/setting-actions";

export const dynamic = "force-dynamic";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fira-sans",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});

export const metadata = {
  title: {
    default: "ALMADEV | Build & Deploy",
    template: "%s | ALMADEV", // Ini akan menghasilkan "Bootcamp... | ALMADEV" secara otomatis
  },
  description:
    "Platform belajar pemrograman JavaScript Full Stack berstandar industri.",
  metadataBase: new URL("https://jadidalmagribi.com"), // Ganti dengan domain asli Anda
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }) {
  const settings = await getSettings();
  const metaPixelId = settings?.data?.metaPixelId || "";
  const pixelSrc = metaPixelId
    ? `https://www.facebook.com/tr?id=${encodeURIComponent(
        metaPixelId,
      )}&ev=PageView&noscript=1`
    : "";

  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${firaSans.variable} ${firaCode.variable} antialiased font-sans bg-background text-foreground`}
      >
        {/* PENTING: Gunakan attribute="class" agar kompatibel dengan Tailwind dark: modifier */}
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position='top-center' />
          {pixelSrc ? (
            <noscript>
              <img
                height='1'
                width='1'
                style={{ display: "none" }}
                alt=''
                src={pixelSrc}
              />
            </noscript>
          ) : null}
        </ThemeProvider>
      </body>
    </html>
  );
}
