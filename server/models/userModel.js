const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String },
  submittedGettingStarted: { type: Boolean },
  firstName: { type: String },
  lastName: { type: String },
  gender: { type: String },
  ageRange: { type: String },
  experience: { type: String },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
