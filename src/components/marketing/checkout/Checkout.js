"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  BadgeCheck,
  Zap,
  User,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { formatRupiah } from "@/lib/client-utils";
import { createPayment } from "@/actions/transaction-actions";
import { useRouter } from "next/navigation";

export default function Checkout({ item, user, utm }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const getCookie = (key) => {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${key.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}=([^;]*)`),
    );
    return match ? decodeURIComponent(match[1]) : null;
  };

  // 1. Definisikan Fitur Berdasarkan Nama Plan
  // Mengambil data dari item.planName yang dikirim dari server
  const getPlanFeatures = (planName) => {
    const name = planName?.toLowerCase() || "";

    if (name.includes("premium")) {
      return [
        "Akses Semua Materi Video (Selamanya)",
        "Source Code & File Latihan Lengkap",
        "Grup Diskusi Premium dengan Mentor",
        "Coaching 1-on-1 (Private Session)", // Fitur Khusus Premium
        "Prioritas Support Kendala",
      ];
    } else {
      // Default / Mandiri
      return [
        "Akses Semua Materi Video (Selamanya)",
        "Source Code & File Latihan Lengkap",
        "Grup Diskusi Komunitas",
      ];
    }
  };

  const features = getPlanFeatures(item.planName);

  useEffect(() => {
    const locked =
      localStorage.getItem("checkout_locked") === "1" ||
      getCookie("checkout_locked") === "1";
    if (locked) {
      setBlocked(true);
      router.replace("/");
    }
  }, [router]);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await createPayment({
        itemId: item._id,
        itemType: "Course",
        itemName: item.name, // untuk email
        price: item.price,
        userName: user.name,
        userEmail: user.email,
        phone: user.phone,
        utmSource: utm?.utmSource,
        utmMedium: utm?.utmMedium,
        utmCampaign: utm?.utmCampaign,
        utmTerm: utm?.utmTerm,
        utmContent: utm?.utmContent,
      });

      if (res.success && res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        throw new Error(res.error || "Gagal membuat token pembayaran");
      }
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  if (blocked) return null;

  return (
    <div className='max-w-6xl mx-auto px-4 py-12 lg:py-20'>
      <div className='grid lg:grid-cols-12 gap-12 items-start'>
        {/* KOLOM KIRI: Detail Produk & Data User */}
        <div className='lg:col-span-7 space-y-8'>
          <div>
            <h1 className='text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-2'>
              Konfirmasi Pesanan
            </h1>
            <p className='text-slate-500'>
              Review kembali pesanan dan data diri Anda sebelum lanjut ke
              pembayaran.
            </p>
          </div>

          {/* SECTION 1: Detail Produk (Dinamis sesuai Plan) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='p-1 rounded-2xl shadow shadow-violet-200 border border-violet-100'
          >
            <div className='bg-white p-6 md:p-8 rounded-[1.8rem] space-y-6'>
              <div className='flex flex-col md:flex-row gap-6'>
                <img
                  src={item.image}
                  className='w-full md:w-32 h-32 rounded-2xl object-cover shadow-sm'
                  alt={item.name}
                />
                <div className='flex-1 space-y-3'>
                  {/* Badge Plan Name */}
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      item.planName?.toLowerCase().includes("premium")
                        ? "bg-amber-100 text-amber-700"
                        : "bg-violet-50 text-violet-700"
                    }`}
                  >
                    <Zap size={14} fill='currentColor' />
                    {item.planName || "Online Course"}
                  </div>

                  <h2 className='text-2xl font-bold text-slate-900 leading-tight'>
                    {item.name}
                  </h2>
                </div>
              </div>

              {/* List Fitur Dinamis */}
              <div className='pt-6 border-t border-slate-100'>
                <h3 className='text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider'>
                  Fasilitas Paket {item.planName}
                </h3>
                <ul className='grid gap-3'>
                  {features.map((feature, i) => (
                    <li
                      key={i}
                      className='flex items-start gap-3 text-slate-600 text-sm'
                    >
                      <CheckCircle2
                        className='text-green-500 shrink-0 mt-0.5'
                        size={18}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* SECTION 2: Data Pembeli (Input dari Modal) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='bg-slate-50 border border-slate-200 p-8 rounded-2xl'
          >
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-bold text-slate-900'>Data Pembeli</h3>
              {/* Opsional: Tombol edit bisa ditambahkan di sini jika mau redirect back */}
            </div>

            <div className='grid gap-4'>
              <div className='flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100'>
                <div className='w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600'>
                  <User size={20} />
                </div>
                <div>
                  <p className='text-xs text-slate-400 font-bold uppercase'>
                    Nama Lengkap
                  </p>
                  <p className='text-slate-900 font-medium'>{user.name}</p>
                </div>
              </div>

              <div className='flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100'>
                <div className='w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600'>
                  <Mail size={20} />
                </div>
                <div>
                  <p className='text-xs text-slate-400 font-bold uppercase'>
                    Email Akses
                  </p>
                  <p className='text-slate-900 font-medium'>{user.email}</p>
                </div>
              </div>

              <div className='flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100'>
                <div className='w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600'>
                  <Phone size={20} />
                </div>
                <div>
                  <p className='text-xs text-slate-400 font-bold uppercase'>
                    WhatsApp
                  </p>
                  <p className='text-slate-900 font-medium'>{user.phone}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* KOLOM KANAN: Ringkasan Bayar */}
        <div className='lg:col-span-5'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className='bg-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-violet-900/20 sticky top-24'
          >
            <h3 className='text-xl font-bold mb-8'>Detail Pembayaran</h3>

            <div className='space-y-4 mb-10 text-slate-400 text-sm'>
              <div className='flex justify-between'>
                <span>Paket {item.planName}</span>
                <span className='text-white font-medium'>
                  {formatRupiah(item.price)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Biaya Admin</span>
                <span className='text-green-400 font-bold uppercase text-xs tracking-widest mt-1'>
                  Gratis
                </span>
              </div>
              <div className='pt-6 border-t border-slate-800 flex justify-between items-end'>
                <span className='text-sm font-medium text-slate-300'>
                  Total Bayar
                </span>
                <span className='text-3xl font-black text-white tracking-tight'>
                  {formatRupiah(item.price)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className='w-full bg-violet-600 hover:bg-violet-500 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-violet-900/50 relative overflow-hidden'
            >
              <div className='absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300' />
              <span className='relative flex items-center gap-2'>
                {loading ? "Memproses..." : "Bayar Sekarang"}
                {!loading && <ArrowRight size={20} />}
              </span>
            </button>

            <div className='mt-8 flex flex-col gap-3 text-center'>
              <p className='text-xs text-slate-500'>
                Dengan mengklik tombol di atas, Anda menyetujui syarat &
                ketentuan yang berlaku.
              </p>
              <div className='flex items-center justify-center gap-4 opacity-40 grayscale mt-2'>
                <div className='flex items-center gap-1.5 text-10px font-bold tracking-widest'>
                  <ShieldCheck size={14} /> MIDTRANS
                </div>
                <div className='flex items-center gap-1.5 text-10px font-bold tracking-widest'>
                  <Lock size={14} /> SSL SECURE
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
