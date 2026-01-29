import InputGroup from "./InputGroup";
import { AlertTriangle } from "lucide-react";

export default function TabGeneral({ formData, handleChange }) {
  return (
    <div className='space-y-6 animate-in fade-in duration-300'>
      <div className='grid md:grid-cols-2 gap-6'>
        <InputGroup
          label='Nama Website'
          name='websiteName'
          value={formData.websiteName}
          onChange={handleChange}
          placeholder='Contoh: My Academy'
        />
        <InputGroup
          label='URL Logo'
          name='websiteLogo'
          value={formData.websiteLogo}
          onChange={handleChange}
          placeholder='https://...'
        />
        <InputGroup
          label='URL Favicon'
          name='websiteFavicon'
          value={formData.websiteFavicon}
          onChange={handleChange}
          placeholder='https://...'
        />
      </div>

      <div className='pt-4 border-t border-zinc-100 dark:border-zinc-800'>
        <div className='flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl'>
          <AlertTriangle className='text-amber-600 shrink-0' size={20} />
          <div>
            <h4 className='text-sm font-semibold text-amber-800 dark:text-amber-400'>
              Maintenance Mode
            </h4>
            <p className='text-xs text-amber-700 dark:text-amber-500 mt-1 mb-3'>
              Jika diaktifkan, pengunjung tidak bisa mengakses halaman kursus.
            </p>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                name='maintenanceMode'
                checked={formData.maintenanceMode}
                onChange={handleChange}
                className='sr-only peer'
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-2px after:left-2px after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
