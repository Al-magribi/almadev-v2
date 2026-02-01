"use client";

import { useActionState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { requestPasswordReset } from "@/actions/auth-action";
import { SubmitButton } from "@/components/ui/SubmitButton";
import toast from "react-hot-toast";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut" },
};

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(requestPasswordReset, null);

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <motion.div
      className="p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div {...fadeUp} className="space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 text-blue-300 px-3 py-1 text-xs">
          <ShieldCheck className="w-4 h-4" />
          Reset Password
        </div>
        <h1 className="text-2xl font-bold text-white">Lupa Password?</h1>
        <p className="text-sm text-gray-400">
          Masukkan email akun Anda. Kami akan kirimkan link untuk membuat
          password baru.
        </p>
      </motion.div>

      <motion.form {...fadeUp} action={action} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              name="email"
              type="email"
              placeholder="nama@email.com"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
              required
            />
          </div>
        </div>

        <SubmitButton label="Kirim Link Reset" icon={ArrowRight} iconPosition="right" />
      </motion.form>

      <motion.div {...fadeUp} className="mt-8 space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="text-xs text-gray-400 leading-relaxed">
            Link reset berlaku 1 jam. Jika tidak menerima email, cek folder
            spam atau pastikan email Anda terdaftar.
          </div>
        </div>

        <p className="text-center text-sm text-gray-400">
          Kembali ke{" "}
          <Link href="/signin" className="text-blue-400 hover:underline">
            halaman login
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
