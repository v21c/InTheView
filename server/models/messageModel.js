const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Session",
    index: true,
  },
  messageId: { type: String },
  question: { type: String },
  answer: { type: String },
  messageScore: { type: Number },
  time: { 
    type: Date, 
    default: Date.now,
  },
});

MessageSchema.index({ sessionId: 1, createdAt: 1 });

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
