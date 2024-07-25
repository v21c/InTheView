const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("db.js > MongoDB connected");
  } catch (error) {
    console.error("db.js > MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
