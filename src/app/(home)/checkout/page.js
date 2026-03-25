import { getCourseDetail } from "@/actions/course-actions";
import { getProductDetail } from "@/actions/product-actions";
import { getSettings } from "@/actions/setting-actions";
import { getCurrentUser } from "@/lib/auth-service";
import Checkout from "@/components/marketing/checkout/Checkout"; // Sesuaikan path import
import { getOfferSessionKey, resolveCourseOfferStates } from "@/lib/course-offer";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const normalizePhone = (value = "") => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
};

export default async function CheckoutPage({ searchParams }) {
  // 1. Ambil data dari URL
  const query = await searchParams;
  const {
    itemType,
    courseId,
    productId,
    planId,
    planName,
    name,
    email,
    phone,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
    ref,
  } = query;

  const settings = await getSettings();
  const metaPixelId = settings?.data?.metaPixelId || "";

  const normalizedType = itemType === "Product" ? "Product" : "Course";

  if (normalizedType === "Product") {
    if (!productId) {
      return redirect("/");
    }

    const product = await getProductDetail(productId);
    if (!product) return notFound();

    const sessionUser = await getCurrentUser();
    const userData = {
      id: sessionUser?.id || "guest",
      name: sessionUser?.name || name,
      email: sessionUser?.email || email,
      phone: normalizePhone(sessionUser?.phone || phone),
    };

    const item = {
      _id: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.image || "/placeholder-course.jpg",
      planName: planName || "Produk Digital",
      itemType: "Product",
    };

    return (
      <Checkout
        item={item}
        user={userData}
        metaPixelId={metaPixelId}
        utm={{
          utmSource: utm_source || null,
          utmMedium: utm_medium || null,
          utmCampaign: utm_campaign || null,
          utmTerm: utm_term || null,
          utmContent: utm_content || null,
          referralCode: ref || null,
        }}
      />
    );
  }

  if (!courseId) {
    return redirect("/"); // Kick user jika tidak ada ID
  }

  // 2. Fetch Data Asli dari Database (Server Side - AMAN)
  const dataCourse = await getCourseDetail(courseId);

  if (!dataCourse || !dataCourse.course) {
    return notFound();
  }

  const { course, landing } = dataCourse;

  const pricingItems = landing?.pricing?.items || [];
  const selectedPlan =
    pricingItems.find((p) => String(p?._id) === String(planId || "")) ||
    pricingItems.find((p) => p.name === planName);

  const cookieStore = await cookies();
  const sessionKey = await getOfferSessionKey(cookieStore);
  const [offerState] = selectedPlan
    ? await resolveCourseOfferStates({
        courseId,
        plans: [selectedPlan],
        sessionKey,
        now: new Date(),
      })
    : [];

  const realPrice = Number.isFinite(Number(offerState?.currentPrice))
    ? Number(offerState.currentPrice)
    : selectedPlan
      ? selectedPlan.price
      : course.price;
  const displayItemName = selectedPlan
    ? `${course.name} - ${selectedPlan.name}`
    : course.name;

  // 4. Siapkan Data User (Prioritas: Session Logged In > Input Form URL)
  const sessionUser = await getCurrentUser();

  const userData = {
    id: sessionUser?.id || "guest", // Jika guest, nanti di backend handle logic create user/guest
    name: sessionUser?.name || name,
    email: sessionUser?.email || email,
    phone: normalizePhone(sessionUser?.phone || phone),
  };

  // 5. Siapkan Item Object yang sudah diverifikasi harganya
  const item = {
    _id: course._id.toString(), // ID Course
    name: displayItemName,
    price: realPrice, // INI HARGA AMAN DARI DB
    image: course.image || "/placeholder-course.jpg",
    planId: selectedPlan?._id?.toString?.() || null,
    planName: selectedPlan?.name || planName, // Simpan info plan
    itemType: "Course",
  };

  // Render Client Component
  return (
    <Checkout
      item={item}
      user={userData}
      metaPixelId={metaPixelId}
      utm={{
        utmSource: utm_source || null,
        utmMedium: utm_medium || null,
        utmCampaign: utm_campaign || null,
        utmTerm: utm_term || null,
        utmContent: utm_content || null,
        referralCode: ref || null,
      }}
    />
  );
}
