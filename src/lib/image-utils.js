export function normalizeImageSrc(src = "") {
  const normalized = String(src || "").trim();

  if (!normalized) return "";

  return normalized.replace(/^\/Uploads\//, "/uploads/");
}

export function shouldUnoptimizeImage(src = "") {
  const normalized = normalizeImageSrc(src);

  return (
    normalized.startsWith("/uploads/") ||
    normalized.startsWith("blob:") ||
    normalized.startsWith("data:")
  );
}
