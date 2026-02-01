"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  MailCheck,
} from "lucide-react";

const statusConfig = {
  success: {
    icon: CheckCircle2,
    title: "Akun Aktif!",
    badge: "AKTIF",
    tone: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    glow: "bg-emerald-500/20",
    button: {
      href: "/signin",
      label: "Login Sekarang",
      icon: ArrowRight,
    },
  },
  error: {
    icon: XCircle,
    title: "Aktivasi Gagal",
    badge: "GAGAL",
    tone: "bg-red-500/10 text-red-300 border-red-500/20",
    glow: "bg-red-500/20",
    button: {
      href: "/signup",
      label: "Daftar Ulang",
      icon: ArrowRight,
    },
  },
  warning: {
    icon: ShieldAlert,
    title: "Link Tidak Valid",
    badge: "TIDAK VALID",
    tone: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
    glow: "bg-yellow-500/20",
    button: {
      href: "/",
      label: "Kembali ke Beranda",
      icon: ArrowRight,
    },
  },
};

export default function ActivateClient({
  status = "warning",
  message,
  helper,
}) {
  const config = statusConfig[status] || statusConfig.warning;
  const Icon = config.icon;
  const ButtonIcon = config.button.icon;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-950 p-4 relative overflow-hidden">
      <div className={`absolute -top-24 -left-24 h-72 w-72 rounded-full blur-[120px] ${config.glow}`} />
      <div className="absolute bottom-[-25%] right-[-10%] h-80 w-80 rounded-full bg-sky-500/10 blur-[140px]" />

      <motion.div
        className="max-w-lg w-full bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-3xl p-8 text-center shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border ${config.tone}`}>
            <MailCheck className="h-4 w-4" />
            {config.badge}
          </div>

          <div className={`rounded-full p-4 ${config.tone}`}>
            <Icon className="w-14 h-14" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">{config.title}</h1>
            <p className="text-gray-300 leading-relaxed">{message}</p>
            {helper ? (
              <p className="text-sm text-gray-500">{helper}</p>
            ) : null}
          </div>
        </motion.div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
        >
          <Link
            href={config.button.href}
            className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 group"
          >
            {config.button.label}
            <ButtonIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
