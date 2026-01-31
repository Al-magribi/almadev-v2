export default function CurriculumSection() {
  return (
    <section id='silabus' className='py-24 bg-slate-50'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>
            Kurikulum Berstandar Industri
          </h2>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          <div className='p-8 bg-white rounded-2xl shadow-sm border border-slate-100'>
            <div className='w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg mb-6 font-bold'>
              01
            </div>
            <h3 className='text-xl font-bold mb-4'>Frontend Mastery</h3>
            <ul className='space-y-3 text-slate-600 text-sm'>
              <li>• Fundamental HTML & CSS </li>
              <li>• Advanced Responsive Design & Grid </li>
              <li>• React JS & State Management Redux </li>
            </ul>
          </div>
          <div className='p-8 bg-white rounded-2xl shadow-sm border border-slate-100'>
            <div className='w-12 h-12 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-lg mb-6 font-bold'>
              02
            </div>
            <h3 className='text-xl font-bold mb-4'>Backend & API</h3>
            <ul className='space-y-3 text-slate-600 text-sm'>
              <li>• Node.js & Express.js </li>
              <li>• API Integration & Midtrans Payment</li>
              <li>• PostgreSQL & MongoDB </li>
            </ul>
          </div>
          <div className='p-8 bg-white rounded-2xl shadow-sm border border-slate-100'>
            <div className='w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-lg mb-6 font-bold'>
              03
            </div>
            <h3 className='text-xl font-bold mb-4'>Project & Deploy</h3>
            <ul className='space-y-3 text-slate-600 text-sm'>
              <li>• Real-world E-commerce Project </li>
              <li>• Facebook Clone (Memoria) </li>
              <li>• Production Deployment </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
