import { getSettings } from "@/actions/setting-actions";
import { normalizeBaseUrl } from "@/lib/seo";

export default async function robots() {
  const settings = await getSettings();
  const baseUrl = normalizeBaseUrl(settings?.data?.domain);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/student",
          "/online-bootcamp",
          "/signin",
          "/signup",
          "/activate",
          "/checkout",
          "/status",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
