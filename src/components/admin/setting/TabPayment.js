import { Settings } from "lucide-react";
import InputGroup from "./InputGroup";

export default function TabPayment({ formData, handleChange }) {
  return (
    <div className='space-y-6 animate-in fade-in zoom-in-95 duration-300'>
      <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50 flex gap-3 text-sm text-blue-800 dark:text-blue-400 mb-4'>
        <Settings className='shrink-0' size={18} />
        <p>
          Konfigurasi Midtrans untuk pembayaran otomatis. Pastikan Key dan Base
          URL sesuai dengan mode (Sandbox/Production).
        </p>
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        <InputGroup
          label='Midtrans Merchant ID'
          name='midtransMerchantId'
          value={formData.midtransMerchantId}
          onChange={handleChange}
          placeholder='G123456789'
        />
        <div className='flex items-center gap-3 pt-6'>
          <input
            type='checkbox'
            id='midtransIsProduction'
            name='midtransIsProduction'
            checked={formData.midtransIsProduction}
            onChange={handleChange}
            className='w-5 h-5 text-violet-600 rounded focus:ring-violet-500'
          />
          <label
            htmlFor='midtransIsProduction'
            className='text-sm font-medium text-zinc-700 dark:text-zinc-300'
          >
            Mode Production (Live)
          </label>
        </div>

        {/* Input Baru: Midtrans Base URL */}
        <div className='md:col-span-2'>
          <InputGroup
            label='Midtrans Base URL'
            name='midtransBaseUrl'
            value={formData.midtransBaseUrl}
            onChange={handleChange}
            placeholder='https://api.sandbox.midtrans.com'
            helper='Sandbox: https://api.sandbox.midtrans.com | Live: https://api.midtrans.com'
          />
        </div>

        <InputGroup
          label='Midtrans Client Key'
          name='midtransClientKey'
          value={formData.midtransClientKey}
          onChange={handleChange}
          placeholder='SB-Mid-client-...'
        />
        <InputGroup
          label='Midtrans Server Key'
          name='midtransServerKey'
          value={formData.midtransServerKey}
          onChange={handleChange}
          type='password'
          placeholder='SB-Mid-server-...'
        />
      </div>
    </div>
  );
}
