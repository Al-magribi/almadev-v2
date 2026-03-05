import { getSettings } from "@/actions/setting-actions";

const FALLBACK_BASE_URL = "https://jadidalmagribi.com";

function normalizeBaseUrl(domain) {
  const raw = String(domain || "").trim();
  if (!raw) return FALLBACK_BASE_URL;

  try {
    return raw.startsWith("http://") || raw.startsWith("https://")
      ? new URL(raw).toString().replace(/\/$/, "")
      : new URL(`https://${raw}`).toString().replace(/\/$/, "");
  } catch {
    return FALLBACK_BASE_URL;
  }
}

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
