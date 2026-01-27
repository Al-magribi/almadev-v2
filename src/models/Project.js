import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  technologies: [{ name: { type: String, required: true } }],
  type: { type: String, default: "project" },
  demo: { type: String, required: true },
  sourceCode: { type: String, required: true },
});

const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);

export default Project;
