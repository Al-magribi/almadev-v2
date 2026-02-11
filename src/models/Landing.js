import mongoose from "mongoose";

// Subdocument schema for testimonial items with timestamps
const TestimonialItemSchema = new mongoose.Schema(
  {
    name: { type: String },
    role: { type: String },
    comment: { type: String },
    rating: { type: Number },
    // Persist visibility flag for each testimonial
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const GalleryItemSchema = new mongoose.Schema({
  title: { type: String }, // Nama Project
  description: { type: String },
  link: { type: String },
  images: [{ type: String }], // Array of image URLs/Paths
  isActive: { type: Boolean, default: true },
});

const PricingItemSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Misal: "Basic", "Pro"
  subtitle: { type: String }, // Subjudul paket (ditampilkan di bawah nama paket)
  promoText: { type: String }, // Contoh: "Promo Ramadan"
  buttonText: { type: String }, // Nama custom untuk tombol checkout
  price: { type: Number, required: true },
  benefits: [{ type: String }], // Array text untuk list benefit
  isRecommended: { type: Boolean, default: false }, // Opsi untuk highlight paket
  isActive: { type: Boolean, default: true },
});

const landingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["Course", "Product"], required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isActive: { type: Boolean, default: true },
  hero: {
    isActive: { type: Boolean, default: true },
    headline: { type: String },
    customTitle: { type: String },
    customSubtitle: { type: String },
    customDescription: { type: String },
  },
  instructor: {
    isActive: { type: Boolean, default: true },
    customTitle: { type: String },
    customExperience: { type: String },
    customCompany: { type: String },
    customRating: { type: Number },
    customStudents: { type: Number },
  },
  curriculum: {
    isActive: { type: Boolean, default: true },
    customTitle: { type: String },
    customSubtitle: { type: String },
  },

  testimonials: {
    isActive: { type: Boolean, default: true },
    customTitle: { type: String },
    customSubtitle: { type: String },
    items: [TestimonialItemSchema],
  },
  pricing: {
    isActive: { type: Boolean, default: true },
    customTitle: { type: String, default: "Pilih Paket Belajar" },
    customSubtitle: {
      type: String,
      default: "Investasi terbaik untuk masa depan Anda",
    },
    items: [PricingItemSchema],
  },
  faqs: {
    isActive: { type: Boolean, default: true },
    customTitle: { type: String },
    customSubtitle: { type: String },
    items: [
      {
        question: { type: String },
        answer: { type: String },
        isActive: { type: Boolean, default: true },
      },
    ],
  },
  gallery: {
    isActive: { type: Boolean, default: true },
    customTitle: { type: String, default: "Project Showcase" },
    customSubtitle: { type: String, default: "Lihat hasil karya kami" },
    items: [GalleryItemSchema], // Array of Projects
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Landing =
  mongoose.models.Landing || mongoose.model("Landing", landingSchema);

export default Landing;
