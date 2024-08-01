// feedbackService.js

const User = require('./models/userModel');
const Session = require('./models/sessionModel');
const Message = require('./models/messageModel');
const FeedbackRequest = require('./models/feedbackRequestModel');

async function generateFeedbackRequest(userId) {
  try {
    // 사용자 정보 로드
    const user = await User.findById(userId).lean();
    if (!user) throw new Error('User not found');

    // 최신 3개 세션 로드
    const sessions = await Session.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    if (sessions.length < 3) throw new Error('Not enough sessions for generating feedback');

    // 각 세션의 메시지 로드
    const sessionsWithMessages = await Promise.all(
      sessions.map(async (session) => {
        const messages = await Message.find({ sessionId })
          .sort({ time: 1 })
          .lean();
        return { ...session, messages };
      })
    );

    // 정리된 데이터 저장
    const feedbackRequest = new FeedbackRequest({
      userId,
      sessions: sessionsWithMessages,
      status: 'pending'
    });
    await feedbackRequest.save();

    return feedbackRequest._id;
  } catch (error) {
    console.error('Error generating feedback request:', error);
    throw error;
  }
}

async function getFeedback(requestId) {
  try {
    const feedbackRequest = await FeedbackRequest.findById(requestId).lean();
    if (!feedbackRequest) throw new Error('Feedback request not found');
    
    if (feedbackRequest.status === 'pending') {
      return { status: 'pending', message: 'Feedback is still being generated' };
    }
    
    return { status: 'completed', feedback: feedbackRequest.feedback };
  } catch (error) {
    console.error('Error getting feedback:', error);
    throw error;
  }
}

module.exports = { generateFeedbackRequest, getFeedback };