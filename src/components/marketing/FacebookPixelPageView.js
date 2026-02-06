"use client";

import { useEffect, useRef } from "react";
import { initFacebookPixel, trackFacebookEvent } from "@/lib/facebook-pixel";

export default function FacebookPixelPageView({
  metaPixelId,
  contentIds,
  contentName,
  contentType,
}) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    const pixelId = String(metaPixelId || "").trim();
    if (!pixelId) return;
    const payload = {};
    if (Array.isArray(contentIds) && contentIds.length > 0) {
      payload.content_ids = contentIds.map((id) => String(id));
    }
    if (contentName) {
      payload.content_name = String(contentName);
    }
    if (contentType) {
      payload.content_type = String(contentType);
    }

    initFacebookPixel(pixelId, {
      trackPageView: Object.keys(payload).length === 0,
    });
    if (Object.keys(payload).length > 0) {
      trackFacebookEvent("PageView", payload);
    }
    hasTracked.current = true;
  }, [metaPixelId, contentIds, contentName, contentType]);

  return null;
}
