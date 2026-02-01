"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  createEditorEntry,
  deleteEditorEntry,
  getEditorEntries,
  updateEditorEntry,
} from "@/actions/course-actions";
import { Code, PlayCircle, Save, Trash2, X } from "lucide-react";
import DeleteConfirmation from "@/components/ui/DeleteConfirmation";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const defaultCode = {
  html: "<div class='card'>\n  <h1>Hello, World!</h1>\n  <p>Edit HTML, CSS, JS lalu klik Run.</p>\n</div>",
  css: ".card{font-family:system-ui;max-width:420px;padding:20px;border-radius:16px;background:#111827;color:#fff}\n.card h1{margin:0 0 8px 0;font-size:24px}",
  js: "console.log('Ready');",
};

export default function TextEditor({ courseId, lessonId }) {
  const [entries, setEntries] = useState([]);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [title, setTitle] = useState("Workspace HTML/CSS/JS");
  const [code, setCode] = useState(defaultCode);
  const [tab, setTab] = useState("html");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [outputSrc, setOutputSrc] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    getEditorEntries({ courseId, lessonId }).then((data) => {
      if (!mounted) return;
      setEntries(data || []);
    });
    return () => {
      mounted = false;
    };
  }, [courseId, lessonId]);

  const handleRun = () => {
    setConsoleLogs([]);
    setOutputSrc(buildPreview(code));
  };

  const handleOpenNew = () => {
    setActiveEntryId(null);
    setTitle("Workspace HTML/CSS/JS");
    setCode(defaultCode);
    setOutputSrc("");
    setConsoleLogs([]);
    setIsModalOpen(true);
  };

  const handleOpenExisting = (entry) => {
    setActiveEntryId(entry.id);
    setTitle(entry.title);
    const parsed = parseCode(entry.code);
    setCode(parsed);
    setOutputSrc(buildPreview(parsed));
    setConsoleLogs([]);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!courseId || !title.trim()) return;
    setIsSaving(true);
    const payload = {
      courseId,
      lessonId,
      title: title.trim(),
      code,
    };
    const result = activeEntryId
      ? await updateEditorEntry({ entryId: activeEntryId, ...payload })
      : await createEditorEntry(payload);
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
    const result = await deleteEditorEntry({ entryId: activeEntryId });
    setIsDeleting(false);

    if (result?.success) {
      setEntries((prev) => prev.filter((item) => item.id !== activeEntryId));
      setActiveEntryId(null);
      setTitle("Workspace HTML/CSS/JS");
      setCode(defaultCode);
      setOutputSrc("");
      setConsoleLogs([]);
      setIsModalOpen(false);
      setDeleteOpen(false);
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (event) => {
      if (!event?.data || event.data.type !== "console") return;
      setConsoleLogs((prev) => [
        ...prev,
        {
          level: event.data.level || "log",
          args: event.data.args || [],
          timestamp: new Date().toISOString(),
        },
      ]);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [isModalOpen]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <Code className='w-4 h-4' />
          Editor HTML/CSS/JS
        </div>
        <button
          onClick={handleOpenNew}
          className='px-3 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2'
        >
          <PlayCircle className='w-4 h-4' />
          Baru
        </button>
      </div>

      <div className='border border-gray-200 dark:border-gray-800 rounded-xl p-3 space-y-3 bg-white dark:bg-gray-900'>
        <div className='text-xs font-semibold text-gray-500'>
          Daftar Workspace
        </div>
        <div className='space-y-2 max-h-360px overflow-y-auto pr-1'>
          {entries.length === 0 ? (
            <p className='text-xs text-gray-400'>Belum ada workspace.</p>
          ) : (
            entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => handleOpenExisting(entry)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs border ${
                  activeEntryId === entry.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <p className='font-semibold text-gray-900'>{entry.title}</p>
                <p className='text-[10px] text-gray-400'>
                  {entry.updatedAt
                    ? new Date(entry.updatedAt).toLocaleString("id-ID")
                    : ""}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden'>
            <div className='flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800'>
              <div className='min-w-0'>
                <p className='text-xs text-gray-500'>Workspace</p>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className='text-base font-semibold text-gray-900 dark:text-white bg-transparent outline-none w-full'
                />
              </div>
              <div className='flex flex-wrap gap-2'>
                <button
                  onClick={handleRun}
                  className='px-3 py-2 text-xs rounded-lg bg-gray-900 text-white hover:bg-gray-800 inline-flex items-center gap-2'
                >
                  <PlayCircle className='w-4 h-4' />
                  Run
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className='px-3 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-50'
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

            <div className='p-5 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4'>
              <div className='space-y-3'>
                <div className='flex flex-wrap gap-2'>
                  {[
                    { id: "html", label: "HTML" },
                    { id: "css", label: "CSS" },
                    { id: "js", label: "JavaScript" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTab(item.id)}
                      className={`px-3 py-1.5 text-xs rounded-full border ${
                        tab === item.id
                          ? "border-blue-600 text-blue-600"
                          : "border-gray-200 text-gray-500"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className='border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900'>
                  <MonacoEditor
                    height='420px'
                    theme='vs-dark'
                    language={tab === "js" ? "javascript" : tab}
                    value={code[tab]}
                    onChange={(value) =>
                      setCode((prev) => ({ ...prev, [tab]: value || "" }))
                    }
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: "on",
                      wordWrap: "on",
                    }}
                  />
                </div>
              </div>

              <div className='border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900'>
                <div className='px-4 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200 dark:border-gray-800'>
                  Preview
                </div>
                <div className='grid grid-rows-[1fr_140px] h-420px'>
                  {outputSrc ? (
                    <iframe
                      title='preview'
                      className='w-full h-full bg-white'
                      sandbox='allow-scripts allow-same-origin'
                      srcDoc={outputSrc}
                    />
                  ) : (
                    <div className='h-full flex items-center justify-center text-xs text-gray-400'>
                      Klik Run untuk menampilkan hasil.
                    </div>
                  )}
                  <div className='border-t border-gray-200 dark:border-gray-800 bg-gray-900 text-gray-100 text-xs font-mono overflow-y-auto'>
                    <div className='px-3 py-2 text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-800'>
                      Console
                    </div>
                    <div className='px-3 py-2 space-y-1'>
                      {consoleLogs.length === 0 ? (
                        <p className='text-gray-500'>Belum ada log.</p>
                      ) : (
                        consoleLogs.map((log, index) => (
                          <div
                            key={`${log.timestamp}-${index}`}
                            className='whitespace-pre-wrap'
                          >
                            <span
                              className={`mr-2 ${
                                log.level === "error"
                                  ? "text-red-400"
                                  : log.level === "warn"
                                    ? "text-yellow-300"
                                    : "text-emerald-300"
                              }`}
                            >
                              {log.level}
                            </span>
                            <span>{log.args.join(" ")}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <DeleteConfirmation
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title='Hapus Workspace'
        description='Workspace ini akan dihapus permanen dan tidak bisa dikembalikan.'
        isDeleting={isDeleting}
      />
    </div>
  );
}

function parseCode(raw) {
  if (!raw) return { ...defaultCode };
  try {
    const parsed = JSON.parse(raw);
    return {
      html: parsed.html || "",
      css: parsed.css || "",
      js: parsed.js || "",
    };
  } catch {
    return { ...defaultCode, html: raw };
  }
}

function buildPreview(code) {
  return `<!doctype html>
<html>
<head>
<style>${code.css || ""}</style>
</head>
<body>
${code.html || ""}
<script>
(function(){
  const levels = ["log","info","warn","error"];
  levels.forEach((level) => {
    const original = console[level];
    console[level] = function(...args){
      try {
        window.parent.postMessage({ type: "console", level, args }, "*");
      } catch (e) {}
      original.apply(console, args);
    };
  });
  window.onerror = function(message, source, lineno, colno){
    window.parent.postMessage({ type: "console", level: "error", args: [message, source + ":" + lineno + ":" + colno] }, "*");
  };
})();
</script>
<script>${code.js || ""}</script>
</body>
</html>`;
}
