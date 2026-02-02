"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { initFacebookPixel, trackFacebookEvent } from "@/lib/facebook-pixel";

export default function CheckoutModal({
  isOpen,
  onClose,
  user,
  courseId,
  itemId,
  itemType,
  planData,
  courseData,
  planName,
  utmData,
  metaPixelId,
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const clearCheckoutLock = () => {
    try {
      localStorage.removeItem("checkout_locked");
    } catch {}
    document.cookie =
      "checkout_locked=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearCheckoutLock();

    const normalizedType = itemType || "Course";
    const effectiveId = itemId || courseId;
    const selectedPlanName =
      planData?.name ||
      planName ||
      (normalizedType === "Product" ? "Produk Digital" : "Online Course");

    const pixelId = String(metaPixelId || "").trim();
    if (pixelId) {
      const storageKey = `fb_initiate_checkout_${String(effectiveId || "")}`;
      try {
        if (sessionStorage.getItem(storageKey) !== "1") {
          initFacebookPixel(pixelId);
          trackFacebookEvent("InitiateCheckout", {
            content_ids: [String(effectiveId || "")],
            content_name: selectedPlanName,
            content_type: normalizedType === "Product" ? "product" : "course",
            currency: "IDR",
            value: Number(planData?.price ?? courseData?.price ?? 0),
            num_items: 1,
          });
          sessionStorage.setItem(storageKey, "1");
        }
      } catch {}
    }

    // Construct Query Params
    const params = new URLSearchParams();
    params.set("itemType", normalizedType);
    if (normalizedType === "Product") {
      params.set("productId", effectiveId);
    } else {
      params.set("courseId", effectiveId);
    }
    params.set("planName", selectedPlanName);
    params.set("name", formData.name);
    params.set("email", formData.email);
    params.set("phone", formData.phone);

    if (utmData?.utm_source) params.set("utm_source", utmData.utm_source);
    if (utmData?.utm_medium) params.set("utm_medium", utmData.utm_medium);
    if (utmData?.utm_campaign) params.set("utm_campaign", utmData.utm_campaign);
    if (utmData?.utm_term) params.set("utm_term", utmData.utm_term);
    if (utmData?.utm_content) params.set("utm_content", utmData.utm_content);

    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className='bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative'
        >
          <button
            onClick={onClose}
            className='absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full transition-colors'
          >
            <X size={20} className='text-slate-500' />
          </button>

          <div className='p-8'>
            <h2 className='text-2xl font-bold text-slate-900 mb-2'>
              Lengkapi Data
            </h2>
            <p className='text-slate-500 text-sm mb-6'>
              Pastikan data di bawah benar untuk keperluan sertifikat dan akses
              grup.
            </p>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-1'>
                <label className='text-xs font-bold uppercase tracking-wider text-slate-400 ml-1'>
                  Nama Lengkap
                </label>
                <div className='relative group'>
                  <User
                    className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors'
                    size={18}
                  />
                  <input
                    required
                    type='text'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder='Nama lengkap Anda'
                    className='w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all'
                  />
                </div>
              </div>

              <div className='space-y-1'>
                <label className='text-xs font-bold uppercase tracking-wider text-slate-00 ml-1'>
                  Email Aktif
                </label>
                <div className='relative group'>
                  <Mail
                    className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors'
                    size={18}
                  />
                  <input
                    required
                    type='email'
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder='email@contoh.com'
                    className='w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all'
                  />
                </div>
              </div>

              <div className='space-y-1'>
                <label className='text-xs font-bold uppercase tracking-wider text-slate-400 ml-1'>
                  WhatsApp
                </label>
                <div className='relative group'>
                  <Phone
                    className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors'
                    size={18}
                  />
                  <input
                    required
                    type='tel'
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder='62812xxxxxx'
                    className='w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all'
                  />
                </div>
              </div>

              <button
                type='submit'
                className='w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-5 rounded-2xl mt-6 flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-200'
              >
                Konfirmasi Data <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
