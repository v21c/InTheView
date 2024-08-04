const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true,
  },
  sessionName: { 
    type: String,
    text: true, 
  },
  sessionDemand: { type: String },
  sessionScore: { type: Number },
  sessionFeedback: { type: String },
},{ timestamps: true });

SessionSchema.index({ userId: 1, createdAt: -1 });

const Session = mongoose.model("Session", SessionSchema);
module.exports = Session;
