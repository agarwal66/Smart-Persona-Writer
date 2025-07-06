// models/Persona.js
import mongoose from "mongoose";

const PersonaSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: String,
  tone: String,
  style: String,
  domain: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Persona || mongoose.model("Persona", PersonaSchema);
