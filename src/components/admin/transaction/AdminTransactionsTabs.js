"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  History,
  Landmark,
  RotateCcw,
  Users,
} from "lucide-react";
import TransactionAnalysis from "@/components/admin/transaction/TransactionAnalysis";
import TransactionList from "@/components/admin/transaction/TransactionList";
import TransactionAffiliateMembersTab from "@/components/admin/transaction/TransactionAffiliateMembersTab";
import TransactionPayoutsTab from "@/components/admin/transaction/TransactionPayoutsTab";
import TransactionRefundRequestsTab from "@/components/admin/transaction/TransactionRefundRequestsTab";

const TAB_ITEMS = [
  { id: "history", label: "Riwayat", icon: History },
  { id: "analysis", label: "Analisis", icon: BarChart3 },
  { id: "affiliates", label: "Program Affiliate", icon: Users },
  { id: "payouts", label: "Payout", icon: Landmark },
  { id: "refunds", label: "Refund", icon: RotateCcw },
];

export default function AdminTransactionsTabs({
  transactions = [],
  analytics = null,
  affiliateMembers = [],
  payoutRows = [],
  refundRequests = [],
}) {
  const [activeTab, setActiveTab] = useState("history");

  const tabSummary = useMemo(
    () => ({
      history: transactions.length,
      affiliates: affiliateMembers.length,
      payouts: payoutRows.length,
      refunds: refundRequests.length,
    }),
    [
      affiliateMembers.length,
      payoutRows.length,
      refundRequests.length,
      transactions.length,
    ],
  );

  return (
    <div className='space-y-6'>
      <div className='rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
        <div className='flex flex-wrap gap-2'>
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const badgeCount = tabSummary[tab.id];

            return (
              <button
                key={tab.id}
                type='button'
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-zinc-900 text-white dark:bg-violet-600"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className='h-4 w-4' />
                {tab.label}
                {typeof badgeCount === "number" && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      activeTab === tab.id
                        ? "bg-white/15 text-white"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "history" ? (
        <TransactionList transactions={transactions} />
      ) : null}

      {activeTab === "analysis" ? (
        <TransactionAnalysis analytics={analytics} />
      ) : null}

      {activeTab === "affiliates" ? (
        <TransactionAffiliateMembersTab members={affiliateMembers} />
      ) : null}

      {activeTab === "payouts" ? (
        <TransactionPayoutsTab payoutRows={payoutRows} />
      ) : null}

      {activeTab === "refunds" ? (
        <TransactionRefundRequestsTab refundRequests={refundRequests} />
      ) : null}
    </div>
  );
}
