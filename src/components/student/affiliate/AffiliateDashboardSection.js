"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Copy,
  Eye,
  Gift,
  Landmark,
  Link2,
  LayoutDashboard,
  PackageSearch,
  Receipt,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { formatRupiah } from "@/lib/client-utils";
import { registerAffiliateProgram } from "@/actions/affiliate-actions";
import {
  BadgePill,
  BankFormCard,
  InfoCard,
  SummaryDarkCard,
} from "@/components/student/affiliate/AffiliateShared";
import AffiliateDashboardTab from "@/components/student/affiliate/AffiliateDashboardTab";
import AffiliateVisitorsTab from "@/components/student/affiliate/AffiliateVisitorsTab";
import AffiliateCatalogTab from "@/components/student/affiliate/AffiliateCatalogTab";
import AffiliateTransactionsTab from "@/components/student/affiliate/AffiliateTransactionsTab";
import AffiliateBankTab from "@/components/student/affiliate/AffiliateBankTab";

const initialState = null;

const TAB_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "visitors", label: "Visitor", icon: Users },
  { id: "catalog", label: "Katalog", icon: PackageSearch },
  { id: "transactions", label: "Transaksi", icon: Receipt },
  { id: "bank", label: "Rekening", icon: Landmark },
];

export default function AffiliateDashboardSection({
  user,
  metrics,
  catalog,
  visitors = [],
  transactions = [],
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [visitorQuery, setVisitorQuery] = useState("");
  const [visitorType, setVisitorType] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [formState, formAction] = useActionState(
    registerAffiliateProgram,
    initialState,
  );

  const hasBankInfo = Boolean(
    user?.bankInfo?.bankName &&
    user?.bankInfo?.accountNumber &&
    user?.bankInfo?.accountName,
  );
  const isEnrolled = Boolean(user?.referralCode && hasBankInfo);
  const affiliateCode = user?.referralCode || null;
  const nextPayoutDate = metrics?.nextPayoutDate || "10 bulan depan";

  const filteredVisitors = useMemo(() => {
    const query = visitorQuery.trim().toLowerCase();
    return (visitors || []).filter((visitor) => {
      const matchesQuery =
        !query ||
        String(visitor.landingPath || "")
          .toLowerCase()
          .includes(query) ||
        String(visitor.utmCampaign || "")
          .toLowerCase()
          .includes(query) ||
        String(visitor.referralCode || "")
          .toLowerCase()
          .includes(query);
      const matchesType =
        visitorType === "all" || visitor.itemType === visitorType;
      return matchesQuery && matchesType;
    });
  }, [visitorQuery, visitorType, visitors]);

  const topRewards = [...(catalog || [])]
    .sort((a, b) => b.rewardAmount - a.rewardAmount)
    .slice(0, 3);

  useEffect(() => {
    if (!formState?.message) return;
    if (formState.success) {
      toast.success(formState.message);
      router.refresh();
      return;
    }
    toast.error(formState.message);
  }, [formState, router]);

  const copyText = (value, successMessage) => {
    if (!value) {
      toast.error("Link referral belum tersedia.");
      return;
    }

    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(value);
        toast.success(successMessage);
      } catch {
        toast.error("Gagal menyalin ke clipboard.");
      }
    });
  };

  if (!isEnrolled) {
    return (
      <section className='space-y-8'>
        <div className='relative overflow-hidden rounded-[2rem] border border-amber-200/70 bg-linear-to-br from-amber-50 via-white to-blue-50 p-8 shadow-sm dark:border-amber-900/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-blue-950'>
          <div className='absolute -top-12 right-0 h-40 w-40 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-500/10' />
          <div className='relative grid gap-8 lg:grid-cols-[1.2fr,0.8fr]'>
            <div className='space-y-5'>
              <div className='inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-white/80 px-3 py-1 text-sm font-semibold text-amber-700 dark:border-amber-800 dark:bg-zinc-900/70 dark:text-amber-300'>
                <Sparkles className='h-4 w-4' />
                Program Affiliate ALMADEV
              </div>
              <div className='space-y-3'>
                <h1 className='max-w-3xl text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl'>
                  Rekomendasikan kursus dan produk, lalu ubah audience Anda jadi
                  penghasilan bulanan.
                </h1>
                <p className='max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300'>
                  Setiap kursus dan produk punya reward referral sendiri. Anda
                  cukup bagikan link personal, kami lacak transaksi yang masuk,
                  lalu reward yang valid dicairkan ke rekening terdaftar setiap
                  tanggal 10 bulan berikutnya.
                </p>
              </div>
              <div className='grid gap-3 sm:grid-cols-3'>
                <InfoCard title='Reward' value='Nominal per item berbeda' />
                <InfoCard
                  title='Tracking'
                  value='Visitor, transaksi, refund transparan'
                />
                <InfoCard
                  title='Pencairan'
                  value='Otomatis direkap tiap tanggal 10'
                />
              </div>
            </div>
            <div className='rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20'>
              <p className='text-xs uppercase tracking-[0.28em] text-blue-200/80'>
                Gambaran Program
              </p>
              <div className='mt-5 space-y-4'>
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-sm text-white/60'>Top reward saat ini</p>
                  <div className='mt-3 space-y-3'>
                    {topRewards.length > 0 ? (
                      topRewards.map((item) => (
                        <div
                          key={`${item.type}-${item.id}`}
                          className='flex items-center justify-between gap-4'
                        >
                          <div>
                            <p className='text-sm font-semibold'>{item.name}</p>
                            <p className='text-xs text-white/55'>{item.type}</p>
                          </div>
                          <p className='text-sm font-bold text-amber-300'>
                            {formatRupiah(item.rewardAmount)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className='text-sm text-white/60'>
                        Reward akan tampil setelah katalog affiliate tersedia.
                      </p>
                    )}
                  </div>
                </div>
                <div className='rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4'>
                  <p className='text-sm text-blue-100'>
                    Transaksi valid bulan berjalan akan direkap dan ditransfer
                    ke rekening terdaftar pada{" "}
                    <span className='font-semibold'>{nextPayoutDate}</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='grid gap-6 lg:grid-cols-[0.95fr,1.05fr]'>
          <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
            <div className='flex items-center gap-3'>
              <div className='rounded-xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-300'>
                <Gift className='h-5 w-5' />
              </div>
              <div>
                <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                  Kenapa layak diikuti?
                </h2>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Program ini disusun agar mudah dijalankan dan transparan.
                </p>
              </div>
            </div>
            <div className='mt-6 space-y-4'>
              {[
                "Setiap kursus dan produk punya nominal reward yang sudah ditentukan per item.",
                "Setiap link otomatis membawa UTM dan kode referral Anda agar tracking lebih akurat.",
                "User bisa melihat transaksi referral dan refund secara terbuka, jadi tidak ada angka abu-abu.",
                "Pencairan dilakukan ke rekening terdaftar tiap tanggal 10 bulan berikutnya.",
              ].map((item) => (
                <div key={item} className='flex items-start gap-3'>
                  <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-emerald-500' />
                  <p className='text-sm leading-6 text-gray-600 dark:text-gray-300'>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <BankFormCard
            user={user}
            formAction={formAction}
            isPending={isPending}
            mode='join'
          />
        </div>
      </section>
    );
  }

  const affiliateStats = [
    {
      label: "Pengunjung Link",
      value: String(metrics?.visitors || 0),
      hint: "Total visitor terekam",
      icon: Eye,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
    },
    {
      label: "Konversi Visitor",
      value: String(metrics?.conversions || 0),
      hint: "Visitor yang menjadi transaksi",
      icon: Users,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Reward Tervalidasi",
      value: formatRupiah(metrics?.rewardTotal || 0),
      hint: "Akumulasi reward completed",
      icon: Wallet,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Siap Diproses Payout",
      value: formatRupiah(metrics?.rewardReady || 0),
      hint: "Nominal yang belum void",
      icon: CalendarClock,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <section className='space-y-6'>
      <div className='rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
        <div className='flex flex-wrap gap-2'>
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.id}
              type='button'
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeTab === tab.id ? "bg-slate-900 text-white dark:bg-blue-600" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
            >
              <tab.icon className='h-4 w-4' />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div id='affiliate-tab-content' className='space-y-6'>
        {activeTab === "dashboard" ? (
          <AffiliateDashboardTab
            affiliateCode={affiliateCode}
            metrics={metrics}
            nextPayoutDate={nextPayoutDate}
          />
        ) : null}

        {activeTab === "visitors" ? (
          <AffiliateVisitorsTab
            filteredVisitors={filteredVisitors}
            visitorQuery={visitorQuery}
            setVisitorQuery={setVisitorQuery}
            visitorType={visitorType}
            setVisitorType={setVisitorType}
          />
        ) : null}

        {activeTab === "catalog" ? (
          <AffiliateCatalogTab catalog={catalog} copyText={copyText} />
        ) : null}

        {activeTab === "transactions" ? (
          <AffiliateTransactionsTab
            transactions={transactions}
            metrics={metrics}
          />
        ) : null}

        {activeTab === "bank" ? (
          <AffiliateBankTab
            user={user}
            formAction={formAction}
            isPending={isPending}
            affiliateCode={affiliateCode}
            nextPayoutDate={nextPayoutDate}
            metrics={metrics}
          />
        ) : null}
      </div>
    </section>
  );
}
