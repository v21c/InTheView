const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String },
    submittedGettingStarted: { type: Boolean },
    firstName: { type: String },
    lastName: { type: String },
    gender: { type: String },
    ageRange: { type: String },
    experience: { type: String },
    score: {
      averageScore: { type: Number },
      totalScore: { type: [Number] },
    },
    userSettings: {
      notification: {
        notifyEmail: { type: Boolean, default: true },
      },
      theme: {
        darkMode: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
