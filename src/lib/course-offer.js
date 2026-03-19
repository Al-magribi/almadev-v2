import { randomUUID } from "crypto";
import CourseOfferSession from "@/models/CourseOfferSession";

export const COURSE_OFFER_COOKIE = "course_offer_session";

export function getPricingPlanId(plan = {}) {
  return String(plan?._id || plan?.pricingId || "").trim();
}

export function parseCountdownToMinutes(value = "") {
  const normalized = String(value || "").trim();
  if (!normalized) return 0;

  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 0;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return 0;
  if (hours < 0 || hours > 99 || minutes < 0 || minutes > 59) return 0;

  return hours * 60 + minutes;
}

export function formatMinutesToCountdown(totalMinutes = 0) {
  const safeMinutes = Math.max(0, Number(totalMinutes) || 0);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function normalizeOfferConfig(plan = {}) {
  const countdownInput = String(
    plan?.offerCountdown || plan?.countdownDuration || "",
  ).trim();
  const durationMinutes = parseCountdownToMinutes(countdownInput);
  const increaseAmount = Math.max(0, Number(plan?.offerIncreaseAmount) || 0);
  const maxIncreases = Math.max(0, Number(plan?.offerMaxIncreases) || 0);
  const enabled =
    durationMinutes > 0 && increaseAmount > 0 && maxIncreases > 0;

  return {
    enabled,
    countdown: formatMinutesToCountdown(durationMinutes),
    durationMinutes,
    durationMs: durationMinutes * 60 * 1000,
    increaseAmount,
    maxIncreases,
  };
}

export function computeOfferState({ plan = {}, startedAt = null, now = new Date() }) {
  const basePrice = Math.max(0, Number(plan?.price) || 0);
  const planId = getPricingPlanId(plan);
  const config = normalizeOfferConfig(plan);
  const startedAtDate = startedAt ? new Date(startedAt) : null;

  if (!config.enabled || !startedAtDate || Number.isNaN(startedAtDate.getTime())) {
    return {
      pricingId: planId,
      startedAt: startedAtDate ? startedAtDate.toISOString() : null,
      basePrice,
      currentPrice: basePrice,
      appliedIncrements: 0,
      increaseAmount: config.increaseAmount,
      maxIncreases: config.maxIncreases,
      countdown: config.countdown,
      durationMinutes: config.durationMinutes,
      nextExpiryAt: null,
      isFinished: true,
      isEnabled: config.enabled,
    };
  }

  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const startedAtMs = startedAtDate.getTime();
  const elapsedMs = Math.max(0, nowMs - startedAtMs);
  const elapsedCycles = Math.floor(elapsedMs / config.durationMs);
  const appliedIncrements = Math.min(elapsedCycles, config.maxIncreases);
  const currentPrice = basePrice + appliedIncrements * config.increaseAmount;
  const isFinished = appliedIncrements >= config.maxIncreases;
  const nextExpiryAt = isFinished
    ? null
    : new Date(startedAtMs + (appliedIncrements + 1) * config.durationMs);

  return {
    pricingId: planId,
    startedAt: startedAtDate.toISOString(),
    basePrice,
    currentPrice,
    appliedIncrements,
    increaseAmount: config.increaseAmount,
    maxIncreases: config.maxIncreases,
    countdown: config.countdown,
    durationMinutes: config.durationMinutes,
    nextExpiryAt: nextExpiryAt ? nextExpiryAt.toISOString() : null,
    isFinished,
    isEnabled: config.enabled,
  };
}

export async function ensureOfferSessionKey(cookieStore) {
  const existing = cookieStore?.get(COURSE_OFFER_COOKIE)?.value;
  if (existing) return existing;

  const sessionKey = randomUUID();
  cookieStore?.set(COURSE_OFFER_COOKIE, sessionKey, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return sessionKey;
}

export async function getOfferSessionKey(cookieStore) {
  return cookieStore?.get(COURSE_OFFER_COOKIE)?.value || null;
}

export async function resolveCourseOfferStates({
  courseId,
  plans = [],
  sessionKey = null,
  now = new Date(),
}) {
  const normalizedPlans = Array.isArray(plans) ? plans : [];
  const timedPlans = normalizedPlans.filter(
    (plan) => normalizeOfferConfig(plan).enabled && getPricingPlanId(plan),
  );

  let sessionsByPlanId = new Map();

  if (sessionKey && timedPlans.length > 0) {
    const planIds = timedPlans.map((plan) => getPricingPlanId(plan));
    const existingSessions = await CourseOfferSession.find({
      sessionKey,
      courseId,
      pricingId: { $in: planIds },
    })
      .select("pricingId startedAt")
      .lean();

    sessionsByPlanId = new Map(
      existingSessions.map((session) => [String(session.pricingId), session]),
    );

    const missingPlans = timedPlans.filter(
      (plan) => !sessionsByPlanId.has(getPricingPlanId(plan)),
    );

    if (missingPlans.length > 0) {
      await Promise.all(
        missingPlans.map(async (plan) => {
          const pricingId = getPricingPlanId(plan);
          const created = await CourseOfferSession.findOneAndUpdate(
            { sessionKey, courseId, pricingId },
            { $setOnInsert: { startedAt: now } },
            {
              new: true,
              upsert: true,
              setDefaultsOnInsert: true,
            },
          )
            .select("pricingId startedAt")
            .lean();

          sessionsByPlanId.set(pricingId, created);
        }),
      );
    }
  }

  return normalizedPlans.map((plan) => {
    const pricingId = getPricingPlanId(plan);
    const session = pricingId ? sessionsByPlanId.get(pricingId) : null;
    return computeOfferState({
      plan,
      startedAt: session?.startedAt || null,
      now,
    });
  });
}
