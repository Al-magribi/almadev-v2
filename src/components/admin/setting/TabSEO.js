import InputGroup from "./InputGroup";

export default function TabSEO({ formData, handleChange }) {
  return (
    <div className='space-y-6 animate-in fade-in duration-300'>
      <div className='space-y-4'>
        <InputGroup
          label='SEO Title'
          name='seoTitle'
          value={formData.seoTitle}
          onChange={handleChange}
          placeholder='Judul yang muncul di Google'
        />
        <div>
          <label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1'>
            SEO Description
          </label>
          <textarea
            name='seoDescription'
            value={formData.seoDescription}
            onChange={handleChange}
            rows={3}
            className='w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500 outline-none transition'
            placeholder='Deskripsi singkat website...'
          />
        </div>
        <InputGroup
          label='Keywords'
          name='seoKeywords'
          value={formData.seoKeywords}
          onChange={handleChange}
          placeholder='course, belajar, koding (pisahkan dengan koma)'
        />
      </div>

      <div className='grid md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800'>
        <InputGroup
          label='Google Analytics ID'
          name='googleAnalyticsId'
          value={formData.googleAnalyticsId}
          onChange={handleChange}
          placeholder='G-XXXXXXXXXX'
        />
        <InputGroup
          label='Facebook Pixel ID'
          name='metaPixelId'
          value={formData.metaPixelId}
          onChange={handleChange}
          placeholder='1234567890'
        />
      </div>
    </div>
  );
}
