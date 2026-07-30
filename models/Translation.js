import mongoose from "mongoose";

const translationSchema = new mongoose.Schema(
  {
    sourceLang: {
      type: String,
      required: true
    },

    targetLang: {
      type: String,
      required: true
    },

    inputCode: {
      type: String,
      required: true
    },

    outputCode: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "Translation",
  translationSchema
);