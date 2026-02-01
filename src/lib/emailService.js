import nodemailer from "nodemailer";
import dbConnect from "@/lib/db";
import Setting from "@/models/Setting";

const SETTINGS_TTL_MS = 5 * 60 * 1000;
let cachedSettings = { value: null, fetchedAt: 0 };

async function getSettings() {
  const now = Date.now();
  if (cachedSettings.value && now - cachedSettings.fetchedAt < SETTINGS_TTL_MS) {
    return cachedSettings.value;
  }

  await dbConnect();
  const settings = await Setting.findOne({}).lean();
  cachedSettings = {
    value: settings || null,
    fetchedAt: now,
  };
  return cachedSettings.value;
}

function buildBaseUrl(domain) {
  if (!domain) return "";
  if (domain.startsWith("http://") || domain.startsWith("https://")) {
    return domain.replace(/\/+$/, "");
  }
  return `https://${domain.replace(/\/+$/, "")}`;
}

async function getTransporter() {
  const settings = await getSettings();
  if (!settings) {
    throw new Error("Pengaturan SMTP belum tersedia di database.");
  }

  const port = Number(settings.smtpPort || 0);
  const secure = port === 465;

  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
    throw new Error("Konfigurasi SMTP belum lengkap.");
  }

  return nodemailer.createTransport({
    host: settings.smtpHost,
    port,
    secure,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPassword,
    },
  });
}

function getFromAddress(settings) {
  const name = settings.smtpFromName || "Admin Course";
  const email = settings.smtpFromEmail || settings.smtpUser;
  return `"${name}" <${email}>`;
}

function paymentEmailTemplate({
  name = "Pelanggan",
  status = "pending",
  transactionId,
  itemName,
  amount,
  statusUrl,
}) {
  const formatCurrency = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  const statusMap = {
    pending: {
      title: "Menunggu Pembayaran",
      subtitle:
        "Silakan selesaikan pembayaran kamu. Setelah berhasil, akses course akan otomatis aktif.",
      badge: "PENDING",
    },
    completed: {
      title: "Pembayaran Berhasil",
      subtitle:
        "Terima kasih! Pembayaran kamu sudah kami terima. Akses course kamu sekarang sudah aktif.",
      badge: "SUCCESS",
    },
    failed: {
      title: "Pembayaran Gagal",
      subtitle:
        "Maaf, pembayaran kamu tidak berhasil. Kamu bisa coba buat transaksi baru dan lakukan pembayaran ulang.",
      badge: "FAILED",
    },
    cancelled: {
      title: "Pembayaran Dibatalkan",
      subtitle:
        "Transaksi dibatalkan. Jika kamu masih ingin membeli course, silakan buat transaksi baru.",
      badge: "CANCELLED",
    },
    expired: {
      title: "Pembayaran Kedaluwarsa",
      subtitle:
        "Waktu pembayaran sudah habis (expired). Silakan buat transaksi baru untuk melanjutkan pembelian.",
      badge: "EXPIRED",
    },
  };

  const meta = statusMap[status] || statusMap.pending;

  return `
  <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:20px;background:#ffffff">
    <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="padding:18px 20px;background:#0b1220;color:#fff">
        <div style="font-size:18px;font-weight:700;margin-bottom:6px">${meta.title}</div>
        <div style="font-size:13px;opacity:.9">${meta.subtitle}</div>
      </div>

      <div style="padding:18px 20px">
        <div style="display:inline-block;padding:6px 10px;border-radius:999px;background:#f3f4f6;font-size:12px;font-weight:700;color:#111827;margin-bottom:14px">
          STATUS: ${meta.badge}
        </div>

        <p style="margin:0 0 12px;color:#111827">Halo <b>${name}</b>,</p>

        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:14px;background:#fafafa">
          <div style="font-size:13px;color:#6b7280;margin-bottom:8px">Detail Transaksi</div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#111827">
            <tr>
              <td style="padding:6px 0;color:#6b7280">Transaction ID</td>
              <td style="padding:6px 0;text-align:right;font-weight:700">${transactionId}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280">Item</td>
              <td style="padding:6px 0;text-align:right;font-weight:700">${itemName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280">Total</td>
              <td style="padding:6px 0;text-align:right;font-weight:700">${formatCurrency(
                amount,
              )}</td>
            </tr>
          </table>
        </div>

        ${
          statusUrl
            ? `
          <div style="margin-top:16px">
            <a href="${statusUrl}" style="display:inline-block;padding:10px 14px;border-radius:10px;background:#6d28d9;color:#fff;text-decoration:none;font-weight:700;font-size:14px">
              Lihat Status Pembayaran
            </a>
          </div>
        `
            : ""
        }

        <p style="margin:18px 0 0;color:#6b7280;font-size:12px">
          Jika kamu merasa tidak melakukan transaksi ini, abaikan email ini.
        </p>
      </div>

      <div style="padding:14px 20px;background:#f9fafb;color:#6b7280;font-size:12px">
        © ${new Date().getFullYear()} ALMADEV. All rights reserved.
      </div>
    </div>
  </div>
  `;
}

export const sendActivationEmail = async (email, name, activationUrl) => {
  const settings = await getSettings();
  if (!settings) {
    console.error("Pengaturan SMTP belum tersedia di database.");
    return false;
  }

  const mailOptions = {
    from: getFromAddress(settings),
    to: email,
    subject: "Aktivasi Akun Web Developer Course",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2563EB;">Selamat Datang, ${name}!</h2>
        <p>Terima kasih telah mendaftar. Langkah terakhir untuk memulai perjalanan belajar Anda adalah mengaktifkan akun.</p>
        <p>Silakan klik tombol di bawah ini:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${activationUrl}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Aktifkan Akun Saya
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Atau salin link ini ke browser Anda:<br/>
        <a href="${activationUrl}">${activationUrl}</a></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">Link ini akan kadaluarsa dalam 24 jam.</p>
      </div>
    `,
  };

  try {
    console.log(`[Kirim EMAIL] ${email} `);
    const transporter = await getTransporter();
    await transporter.sendMail(mailOptions);

    console.log(`Berhasil terkirim`);
    return true;
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    return false;
  }
};

export const sendResetPasswordEmail = async (email, name, resetUrl) => {
  const settings = await getSettings();
  if (!settings) {
    console.error("Pengaturan SMTP belum tersedia di database.");
    return false;
  }

  const mailOptions = {
    from: getFromAddress(settings),
    to: email,
    subject: "Reset Password - Web Developer Course",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #111827; margin-bottom: 8px;">Halo, ${name}</h2>
        <p style="color: #4b5563; margin: 0 0 16px;">
          Kami menerima permintaan untuk reset password akun Anda. Klik tombol di bawah untuk melanjutkan.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #2563EB; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Atau salin link ini ke browser Anda:<br/>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">
          Link ini berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.
        </p>
      </div>
    `,
  };

  try {
    console.log(`[Kirim EMAIL] ${email} `);
    const transporter = await getTransporter();
    await transporter.sendMail(mailOptions);
    console.log("Berhasil terkirim");
    return true;
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    return false;
  }
};

export async function sendPaymentEmail({
  to,
  name,
  status,
  transactionId,
  itemName,
  amount,
}) {
  if (!to) throw new Error("Email penerima (to) wajib diisi");
  if (!transactionId) throw new Error("transactionId wajib diisi");
  if (!itemName) throw new Error("itemName wajib diisi");

  const settings = await getSettings();
  if (!settings) {
    throw new Error("Pengaturan SMTP belum tersedia di database.");
  }

  const baseUrl = buildBaseUrl(settings.domain);
  const statusUrl = baseUrl
    ? `${baseUrl}/status?order_id=${encodeURIComponent(transactionId)}`
    : "";

  const subjectMap = {
    pending: "Menunggu Pembayaran - ALMADEV",
    completed: "Pembayaran Berhasil - ALMADEV",
    failed: "Pembayaran Gagal - ALMADEV",
    cancelled: "Transaksi Dibatalkan - ALMADEV",
    expired: "Pembayaran Kedaluwarsa - ALMADEV",
  };

  const subject = subjectMap[status] || subjectMap.pending;

  const mailOptions = {
    from: getFromAddress(settings),
    to,
    subject,
    html: paymentEmailTemplate({
      name,
      status,
      transactionId,
      itemName,
      amount,
      statusUrl,
    }),
  };

  const transporter = await getTransporter();
  return transporter.sendMail(mailOptions);
}
