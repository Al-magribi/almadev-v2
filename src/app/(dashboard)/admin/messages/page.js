"use client";

import { useEffect, useRef, useState } from "react";
import {
  createQnaReplyAdmin,
  deleteQnaAdmin,
  deleteQnaReplyAdmin,
  getAdminQna,
  toggleQnaReplyLike,
  toggleQnaSolvedAdmin,
  updateQnaQuestionAdmin,
  updateQnaReplyAdmin,
} from "@/actions/course-actions";
import DeleteConfirmation from "@/components/ui/DeleteConfirmation";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Pencil,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/client-utils";
import TiptapEditor from "@/components/admin/message/TiptapEditor";

export default function AdminMessagesPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const loaderRef = useRef(null);
  const selectedRef = useRef(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [editQuestionOpen, setEditQuestionOpen] = useState(false);
  const [editQuestionTitle, setEditQuestionTitle] = useState("");
  const [editQuestionContent, setEditQuestionContent] = useState("");
  const [editQuestionLoading, setEditQuestionLoading] = useState(false);
  const [editReplyOpen, setEditReplyOpen] = useState(false);
  const [editReply, setEditReply] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  const [editReplyLoading, setEditReplyLoading] = useState(false);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, [filter]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const res = await getAdminQna({ page, limit: 20, filter });
      if (!mounted) return;
      if (res?.success) {
        setItems((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
        setHasMore(res.hasMore);
        if (page === 1) {
          setSelected(res.data?.[0] || null);
        }
      }
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [page, filter]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    const refresh = async () => {
      const res = await getAdminQna({ page: 1, limit: 20, filter });
      if (res?.success) {
        setItems(res.data);
        setHasMore(res.hasMore);
        if (selectedRef.current) {
          const updated = res.data.find(
            (item) => item.id === selectedRef.current.id,
          );
          if (updated) {
            setSelected((prev) => ({ ...prev, ...updated }));
          }
        }
      }
    };
    const intervalId = setInterval(refresh, 30000);
    return () => clearInterval(intervalId);
  }, [filter]);

  useEffect(() => {
    if (!loaderRef.current) return;
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  const handleToggleSolved = async () => {
    if (!selected) return;
    const res = await toggleQnaSolvedAdmin({
      qnaId: selected.id,
      isResolved: !selected.isResolved,
    });
    if (res?.success) {
      setSelected((prev) => ({ ...prev, isResolved: res.data.isResolved }));
      setItems((prev) =>
        prev.map((item) =>
          item.id === selected.id
            ? { ...item, isResolved: res.data.isResolved }
            : item,
        ),
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res =
      deleteTarget.type === "question"
        ? await deleteQnaAdmin({ qnaId: deleteTarget.qnaId })
        : await deleteQnaReplyAdmin({
            qnaId: deleteTarget.qnaId,
            replyId: deleteTarget.replyId,
          });
    setIsDeleting(false);
    if (res?.success) {
      if (deleteTarget.type === "question") {
        setItems((prev) => prev.filter((item) => item.id !== deleteTarget.qnaId));
        if (selected?.id === deleteTarget.qnaId) {
          setSelected(null);
        }
      } else {
        setSelected((prev) => {
          if (!prev || prev.id !== deleteTarget.qnaId) return prev;
          const nextReplies = (prev.replies || []).filter(
            (reply) => reply.id !== deleteTarget.replyId,
          );
          return {
            ...prev,
            replies: nextReplies,
            repliesCount: Math.max(0, (prev.repliesCount || 1) - 1),
          };
        });
      }
      setDeleteTarget(null);
    }
  };

  const handleSendReply = async () => {
    if (!replyContent || !selected) return;
    setSending(true);
    const res = await createQnaReplyAdmin({
      qnaId: selected.id,
      content: replyContent,
    });
    setSending(false);
    if (res?.success) {
      setReplyContent("");
      setReplyOpen(false);
      setSelected((prev) => ({
        ...prev,
        repliesCount: (prev.repliesCount || 0) + 1,
        replies: [...(prev.replies || []), res.data],
      }));
    }
  };

  const handleUpdateQuestion = async () => {
    if (!selected) return;
    if (!editQuestionTitle.trim() || !editQuestionContent.trim()) return;
    setEditQuestionLoading(true);
    const res = await updateQnaQuestionAdmin({
      qnaId: selected.id,
      title: editQuestionTitle.trim(),
      content: editQuestionContent,
    });
    setEditQuestionLoading(false);
    if (res?.success) {
      setSelected((prev) => ({
        ...prev,
        title: res.data.title,
        content: res.data.content,
      }));
      setItems((prev) =>
        prev.map((item) =>
          item.id === selected.id ? { ...item, title: res.data.title } : item,
        ),
      );
      setEditQuestionOpen(false);
    }
  };

  const handleUpdateReply = async () => {
    if (!selected || !editReply?.id || !editReplyContent.trim()) return;
    setEditReplyLoading(true);
    const res = await updateQnaReplyAdmin({
      qnaId: selected.id,
      replyId: editReply.id,
      content: editReplyContent,
    });
    setEditReplyLoading(false);
    if (res?.success) {
      setSelected((prev) => ({
        ...prev,
        replies: (prev.replies || []).map((reply) =>
          reply.id === editReply.id
            ? { ...reply, content: res.data.content }
            : reply,
        ),
      }));
      setEditReplyOpen(false);
      setEditReply(null);
    }
  };

  const handleToggleReplyLike = async (qnaId, replyId) => {
    const res = await toggleQnaReplyLike({ qnaId, replyId });
    if (res?.success) {
      setSelected((prev) => ({
        ...prev,
        replies: (prev.replies || []).map((reply) =>
          reply.id === replyId
            ? {
                ...reply,
                liked: res.data.liked,
                likesCount: res.data.likesCount,
              }
            : reply,
        ),
      }));
    }
  };

  return (
    <div className='flex flex-col md:flex-row md:h-[calc(100vh-120px)] bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-visible md:overflow-hidden'>
      <div className='w-full md:w-96 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-zinc-950/30'>
        <div className='p-4 border-b border-zinc-200 dark:border-zinc-800'>
          <h2 className='font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-3'>
            QnA
          </h2>
          <div className='flex flex-wrap gap-2'>
            <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
              Semua
            </FilterBtn>
            <FilterBtn
              active={filter === "unsolved"}
              onClick={() => setFilter("unsolved")}
            >
              Belum Solved
            </FilterBtn>
            <FilterBtn
              active={filter === "solved"}
              onClick={() => setFilter("solved")}
            >
              Solved
            </FilterBtn>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto md:max-h-full max-h-[55vh]'>
          {loading && page === 1 ? (
            <div className='p-4 text-center text-zinc-400 text-sm'>Memuat...</div>
          ) : items.length === 0 ? (
            <div className='p-8 text-center text-zinc-400 text-sm'>
              Tidak ada pertanyaan.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className={`p-4 border-b border-zinc-100 dark:border-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition relative
                  ${selected?.id === item.id ? "bg-white dark:bg-zinc-900 shadow-sm border-l-4 border-l-violet-600" : ""}
                `}
              >
                <div className='flex justify-between items-start mb-1'>
                  <h4 className='font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1'>
                    {item.user?.name || "User"}
                  </h4>
                  <span className='text-[10px] text-zinc-500'>
                    {item.createdAt ? formatDate(item.createdAt) : ""}
                  </span>
                </div>
                <p className='text-xs text-zinc-500 line-clamp-1 mb-2 font-medium'>
                  {item.title}
                </p>
                <div className='flex items-center gap-2 text-[10px] text-zinc-400 flex-wrap'>
                  <span className='bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded'>
                    {item.course?.name || "Course"}
                  </span>
                  {item.moduleTitle ? (
                    <span className='bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded'>
                      {item.moduleTitle}
                    </span>
                  ) : null}
                  {item.lessonTitle ? (
                    <span className='bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded'>
                      {item.lessonTitle}
                    </span>
                  ) : null}
                  {item.isResolved ? (
                    <span className='text-green-600 flex items-center gap-1'>
                      <CheckCircle2 size={10} /> Solved
                    </span>
                  ) : (
                    <span className='text-amber-600 flex items-center gap-1'>
                      <Circle size={10} /> Open
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
          {hasMore && (
            <div ref={loaderRef} className='py-4 flex items-center justify-center text-zinc-400 text-xs'>
              {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : ""}
            </div>
          )}
        </div>
      </div>

      <div className='flex-1 flex flex-col bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 md:border-t-0'>
        {selected ? (
          <>
            <div className='p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-zinc-50/50 dark:bg-zinc-900'>
              <div>
                <h3 className='font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2'>
                  {selected.title}
                  {selected.isResolved && (
                    <span className='bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full border border-green-200'>
                      SOLVED
                    </span>
                  )}
                </h3>
                <p className='text-xs text-zinc-500 mt-1'>
                  {selected.user?.name || "User"} ·{" "}
                  {selected.course?.name || "Course"}
                </p>
                <div className='mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-500'>
                  {selected.moduleTitle ? (
                    <span className='px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800'>
                      {selected.moduleTitle}
                    </span>
                  ) : null}
                  {selected.lessonTitle ? (
                    <span className='px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800'>
                      {selected.lessonTitle}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className='flex flex-wrap items-center gap-2'>
                <button
                  onClick={handleToggleSolved}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-2
                    ${
                      selected.isResolved
                        ? "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                        : "bg-green-600 text-white hover:bg-green-700 border-transparent"
                    }
                  `}
                >
                  <CheckCircle2 size={14} />
                  {selected.isResolved ? "Tandai Belum Selesai" : "Tandai Selesai"}
                  </button>
                <button
                  onClick={() => {
                    setEditQuestionTitle(selected.title || "");
                    setEditQuestionContent(selected.content || "");
                    setEditQuestionOpen(true);
                  }}
                  className='px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 text-zinc-700 hover:bg-zinc-50 flex items-center gap-2'
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() =>
                    setDeleteTarget({ type: "question", qnaId: selected.id })
                  }
                  className='px-3 py-1.5 rounded-lg text-xs font-medium border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center gap-2'
                >
                  <Trash2 size={14} /> Hapus
                </button>
                <button
                  onClick={() => setReplyOpen(true)}
                  className='px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                >
                  Balas
                </button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-dots-pattern'>
              <div className='text-xs text-zinc-500'>
                {selected.user?.name || "User"} ·{" "}
                {selected.createdAt ? formatDate(selected.createdAt) : ""}
              </div>
              <div className='bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-2xl p-4'>
                <div
                  className='prose dark:prose-invert max-w-none text-sm'
                  dangerouslySetInnerHTML={{ __html: selected.content }}
                />
              </div>
              <div className='text-xs text-zinc-400'>
                {selected.repliesCount || 0} balasan
              </div>
              {(selected.replies || []).map((reply) => (
                <div
                  key={reply.id}
                  className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4'
                >
                  <div className='flex items-center justify-between gap-3 text-xs text-zinc-500 mb-2'>
                    <div>
                      {reply.user?.name || "User"} ·{" "}
                      {reply.createdAt ? formatDate(reply.createdAt) : ""}
                    </div>
                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        onClick={() => handleToggleReplyLike(selected.id, reply.id)}
                        className={`text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-full border ${
                          reply.liked
                            ? "border-violet-500 text-violet-600 bg-violet-50"
                            : "border-zinc-200 text-zinc-500"
                        }`}
                      >
                        <ThumbsUp className='w-3 h-3' />
                        {reply.likesCount || 0}
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          setEditReply(reply);
                          setEditReplyContent(reply.content || "");
                          setEditReplyOpen(true);
                        }}
                        className='text-zinc-400 hover:text-violet-600'
                      >
                        <Pencil className='w-4 h-4' />
                      </button>
                      <button
                        type='button'
                        onClick={() =>
                          setDeleteTarget({
                            type: "reply",
                            qnaId: selected.id,
                            replyId: reply.id,
                          })
                        }
                        className='text-zinc-400 hover:text-rose-500'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                  <div
                    className='prose dark:prose-invert max-w-none text-sm'
                    dangerouslySetInnerHTML={{ __html: reply.content }}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className='flex flex-col items-center justify-center h-full text-zinc-400'>
            <p>Pilih pertanyaan untuk melihat detail</p>
          </div>
        )}
      </div>

      <DeleteConfirmation
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={
          deleteTarget?.type === "reply" ? "Hapus Balasan" : "Hapus Pertanyaan"
        }
        description={
          deleteTarget?.type === "reply"
            ? "Balasan akan dihapus permanen dan tidak bisa dikembalikan."
            : "Pertanyaan dan seluruh balasannya akan dihapus permanen."
        }
        isDeleting={isDeleting}
      />

      {replyOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
          <div className='w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden'>
            <div className='flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800'>
              <h3 className='text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
                Balas Pertanyaan
              </h3>
              <button
                onClick={() => setReplyOpen(false)}
                className='text-zinc-400 hover:text-zinc-600'
              >
                <X size={16} />
              </button>
            </div>
            <div className='p-4'>
              <TiptapEditor
                content={replyContent}
                onChange={setReplyContent}
                onSend={handleSendReply}
                loading={sending}
              />
            </div>
          </div>
        </div>
      )}

      {editQuestionOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
          <div className='w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden'>
            <div className='flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800'>
              <h3 className='text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
                Edit Pertanyaan
              </h3>
              <button
                onClick={() => setEditQuestionOpen(false)}
                className='text-zinc-400 hover:text-zinc-600'
              >
                <X size={16} />
              </button>
            </div>
            <div className='p-4 space-y-3'>
              <input
                value={editQuestionTitle}
                onChange={(event) => setEditQuestionTitle(event.target.value)}
                placeholder='Judul pertanyaan'
                className='w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
              />
              <TiptapEditor
                key={selected?.id || "question-editor"}
                content={editQuestionContent}
                onChange={setEditQuestionContent}
                onSend={handleUpdateQuestion}
                loading={editQuestionLoading}
                submitLabel='Simpan Perubahan'
              />
            </div>
          </div>
        </div>
      )}

      {editReplyOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
          <div className='w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden'>
            <div className='flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800'>
              <h3 className='text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
                Edit Balasan
              </h3>
              <button
                onClick={() => setEditReplyOpen(false)}
                className='text-zinc-400 hover:text-zinc-600'
              >
                <X size={16} />
              </button>
            </div>
            <div className='p-4'>
              <TiptapEditor
                key={editReply?.id || "reply-editor"}
                content={editReplyContent}
                onChange={setEditReplyContent}
                onSend={handleUpdateReply}
                loading={editReplyLoading}
                submitLabel='Simpan Balasan'
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterBtn({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition ${active ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"}`}
    >
      {children}
    </button>
  );
}
