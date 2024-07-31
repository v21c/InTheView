const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    uid: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    email: { 
      type: String,
      required: true, 
      unique: true, 
      index: true 
    },
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
    sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Session" }],
  },
  { timestamps: true }
);

UserSchema.index({ email: 1, createdAt: -1 });

const User = mongoose.model("User", UserSchema);
module.exports = User;
