"use client";

import { useEffect, useState } from "react";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "@/actions/course-actions";
import DeleteConfirmation from "@/components/ui/DeleteConfirmation";
import { Pencil, Trash2 } from "lucide-react";

export default function Note({ courseId, lessonId }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    getNotes({ courseId, lessonId }).then((data) => {
      if (!mounted) return;
      setNotes(data || []);
    });
    return () => {
      mounted = false;
    };
  }, [courseId, lessonId]);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    const result = await createNote({
      courseId,
      lessonId,
      title: title.trim(),
      content: content.trim(),
    });
    setLoading(false);

    if (result?.success) {
      setNotes((prev) => [result.data, ...prev]);
      setTitle("");
      setContent("");
    }
  };

  const handleUpdate = async (noteId) => {
    if (!editingTitle.trim() || !editingContent.trim()) return;
    setLoading(true);
    const result = await updateNote({
      noteId,
      title: editingTitle.trim(),
      content: editingContent.trim(),
    });
    setLoading(false);

    if (result?.success) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? { ...note, ...result.data }
            : note,
        ),
      );
      setEditingId(null);
      setEditingTitle("");
      setEditingContent("");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const result = await deleteNote({ noteId: deleteId });
    setIsDeleting(false);

    if (result?.success) {
      setNotes((prev) => prev.filter((note) => note.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='border border-gray-200 dark:border-gray-800 rounded-2xl p-5 bg-white dark:bg-gray-900'>
        <h4 className='text-lg font-semibold text-gray-900 dark:text-white'>
          Catatan Baru
        </h4>
        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
          Simpan insight penting selama belajar.
        </p>
        <div className='mt-4 space-y-3'>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder='Judul catatan'
            className='w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40'
          />
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={4}
            placeholder='Tulis catatan kamu di sini...'
            className='w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40'
          />
          <button
            onClick={handleCreate}
            disabled={loading}
            className='px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
          >
            {loading ? "Menyimpan..." : "Simpan Catatan"}
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className='border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-5 text-sm text-gray-500'>
          Belum ada catatan tersimpan.
        </div>
      ) : (
        <div className='space-y-4'>
          {notes.map((note) => (
            <div
              key={note.id}
              className='border border-gray-200 dark:border-gray-800 rounded-2xl p-5 bg-white dark:bg-gray-900'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <h5 className='text-base font-semibold text-gray-900 dark:text-white'>
                    {note.title}
                  </h5>
                  <p className='text-xs text-gray-400 mt-1'>
                    {note.updatedAt
                      ? new Date(note.updatedAt).toLocaleString("id-ID")
                      : ""}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => {
                      setEditingId(note.id);
                      setEditingTitle(note.title);
                      setEditingContent(note.content);
                    }}
                    className='text-gray-400 hover:text-blue-600'
                  >
                    <Pencil className='w-4 h-4' />
                  </button>
                  <button
                    type='button'
                    onClick={() => setDeleteId(note.id)}
                    className='text-gray-400 hover:text-red-500'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>

              {editingId === note.id ? (
                <div className='mt-4 space-y-3'>
                  <input
                    value={editingTitle}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    className='w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                  />
                  <textarea
                    value={editingContent}
                    onChange={(event) => setEditingContent(event.target.value)}
                    rows={4}
                    className='w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                  />
                  <div className='flex items-center gap-3'>
                    <button
                      type='button'
                      onClick={() => handleUpdate(note.id)}
                      disabled={loading}
                      className='px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                    >
                      {loading ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button
                      type='button'
                      onClick={() => setEditingId(null)}
                      className='text-xs text-gray-400 hover:text-gray-600'
                    >
                      Batalkan edit
                    </button>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-gray-600 dark:text-gray-300 mt-3 whitespace-pre-wrap'>
                  {note.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmation
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title='Hapus Catatan'
        description='Catatan ini akan dihapus permanen dan tidak bisa dikembalikan.'
        isDeleting={isDeleting}
      />
    </div>
  );
}
