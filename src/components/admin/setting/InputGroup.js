export default function InputGroup({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  helper,
}) {
  return (
    <div>
      <label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1'>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className='w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500 outline-none transition'
      />
      {helper && <p className='text-xs text-zinc-500 mt-1'>{helper}</p>}
    </div>
  );
}
