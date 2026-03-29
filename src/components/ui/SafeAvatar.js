"use client";

import { useMemo, useState } from "react";

function getInitial(name) {
  if (!name) return "U";
  const parts = String(name).trim().split(" ");
  const first = parts[0]?.[0] || "";
  const second = parts.length > 1 ? parts[1]?.[0] : "";
  return (first + second).toUpperCase();
}

function getAvatarCandidates(avatar) {
  if (!avatar) return [];
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return [avatar];
  }

  let normalized = avatar;
  try {
    normalized = decodeURIComponent(avatar);
  } catch {
    normalized = avatar;
  }

  normalized = normalized.replace(/\\/g, "/").trim();
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  const candidates = new Set([
    normalized,
    normalized.replace(/^\/Uploads\//, "/uploads/"),
    normalized.replace(/\/Avatars\//, "/avatars/"),
    normalized
      .replace(/^\/Uploads\//, "/uploads/")
      .replace(/\/Avatars\//, "/avatars/"),
    normalized.toLowerCase(),
  ]);

  return Array.from(candidates).filter(Boolean);
}

export default function SafeAvatar({
  src,
  name,
  alt,
  className = "",
  imgClassName = "",
  fallbackClassName = "",
}) {
  const candidates = useMemo(() => getAvatarCandidates(src), [src]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const avatarSrc = candidates[candidateIndex] || null;
  const initial = getInitial(name);

  if (!avatarSrc) {
    return (
      <div className={fallbackClassName || className}>
        <span>{initial}</span>
      </div>
    );
  }

  return (
    <img
      key={avatarSrc}
      src={avatarSrc}
      alt={alt || name || "User"}
      className={imgClassName || className}
      onError={() => {
        if (candidateIndex < candidates.length - 1) {
          setCandidateIndex((prev) => prev + 1);
          return;
        }
        setCandidateIndex(candidates.length);
      }}
    />
  );
}
