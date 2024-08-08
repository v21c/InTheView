import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Session",
  },
  messageId: { type: String },
  question: { type: String },
  answer: { type: String },
  messageScore: { type: Number },
  time: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", MessageSchema);

export default Message;
