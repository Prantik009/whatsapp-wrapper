// src/db/connect.js
import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;           // e.g. mongodb://127.0.0.1:27017
  const dbName = process.env.MONGO_DB || "whatsappWrapper";

  if (!uri) {
    console.error("❌ MONGO_URI missing");
    process.exit(1);
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 10000, // 10s
    socketTimeoutMS: 45000,
  });

  console.log("✅ MongoDB connected");
};
