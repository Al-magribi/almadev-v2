"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Code, ImageIcon, Italic, List, Terminal } from "lucide-react";

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
      },
    };
  },
});

export default function QnaEditor({
  value,
  onChange,
  onSubmit,
  onUploadImage,
  submitLabel,
  loading,
  placeholder,
}) {
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage.configure({
        inline: true,
        allowBase64: false,
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[120px] px-4 py-3 text-sm text-gray-800 dark:text-gray-200 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-code:text-[0.85em] prose-pre:bg-gray-900 prose-pre:text-gray-100",
        "data-placeholder": placeholder || "Tulis sesuatu...",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || "") !== current) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  const handleImagePick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onUploadImage) return;
    const url = await onUploadImage(file);
    if (url && editor) {
      const width = window.prompt(
        "Atur lebar gambar (px atau %), kosongkan untuk auto:",
      );
      const style =
        width && width.trim()
          ? `width: ${width.trim()}; height: auto;`
          : null;
      editor.chain().focus().setImage({ src: url, style }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className='border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm'>
      <div className='flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800'>
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
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          icon={<Code size={16} />}
          title='Inline code'
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          icon={<Terminal size={16} />}
          title='Code block'
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          icon={<List size={16} />}
        />
        <ToolButton
          onClick={handleImagePick}
          icon={<ImageIcon size={16} />}
          title='Upload gambar'
        />
        <ToolButton
          onClick={() => {
            if (!editor.isActive("image")) return;
            const width = window.prompt(
              "Ubah lebar gambar (px atau %), kosongkan untuk auto:",
            );
            const style =
              width && width.trim()
                ? `width: ${width.trim()}; height: auto;`
                : null;
            editor.chain().focus().updateAttributes("image", { style }).run();
          }}
          icon={<span className='text-xs font-semibold'>W</span>}
          title='Resize gambar'
        />
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleImageUpload}
        />
      </div>

      <EditorContent editor={editor} />

      <div className='flex justify-between items-center p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800'>
        <span className='text-xs text-gray-400'>Shift + Enter untuk baris baru</span>
        <button
          type='button'
          onClick={onSubmit}
          disabled={loading || editor.isEmpty}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50'
        >
          {loading ? "Mengirim..." : submitLabel || "Kirim"}
        </button>
      </div>
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
        active ? "bg-gray-200 dark:bg-gray-700 text-blue-600" : "text-gray-500"
      }`}
    >
      {icon}
    </button>
  );
}
