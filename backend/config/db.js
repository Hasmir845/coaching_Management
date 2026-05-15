const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    // Already connected
    if (mongoose.connections[0].readyState) {
      return;
    }

    // Connect MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

module.exports = dbConnect;