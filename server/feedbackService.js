const User = require('./models/userModel');
const Session = require('./models/sessionModel');
const Message = require('./models/messageModel');
const FeedbackRequest = require('./models/feedbackModel');

const REQUIRED_SESSIONS_COUNT = 3;

// 피드백 생성 요청
async function generateFeedbackRequest(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const sessions = await getLastSessionsWithMessages(user);
    if (sessions.length < REQUIRED_SESSIONS_COUNT) {
      throw new Error(`Not enough sessions for generating feedback. Required: ${REQUIRED_SESSIONS_COUNT}`);
    }

    const feedbackRequest = new FeedbackRequest({
      userId,
      sessions: sessions.map(session => ({
        sessionId: session._id,
        sessionName: session.sessionName,
        sessionDemand: session.sessionDemand,
        sessionScore: session.sessionScore,
        messages: session.messages.map(message => ({
          messageId: message._id,
          question: message.question,
          answer: message.answer,
          messageScore: message.messageScore,
          time: message.time
        }))
      })),
      status: 'pending'
    });

    await feedbackRequest.save();
    return feedbackRequest._id;
  } catch (error) {
    console.error('Error generating feedback request:', error);
    throw error;
  }
}

async function getLastSessionsWithMessages(userId) {
  return Session.aggregate([
    { $match: { userId: userId } },
    { $sort: { createdAt: -1 } },
    { $limit: REQUIRED_SESSIONS_COUNT },
    {
      $lookup: {
        from: 'messages',
        localField: '_id',
        foreignField: 'sessionId',
        as: 'messages'
      }
    },
    { $sort: { 'messages.time': 1 } }
  ]);
}

// 피드백 가져오기
async function getFeedback(requestId) {
  try {
    const feedbackRequest = await FeedbackRequest.findById(requestId);
    if (!feedbackRequest) throw new Error('Feedback request not found');

    if (feedbackRequest.status === 'pending') {
      return { status: 'pending', message: 'Feedback is still being generated' };
    }

    return { 
      status: 'completed', 
      feedback: feedbackRequest.feedback,
      sessions: feedbackRequest.sessions
    };
  } catch (error) {
    console.error('Error getting feedback:', error);
    throw error;
  }
}

module.exports = { generateFeedbackRequest, getFeedback };