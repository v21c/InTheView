const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    sessionName: { type: String },
    sessionDemand: { type: String },
    sessionScore: { type: Number },
    sessionFeedback: { type: String },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", SessionSchema);
module.exports = Session;
