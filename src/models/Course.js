import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    image: { type: String },
    video: { type: String },
    description: { type: String },
    price: { type: Number },
    objectives: [{ objective: { type: String } }],
    type: { type: String, default: "course" },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    referralReward: { type: Number, default: 0 },
    curriculum: [
      {
        title: { type: String },
        description: { type: String },
        order: { type: Number },
        lessons: [
          {
            title: { type: String },
            description: { type: String },
            video: { type: String },
            duration: { type: String },
            resources: [{ type: String }],
            order: { type: Number },
          },
        ],
      },
    ],
    reviews: [
      {
        name: { type: String },
        review: { type: String },
        rating: { type: Number },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// --- LOGIKA PERHITUNGAN RATING OTOMATIS ---
courseSchema.pre("save", function () {
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
});

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

export default Course;
