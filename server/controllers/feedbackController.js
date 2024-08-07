const feedback = require("../models/feedbackModel");
const feedbackService = require('../feedbackService');

// 피드백 요청 생성
exports.feedbackRequest = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await feedbackService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const requestId = await feedbackService.generateFeedbackRequest(userId);
    res.status(201).json({ requestId });
  } catch (error) {
    console.error("Error generating feedback request:", error);
    res.status(500).json({ message: "Error generating feedback request" });
  }
};

// 피드백 결과 조회
exports.getResultFeedback = async (req, res) => {
  try {
    const { requestId } = req.params;

    const feedback = await feedbackService.getFeedback(requestId);
    res.status(200).json(feedback);
  } catch (error) {
    console.error("Error getting feedback:", error);
    res.status(500).json({ message: "Error getting feedback" });
  }
};