"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Save,
  Globe,
  Search,
  Mail,
  Database,
  HardDrive,
  UploadCloud,
  AlertTriangle,
  Download,
  RefreshCw,
  CheckCircle2,
  Settings,
} from "lucide-react";
import {
  getSettings,
  updateSettings,
  backupDatabase,
  restoreDatabase,
} from "@/actions/setting-actions";

export default function AdminSetting() {
  const [activeTab, setActiveTab] = useState("general");
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  // State Form
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

  // Handler Input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handler Save
  const handleSave = () => {
    startTransition(async () => {
      const res = await updateSettings(formData);
      if (res.success) {
        showNotif("success", "Pengaturan berhasil disimpan!");
      } else {
        showNotif("error", res.error);
      }
    });
  };

  // Helper Notifikasi
  const showNotif = (type, msg) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handler Download Database JSON
  const handleDownloadDB = async () => {
    const res = await backupDatabase();
    if (res.success) {
      const blob = new Blob([res.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-db-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      showNotif("success", "Database berhasil di-download.");
    } else {
      showNotif("error", "Gagal backup database.");
    }
  };

  // Handler Restore (Upload JSON)
  const handleRestoreDB = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (
        confirm("PERINGATAN: Ini akan menimpa pengaturan saat ini. Lanjutkan?")
      ) {
        const jsonContent = event.target.result;
        const res = await restoreDatabase(jsonContent);
        if (res.success) {
          showNotif("success", "Restore berhasil! Silakan refresh.");
          window.location.reload();
        } else {
          showNotif("error", res.error);
        }
      }
    };
    reader.readAsText(file);
  };

  if (loading)
    return (
      <div className='p-8 text-center animate-pulse'>Memuat pengaturan...</div>
    );

  const tabs = [
    { id: "general", label: "Umum", icon: Globe },
    { id: "seo", label: "SEO & Meta", icon: Search },
    { id: "smtp", label: "SMTP Email", icon: Mail },
    { id: "backup", label: "Backup & Restore", icon: Database },
  ];

  return (
    <div className='max-w-5xl space-y-8 pb-12'>
      {/* Header */}

      <div className='flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors'>
        <div className='flex items-center gap-4 mb-4 sm:mb-0'>
          <div className='p-3 bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl hidden sm:block'>
            <Settings size={24} />
          </div>

          <div>
            <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50'>
              Pengaturan Website
            </h1>
            <p className='text-zinc-500 dark:text-zinc-400'>
              Kelola konfigurasi global aplikasi.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isPending}
          className='flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50'
        >
          {isPending ? (
            <RefreshCw className='animate-spin w-4 h-4' />
          ) : (
            <Save className='w-4 h-4' />
          )}
          <span>Simpan Perubahan</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium animate-in slide-in-from-bottom-5 z-50 ${
            notification.type === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          {notification.msg}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className='flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-1'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg text-sm font-medium transition-colors relative
              ${
                activeTab === tab.id
                  ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/10 border-b-2 border-violet-600"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 md:p-8 min-h-400px'>
        {/* TAB: GENERAL */}
        {activeTab === "general" && (
          <div className='space-y-6 animate-in fade-in zoom-in-95 duration-300'>
            <div className='grid md:grid-cols-2 gap-6'>
              <InputGroup
                label='Nama Website'
                name='websiteName'
                value={formData.websiteName}
                onChange={handleChange}
                placeholder='Contoh: My Course'
              />
              <div className='flex items-center gap-3 pt-6'>
                <input
                  type='checkbox'
                  id='maintenance'
                  name='maintenanceMode'
                  checked={formData.maintenanceMode}
                  onChange={handleChange}
                  className='w-5 h-5 text-violet-600 rounded focus:ring-violet-500'
                />
                <label
                  htmlFor='maintenance'
                  className='text-sm font-medium text-zinc-700 dark:text-zinc-300'
                >
                  Aktifkan Mode Maintenance
                </label>
              </div>
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
              <InputGroup
                label='URL Logo'
                name='websiteLogo'
                value={formData.websiteLogo}
                onChange={handleChange}
                placeholder='https://...'
                helper='Masukkan URL gambar logo.'
              />
              <InputGroup
                label='URL Favicon'
                name='websiteFavicon'
                value={formData.websiteFavicon}
                onChange={handleChange}
                placeholder='https://...'
                helper='Masukkan URL icon website (.ico/.png).'
              />
            </div>
          </div>
        )}

        {/* TAB: SEO */}
        {activeTab === "seo" && (
          <div className='space-y-6 animate-in fade-in zoom-in-95 duration-300'>
            <InputGroup
              label='SEO Meta Title'
              name='seoTitle'
              value={formData.seoTitle}
              onChange={handleChange}
            />
            <div>
              <label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1'>
                Meta Description
              </label>
              <textarea
                name='seoDescription'
                value={formData.seoDescription}
                onChange={handleChange}
                rows={3}
                className='w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500 outline-none transition'
              ></textarea>
              <p className='text-xs text-zinc-500 mt-1'>
                Deskripsi singkat yang muncul di hasil pencarian Google.
              </p>
            </div>
            <InputGroup
              label='Keywords (Pisahkan dengan koma)'
              name='seoKeywords'
              value={formData.seoKeywords}
              onChange={handleChange}
              placeholder='kursus, online, belajar'
            />

            <div className='h-px bg-zinc-100 dark:bg-zinc-800 my-4' />
            <h3 className='font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2'>
              <Globe size={18} /> Integrasi Pixel
            </h3>
            <div className='grid md:grid-cols-2 gap-6'>
              <InputGroup
                label='Facebook Pixel ID'
                name='metaPixelId'
                value={formData.metaPixelId}
                onChange={handleChange}
                placeholder='1234567890'
              />
              <InputGroup
                label='Google Analytics ID (G-XXXX)'
                name='googleAnalyticsId'
                value={formData.googleAnalyticsId}
                onChange={handleChange}
                placeholder='G-A1B2C3D4'
              />
            </div>
          </div>
        )}

        {/* TAB: SMTP */}
        {activeTab === "smtp" && (
          <div className='space-y-6 animate-in fade-in zoom-in-95 duration-300'>
            <div className='bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-900/50 flex gap-3 text-sm text-yellow-800 dark:text-yellow-400 mb-4'>
              <AlertTriangle className='shrink-0' size={18} />
              <p>
                Konfigurasi ini digunakan untuk mengirim email notifikasi, reset
                password, dan verifikasi akun.
              </p>
            </div>
            <div className='grid md:grid-cols-2 gap-6'>
              <InputGroup
                label='SMTP Host'
                name='smtpHost'
                value={formData.smtpHost}
                onChange={handleChange}
                placeholder='smtp.gmail.com'
              />
              <InputGroup
                label='SMTP Port'
                name='smtpPort'
                value={formData.smtpPort}
                onChange={handleChange}
                placeholder='587'
              />
              <InputGroup
                label='SMTP User / Email'
                name='smtpUser'
                value={formData.smtpUser}
                onChange={handleChange}
                placeholder='email@domain.com'
              />
              <InputGroup
                label='SMTP Password'
                name='smtpPassword'
                value={formData.smtpPassword}
                onChange={handleChange}
                type='password'
                placeholder='••••••••'
              />
            </div>
          </div>
        )}

        {/* TAB: BACKUP */}
        {activeTab === "backup" && (
          <div className='space-y-8 animate-in fade-in zoom-in-95 duration-300'>
            {/* Database Backup */}
            <div className='flex flex-col md:flex-row gap-6 items-start p-6 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800'>
              <div className='p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg'>
                <Database size={24} />
              </div>
              <div className='flex-1'>
                <h3 className='font-semibold text-zinc-900 dark:text-zinc-100 text-lg'>
                  Backup & Restore Database
                </h3>
                <p className='text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-4'>
                  Download seluruh data text (JSON) dari database MongoDB anda,
                  atau restore dari file backup sebelumnya.
                </p>
                <div className='flex gap-3'>
                  <button
                    onClick={handleDownloadDB}
                    className='flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-violet-500 text-sm font-medium transition'
                  >
                    <Download size={16} /> Download JSON
                  </button>
                  <label className='flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-violet-500 text-sm font-medium transition cursor-pointer'>
                    <UploadCloud size={16} /> Restore JSON
                    <input
                      type='file'
                      accept='.json'
                      onChange={handleRestoreDB}
                      className='hidden'
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Public Folder Backup */}
            <div className='flex flex-col md:flex-row gap-6 items-start p-6 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800'>
              <div className='p-3 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-lg'>
                <HardDrive size={24} />
              </div>
              <div className='flex-1'>
                <h3 className='font-semibold text-zinc-900 dark:text-zinc-100 text-lg'>
                  Backup File Public (Assets)
                </h3>
                <p className='text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-4'>
                  Download folder <code>/public</code> (Gambar, Uploads) dalam
                  format .ZIP. Diperlukan modul <code>archiver</code> di server.
                </p>
                <a
                  href='/api/backup/public'
                  target='_blank'
                  className='inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm'
                >
                  <Download size={16} /> Download .ZIP
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Component Input Reusable
function InputGroup({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  helper,
}) {
  return (
    <div>
      <label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1'>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className='w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500 outline-none transition'
      />
      {helper && <p className='text-xs text-zinc-500 mt-1'>{helper}</p>}
    </div>
  );
}
