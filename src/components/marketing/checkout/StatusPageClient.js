"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle, ArrowLeft, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { syncTransactionStatus } from "@/actions/transaction-actions";
import { initFacebookPixel, trackFacebookEvent } from "@/lib/facebook-pixel";

export default function StatusPageClient({
  searchParams,
  metaPixelId,
  transaction,
}) {
  const router = useRouter();
  const params = searchParams || {};
  const orderId = params.order_id;
  const statusCode = params.status_code;

  const isSuccess = statusCode === "200";
  const isPending = statusCode === "201";
  const hasTrackedPurchase = useRef(false);

  const getStatusLockKey = (id) =>
    `status_locked_${String(id).replace(/[^A-Za-z0-9_-]/g, "_")}`;

  const setCookie = (key, value) => {
    const maxAge = 60 * 60 * 24 * 30; // 30 hari
    document.cookie = `${key}=${value}; path=/; max-age=${maxAge}`;
  };

  const getCookie = (key) => {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${key.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}=([^;]*)`),
    );
    return match ? decodeURIComponent(match[1]) : null;
  };

  useEffect(() => {
    if (!orderId) return;

    const lockKey = getStatusLockKey(orderId);
    const locked =
      localStorage.getItem(lockKey) === "1" || getCookie(lockKey) === "1";
    if (locked) {
      router.replace("/");
      return;
    }

    syncTransactionStatus(orderId).catch(() => {});
  }, [orderId, router]);

  useEffect(() => {
    if (!isSuccess || hasTrackedPurchase.current) return;
    const pixelId = String(metaPixelId || "").trim();
    if (!pixelId) return;

    initFacebookPixel(pixelId);

    const payload = {
      currency: "IDR",
      value: Number(transaction?.price || 0),
      num_items: 1,
      event_id: orderId,
    };

    if (transaction?.itemId) {
      payload.content_ids = [String(transaction.itemId)];
    }
    if (transaction?.itemName) {
      payload.content_name = transaction.itemName;
    }
    if (transaction?.itemType) {
      payload.content_type =
        transaction.itemType === "Product" ? "product" : "course";
    }

    trackFacebookEvent("Purchase", payload);
    hasTrackedPurchase.current = true;
  }, [isSuccess, metaPixelId, orderId, transaction]);

  const handleExit = (target) => {
    if (orderId) {
      const lockKey = getStatusLockKey(orderId);
      localStorage.setItem(lockKey, "1");
      setCookie(lockKey, "1");
    }
    localStorage.setItem("checkout_locked", "1");
    setCookie("checkout_locked", "1");
    router.push(target);
  };

  return (
    <div className='min-h-screen bg-slate-50 flex items-center justify-center p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className='max-w-md w-full bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 text-center'
      >
        <div className='mb-6 flex justify-center'>
          {isSuccess ? (
            <div className='bg-green-100 p-4 rounded-full text-green-600'>
              <CheckCircle2 size={48} />
            </div>
          ) : isPending ? (
            <div className='bg-amber-100 p-4 rounded-full text-amber-600'>
              <Clock size={48} />
            </div>
          ) : (
            <div className='bg-red-100 p-4 rounded-full text-red-600'>
              <XCircle size={48} />
            </div>
          )}
        </div>

        <h1 className='text-2xl font-black text-slate-900 mb-2'>
          {isSuccess
            ? "Pembayaran Berhasil!"
            : isPending
              ? "Menunggu Pembayaran"
              : "Transaksi Bermasalah"}
        </h1>
        <p className='text-slate-500 mb-8 text-sm'>
          {isSuccess
            ? "Akses Anda telah aktif. Silakan cek dashboard untuk mulai belajar."
            : "Silakan selesaikan pembayaran Anda melalui instruksi di aplikasi pilihan Anda."}
        </p>

        <div className='bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100'>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
            Order ID
          </p>
          <p className='font-mono text-slate-700'>{orderId || "N/A"}</p>
        </div>

        <div className='space-y-3'>
          <Link
            href='/signin'
            onClick={(e) => {
              e.preventDefault();
              handleExit("/signin");
            }}
            className='w-full bg-violet-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-violet-700 transition-all'
          >
            <LogIn size={18} /> Masuk
          </Link>
          <Link
            href='/'
            onClick={(e) => {
              e.preventDefault();
              handleExit("/");
            }}
            className='w-full bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all'
          >
            <ArrowLeft size={18} /> Kembali ke Beranda
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
