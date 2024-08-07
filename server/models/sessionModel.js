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

/* dev version
const SessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    sessionName: { type: String },
    sessionStarted: { type: Boolean },
    sessionPurpose: { type: String },
    sessionScore: { type: Number },
    sessionFeedback: { type: String },
  },
  { timestamps: true }
);
*/

const Session = mongoose.model("Session", SessionSchema);
module.exports = Session;
