"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Globe,
  Settings,
  ChevronLeft,
  Save,
  Loader2,
  AlertCircle,
  ChartNoAxesCombined,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { updateProductManager } from "@/actions/product-actions";
import TabLanding from "./tabs/TabLanding";
import TabSetting from "./tabs/TabSetting";
import TabBenefit from "./tabs/TabBenefit";
import TabAnalytic from "./tabs/TabAnalytic";

function normalizeProductState(product = {}) {
  const normalizedDownloadableFiles = Array.isArray(product?.downloadableFiles)
    ? product.downloadableFiles
        .map((item) => ({
          name: String(item?.name || "").trim(),
          url: String(item?.url || "").trim(),
        }))
        .filter((item) => item.name && item.url)
    : [];
  const legacyFileUrl = String(product?.filePath || product?.fileLink || "").trim();

  return {
    ...product,
    benefits: Array.isArray(product?.benefits)
      ? product.benefits.filter((item) => typeof item === "string")
      : [],
    downloadableFiles:
      normalizedDownloadableFiles.length > 0
        ? normalizedDownloadableFiles
        : legacyFileUrl
          ? [
              {
                name: legacyFileUrl.split("/").pop() || "File Produk",
                url: legacyFileUrl,
              },
            ]
          : [],
    affiliateEnabled: Boolean(product?.affiliateEnabled),
    affiliateRewardAmount: product?.affiliateRewardAmount || 0,
    price: product?.price || 0,
  };
}

function normalizeLandingState(landing = {}) {
  return {
    ...landing,
    hero: landing?.hero || {},
    pricing: {
      ...(landing?.pricing || {}),
      items: Array.isArray(landing?.pricing?.items) ? landing.pricing.items : [],
    },
    testimonials: {
      ...(landing?.testimonials || {}),
      items: Array.isArray(landing?.testimonials?.items)
        ? landing.testimonials.items
        : [],
    },
    faqs: {
      ...(landing?.faqs || {}),
      items: Array.isArray(landing?.faqs?.items) ? landing.faqs.items : [],
    },
    gallery: {
      ...(landing?.gallery || {}),
      items: Array.isArray(landing?.gallery?.items) ? landing.gallery.items : [],
    },
    instructor: {
      ...(landing?.instructor || {}),
      customStudents: Number(landing?.instructor?.customStudents) || 0,
    },
  };
}

export default function ProductManager({ initialData }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("landing");
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const normalizedInitialProduct = useMemo(
    () => normalizeProductState(initialData.product),
    [initialData],
  );
  const normalizedInitialLanding = useMemo(
    () => normalizeLandingState(initialData.landing || {}),
    [initialData],
  );

  const [productData, setProductData] = useState(() =>
    JSON.parse(JSON.stringify(normalizedInitialProduct)),
  );
  const [landingData, setLandingData] = useState(() =>
    JSON.parse(JSON.stringify(normalizedInitialLanding)),
  );
  const [newImageFile, setNewImageFile] = useState(null);
  const [productFileUploads, setProductFileUploads] = useState({});
  const [galleryFiles, setGalleryFiles] = useState({});

  useEffect(() => {
    const currentProductState = JSON.stringify(normalizeProductState(productData));
    const initialProductState = JSON.stringify(normalizedInitialProduct);
    const currentLandingState = JSON.stringify(normalizeLandingState(landingData));
    const initialLandingState = JSON.stringify(normalizedInitialLanding);

    setIsDirty(
      currentProductState !== initialProductState ||
        currentLandingState !== initialLandingState ||
        newImageFile !== null ||
        Object.keys(productFileUploads).length > 0,
    );
  }, [
    productData,
    landingData,
    newImageFile,
    productFileUploads,
    normalizedInitialProduct,
    normalizedInitialLanding,
  ]);

  useEffect(() => {
    setProductData(JSON.parse(JSON.stringify(normalizedInitialProduct)));
    setLandingData(JSON.parse(JSON.stringify(normalizedInitialLanding)));
    setNewImageFile(null);
    setProductFileUploads({});
    setGalleryFiles({});
    setIsDirty(false);
  }, [normalizedInitialProduct, normalizedInitialLanding]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const tabs = [
    { id: "landing", label: "Landing Page", icon: Globe },
    { id: "benefit", label: "Benefit", icon: Sparkles },
    { id: "settings", label: "Pengaturan", icon: Settings },
    { id: "analytic", label: "Analisis", icon: ChartNoAxesCombined },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const normalizedProduct = normalizeProductState(productData);
      const formData = new FormData();
      formData.append("name", normalizedProduct.name || "");
      formData.append("description", normalizedProduct.description || "");
      formData.append("note", normalizedProduct.note || "");
      formData.append("price", normalizedProduct.price || 0);
      formData.append("category", normalizedProduct.category || "");
      formData.append("status", normalizedProduct.status || "draft");
      formData.append("fileLink", normalizedProduct.fileLink || "");
      formData.append("videoLink", normalizedProduct.videoLink || "");
      formData.append("affiliateEnabled", normalizedProduct.affiliateEnabled);
      formData.append(
        "affiliateRewardAmount",
        normalizedProduct.affiliateRewardAmount || 0,
      );
      formData.append(
        "benefits",
        JSON.stringify(
          normalizedProduct.benefits
            .map((item) => String(item || "").trim())
            .filter(Boolean),
        ),
      );
      const payloadDownloadableFiles = (normalizedProduct.downloadableFiles || [])
        .map((item) => ({
          name: String(item?.name || "").trim(),
          url: String(item?.url || "").trim(),
        }))
        .filter((item) => item.name && item.url);

      if (newImageFile) {
        formData.append("image", newImageFile);
      }
      payloadDownloadableFiles.forEach((item, index) => {
        if (item.url.startsWith("blob:")) {
          const file = productFileUploads[item.url];
          if (file) {
            const key = `product_file_upload_${index}`;
            formData.append(key, file);
            item.url = `__UPLOAD__:${key}`;
          }
        }
      });
      formData.append(
        "downloadableFiles",
        JSON.stringify(payloadDownloadableFiles),
      );

      const payloadLanding = JSON.parse(
        JSON.stringify(normalizeLandingState(landingData)),
      );
      if (payloadLanding.gallery?.items) {
        payloadLanding.gallery.items.forEach((project, pIdx) => {
          if (!Array.isArray(project?.images)) return;
          project.images.forEach((imgUrl, imgIdx) => {
            if (imgUrl && imgUrl.startsWith("blob:")) {
              const file = galleryFiles[imgUrl];
              if (file) {
                const key = `gallery_upload_${pIdx}_${imgIdx}`;
                formData.append(key, file);
                project.images[imgIdx] = `__UPLOAD__:${key}`;
              }
            }
          });
        });
      }

      formData.append("landingData", JSON.stringify(payloadLanding));
      const result = await updateProductManager(normalizedProduct._id, formData);

      if (result.success) {
        toast.success(result.message);
        setNewImageFile(null);
        setProductFileUploads({});
        setGalleryFiles({});
        setIsDirty(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Gagal menyimpan: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20'>
      <header className='py-3 rounded-2xl top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800'>
        <div className='max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-0 min-h-4rem flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div className='flex items-start gap-3 md:gap-4 w-full md:w-auto'>
            <Link
              href='/admin/products'
              className='p-2 -ml-2 mt-0.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 rounded-full transition-colors shrink-0'
            >
              <ChevronLeft size={20} />
            </Link>

            <div className='flex flex-col gap-2'>
              <h1 className='text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug wrap-break-words'>
                {productData.name}
              </h1>

              <div className='flex flex-wrap items-center gap-2'>
                <span
                  className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                    productData.status === "published"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : productData.status === "archived"
                        ? "bg-zinc-200 text-zinc-700 border-zinc-300"
                        : "bg-amber-100 text-amber-700 border-amber-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      productData.status === "published"
                        ? "bg-emerald-500"
                        : productData.status === "archived"
                          ? "bg-zinc-500"
                          : "bg-amber-500"
                    }`}
                  />
                  {productData.status === "published"
                    ? "Terbit"
                    : productData.status === "archived"
                      ? "Arsip"
                      : "Draf"}
                </span>

                {isDirty && (
                  <span className='flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse'>
                    <AlertCircle size={10} />
                    <span className='whitespace-nowrap'>Belum Disimpan</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className='flex items-center gap-3 w-full md:w-auto'>
            <button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className={`w-full md:w-auto justify-center cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDirty
                  ? "bg-sky-600 text-white hover:bg-sky-700 shadow-sky-200"
                  : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
              }`}
            >
              {isSaving ? (
                <Loader2 size={16} className='animate-spin' />
              ) : (
                <Save size={16} />
              )}
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>

        <div className='max-w-6xl mx-auto px-4 md:px-6'>
          <nav className='flex space-x-1 overflow-x-auto no-scrollbar pt-1 md:pt-2'>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type='button'
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all rounded-t-lg whitespace-nowrap ${
                    isActive
                      ? "text-sky-700 bg-sky-50/50 dark:text-sky-400 dark:bg-sky-500/10"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  <Icon
                    size={16}
                    className={
                      isActive
                        ? "text-sky-600"
                        : "text-zinc-400 group-hover:text-zinc-600"
                    }
                  />
                  {tab.label}
                  {isActive && (
                    <span className='absolute bottom-0 left-0 w-full h-0.5 bg-sky-600 rounded-t-full' />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className='max-w-5xl mx-auto px-6 py-8'>
        {activeTab === "landing" && (
          <TabLanding
            landing={landingData}
            setLanding={setLandingData}
            galleryFiles={galleryFiles}
            setGalleryFiles={setGalleryFiles}
          />
        )}

        {activeTab === "benefit" && (
          <TabBenefit
            benefits={productData.benefits || []}
            setProduct={setProductData}
          />
        )}

        {activeTab === "settings" && (
          <TabSetting
            product={productData}
            setProduct={setProductData}
            landing={landingData}
            setLanding={setLandingData}
            newImageFile={newImageFile}
            setNewImageFile={setNewImageFile}
            productFileUploads={productFileUploads}
            setProductFileUploads={setProductFileUploads}
          />
        )}

        {activeTab === "analytic" && <TabAnalytic courseId={productData._id} />}
      </main>
    </div>
  );
}

