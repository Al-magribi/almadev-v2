import { Check, Plus, X } from "lucide-react";

export default function TabLearners({ objectives, setCourse }) {
  const addObjective = () => {
    setCourse((prev) => ({
      ...prev,
      objectives: [...(prev.objectives || []), { objective: "" }],
    }));
  };

  const updateObjective = (index, value) => {
    const newObjectives = [...objectives];
    newObjectives[index].objective = value;
    setCourse((prev) => ({ ...prev, objectives: newObjectives }));
  };

  const removeObjective = (index) => {
    const newObjectives = objectives.filter((_, i) => i !== index);
    setCourse((prev) => ({ ...prev, objectives: newObjectives }));
  };

  return (
    <div className='max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>
          Target Peserta
        </h2>
        <p className='text-zinc-500 mt-2'>
          Siapa target kursus ini? Tujuan yang jelas membantu siswa memutuskan.
        </p>
      </div>

      <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 shadow-sm overflow-hidden'>
        <div className='p-6 bg-violet-50/50 border-b border-zinc-100'>
          <h3 className='font-semibold text-violet-900'>
            Apa yang akan dipelajari siswa?
          </h3>
        </div>

        <ul className='divide-y divide-zinc-100'>
          {objectives?.map((obj, i) => (
            <li
              key={i}
              className='group flex items-start gap-4 p-5 hover:bg-zinc-50 transition-colors'
            >
              <div className='mt-1 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200'>
                <Check size={14} strokeWidth={3} />
              </div>
              <div className='flex-1'>
                <input
                  value={obj.objective}
                  onChange={(e) => updateObjective(i, e.target.value)}
                  className='w-full bg-transparent border-none p-0 text-sm text-zinc-700 focus:ring-0 placeholder:text-zinc-300 font-medium'
                  placeholder='misal: Memahami dasar React Hooks'
                />
              </div>
              <button
                onClick={() => removeObjective(i)}
                className='p-2 text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all'
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>

        <div className='p-4 bg-zinc-50 border-t border-zinc-100'>
          <button
            onClick={addObjective}
            className='flex items-center gap-2 text-sm font-semibold text-violet-600 hover:bg-violet-100 px-4 py-2 rounded-lg transition-all'
          >
            <Plus size={16} />
            Tambah Tujuan Belajar
          </button>
        </div>
      </div>
    </div>
  );
}
