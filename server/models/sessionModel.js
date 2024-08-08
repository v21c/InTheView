import mongoose from "mongoose";

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

const Session = mongoose.model("Session", SessionSchema);

export default Session;
