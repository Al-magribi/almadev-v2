import { getSettings } from "@/actions/setting-actions";
import { normalizeBaseUrl } from "@/lib/seo";

export default async function robots() {
  const settings = await getSettings();
  const baseUrl = normalizeBaseUrl(settings?.data?.domain);

  return {
    // Keep robots.txt crawl-friendly. Private/auth pages are excluded with
    // route-level metadata (`robots: { index: false, follow: false }`) instead.
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
