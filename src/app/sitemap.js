import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Product from "@/models/Product";
import Setting from "@/models/Setting";

const FALLBACK_BASE_URL = "https://jadidalmagribi.com";

function normalizeBaseUrl(domain) {
  const raw = String(domain || "").trim();
  if (!raw) return FALLBACK_BASE_URL;

  try {
    return raw.startsWith("http://") || raw.startsWith("https://")
      ? new URL(raw).toString().replace(/\/$/, "")
      : new URL(`https://${raw}`).toString().replace(/\/$/, "");
  } catch {
    return FALLBACK_BASE_URL;
  }
}

function slugify(value = "") {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function sitemap() {
  await dbConnect();

  const [setting, courses, products] = await Promise.all([
    Setting.findOne({}).lean(),
    Course.find({ isActive: true }).select("slug name updatedAt createdAt").lean(),
    Product.find({ status: "published" }).select("_id updatedAt createdAt").lean(),
  ]);

  const baseUrl = normalizeBaseUrl(setting?.domain);
  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/courses", priority: 0.9 },
    { path: "/products", priority: 0.9 },
    { path: "/bootcamp", priority: 0.9 },
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route.priority,
  }));

  const courseUrls = courses
    .map((course) => {
      const slug = String(course?.slug || "").trim() || slugify(course?.name);
      if (!slug) return null;

      return {
        url: `${baseUrl}/courses/${slug}`,
        lastModified: course.updatedAt || course.createdAt || now,
        changeFrequency: "weekly",
        priority: 0.8,
      };
    })
    .filter(Boolean);

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${String(product._id)}`,
    lastModified: product.updatedAt || product.createdAt || now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticUrls, ...courseUrls, ...productUrls];
}
