import mongoose from "mongoose";

const bootcampExerciseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const BootcampExercise =
  mongoose.models.BootcampExercise ||
  mongoose.model("BootcampExercise", bootcampExerciseSchema);

export default BootcampExercise;
