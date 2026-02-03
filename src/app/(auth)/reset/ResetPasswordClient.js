"use client";

import { useActionState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  LockKeyhole,
  ArrowRight,
  ShieldAlert,
  CircleCheck,
} from "lucide-react";
import { resetPassword } from "@/actions/auth-action";
import { SubmitButton } from "@/components/ui/SubmitButton";
import toast from "react-hot-toast";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut" },
};

export default function ResetPasswordClient() {
  const [state, action] = useActionState(resetPassword, null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  if (!token) {
    return (
      <motion.div
        className="p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="space-y-3 text-center">
          <div className="mx-auto inline-flex items-center justify-center rounded-full bg-red-500/10 p-3">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white">Token Tidak Ada</h1>
          <p className="text-sm text-gray-400">
            Link reset tidak valid atau sudah kedaluwarsa.
          </p>
          <Link
            href="/forgot"
            className="inline-flex items-center justify-center rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Minta Link Baru
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div {...fadeUp} className="space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-300 px-3 py-1 text-xs">
          <CircleCheck className="w-4 h-4" />
          Buat Password Baru
        </div>
        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        <p className="text-sm text-gray-400">
          Masukkan password baru Anda. Pastikan kombinasi yang kuat dan aman.
        </p>
      </motion.div>

      <motion.form {...fadeUp} action={action} className="space-y-5">
        <input type="hidden" name="token" value={token} />

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Password Baru
          </label>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              name="password"
              type="password"
              placeholder="Minimal 6 karakter"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Konfirmasi Password
          </label>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Ulangi password baru"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
              required
            />
          </div>
        </div>

        <SubmitButton
          label="Simpan Password Baru"
          icon={ArrowRight}
          iconPosition="right"
        />
      </motion.form>

      <motion.div {...fadeUp} className="mt-6 text-center text-sm text-gray-400">
        Sudah ingat password?{" "}
        <Link href="/signin" className="text-emerald-400 hover:underline">
          Login
        </Link>
      </motion.div>
    </motion.div>
  );
}
