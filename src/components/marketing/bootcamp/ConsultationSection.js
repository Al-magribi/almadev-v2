"use client";
import { motion } from "framer-motion";

export default function ConsultationSection() {
  const whatsappNumber = "6287720776871"; // Format internasional
  const message = encodeURIComponent(
    "Halo ALMADEV, saya ingin bertanya lebih lanjut mengenai Batch 1 JavaScript Full Stack Web Developer Bootcamp.",
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <section className='py-16 bg-blue-50'>
      <div className='max-w-4xl mx-auto px-4 text-center'>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className='bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-blue-100'
        >
          <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6 animate-pulse'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='32'
              height='32'
              viewBox='0 0 24 24'
              fill='currentColor'
            >
              <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
            </svg>
          </div>
          <h2 className='text-3xl font-bold text-slate-900 mb-4'>
            Masih ada yang ingin ditanyakan?
          </h2>
          <p className='text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed'>
            Dapatkan penjelasan lebih mendalam mengenai kurikulum, metode
            belajar, atau sistem pembayaran langsung dengan instruktur kami.
          </p>
          <a
            href={whatsappUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white font-bold rounded-full shadow-lg hover:bg-[#20ba5a] transition-all transform hover:-translate-y-1'
          >
            Konsultasi via WhatsApp
          </a>
          <p className='mt-6 text-sm text-slate-400 font-medium'>
            Fast Response: Senin - Jum'at | 09.00 - 15.00 WIB
          </p>
        </motion.div>
      </div>
    </section>
  );
}
