"use server";

import dbConnect from "@/lib/db";
import {
  deleteFile,
  productSchema,
  uploadImage,
  uploadProductFile,
} from "@/lib/server-utils";
import Landing from "@/models/Landing";
import Product from "@/models/Product";
import Transaction from "@/models/Transaction";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { ensureOfferSessionKey, resolveCourseOfferStates } from "@/lib/course-offer";

function normalizeProductName(value = "") {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function slugifyProductName(name = "") {
  return normalizeProductName(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeLookupValue(value = "") {
  return decodeURIComponent(String(value || ""))
    .trim()
    .replace(/\s+/g, " ");
}

function lookupSlugToName(value = "") {
  return normalizeLookupValue(value).replace(/-/g, " ");
}

function escapeRegex(value = "") {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildProductSlug(product) {
  return slugifyProductName(product?.name || "product");
}

function serializeProduct(product) {
  const downloadableFiles = Array.isArray(product.downloadableFiles)
    ? product.downloadableFiles
        .map((item) => ({
          name: String(item?.name || "").trim(),
          url: String(item?.url || "").trim(),
        }))
        .filter((item) => item.name && item.url)
    : [];
  const legacyFileUrl = String(product.filePath || product.fileLink || "").trim();

  return {
    ...product,
    _id: product._id.toString(),
    slug: buildProductSlug(product),
    benefits: Array.isArray(product.benefits) ? product.benefits : [],
    downloadableFiles:
      downloadableFiles.length > 0
        ? downloadableFiles
        : legacyFileUrl
          ? [
              {
                name: legacyFileUrl.split("/").pop() || "File Produk",
                url: legacyFileUrl,
              },
            ]
          : [],
    reviews: product.reviews?.map((r) => ({
      ...r,
      _id: r._id.toString(),
      user: r.user?.toString(),
    })),
  };
}

function serializeLanding(landing) {
  if (!landing) return null;

  return {
    ...landing,
    _id: landing._id?.toString?.() || "",
    courseId: landing.courseId?.toString?.() || null,
    productId: landing.productId?.toString?.() || null,
    instructorId: landing.instructorId?.toString?.() || null,
    createdAt: landing.createdAt ? landing.createdAt.toISOString() : null,
    updatedAt: landing.updatedAt ? landing.updatedAt.toISOString() : null,
  };
}

function getLandingTestimonialStats(landing, fallbackProduct = {}) {
  const activeTestimonials = (landing?.testimonials?.items || []).filter(
    (item) =>
      item?.isActive !== false && Number.isFinite(Number(item?.rating || 0)),
  );

  if (activeTestimonials.length === 0) {
    return {
      displayRating: Number(fallbackProduct?.rating || 0),
      displayReviews: Number(fallbackProduct?.totalReviews || 0),
    };
  }

  const totalRating = activeTestimonials.reduce((sum, item) => {
    const rating = Math.max(0, Math.min(5, Number(item?.rating) || 0));
    return sum + rating;
  }, 0);

  return {
    displayRating: totalRating / activeTestimonials.length,
    displayReviews: activeTestimonials.length,
  };
}

export async function getProducts(query = {}) {
  await dbConnect();
  const products = await Product.find(query).sort({ createdAt: -1 }).lean();
  const landings = await Landing.find({
    productId: { $in: products.map((product) => product._id) },
  })
    .select("productId testimonials.items")
    .lean();

  const landingByProductId = new Map(
    landings.map((landing) => [String(landing.productId), landing]),
  );

  return products.map((product) => {
    const serializedProduct = serializeProduct(product);
    const landing = landingByProductId.get(String(product._id));
    const testimonialStats = getLandingTestimonialStats(
      landing,
      serializedProduct,
    );

    return {
      ...serializedProduct,
      displayRating: Number(testimonialStats.displayRating || 0),
      displayReviews: Number(testimonialStats.displayReviews || 0),
    };
  });
}

export async function getProductDetail(idOrSlug) {
  await dbConnect();

  const rawValue = normalizeLookupValue(idOrSlug);
  if (!rawValue) return null;

  const normalizedSlug = slugifyProductName(rawValue);
  const normalizedName = normalizeProductName(lookupSlugToName(rawValue));

  let product = null;

  if (mongoose.Types.ObjectId.isValid(rawValue)) {
    product = await Product.findById(rawValue).lean();
  }

  if (!product && normalizedName) {
    product = await Product.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, "i") },
    }).lean();
  }

  if (!product && normalizedSlug) {
    const candidates = await Product.find({}).sort({ createdAt: -1 }).lean();
    product =
      candidates.find(
        (item) =>
          buildProductSlug(item) === normalizedSlug ||
          normalizeProductName(item?.name) === normalizedName,
      ) || null;
  }

  if (!product) return null;
  return serializeProduct(product);
}

export async function getProductLandingDetail(idOrSlug) {
  await dbConnect();

  const product = await getProductDetail(idOrSlug);
  if (!product?._id) return null;

  const productObjectId = new mongoose.Types.ObjectId(product._id);
  const [landing, salesAgg] = await Promise.all([
    Landing.findOne({ productId: productObjectId }).lean(),
    Transaction.aggregate([
      {
        $match: {
          itemType: "Product",
          status: "completed",
          itemId: productObjectId,
        },
      },
      {
        $group: {
          _id: "$itemId",
          totalSold: { $sum: 1 },
        },
      },
    ]),
  ]);

  const testimonialStats = getLandingTestimonialStats(landing, product);

  return {
    product: {
      ...product,
      salesCount: salesAgg?.[0]?.totalSold || 0,
      displayRating: Number(testimonialStats.displayRating || 0),
      displayReviews: Number(testimonialStats.displayReviews || 0),
    },
    landing: serializeLanding(landing),
  };
}

export async function getProductPricingOffers(productId) {
  await dbConnect();

  try {
    if (!productId) {
      return { success: false, message: "Produk tidak valid." };
    }

    const landing = await Landing.findOne({ productId })
      .select("pricing.items")
      .lean();

    const plans = landing?.pricing?.items || [];
    const cookieStore = await cookies();
    const sessionKey = await ensureOfferSessionKey(cookieStore);
    const states = await resolveCourseOfferStates({
      courseId: productId,
      plans,
      sessionKey,
      now: new Date(),
    });

    return {
      success: true,
      data: states,
    };
  } catch (error) {
    console.error("getProductPricingOffers error:", error);
    return {
      success: false,
      message: error.message || "Gagal mengambil pricing offer produk.",
    };
  }
}

export async function saveProduct(prevState, formData) {
  try {
    await dbConnect();

    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
      note: formData.get("note"),
      price: formData.get("price"),
      category: formData.get("category"),
      status: formData.get("status"),
      fileLink: formData.get("fileLink"),
      filePath: formData.get("filePath"),
      videoLink: formData.get("videoLink"),
      image: formData.get("image"),
    };
    const hasFileUpload =
      rawData.filePath instanceof File && rawData.filePath.size > 0;

    const id = formData.get("id");
    const validatedFields = productSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Validasi Gagal. Periksa input anda.",
      };
    }

    const { image, filePath, ...productData } = validatedFields.data;
    let imagePath = undefined;
    let uploadedFilePath = undefined;
    let downloadableFiles = undefined;

    if (image instanceof File && image.size > 0) {
      const uploadedPath = await uploadImage(image, "products");
      if (uploadedPath) imagePath = uploadedPath;
    } else if (typeof image === "string" && image.length > 0) {
      imagePath = image;
    }

    if (filePath instanceof File && filePath.size > 0) {
      const uploadedFile = await uploadProductFile(filePath, "product-files");
      if (uploadedFile) {
        uploadedFilePath = uploadedFile;
        downloadableFiles = [
          {
            name: filePath.name || uploadedFile.split("/").pop() || "File Produk",
            url: uploadedFile,
          },
        ];
      }
    } else if (typeof filePath === "string" && filePath.length > 0) {
      uploadedFilePath = filePath;
      downloadableFiles = [
        {
          name: filePath.split("/").pop() || "File Produk",
          url: filePath,
        },
      ];
    }
    if (hasFileUpload && !uploadedFilePath) {
      return {
        success: false,
        message:
          "Upload file gagal. Periksa ukuran dan format file, lalu coba lagi.",
      };
    }

    if (id) {
      const updateData = { ...productData };
      if (imagePath) updateData.image = imagePath;
      if (uploadedFilePath) updateData.filePath = uploadedFilePath;
      if (downloadableFiles) updateData.downloadableFiles = downloadableFiles;

      await Product.findByIdAndUpdate(id, updateData);
      revalidatePath("/admin/product");
      revalidatePath("/admin/products");
      revalidatePath(`/admin/products/${id}`);
      return { success: true, message: "Produk berhasil diperbarui!" };
    }

    if (!imagePath) {
      return {
        success: false,
        message: "Gambar wajib diupload untuk produk baru.",
      };
    }

    await Product.create({
      ...productData,
      image: imagePath,
      filePath: uploadedFilePath || "",
      downloadableFiles: downloadableFiles || [],
    });
    revalidatePath("/admin/product");
    revalidatePath("/admin/products");
    return { success: true, message: "Produk berhasil dibuat!" };
  } catch (error) {
    console.error("Save Product Error:", error);
    return { success: false, message: "Terjadi kesalahan server." };
  }
}

export async function updateProductManager(productId, formData) {
  try {
    await dbConnect();

    const existingProduct = await Product.findById(productId).lean();
    if (!existingProduct) {
      return { success: false, message: "Produk tidak ditemukan." };
    }

    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const note = String(formData.get("note") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const status = String(formData.get("status") || "draft").trim();
    const videoLink = String(formData.get("videoLink") || "").trim();
    const imageFile = formData.get("image");
    const price = Math.max(0, Number(formData.get("price")) || 0);
    const affiliateRewardAmount = Math.max(
      0,
      Number(formData.get("affiliateRewardAmount")) || 0,
    );
    const affiliateEnabled = formData.get("affiliateEnabled") === "true";
    const parsedBenefits = JSON.parse(formData.get("benefits") || "[]");
    const benefits = Array.isArray(parsedBenefits)
      ? parsedBenefits.map((item) => String(item || "").trim()).filter(Boolean)
      : [];
    const parsedDownloadableFiles = JSON.parse(
      formData.get("downloadableFiles") || "[]",
    );
    const landingData = JSON.parse(formData.get("landingData") || "{}");
    const manualBuyers = Math.max(
      0,
      Number(landingData?.instructor?.customStudents) || 0,
    );

    if (!name || !description || !category) {
      return {
        success: false,
        message: "Nama, deskripsi, dan kategori wajib diisi.",
      };
    }

    let imagePath = existingProduct.image || "";
    if (imageFile && imageFile.size > 0 && imageFile !== "undefined") {
      const uploadedImage = await uploadImage(imageFile, "products");
      if (uploadedImage) {
        imagePath = uploadedImage;
      }
    }

    const downloadableFiles = Array.isArray(parsedDownloadableFiles)
      ? parsedDownloadableFiles
          .map((item) => ({
            name: String(item?.name || "").trim(),
            url: String(item?.url || "").trim(),
          }))
          .filter((item) => item.name && item.url)
      : [];

    for (let index = 0; index < downloadableFiles.length; index++) {
      const fileItem = downloadableFiles[index];
      if (
        fileItem.url &&
        typeof fileItem.url === "string" &&
        fileItem.url.startsWith("__UPLOAD__:")
      ) {
        const fileKey = fileItem.url.split(":")[1];
        const file = formData.get(fileKey);
        if (file && file.size > 0) {
          const uploadedFile = await uploadProductFile(file, "product-files");
          downloadableFiles[index].url = uploadedFile || "";
          if (!downloadableFiles[index].name) {
            downloadableFiles[index].name =
              file.name || uploadedFile?.split("/").pop() || "File Produk";
          }
        } else {
          downloadableFiles[index].url = "";
        }
      }
    }

    const cleanedDownloadableFiles = downloadableFiles.filter(
      (item) => item.name && item.url,
    );
    const primaryDownloadUrl = cleanedDownloadableFiles[0]?.url || "";

    if (landingData.gallery?.items) {
      for (let pIdx = 0; pIdx < landingData.gallery.items.length; pIdx++) {
        const project = landingData.gallery.items[pIdx];
        if (!Array.isArray(project?.images)) continue;

        for (let imgIdx = 0; imgIdx < project.images.length; imgIdx++) {
          const imgStr = project.images[imgIdx];
          if (
            imgStr &&
            typeof imgStr === "string" &&
            imgStr.startsWith("__UPLOAD__:")
          ) {
            const fileKey = imgStr.split(":")[1];
            const file = formData.get(fileKey);
            if (file && file.size > 0) {
              const uploadedUrl = await uploadImage(file, "gallery");
              landingData.gallery.items[pIdx].images[imgIdx] = uploadedUrl || "";
            } else {
              landingData.gallery.items[pIdx].images[imgIdx] = "";
            }
          }
        }

        landingData.gallery.items[pIdx].images = project.images.filter(Boolean);
      }
    }

    const normalizedPricingItems = (landingData.pricing?.items || []).map(
      (item) => ({
        name: item?.name || "",
        subtitle: item?.subtitle || "",
        promoText: item?.promoText || "",
        buttonText: item?.buttonText || "",
        price: Number(item?.price) || 0,
        offerCountdown: String(item?.offerCountdown || "").trim(),
        offerIncreaseAmount: Math.max(
          0,
          Number(item?.offerIncreaseAmount) || 0,
        ),
        offerMaxIncreases: Math.max(0, Number(item?.offerMaxIncreases) || 0),
        benefits: Array.isArray(item?.benefits)
          ? item.benefits.filter(Boolean)
          : [],
        isRecommended: Boolean(item?.isRecommended),
      }),
    );

    await Product.findByIdAndUpdate(productId, {
      name,
      description,
      note,
      benefits,
      image: imagePath,
      price,
      category,
      status,
      fileLink: primaryDownloadUrl,
      filePath: primaryDownloadUrl,
      downloadableFiles: cleanedDownloadableFiles,
      videoLink,
      affiliateEnabled,
      affiliateRewardAmount,
    });

    await Landing.findOneAndUpdate(
      { productId },
      {
        $set: {
          name,
          type: "Product",
          productId,
          "hero.headline": landingData.hero?.headline || name,
          "hero.customTitle": landingData.hero?.customTitle || "",
          "hero.customSubtitle": landingData.hero?.customSubtitle || "",
          "hero.customDescription": landingData.hero?.customDescription || "",
          "instructor.customStudents": manualBuyers,
          "pricing.items": normalizedPricingItems,
          "testimonials.items": landingData.testimonials?.items || [],
          "faqs.items": landingData.faqs?.items || [],
          "gallery.items": landingData.gallery?.items || [],
        },
      },
      { upsert: true },
    );

    revalidatePath("/admin/product");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/products/${buildProductSlug({ name })}`);

    return { success: true, message: "Perubahan produk berhasil disimpan." };
  } catch (error) {
    console.error("updateProductManager error:", error);
    return {
      success: false,
      message: error.message || "Gagal menyimpan perubahan produk.",
    };
  }
}

export async function deleteProduct(id) {
  try {
    await dbConnect();

    const product = await Product.findById(id);
    if (!product) {
      return { success: false, message: "Produk tidak ditemukan" };
    }

    if (product.image) {
      await deleteFile(product.image);
    }

    await Product.findByIdAndDelete(id);
    await Landing.findOneAndDelete({ productId: id });

    revalidatePath("/admin/product");
    revalidatePath("/admin/products");
    return { success: true, message: "Produk berhasil dihapus" };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, message: "Gagal menghapus produk" };
  }
}




