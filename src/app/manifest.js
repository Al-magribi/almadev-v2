import { getSettings } from "@/actions/setting-actions";

export default async function manifest() {
  const settings = await getSettings();
  const websiteName = String(settings?.data?.websiteName || "ALMADEV").trim();
  const description = String(
    settings?.data?.seoDescription ||
      "Platform belajar pemrograman JavaScript Full Stack berstandar industri.",
  ).trim();
  const favicon = String(settings?.data?.websiteFavicon || "/favicon.ico").trim();

  return {
    name: websiteName,
    short_name: websiteName,
    description,
    start_url: "/",
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
