"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Package,
  Phone,
  ShoppingBag,
  Users,
} from "lucide-react";
import { formatDate, formatRupiah } from "@/lib/client-utils";

const TAB_OPTIONS = [
  { id: "All", label: "User", icon: Users },
  { id: "Course", label: "Kursus", icon: BookOpen },
  { id: "Product", label: "Produk", icon: Package },
];

const PURCHASE_TYPE_STYLES = {
  Course:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300",
  Product:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300",
  Bootcamp:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300",
};

const STATUS_STYLES = {
  completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  failed: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  expired:
    "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  cancelled:
    "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

function normalizePhoneDisplay(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "-";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

function getAvatarCandidates(avatar) {
  if (!avatar) return [];
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return [avatar];
  }

  let normalized = avatar;
  try {
    normalized = decodeURIComponent(avatar);
  } catch {
    normalized = avatar;
  }

  normalized = normalized.replace(/\\/g, "/").trim();
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  const candidates = new Set([
    normalized,
    normalized.replace(/^\/Uploads\//, "/uploads/"),
    normalized.replace(/\/Avatars\//, "/avatars/"),
    normalized
      .replace(/^\/Uploads\//, "/uploads/")
      .replace(/\/Avatars\//, "/avatars/"),
    normalized.toLowerCase(),
  ]);

  return Array.from(candidates).filter(Boolean);
}

function Avatar({ student }) {
  const candidates = useMemo(
    () => getAvatarCandidates(student?.profile?.avatar),
    [student?.profile?.avatar],
  );
  const [candidateIndex, setCandidateIndex] = useState(0);

  const avatarSrc = candidates[candidateIndex] || null;
  const initial = student?.profile?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className='relative h-14 w-14 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
      {avatarSrc ? (
        <Image
          key={avatarSrc}
          src={avatarSrc}
          alt={student.profile.name}
          fill
          sizes='56px'
          className='object-cover'
          onError={() => {
            if (candidateIndex < candidates.length - 1) {
              setCandidateIndex((prev) => prev + 1);
            }
          }}
        />
      ) : (
        <div className='flex h-full items-center justify-center text-base font-semibold text-zinc-500 dark:text-zinc-400'>
          {initial}
        </div>
      )}
    </div>
  );
}

function PurchaseTable({ purchases }) {
  if (purchases.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-5 text-sm italic text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-400'>
        Belum ada riwayat transaksi pada tab ini.
      </div>
    );
  }

  return (
    <div className='overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800'>
      <table className='w-full text-left text-sm'>
        <thead className='bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950/40 dark:text-zinc-400'>
          <tr>
            <th className='px-4 py-3'>Tanggal</th>
            <th className='px-4 py-3'>Item</th>
            <th className='px-4 py-3'>Tipe</th>
            <th className='px-4 py-3 text-right'>Harga</th>
            <th className='px-4 py-3 text-right'>Status</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-zinc-100 dark:divide-zinc-800'>
          {purchases.map((purchase) => (
            <tr
              key={purchase.id}
              className='bg-white transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-950/40'
            >
              <td className='px-4 py-3 text-zinc-600 dark:text-zinc-300'>
                {formatDate(purchase.date)}
              </td>
              <td className='px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100'>
                {purchase.itemName}
              </td>
              <td className='px-4 py-3'>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                    PURCHASE_TYPE_STYLES[purchase.itemType] ||
                    "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {purchase.itemType}
                </span>
              </td>
              <td className='px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-100'>
                {formatRupiah(purchase.price)}
              </td>
              <td className='px-4 py-3 text-right'>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                    STATUS_STYLES[purchase.status] ||
                    "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {purchase.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StudentCard({ student, activeTab }) {
  const [historyVisible, setHistoryVisible] = useState(false);

  const filteredPurchases = useMemo(
    () =>
      activeTab === "All"
        ? student.purchases
        : student.purchases.filter((purchase) => purchase.itemType === activeTab),
    [activeTab, student.purchases],
  );

  const totalSpent = filteredPurchases.reduce(
    (acc, item) => (item.status === "completed" ? acc + item.price : acc),
    0,
  );
  const totalPurchases = filteredPurchases.filter(
    (item) => item.status === "completed",
  ).length;

  return (
    <article className='overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900'>
      <div className='border-b border-zinc-200 bg-[linear-gradient(135deg,#fafafa_0%,#ffffff_45%,#f5f5f5_100%)] px-5 py-5 dark:border-zinc-800 dark:bg-[linear-gradient(135deg,rgba(24,24,27,0.95)_0%,rgba(24,24,27,1)_55%,rgba(39,39,42,0.95)_100%)]'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='flex items-start gap-4'>
            <Avatar student={student} />
            <div className='min-w-0'>
              <h2 className='text-lg font-semibold text-zinc-950 dark:text-zinc-50'>
                {student.profile.name}
              </h2>
              <p className='truncate text-sm text-zinc-600 dark:text-zinc-400'>
                {student.profile.email}
              </p>
              <div className='mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400'>
                <span className='inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800'>
                  <Phone className='h-3.5 w-3.5' />
                  {normalizePhoneDisplay(student.profile.phone)}
                </span>
                <span className='rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800'>
                  Bergabung {formatDate(student.joinedAt)}
                </span>
              </div>
            </div>
          </div>

          <button
            type='button'
            onClick={() => setHistoryVisible((prev) => !prev)}
            className='inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'
          >
            {historyVisible ? (
              <>
                <ChevronUp className='h-4 w-4' />
                Hide riwayat
              </>
            ) : (
              <>
                <ChevronDown className='h-4 w-4' />
                Unhide riwayat
              </>
            )}
          </button>
        </div>
      </div>

      <div className='p-5'>
        <div className='grid gap-3 md:grid-cols-3'>
          <div className='rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/30 dark:bg-emerald-950/30'>
            <div className='text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300'>
              Total Belanja
            </div>
            <div className='mt-1 text-lg font-semibold text-emerald-900 dark:text-emerald-100'>
              {formatRupiah(totalSpent)}
            </div>
          </div>

          <div className='rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-950/30'>
            <div className='text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300'>
              Total Item
            </div>
            <div className='mt-1 text-lg font-semibold text-amber-900 dark:text-amber-100'>
              {totalPurchases}
            </div>
          </div>

          <div className='rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900/30 dark:bg-blue-950/30'>
            <div className='text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300'>
              Riwayat{" "}
              {activeTab === "All"
                ? "Semua Pembelian"
                : activeTab === "Course"
                  ? "Kursus"
                  : "Produk"}
            </div>
            <div className='mt-1 text-lg font-semibold text-blue-900 dark:text-blue-100'>
              {filteredPurchases.length} transaksi
            </div>
          </div>
        </div>

        {historyVisible ? (
          <div className='mt-5'>
            <div className='mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300'>
              <ShoppingBag className='h-4 w-4' />
              Riwayat Pembelian
            </div>
            <PurchaseTable purchases={filteredPurchases} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function AdminParticipantsClient({ students = [] }) {
  const [activeTab, setActiveTab] = useState("All");

  const tabCounts = useMemo(
    () =>
      TAB_OPTIONS.reduce((acc, tab) => {
        acc[tab.id] =
          tab.id === "All"
            ? students.length
            : students.filter((student) =>
                student.purchases.some((purchase) => purchase.itemType === tab.id),
              ).length;
        return acc;
      }, {}),
    [students],
  );

  const filteredStudents = useMemo(
    () =>
      activeTab === "All"
        ? students
        : students.filter((student) =>
            student.purchases.some((purchase) => purchase.itemType === activeTab),
          ),
    [activeTab, students],
  );

  return (
    <div className='mx-auto max-w-7xl space-y-6'>
      <section className='overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
        <div className='flex flex-col gap-5 border-b border-zinc-200 px-6 py-6 dark:border-zinc-800 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex items-center gap-4'>
            <div className='hidden rounded-2xl bg-zinc-950 p-3 text-white shadow-sm sm:block dark:bg-zinc-100 dark:text-zinc-900'>
              <Users className='h-6 w-6' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-zinc-950 dark:text-zinc-50'>
                Daftar Peserta
              </h1>
              <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                Pisahkan peserta berdasarkan pembelian kursus dan produk.
              </p>
            </div>
          </div>

          <div className='grid w-full grid-cols-1 gap-1 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-800 sm:grid-cols-3 lg:w-auto'>
            {TAB_OPTIONS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type='button'
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-w-0 w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  <Icon className='h-4 w-4' />
                  {tab.label}
                  <span className='shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800'>
                    {tabCounts[tab.id] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className='grid gap-4 px-6 py-5 md:grid-cols-3'>
          <div className='rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/30'>
            <div className='text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400'>
              Peserta Ditampilkan
            </div>
            <div className='mt-1 text-2xl font-semibold text-zinc-950 dark:text-zinc-50'>
              {filteredStudents.length}
            </div>
          </div>

          <div className='rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/30'>
            <div className='text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400'>
              Tab Aktif
            </div>
            <div className='mt-1 text-2xl font-semibold text-zinc-950 dark:text-zinc-50'>
              {activeTab === "All"
                ? "User"
                : activeTab === "Course"
                  ? "Kursus"
                  : "Produk"}
            </div>
          </div>

          <div className='rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/30'>
            <div className='text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400'>
              Total User Tersimpan
            </div>
            <div className='mt-1 text-2xl font-semibold text-zinc-950 dark:text-zinc-50'>
              {students.length}
            </div>
          </div>
        </div>
      </section>

      {filteredStudents.length > 0 ? (
        <div className='grid gap-5'>
          {filteredStudents.map((student) => (
            <StudentCard
              key={`${activeTab}-${student.id}`}
              student={student}
              activeTab={activeTab}
            />
          ))}
        </div>
      ) : (
        <div className='rounded-3xl border border-dashed border-zinc-200 bg-white px-6 py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
          <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800'>
            {activeTab === "All" ? (
              <Users className='h-6 w-6 text-zinc-500 dark:text-zinc-400' />
            ) : activeTab === "Course" ? (
              <BookOpen className='h-6 w-6 text-zinc-500 dark:text-zinc-400' />
            ) : (
              <Package className='h-6 w-6 text-zinc-500 dark:text-zinc-400' />
            )}
          </div>
          <h2 className='text-lg font-semibold text-zinc-950 dark:text-zinc-50'>
            Belum ada peserta untuk tab ini
          </h2>
          <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
            {activeTab === "All"
              ? "Belum ada user yang tersimpan."
              : activeTab === "Course"
                ? "Data akan muncul ketika ada transaksi kursus."
                : "Data akan muncul ketika ada transaksi produk."}
          </p>
        </div>
      )}
    </div>
  );
}
