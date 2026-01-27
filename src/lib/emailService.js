import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendActivationEmail = async (email, name, activationUrl) => {
  const mailOptions = {
    from: `"ALMADEV" <${process.env.EMAIL_USER}>`,
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
    await transporter.sendMail(mailOptions);

    console.log(`Berhasil terkirim`);
    return true;
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    return false;
  }
};
