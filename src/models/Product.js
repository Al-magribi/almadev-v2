import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    note: { type: String },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    status: { type: String, required: true, default: "draft" },
    fileLink: { type: String },
    videoLink: { type: String },
    // Menambahkan field untuk menyimpan hasil perhitungan
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        review: { type: String },
        rating: { type: Number },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// --- LOGIKA PERHITUNGAN RATING OTOMATIS ---
productSchema.pre("save", function (next) {
  if (this.reviews && this.reviews.length > 0) {
    // Hitung total rating
    const total = this.reviews.reduce((acc, item) => item.rating + acc, 0);

    // Set rata-rata rating
    this.rating = total / this.reviews.length;

    // Set total jumlah review
    this.totalReviews = this.reviews.length;
  } else {
    // Jika tidak ada review, reset ke 0
    this.rating = 0;
    this.totalReviews = 0;
  }
  next();
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
