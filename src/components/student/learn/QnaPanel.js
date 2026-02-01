"use client";

import { useMemo, useState, useEffect } from "react";
import {
  createQnaQuestion,
  createQnaReply,
  deleteQnaQuestion,
  deleteQnaReply,
  getQnaByCourse,
  updateQnaQuestion,
  updateQnaReply,
  uploadQnaImage,
  toggleQnaReplyLike,
} from "@/actions/course-actions";
import { formatDate } from "@/lib/client-utils";
import { CheckCircle2, Pencil, Trash2, ThumbsUp } from "lucide-react";
import QnaEditor from "@/components/student/learn/QnaEditor";
import DeleteConfirmation from "@/components/ui/DeleteConfirmation";

export default function QnaPanel({ courseId, currentUser, initialQnas }) {
  const [qnas, setQnas] = useState(initialQnas || []);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyLoadingId, setReplyLoadingId] = useState(null);
  const [editingReply, setEditingReply] = useState({
    qnaId: null,
    replyId: null,
  });
  const [editingReplyContent, setEditingReplyContent] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const userId = currentUser?.id;

  const canEditQuestion = (item) => item.user?.id && item.user.id === userId;
  const canEditReply = (reply) => reply.user?.id && reply.user.id === userId;

  const handleUploadImage = async (file) => {
    const result = await uploadQnaImage(file);
    return result?.success ? result.url : null;
  };

  const handleCreateQuestion = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    const result = await createQnaQuestion({
      courseId,
      title: title.trim(),
      content,
    });
    setLoading(false);

    if (result?.success) {
      setQnas((prev) => [result.data, ...prev]);
      setTitle("");
      setContent("");
    }
  };

  const handleUpdateQuestion = async (qnaId) => {
    if (!editingTitle.trim() || !editingContent.trim()) return;
    setLoading(true);
    const result = await updateQnaQuestion({
      qnaId,
      title: editingTitle.trim(),
      content: editingContent,
    });
    setLoading(false);

    if (result?.success) {
      setQnas((prev) =>
        prev.map((item) =>
          item.id === qnaId
            ? {
                ...item,
                title: result.data.title,
                content: result.data.content,
              }
            : item,
        ),
      );
      setEditingQuestionId(null);
      setEditingTitle("");
      setEditingContent("");
    }
  };

  const handleDeleteQuestion = async (qnaId) => {
    setIsDeleting(true);
    const result = await deleteQnaQuestion({ qnaId });
    setIsDeleting(false);
    if (result?.success) {
      setQnas((prev) => prev.filter((item) => item.id !== qnaId));
      setDeleteTarget(null);
    }
  };

  const handleCreateReply = async (qnaId) => {
    const draft = replyDrafts[qnaId] || "";
    if (!draft.trim()) return;
    setReplyLoadingId(qnaId);
    const result = await createQnaReply({ qnaId, content: draft });
    setReplyLoadingId(null);

    if (result?.success) {
      setQnas((prev) =>
        prev.map((item) =>
          item.id === qnaId
            ? {
                ...item,
                replies: [...(item.replies || []), result.data],
                repliesCount: (item.repliesCount || 0) + 1,
              }
            : item,
        ),
      );
      setReplyDrafts((prev) => ({ ...prev, [qnaId]: "" }));
    }
  };

  const handleUpdateReply = async () => {
    const { qnaId, replyId } = editingReply;
    if (!qnaId || !replyId || !editingReplyContent.trim()) return;
    setReplyLoadingId(replyId);
    const result = await updateQnaReply({
      qnaId,
      replyId,
      content: editingReplyContent,
    });
    setReplyLoadingId(null);

    if (result?.success) {
      setQnas((prev) =>
        prev.map((item) =>
          item.id === qnaId
            ? {
                ...item,
                replies: (item.replies || []).map((reply) =>
                  reply.id === replyId
                    ? { ...reply, content: result.data.content }
                    : reply,
                ),
              }
            : item,
        ),
      );
      setEditingReply({ qnaId: null, replyId: null });
      setEditingReplyContent("");
    }
  };

  const handleToggleLike = async (qnaId, replyId) => {
    const result = await toggleQnaReplyLike({ qnaId, replyId });
    if (result?.success) {
      setQnas((prev) =>
        prev.map((item) =>
          item.id === qnaId
            ? {
                ...item,
                replies: (item.replies || []).map((reply) =>
                  reply.id === replyId
                    ? {
                        ...reply,
                        liked: result.data.liked,
                        likesCount: result.data.likesCount,
                      }
                    : reply,
                ),
              }
            : item,
        ),
      );
    }
  };

  const handleDeleteReply = async (qnaId, replyId) => {
    setIsDeleting(true);
    const result = await deleteQnaReply({ qnaId, replyId });
    setIsDeleting(false);
    if (result?.success) {
      setQnas((prev) =>
        prev.map((item) =>
          item.id === qnaId
            ? {
                ...item,
                replies: (item.replies || []).filter(
                  (reply) => reply.id !== replyId,
                ),
                repliesCount: Math.max(0, (item.repliesCount || 1) - 1),
              }
            : item,
        ),
      );
      setDeleteTarget(null);
    }
  };

  const emptyState = useMemo(() => qnas.length === 0, [qnas.length]);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      if (editingQuestionId || editingReply?.replyId || loading) return;
      const res = await getQnaByCourse({ courseId });
      if (mounted && res?.success) {
        setQnas(res.data || []);
      }
    };
    const intervalId = setInterval(refresh, 30000);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [courseId, editingQuestionId, editingReply?.replyId, loading]);

  return (
    <div className='space-y-6'>
      <div className='bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-5'>
        <h4 className='text-lg font-semibold text-gray-900 dark:text-white'>
          Ajukan Pertanyaan
        </h4>
        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
          Tulis pertanyaanmu agar mentor dan peserta lain bisa membantu.
        </p>
        <div className='mt-4 space-y-3'>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder='Judul pertanyaan'
            className='w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40'
          />
          <QnaEditor
            value={content}
            onChange={setContent}
            onSubmit={handleCreateQuestion}
            onUploadImage={handleUploadImage}
            submitLabel='Kirim Pertanyaan'
            loading={loading}
            placeholder='Jelaskan pertanyaanmu dengan jelas...'
          />
        </div>
      </div>

      {emptyState ? (
        <div className='border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-5 text-sm text-gray-500'>
          Belum ada pertanyaan. Jadilah yang pertama bertanya.
        </div>
      ) : (
        <div className='space-y-4'>
          {qnas.map((item) => (
            <div
              key={item.id}
              className='border border-gray-200 dark:border-gray-800 rounded-2xl p-5 bg-white dark:bg-gray-900'
            >
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <h5 className='text-base font-semibold text-gray-900 dark:text-white'>
                      {item.title}
                    </h5>
                    {item.isPinned && (
                      <span className='text-[11px] uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold'>
                        Pinned
                      </span>
                    )}
                    {item.isResolved && (
                      <span className='text-[11px] uppercase tracking-wide text-green-600 dark:text-green-400 font-semibold'>
                        Solved
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-gray-400 mt-1'>
                    {item.user?.name || "User"} ·{" "}
                    {item.createdAt ? formatDate(item.createdAt) : "Baru saja"}
                  </p>
                  <div className='mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500'>
                    {item.course?.name ? (
                      <span className='px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800'>
                        {item.course.name}
                      </span>
                    ) : null}
                    {item.moduleTitle ? (
                      <span className='px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800'>
                        {item.moduleTitle}
                      </span>
                    ) : null}
                    {item.lessonTitle ? (
                      <span className='px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800'>
                        {item.lessonTitle}
                      </span>
                    ) : null}
                  </div>
                </div>
                {canEditQuestion(item) && (
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => {
                        setEditingQuestionId(item.id);
                        setEditingTitle(item.title);
                        setEditingContent(item.content);
                      }}
                      className='text-gray-400 hover:text-blue-600'
                    >
                      <Pencil className='w-4 h-4' />
                    </button>
                    <button
                      type='button'
                      onClick={() =>
                        setDeleteTarget({
                          type: "question",
                          qnaId: item.id,
                        })
                      }
                      className='text-gray-400 hover:text-red-500'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                )}
              </div>

              {editingQuestionId === item.id ? (
                <div className='mt-4 space-y-3'>
                  <input
                    value={editingTitle}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    className='w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                  />
                  <QnaEditor
                    value={editingContent}
                    onChange={setEditingContent}
                    onSubmit={() => handleUpdateQuestion(item.id)}
                    onUploadImage={handleUploadImage}
                    submitLabel='Simpan Perubahan'
                    loading={loading}
                  />
                  <button
                    type='button'
                    onClick={() => setEditingQuestionId(null)}
                    className='text-xs text-gray-400 hover:text-gray-600'
                  >
                    Batalkan edit
                  </button>
                </div>
              ) : (
                <div
                  className='prose dark:prose-invert max-w-none mt-4 text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:px-4 prose-pre:py-3 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded'
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              )}

              <div className='mt-5 space-y-3'>
                <p className='text-xs font-semibold text-gray-500'>
                  {item.repliesCount || 0} Balasan
                </p>
                {(item.replies || []).map((reply) => (
                  <div
                    key={reply.id}
                    className='border border-gray-100 dark:border-gray-800 rounded-xl p-3 bg-gray-50 dark:bg-gray-800/40'
                  >
                    <div className='flex items-center justify-between gap-3'>
                      <div>
                        <p className='text-xs text-gray-500'>
                          {reply.user?.name || "User"} ·{" "}
                          {reply.createdAt
                            ? formatDate(reply.createdAt)
                            : "Baru saja"}
                        </p>
                        {reply.isInstructor && (
                          <span className='inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold'>
                            <CheckCircle2 className='w-3 h-3' />
                            Respon instruktur
                          </span>
                        )}
                      </div>
                      <div className='flex items-center gap-2'>
                        <button
                          type='button'
                          onClick={() => handleToggleLike(item.id, reply.id)}
                          className={`text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full border ${
                            reply.liked
                              ? "border-blue-500 text-blue-600 bg-blue-50"
                              : "border-gray-200 text-gray-500"
                          }`}
                        >
                          <ThumbsUp className='w-3 h-3' />
                          {reply.likesCount || 0}
                        </button>
                        {canEditReply(reply) && (
                          <>
                            <button
                              type='button'
                              onClick={() => {
                                setEditingReply({
                                  qnaId: item.id,
                                  replyId: reply.id,
                                });
                                setEditingReplyContent(reply.content);
                              }}
                              className='text-gray-400 hover:text-blue-600'
                            >
                              <Pencil className='w-4 h-4' />
                            </button>
                            <button
                              type='button'
                              onClick={() =>
                                setDeleteTarget({
                                  type: "reply",
                                  qnaId: item.id,
                                  replyId: reply.id,
                                })
                              }
                              className='text-gray-400 hover:text-red-500'
                            >
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {editingReply.qnaId === item.id &&
                    editingReply.replyId === reply.id ? (
                      <div className='mt-3'>
                        <QnaEditor
                          value={editingReplyContent}
                          onChange={setEditingReplyContent}
                          onSubmit={handleUpdateReply}
                          onUploadImage={handleUploadImage}
                          submitLabel='Simpan'
                          loading={replyLoadingId === reply.id}
                        />
                        <button
                          type='button'
                          onClick={() =>
                            setEditingReply({ qnaId: null, replyId: null })
                          }
                          className='text-xs text-gray-400 hover:text-gray-600 mt-2'
                        >
                          Batalkan edit
                        </button>
                      </div>
                    ) : (
                      <div
                        className='prose dark:prose-invert max-w-none text-sm mt-3 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:px-4 prose-pre:py-3 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded'
                        dangerouslySetInnerHTML={{ __html: reply.content }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className='mt-4'>
                <QnaEditor
                  value={replyDrafts[item.id] || ""}
                  onChange={(value) =>
                    setReplyDrafts((prev) => ({ ...prev, [item.id]: value }))
                  }
                  onSubmit={() => handleCreateReply(item.id)}
                  onUploadImage={handleUploadImage}
                  submitLabel='Kirim Balasan'
                  loading={replyLoadingId === item.id}
                  placeholder='Tulis balasan...'
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <DeleteConfirmation
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.type === "question") {
            handleDeleteQuestion(deleteTarget.qnaId);
          } else {
            handleDeleteReply(deleteTarget.qnaId, deleteTarget.replyId);
          }
        }}
        title={
          deleteTarget?.type === "reply" ? "Hapus Balasan" : "Hapus Pertanyaan"
        }
        description={
          deleteTarget?.type === "reply"
            ? "Balasan akan dihapus permanen dan tidak bisa dikembalikan."
            : "Pertanyaan beserta seluruh balasannya akan dihapus permanen."
        }
        isDeleting={isDeleting}
      />
    </div>
  );
}
