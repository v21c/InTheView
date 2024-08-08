const mongoose = require('mongoose');

const FeedbackRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessions: [{
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true
    },
    sessionName: String,
    sessionDemand: String,
    sessionScore: Number,
    messages: [{
      messageId: String,
      question: String,
      answer: String,
      messageScore: Number,
      time: Date
    }]
  }],
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  feedback: {
    type: String,
    default: ''
  }
}, { timestamps: true });

FeedbackRequestSchema.index({ userId: 1, createdAt: -1 });

const FeedbackRequest = mongoose.model('FeedbackRequest', FeedbackRequestSchema);
module.exports = FeedbackRequest;