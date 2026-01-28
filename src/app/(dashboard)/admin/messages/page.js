"use client";

import { useState, useEffect } from "react";
import {
  getAdminConversations,
  getMessages,
  sendMessage,
  toggleSolved,
  deleteMessage,
} from "@/actions/message-actions"; // Pastikan path benar
import TiptapEditor from "@/components/admin/message/TiptapEditor";
import {
  Search,
  CheckCircle2,
  Circle,
  MoreVertical,
  Trash2,
  Edit,
  MessageSquare,
  User,
  BookOpen,
  Layers,
  PlayCircle,
} from "lucide-react";
import { formatDate } from "@/lib/client-utils";

export default function MessagePage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("all");
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // 1. Load Conversations
  useEffect(() => {
    loadConversations();
  }, [filter]);

  const loadConversations = async () => {
    setLoading(true);
    const res = await getAdminConversations(filter);
    if (res.success) setConversations(res.data);
    setLoading(false);
  };

  // 2. Load Messages when Conversation Clicked
  const handleSelectConv = async (conv) => {
    setSelectedConv(conv);
    const res = await getMessages(conv._id);
    if (res.success) setMessages(res.data);
  };

  // 3. Send Reply
  const handleSend = async () => {
    if (!replyContent || !selectedConv) return;
    setSending(true);
    // Ganti senderId dengan ID admin yang sedang login (ambil dari Session)
    const res = await sendMessage({
      conversationId: selectedConv._id,
      senderId: "65b2a...", // TODO: Ganti dengan session.user.id
      messageContent: replyContent,
    });

    if (res.success) {
      setMessages([...messages, res.data]);
      setReplyContent("");
      loadConversations(); // Refresh last message di sidebar
    }
    setSending(false);
  };

  // 4. Toggle Solved
  const handleToggleSolved = async () => {
    if (!selectedConv) return;
    const newStatus = !selectedConv.isSolved;
    const res = await toggleSolved(selectedConv._id, newStatus);
    if (res.success) {
      setSelectedConv((prev) => ({ ...prev, isSolved: newStatus }));
      loadConversations();
    }
  };

  // 5. Delete Message
  const handleDeleteMessage = async (msgId) => {
    if (!confirm("Hapus pesan ini?")) return;
    const res = await deleteMessage(msgId);
    if (res.success) {
      setMessages(messages.filter((m) => m._id !== msgId));
    }
  };

  return (
    <div className='flex h-[calc(100vh-120px)] bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden'>
      {/* --- SIDEBAR LIST --- */}
      <div className='w-full md:w-80 lg:w-96 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-zinc-950/30'>
        {/* Header Sidebar */}
        <div className='p-4 border-b border-zinc-200 dark:border-zinc-800'>
          <h2 className='font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-3'>
            Pesan Masuk
          </h2>
          <div className='flex gap-2 mb-3'>
            <FilterBtn
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
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
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4' />
            <input
              type='text'
              placeholder='Cari siswa atau topik...'
              className='w-full pl-9 pr-4 py-2 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500'
            />
          </div>
        </div>

        {/* List Items */}
        <div className='flex-1 overflow-y-auto'>
          {loading ? (
            <div className='p-4 text-center text-zinc-400 text-sm'>
              Memuat...
            </div>
          ) : conversations.length === 0 ? (
            <div className='p-8 text-center text-zinc-400 text-sm'>
              Tidak ada pesan.
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => handleSelectConv(conv)}
                className={`p-4 border-b border-zinc-100 dark:border-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition relative
                  ${selectedConv?._id === conv._id ? "bg-white dark:bg-zinc-900 shadow-sm border-l-4 border-l-violet-600" : ""}
                `}
              >
                <div className='flex justify-between items-start mb-1'>
                  <h4 className='font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1'>
                    {conv.participantId?.name || "User"}
                  </h4>
                  <span className='text-[10px] text-zinc-500'>
                    {conv.lastMessageAt &&
                      formatDate(new Date(conv.lastMessageAt), {
                        addSuffix: true,
                        locale: id,
                      })}
                  </span>
                </div>
                <p className='text-xs text-zinc-500 line-clamp-1 mb-2 font-medium'>
                  {conv.title}
                </p>
                <div className='flex items-center gap-2 text-[10px] text-zinc-400'>
                  <span className='bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded'>
                    {conv.courseId?.name}
                  </span>
                  {conv.isSolved ? (
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
        </div>
      </div>

      {/* --- CHAT AREA --- */}
      <div className='flex-1 flex flex-col bg-white dark:bg-zinc-900'>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className='p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900'>
              <div>
                <h3 className='font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2'>
                  {selectedConv.title}
                  {selectedConv.isSolved && (
                    <span className='bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full border border-green-200'>
                      SOLVED
                    </span>
                  )}
                </h3>

                {/* Context Breadcrumbs */}
                <div className='flex items-center gap-2 text-xs text-zinc-500 mt-1'>
                  <span className='flex items-center gap-1'>
                    <BookOpen size={12} /> {selectedConv.courseId?.name}
                  </span>
                  {selectedConv.context?.sectionTitle && (
                    <>
                      <span>/</span>
                      <span className='flex items-center gap-1'>
                        <Layers size={12} /> {selectedConv.context.sectionTitle}
                      </span>
                    </>
                  )}
                  {selectedConv.context?.lessonTitle && (
                    <>
                      <span>/</span>
                      <span className='flex items-center gap-1'>
                        <PlayCircle size={12} />{" "}
                        {selectedConv.context.lessonTitle}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleToggleSolved}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-2
                  ${
                    selectedConv.isSolved
                      ? "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                      : "bg-green-600 text-white hover:bg-green-700 border-transparent"
                  }
                `}
              >
                <CheckCircle2 size={14} />
                {selectedConv.isSolved
                  ? "Tandai Belum Selesai"
                  : "Tandai Selesai"}
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className='flex-1 overflow-y-auto p-6 space-y-6 bg-dots-pattern'>
              {messages.map((msg) => {
                const isAdmin =
                  msg.senderType === "instructor" || msg.senderType === "admin";
                return (
                  <div
                    key={msg._id}
                    className={`flex gap-4 ${isAdmin ? "flex-row-reverse" : ""}`}
                  >
                    <div className='w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center'>
                      {msg.senderId?.avatar ? (
                        <img
                          src={msg.senderId.avatar}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <User size={16} className='text-zinc-500' />
                      )}
                    </div>

                    <div
                      className={`flex flex-col max-w-[80%] ${isAdmin ? "items-end" : "items-start"}`}
                    >
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='text-xs font-bold text-zinc-700 dark:text-zinc-300'>
                          {msg.senderId?.name}
                        </span>
                        <span className='text-[10px] text-zinc-400'>
                          {formatDate(new Date(msg.createdAt), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </span>
                      </div>

                      {/* Message Bubble with HTML Content */}
                      <div
                        className={`group relative p-4 rounded-2xl text-sm leading-relaxed prose dark:prose-invert prose-sm max-w-none
                        ${
                          isAdmin
                            ? "bg-violet-600 text-white rounded-tr-none"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-zinc-700"
                        }
                      `}
                      >
                        <div
                          dangerouslySetInnerHTML={{ __html: msg.message }}
                        />

                        {/* Admin Actions (Delete) */}
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className='absolute -right-8 top-2 opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-red-50 rounded'
                          title='Hapus Pesan'
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Editor Input Area */}
            <div className='p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800'>
              <TiptapEditor
                content={replyContent}
                onChange={setReplyContent}
                onSend={handleSend}
                loading={sending}
              />
            </div>
          </>
        ) : (
          <div className='flex flex-col items-center justify-center h-full text-zinc-400'>
            <MessageSquare size={48} className='mb-4 opacity-20' />
            <p>Pilih percakapan untuk melihat detail</p>
          </div>
        )}
      </div>
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
