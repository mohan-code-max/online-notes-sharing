const mongoose = require("mongoose");

const connectDB = async (MONGODB_URL) => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
