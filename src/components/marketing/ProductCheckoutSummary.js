"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { formatRupiah } from "@/lib/client-utils";
import { getProductPricingOffers } from "@/actions/product-actions";
import ProductCheckoutButton from "@/components/marketing/checkout/ProductCheckoutButton";

const formatCountdown = (ms = 0) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function ProductCheckoutSummary({
  product,
  pricingPlans = [],
  user,
  utmData,
  metaPixelId,
}) {
  const [offerStates, setOfferStates] = useState({});
  const [now, setNow] = useState(Date.now());
  const [isLoaded, setIsLoaded] = useState(false);
  const isRefreshingRef = useRef(false);

  const refreshOfferStates = async () => {
    if (!product?._id || isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    try {
      const result = await getProductPricingOffers(product._id);
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
  }, [product?._id]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const mergedPlans = useMemo(() => {
    const plans = Array.isArray(pricingPlans) ? pricingPlans : [];
    return plans.map((plan) => {
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
    });
  }, [pricingPlans, offerStates]);

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

  const selectedPlan = mergedPlans[0] || null;
  const offerState = selectedPlan?.offerState || null;
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
    Number(selectedPlan?.price || product?.price || 0) >
    Number(selectedPlan?.basePrice || product?.price || 0);
  const effectivePrice = Number(selectedPlan?.price || product?.price || 0);
  const basePrice = Number(selectedPlan?.basePrice || product?.price || 0);
  const buttonLabel = selectedPlan?.buttonText || "Checkout Sekarang";
  const summaryProduct = {
    ...product,
    price: effectivePrice,
  };

  return (
    <div className='sticky top-24 space-y-6'>
      <div className='rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100'>
        <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-500'>
          Ringkasan Checkout
        </p>
        <h3 className='mt-3 text-2xl font-bold text-slate-900'>
          {product?.name}
        </h3>

        {selectedPlan?.promoText && (
          <div className='mt-4 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700'>
            {selectedPlan.promoText}
          </div>
        )}

        {showCountdown && (
          <div className='mt-5 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3'>
            <p className='text-xs uppercase tracking-wider text-sky-700'>
              Harga naik lagi dalam
            </p>
            <p className='mt-1 text-2xl font-extrabold font-mono tracking-wide text-slate-950'>
              {formatCountdown(remainingMs)}
            </p>
            <p className='mt-1 text-xs text-sky-700'>
              Kenaikan {offerState?.appliedIncrements || 0}/{offerState?.maxIncreases || 0}
            </p>
          </div>
        )}

        {!showCountdown && offerState?.isEnabled && offerState?.isFinished && (
          <div className='mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600'>
            Harga promo telah berakhir.
          </div>
        )}

        <div className='mt-5 flex items-end justify-between gap-4'>
          <div>
            <p className='text-sm text-slate-500'>Harga</p>
            {isLoaded && hasPriceIncrease && (
              <p className='mt-1 text-sm text-slate-400 line-through'>
                {formatRupiah(basePrice)}
              </p>
            )}
            <p className='text-3xl font-extrabold text-slate-950'>
              {formatRupiah(effectivePrice)}
            </p>
          </div>
          <span className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700'>
            Ready to buy
          </span>
        </div>

        <div className='mt-6 space-y-3'>
          <ProductCheckoutButton
            product={summaryProduct}
            planData={selectedPlan}
            user={user}
            utmData={utmData}
            metaPixelId={metaPixelId}
            className='inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800'
            label={buttonLabel}
          />
        </div>

        <div className='mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4'>
          <div className='flex items-start gap-3 text-sm text-slate-600'>
            <ShieldCheck size={18} className='mt-0.5 shrink-0 text-emerald-500' />
            <span>Pembayaran aman dan proses akses berjalan otomatis.</span>
          </div>
          <div className='mt-3 flex items-start gap-3 text-sm text-slate-600'>
            <BadgeCheck size={18} className='mt-0.5 shrink-0 text-cyan-600' />
            <span>Produk digital dikirim setelah transaksi selesai.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
