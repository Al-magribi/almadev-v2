"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Save,
  Globe,
  Search,
  Mail,
  Database,
  Settings,
  Settings2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  getSettings,
  updateSettings,
  backupDatabase,
  restoreDatabase,
} from "@/actions/setting-actions";

// Import Sub-Komponen
import TabGeneral from "@/components/admin/setting/TabGeneral";
import TabSEO from "@/components/admin/setting/TabSEO";
import TabSMTP from "@/components/admin/setting/TabSMTP";
import TabPayment from "@/components/admin/setting/TabPayment";
import TabBackup from "@/components/admin/setting/TabBackup";

export default function AdminSetting() {
  const [activeTab, setActiveTab] = useState("general");
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  // State Form Lengkap (Termasuk Midtrans)
  const [formData, setFormData] = useState({
    websiteName: "",
    websiteLogo: "",
    websiteFavicon: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    metaPixelId: "",
    googleAnalyticsId: "",
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    smtpFromEmail: "",
    smtpFromName: "",
    midtransServerKey: "",
    midtransClientKey: "",
    midtransMerchantId: "",
    midtransIsProduction: false,
    midtransBaseUrl: "",
    maintenanceMode: false,
  });

  const [notification, setNotification] = useState(null);

  // Fetch Data on Load
  useEffect(() => {
    const loadData = async () => {
      const { success, data } = await getSettings();
      if (success && data) {
        setFormData((prev) => ({ ...prev, ...data }));
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Simpan Settings
  const handleSave = () => {
    startTransition(async () => {
      const result = await updateSettings(formData);
      if (result.success) {
        setNotification({
          type: "success",
          message: "Pengaturan berhasil diperbarui!",
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          type: "error",
          message: result.error || "Gagal menyimpan.",
        });
      }
    });
  };

  // Backup & Restore Handlers
  const handleDownloadDB = async () => {
    const { success, data } = await backupDatabase();
    if (success) {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    }
  };

  const handleRestoreDB = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (
        confirm(
          "Apakah Anda yakin? Data lama akan dihapus dan diganti dengan data dari file ini.",
        )
      ) {
        const result = await restoreDatabase(event.target.result);
        alert(result.message);
        if (result.success) window.location.reload();
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-400px'>
        <RefreshCw className='animate-spin text-violet-600' size={32} />
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "Umum", icon: Globe },
    { id: "seo", label: "SEO & Meta", icon: Search },
    { id: "payment", label: "Pembayaran", icon: Settings },
    { id: "smtp", label: "SMTP Email", icon: Mail },
    { id: "backup", label: "Backup & Restore", icon: Database },
  ];

  return (
    <div className='max-w-5xl space-y-8 pb-12'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm'>
        <div className='flex items-center gap-4'>
          <div className='p-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-xl'>
            <Settings2 size={28} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>
              Pengaturan Sistem
            </h1>
            <p className='text-zinc-500 text-sm'>
              Kelola konfigurasi website dan integrasi pihak ketiga
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className='flex items-center justify-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/20'
        >
          {isPending ? (
            <RefreshCw className='animate-spin' size={18} />
          ) : (
            <Save size={18} />
          )}
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-900/50 dark:text-emerald-400"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}
          <p className='text-sm font-medium'>{notification.message}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className='flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === tab.id
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm min-h-400px'>
        {activeTab === "general" && (
          <TabGeneral formData={formData} handleChange={handleChange} />
        )}
        {activeTab === "seo" && (
          <TabSEO formData={formData} handleChange={handleChange} />
        )}
        {activeTab === "smtp" && (
          <TabSMTP formData={formData} handleChange={handleChange} />
        )}
        {activeTab === "payment" && (
          <TabPayment formData={formData} handleChange={handleChange} />
        )}
        {activeTab === "backup" && (
          <TabBackup
            onDownload={handleDownloadDB}
            onRestore={handleRestoreDB}
          />
        )}
      </div>
    </div>
  );
}
