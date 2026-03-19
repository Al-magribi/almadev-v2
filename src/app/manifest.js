import { getSettings } from "@/actions/setting-actions";
import { buildSeoPayload, resolveUrl } from "@/lib/seo";

export default async function manifest() {
  const settings = await getSettings();
  const seo = buildSeoPayload(settings?.data || {});
  const favicon = resolveUrl(seo.baseUrl, settings?.data?.websiteFavicon, "/favicon.ico");

  return {
    id: seo.baseUrl,
    name: seo.websiteName,
    short_name: seo.websiteName,
    description: seo.seoDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    icons: [
      {
        src: favicon || "/favicon.ico",
        sizes: "any",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
      },
    ],
  };
}
