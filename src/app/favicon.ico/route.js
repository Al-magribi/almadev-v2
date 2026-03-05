import { NextResponse } from "next/server";
import { getSettings } from "@/actions/setting-actions";

function resolveFaviconPath(value) {
  const raw = String(value || "").trim();
  if (!raw) return "/logo.svg";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  return raw.startsWith("/") ? raw : `/${raw}`;
}

export async function GET(request) {
  const settings = await getSettings();
  const faviconPath = resolveFaviconPath(settings?.data?.websiteFavicon);

  const target = new URL(faviconPath, request.url);
  return NextResponse.redirect(target, { status: 307 });
}
