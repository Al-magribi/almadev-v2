import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Fira_Sans, Fira_Code } from "next/font/google";
import { ThemeProvider } from "@/components/provider/ThemeProvider"; // Pastikan path import benar
import { getSettings } from "@/actions/setting-actions";
import { buildSeoPayload } from "@/lib/seo";

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

export async function generateMetadata() {
  const settings = await getSettings();
  const seo = buildSeoPayload(settings?.data || {});

  return {
    metadataBase: new URL(seo.baseUrl),
    title: {
      default: seo.seoTitle,
      template: `%s | ${seo.websiteName}`,
    },
    description: seo.seoDescription,
    keywords: seo.seoKeywords,
    icons: {
      icon: [
        { url: seo.faviconUrl },
        { url: "/favicon.ico" },
      ],
      shortcut: seo.faviconUrl,
      apple: seo.faviconUrl,
    },
    openGraph: {
      type: "website",
      url: seo.baseUrl,
      siteName: seo.websiteName,
      title: seo.seoTitle,
      description: seo.seoDescription,
      images: [
        {
          url: seo.logoUrl,
          alt: `${seo.websiteName} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.seoTitle,
      description: seo.seoDescription,
      images: [seo.logoUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    manifest: "/manifest.webmanifest",
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSettings();
  const siteSettings = settings?.data || {};
  const metaPixelId = siteSettings?.metaPixelId || "";
  const seo = buildSeoPayload(siteSettings);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: seo.websiteName,
      url: seo.baseUrl,
      logo: seo.logoUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: seo.websiteName,
      url: seo.baseUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: `${seo.baseUrl}/courses?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  const pixelSrc = metaPixelId
    ? `https://www.facebook.com/tr?id=${encodeURIComponent(
        metaPixelId,
      )}&ev=PageView&noscript=1`
    : "";

  return (
    <html lang='id' suppressHydrationWarning>
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
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
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
