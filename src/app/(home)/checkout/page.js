import { getCourseDetail } from "@/actions/course-actions";
import { getProductDetail } from "@/actions/product-actions";
import { getSettings } from "@/actions/setting-actions";
import { getCurrentUser } from "@/lib/auth-service";
import Checkout from "@/components/marketing/checkout/Checkout"; // Sesuaikan path import
import { notFound, redirect } from "next/navigation";

export default async function CheckoutPage({ searchParams }) {
  // 1. Ambil data dari URL
  const query = await searchParams;
  const {
    itemType,
    courseId,
    productId,
    planName,
    name,
    email,
    phone,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
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
      phone: sessionUser?.phone || phone,
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

  // 3. Cari Pricing/Plan yang dipilih untuk mendapatkan harga ASLI
  // Kita cari di array pricing landing page yang namanya cocok dengan planName
  const selectedPlan = landing?.pricing?.items?.find(
    (p) => p.name === planName,
  );

  // Jika plan tidak ketemu (misal user edit URL), fallback ke harga default course
  const realPrice = selectedPlan ? selectedPlan.price : course.price;
  const displayItemName = selectedPlan
    ? `${course.name} - ${selectedPlan.name}`
    : course.name;

  // 4. Siapkan Data User (Prioritas: Session Logged In > Input Form URL)
  const sessionUser = await getCurrentUser();

  const userData = {
    id: sessionUser?.id || "guest", // Jika guest, nanti di backend handle logic create user/guest
    name: sessionUser?.name || name,
    email: sessionUser?.email || email,
    phone: sessionUser?.phone || phone,
  };

  // 5. Siapkan Item Object yang sudah diverifikasi harganya
  const item = {
    _id: course._id.toString(), // ID Course
    name: displayItemName,
    price: realPrice, // INI HARGA AMAN DARI DB
    image: course.image || "/placeholder-course.jpg",
    planName: planName, // Simpan info plan
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
      }}
    />
  );
}
