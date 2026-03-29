import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getProductLandingDetail } from "@/actions/product-actions";
import { getSettings } from "@/actions/setting-actions";
import { getCurrentUser } from "@/lib/auth-service";
import { trackPageView } from "@/actions/dataview-actions";
import ProductLandingPage from "@/components/marketing/ProductLandingPage";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getProductLandingDetail(slug);
  const product = data?.product;
  const landing = data?.landing;
  const productSlug = product?.slug || slug;

  return {
    title: landing?.hero?.headline || product?.name || "Detail Produk",
    description:
      landing?.hero?.customSubtitle ||
      product?.description ||
      "Produk digital siap pakai untuk mempercepat karir Anda.",
    alternates: {
      canonical: `/products/${productSlug}`,
    },
  };
}

export default async function ProductDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const sParams = await searchParams;
  const referralCode = String(sParams?.ref || "").trim().toUpperCase() || null;
  const hasReferralCode = Boolean(referralCode);

  const [data, user, settings] = await Promise.all([
    getProductLandingDetail(slug),
    getCurrentUser(),
    getSettings(),
  ]);

  const product = data?.product;
  const landing = data?.landing;

  if (!product) return notFound();

  const metaPixelId = settings?.data?.metaPixelId || "";
  const utmData = {
    utm_source: sParams?.utm_source || (hasReferralCode ? "affiliate" : "website"),
    utm_medium: sParams?.utm_medium || (hasReferralCode ? "referral" : "landing"),
    utm_campaign: sParams?.utm_campaign || (hasReferralCode ? referralCode : "direct"),
    utm_term: sParams?.utm_term || null,
    utm_content: sParams?.utm_content || null,
    referralCode,
  };

  const headerList = await headers();
  try {
    const trackResult = await trackPageView({
      landingId: landing?._id || product._id,
      itemId: product._id,
      itemType: "Product",
      utmSource: utmData.utm_source,
      utmMedium: utmData.utm_medium,
      utmCampaign: utmData.utm_campaign,
      utmTerm: utmData.utm_term,
      utmContent: utmData.utm_content,
      referralCode,
      pageUrl: `/products/${product.slug || slug}`,
      ipAddress:
        headerList.get("x-forwarded-for")?.split(",")?.[0]?.trim() || null,
      userAgent: headerList.get("user-agent"),
      referrer: headerList.get("referer"),
    });

    if (!trackResult?.success) {
      console.error("Track page view failed:", trackResult?.error);
    }
  } catch (error) {
    console.error("Track page view failed:", error);
  }

  return (
    <ProductLandingPage
      product={product}
      landing={landing}
      user={user}
      utmData={utmData}
      metaPixelId={metaPixelId}
    />
  );
}
