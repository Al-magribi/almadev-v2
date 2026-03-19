"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { formatRupiah } from "@/lib/client-utils";
import { getCoursePricingOffers } from "@/actions/course-actions";
import PricingCardWrapper from "@/components/marketing/checkout/PricingCardWrapper";

const formatCountdown = (ms = 0) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function CoursePricingSection({
  courseId,
  courseName,
  courseImage,
  title,
  subtitle,
  plans = [],
  user,
  utmData,
  metaPixelId,
}) {
  const [offerStates, setOfferStates] = useState({});
  const [now, setNow] = useState(Date.now());
  const [isLoaded, setIsLoaded] = useState(false);
  const isRefreshingRef = useRef(false);

  const refreshOfferStates = async () => {
    if (!courseId || isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    try {
      const result = await getCoursePricingOffers(courseId);
      if (result?.success && Array.isArray(result.data)) {
        const nextStates = Object.fromEntries(
          result.data.map((item) => [String(item.pricingId || ""), item]),
        );
        setOfferStates(nextStates);
        setNow(Date.now());
        setIsLoaded(true);
      }
    } finally {
      isRefreshingRef.current = false;
    }
  };

  useEffect(() => {
    refreshOfferStates();
  }, [courseId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const mergedPlans = useMemo(
    () =>
      plans.map((plan) => {
        const state = offerStates[String(plan?._id || "")];
        const currentPrice = Number(state?.currentPrice);
        const effectivePrice = Number.isFinite(currentPrice)
          ? currentPrice
          : Number(plan?.price) || 0;

        return {
          ...plan,
          price: effectivePrice,
          basePrice: Number(plan?.price) || 0,
          offerState: state || null,
        };
      }),
    [plans, offerStates],
  );

  useEffect(() => {
    const shouldRefresh = mergedPlans.some((plan) => {
      const nextExpiryAt = plan?.offerState?.nextExpiryAt;
      if (!nextExpiryAt || plan?.offerState?.isFinished) return false;
      return new Date(nextExpiryAt).getTime() <= now;
    });

    if (shouldRefresh) {
      refreshOfferStates();
    }
  }, [mergedPlans, now]);

  const mobileStartingPrice = mergedPlans.reduce((min, plan) => {
    const value = Number(plan?.price);
    if (!Number.isFinite(value)) return min;
    return Math.min(min, value);
  }, Number.POSITIVE_INFINITY);

  return (
    <>
      <section id='pricing' className='py-24 bg-slate-900 text-white relative'>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-500px h-500px bg-violet-600/20 rounded-full blur-[120px] pointer-events-none' />

        <div className='container mx-auto px-4 relative z-10'>
          <div className='text-center max-w-2xl mx-auto mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              {title || "Investasi Belajar Terbaik"}
            </h2>
            <p className='text-slate-400 text-lg'>
              {subtitle || "Pilih paket yang sesuai dengan kebutuhan Anda."}
            </p>
          </div>

          <div
            className={`grid gap-8 max-w-5xl mx-auto ${mergedPlans.length === 1 ? "grid-cols-1 md:w-1/2" : "md:grid-cols-2 lg:grid-cols-3"}`}
          >
            {mergedPlans.map((plan, idx) => {
              const offerState = plan.offerState;
              const nextExpiryAt = offerState?.nextExpiryAt
                ? new Date(offerState.nextExpiryAt).getTime()
                : null;
              const remainingMs = nextExpiryAt ? nextExpiryAt - now : 0;
              const showCountdown =
                Boolean(nextExpiryAt) &&
                !offerState?.isFinished &&
                remainingMs > 0 &&
                offerState?.isEnabled;
              const hasPriceIncrease =
                Number(plan.price) > Number(plan.basePrice || 0);

              return (
                <div
                  key={plan?._id || idx}
                  className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 ${
                    plan.isRecommended
                      ? "bg-violet-600 text-white scale-105 shadow-2xl shadow-violet-900/50 border-0 z-10"
                      : "bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {plan.isRecommended && (
                    <div className='absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg'>
                      Rekomendasi
                    </div>
                  )}

                  <h3
                    className={`text-lg font-bold mb-2 ${plan.isRecommended ? "text-violet-100" : "text-slate-300"}`}
                  >
                    {plan.name}
                  </h3>
                  {plan.subtitle && (
                    <p
                      className={`text-sm mb-3 ${plan.isRecommended ? "text-violet-100/90" : "text-slate-400"}`}
                    >
                      {plan.subtitle}
                    </p>
                  )}
                  {plan.promoText && (
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                        plan.isRecommended
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {plan.promoText}
                    </div>
                  )}

                  {showCountdown && (
                    <div
                      className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
                        plan.isRecommended
                          ? "bg-white/15 border border-white/20 text-violet-50"
                          : "bg-slate-900 border border-slate-700 text-slate-200"
                      }`}
                    >
                      <p className='text-xs uppercase tracking-wider opacity-80'>
                        Harga naik lagi dalam
                      </p>
                      <p className='mt-1 text-xl font-extrabold font-mono tracking-wide'>
                        {formatCountdown(remainingMs)}
                      </p>
                      <p className='mt-1 text-xs opacity-80'>
                        Kenaikan {offerState.appliedIncrements}/
                        {offerState.maxIncreases}
                      </p>
                    </div>
                  )}

                  {!showCountdown &&
                    offerState?.isEnabled &&
                    offerState?.isFinished && (
                      <div
                        className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
                          plan.isRecommended
                            ? "bg-white/15 border border-white/20 text-violet-50"
                            : "bg-slate-900 border border-slate-700 text-slate-200"
                        }`}
                      >
                        <p className='text-xs uppercase tracking-wider opacity-80'>
                          Harga promo telah berakhir
                        </p>
                      </div>
                    )}

                  {isLoaded && hasPriceIncrease && (
                    <p
                      className={`text-sm line-through mb-1 ${
                        plan.isRecommended
                          ? "text-violet-200/80"
                          : "text-slate-400"
                      }`}
                    >
                      Mulai dari {formatRupiah(plan.basePrice)}
                    </p>
                  )}

                  <div className='text-4xl font-extrabold mb-6'>
                    {plan.price === 0 ? "Gratis" : formatRupiah(plan.price)}
                  </div>

                  <div
                    className={`h-px w-full mb-6 ${plan.isRecommended ? "bg-violet-500" : "bg-slate-700"}`}
                  />

                  <ul className='space-y-4 mb-8 flex-1'>
                    {plan.benefits?.map((benefit, bIdx) => (
                      <li key={bIdx} className='flex gap-3 text-sm'>
                        <CheckCircle2
                          size={18}
                          className={`${plan.isRecommended ? "text-white" : "text-violet-400"} shrink-0`}
                        />
                        <span
                          className={
                            plan.isRecommended
                              ? "text-violet-50"
                              : "text-slate-300"
                          }
                        >
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <PricingCardWrapper
                    plan={plan}
                    courseId={courseId}
                    planIndex={idx}
                    user={user}
                    courseData={{
                      name: courseName,
                      price: plan.price,
                      image: courseImage,
                    }}
                    utmData={utmData}
                    metaPixelId={metaPixelId}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className='fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 md:hidden z-50 flex items-center justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.05)]'>
        <div>
          <p className='text-xs text-slate-500 uppercase font-bold'>
            Mulai dari
          </p>
          <p className='text-lg font-bold text-violet-600'>
            {Number.isFinite(mobileStartingPrice)
              ? formatRupiah(mobileStartingPrice)
              : formatRupiah(0)}
          </p>
        </div>
        <a
          href='#pricing'
          className='bg-violet-600 text-white px-6 py-3 rounded-lg font-bold text-sm shadow-lg shadow-violet-600/30'
        >
          Beli Sekarang
        </a>
      </div>
    </>
  );
}
