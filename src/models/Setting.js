import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    // --- GENERAL ---
    websiteName: { type: String, default: "My Course App" },
    websiteLogo: { type: String, default: "" }, // URL Logo
    websiteFavicon: { type: String, default: "" }, // URL Favicon

    // --- SEO & META ---
    seoTitle: { type: String, default: "Platform Belajar Online Terbaik" },
    seoDescription: {
      type: String,
      default: "Belajar coding dan desain dengan mentor ahli.",
    },
    seoKeywords: { type: String, default: "course, belajar online, koding" },

    // --- ANALYTICS ---
    metaPixelId: { type: String, default: "" }, // Facebook Pixel ID
    googleAnalyticsId: { type: String, default: "" }, // GA4 ID

    // --- SMTP (EMAIL SERVER) ---
    smtpHost: { type: String, default: "" },
    smtpPort: { type: String, default: "587" },
    smtpUser: { type: String, default: "" },
    smtpPassword: { type: String, default: "" }, // Sebaiknya dienkripsi di production
    smtpFromEmail: { type: String, default: "no-reply@domain.com" },
    smtpFromName: { type: String, default: "Admin Course" },

    // --- SYSTEM ---
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Setting =
  mongoose.models.Setting || mongoose.model("Setting", settingSchema);

export default Setting;
