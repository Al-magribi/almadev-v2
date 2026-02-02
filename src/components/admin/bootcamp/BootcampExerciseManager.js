"use client";

import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold,
  BookOpenCheck,
  Code,
  ImageIcon,
  Italic,
  List,
  PlusCircle,
  Save,
  Trash2,
  X,
} from "lucide-react";
import DeleteConfirmation from "@/components/ui/DeleteConfirmation";
import {
  createBootcampExercise,
  deleteBootcampExercise,
  updateBootcampExercise,
} from "@/actions/bootcamp-actions";
import { formatDate } from "@/lib/client-utils";

const defaultTitle = "Latihan Baru";
const defaultContent = "<p>Tulis instruksi latihan di sini...</p>";

export default function BootcampExerciseManager({ initialExercises = [] }) {
  const [entries, setEntries] = useState(initialExercises);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState(defaultContent);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: content || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[220px] px-4 py-3 text-sm text-gray-800 dark:text-gray-200",
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || !isModalOpen) return;
    editor.commands.setContent(content || "", false);
  }, [editor, isModalOpen, activeEntryId]);

  const handleOpenNew = () => {
    setActiveEntryId(null);
    setTitle(defaultTitle);
    setContent(defaultContent);
    setIsModalOpen(true);
  };

  const handleOpenExisting = (entry) => {
    setActiveEntryId(entry.id);
    setTitle(entry.title || defaultTitle);
    setContent(entry.content || "");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    const payload = { title: title.trim(), content: content || "" };
    const result = activeEntryId
      ? await updateBootcampExercise({ exerciseId: activeEntryId, ...payload })
      : await createBootcampExercise(payload);
    setIsSaving(false);

    if (result?.success) {
      if (activeEntryId) {
        setEntries((prev) =>
          prev.map((item) =>
            item.id === activeEntryId ? { ...item, ...result.data } : item,
          ),
        );
      } else {
        setEntries((prev) => [result.data, ...prev]);
        setActiveEntryId(result.data.id);
      }
    }
  };

  const handleDelete = async () => {
    if (!activeEntryId) return;
    setIsDeleting(true);
    const result = await deleteBootcampExercise({
      exerciseId: activeEntryId,
    });
    setIsDeleting(false);

    if (result?.success) {
      setEntries((prev) => prev.filter((item) => item.id !== activeEntryId));
      setActiveEntryId(null);
      setTitle(defaultTitle);
      setContent(defaultContent);
      setIsModalOpen(false);
      setDeleteOpen(false);
    }
  };

  const latestUpdated = useMemo(() => {
    if (!entries.length) return null;
    return entries[0]?.updatedAt || entries[0]?.createdAt || null;
  }, [entries]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <BookOpenCheck className='w-4 h-4' />
          Latihan Bootcamp
          {latestUpdated ? (
            <span className='text-xs text-gray-400'>
              (Update terakhir: {formatDate(latestUpdated)})
            </span>
          ) : null}
        </div>
        <button
          onClick={handleOpenNew}
          className='px-3 py-2 text-xs rounded-lg bg-violet-600 text-white hover:bg-violet-700 inline-flex items-center gap-2'
        >
          <PlusCircle className='w-4 h-4' />
          Buat Latihan
        </button>
      </div>

      <div className='border border-gray-200 dark:border-gray-800 rounded-xl p-3 space-y-3 bg-white dark:bg-gray-900'>
        <div className='text-xs font-semibold text-gray-500'>
          Daftar Latihan
        </div>
        <div className='space-y-2 max-h-360px overflow-y-auto pr-1'>
          {entries.length === 0 ? (
            <p className='text-xs text-gray-400'>Belum ada latihan.</p>
          ) : (
            entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => handleOpenExisting(entry)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs border ${
                  activeEntryId === entry.id
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <p className='font-semibold text-gray-900'>{entry.title}</p>
                <p className='text-[10px] text-gray-400'>
                  {entry.updatedAt ? formatDate(entry.updatedAt) : ""}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-800'>
              <div className='min-w-0'>
                <p className='text-xs text-gray-500'>Judul Latihan</p>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className='text-base font-semibold text-gray-900 dark:text-white bg-transparent outline-none w-full'
                />
              </div>
              <div className='flex flex-wrap gap-2'>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className='px-3 py-2 text-xs rounded-lg bg-violet-600 text-white hover:bg-violet-700 inline-flex items-center gap-2 disabled:opacity-50'
                >
                  <Save className='w-4 h-4' />
                  {isSaving ? "Menyimpan" : "Simpan"}
                </button>
                <button
                  onClick={() => setDeleteOpen(true)}
                  disabled={isDeleting || !activeEntryId}
                  className='px-3 py-2 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 inline-flex items-center gap-2 disabled:opacity-50'
                >
                  <Trash2 className='w-4 h-4' />
                  Hapus
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className='px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 inline-flex items-center gap-2'
                >
                  <X className='w-4 h-4' />
                  Tutup
                </button>
              </div>
            </div>

            <div className='p-5'>
              <div className='border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900'>
                <div className='flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800'>
                  <ToolButton
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    active={editor?.isActive("bold")}
                    icon={<Bold size={16} />}
                    title='Bold'
                  />
                  <ToolButton
                    onClick={() =>
                      editor?.chain().focus().toggleItalic().run()
                    }
                    active={editor?.isActive("italic")}
                    icon={<Italic size={16} />}
                    title='Italic'
                  />
                  <ToolButton
                    onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                    active={editor?.isActive("codeBlock")}
                    icon={<Code size={16} />}
                    title='Code block'
                  />
                  <ToolButton
                    onClick={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
                    active={editor?.isActive("bulletList")}
                    icon={<List size={16} />}
                    title='Bullet list'
                  />
                  <ToolButton
                    onClick={() => {
                      const url = window.prompt("Masukkan URL Gambar:");
                      if (url) {
                        editor?.chain().focus().setImage({ src: url }).run();
                      }
                    }}
                    icon={<ImageIcon size={16} />}
                    title='Image'
                  />
                </div>
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmation
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title='Hapus Latihan'
        description='Latihan ini akan dihapus permanen dan tidak bisa dikembalikan.'
        isDeleting={isDeleting}
      />
    </div>
  );
}

function ToolButton({ onClick, active, icon, title }) {
  return (
    <button
      type='button'
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${
        active ? "bg-gray-200 dark:bg-gray-700 text-violet-600" : "text-gray-500"
      }`}
    >
      {icon}
    </button>
  );
}
