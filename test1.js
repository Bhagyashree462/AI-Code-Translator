  import mongoose from "mongoose";

const uri = "mongodb+srv://admin:CodeAI2026Secure@cluster0.ijcfe4z.mongodb.net/CodeTranslator?appName=Cluster0";

try {
  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");
} catch (err) {
  console.error("❌ MongoDB Error:");
  console.error(err);
}