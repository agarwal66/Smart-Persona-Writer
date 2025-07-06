// models/generated.js
import mongoose from "mongoose";

const GeneratedSchema = new mongoose.Schema({
  persona: Object,
  topic: String,
  template: String,
  content: String,
  userEmail: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Generated || mongoose.model("Generated", GeneratedSchema);
