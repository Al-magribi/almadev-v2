"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Italic, Code, ImageIcon, List } from "lucide-react";

export default function TiptapEditor({ content, onChange, onSend, loading }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true, // Simpel: base64. Production: upload ke cloud
      }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[100px] px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = () => {
    const url = window.prompt("Masukkan URL Gambar:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className='border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm'>
      {/* Toolbar */}
      <div className='flex items-center gap-1 p-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700'>
        <ToolButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          icon={<Bold size={16} />}
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          icon={<Italic size={16} />}
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          icon={<Code size={16} />}
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          icon={<List size={16} />}
        />
        <ToolButton onClick={addImage} icon={<ImageIcon size={16} />} />
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} />

      {/* Footer Action */}
      <div className='flex justify-between items-center p-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800'>
        <span className='text-xs text-zinc-400'>
          Shift + Enter untuk baris baru
        </span>
        <button
          onClick={onSend}
          disabled={loading || editor.isEmpty}
          className='bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50'
        >
          {loading ? "Mengirim..." : "Kirim Balasan"}
        </button>
      </div>
    </div>
  );
}

function ToolButton({ onClick, active, icon }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition ${active ? "bg-zinc-200 dark:bg-zinc-700 text-violet-600" : "text-zinc-500"}`}
    >
      {icon}
    </button>
  );
}
