const FALLBACK_BASE_URL = "https://jadidalmagribi.com";

export function normalizeBaseUrl(domain) {
  const raw = String(domain || "").trim();

  if (!raw) {
    return FALLBACK_BASE_URL;
  }

  try {
    return raw.startsWith("http://") || raw.startsWith("https://")
      ? new URL(raw).toString().replace(/\/$/, "")
      : new URL(`https://${raw}`).toString().replace(/\/$/, "");
  } catch {
    return FALLBACK_BASE_URL;
  }
}

export function resolveUrl(baseUrl, candidate, fallbackPath = "/") {
  const raw = String(candidate || "").trim();
  const safePath = String(fallbackPath || "/");

  if (!raw) {
    return new URL(safePath, baseUrl).toString();
  }

  try {
    return new URL(raw, baseUrl).toString();
  } catch {
    return new URL(safePath, baseUrl).toString();
  }
}

export function buildSeoPayload(settings = {}) {
  const baseUrl = normalizeBaseUrl(settings?.domain);
  const websiteName = (settings?.websiteName || "ALMADEV").trim();
  const seoTitle = (settings?.seoTitle || websiteName || "ALMADEV").trim();
  const seoDescription = (
    settings?.seoDescription ||
    "Platform belajar pemrograman JavaScript Full Stack berstandar industri."
  ).trim();
  const seoKeywords = String(settings?.seoKeywords || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const faviconUrl = resolveUrl(baseUrl, settings?.websiteFavicon, "/favicon.ico");
  const logoUrl = resolveUrl(baseUrl, settings?.websiteLogo, "/logo.svg");

  return {
    baseUrl,
    websiteName,
    seoTitle,
    seoDescription,
    seoKeywords,
    faviconUrl,
    logoUrl,
  };
}
