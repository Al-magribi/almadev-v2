"use client";

import { useState } from "react";
import { ArrowRight, Mail, Phone, User, X } from "lucide-react";
import { createBootcampPayment } from "@/actions/bootcamp-actions";

export default function BootcampRegistrationModal({
  isOpen,
  onClose,
  defaultValues,
}) {
  const [formData, setFormData] = useState({
    name: defaultValues?.name || "",
    email: defaultValues?.email || "",
    phone: defaultValues?.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await createBootcampPayment({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    });

    if (res?.success && res.redirectUrl) {
      window.location.href = res.redirectUrl;
      return;
    }

    setError(res?.error || "Gagal membuat pembayaran.");
    setLoading(false);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
      <div className='bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative'>
        <button
          onClick={onClose}
          className='absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full transition-colors'
        >
          <X size={20} className='text-slate-500' />
        </button>

        <div className='p-8'>
          <h2 className='text-2xl font-bold text-slate-900 mb-2'>
            Daftar Bootcamp
          </h2>
          <p className='text-slate-500 text-sm mb-6'>
            Isi data di bawah untuk melanjutkan pembayaran biaya pendaftaran.
          </p>

          <div className='mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600'>
            Biaya pendaftaran:{" "}
            <span className='font-semibold text-slate-900'>Rp 100.000</span>
            <br />
            Biaya kelas:{" "}
            <span className='font-semibold text-slate-900'>Rp 3.000.000</span>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1'>
              <label className='text-xs font-bold uppercase tracking-wider text-slate-400 ml-1'>
                Nama Lengkap
              </label>
              <div className='relative group'>
                <User
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors'
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
                  className='w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all'
                />
              </div>
            </div>

            <div className='space-y-1'>
              <label className='text-xs font-bold uppercase tracking-wider text-slate-400 ml-1'>
                Email Aktif
              </label>
              <div className='relative group'>
                <Mail
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors'
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
                  className='w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all'
                />
              </div>
            </div>

            <div className='space-y-1'>
              <label className='text-xs font-bold uppercase tracking-wider text-slate-400 ml-1'>
                WhatsApp
              </label>
              <div className='relative group'>
                <Phone
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors'
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
                  className='w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all'
                />
              </div>
            </div>

            {error ? (
              <div className='text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3'>
                {error}
              </div>
            ) : null}

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl mt-6 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 disabled:opacity-70'
            >
              {loading ? "Memproses..." : "Lanjut Pembayaran"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
