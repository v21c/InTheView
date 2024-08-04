const mongoose = require('mongoose');
const Session = require("../models/sessionModel");
const Message = require("../models/messageModel");

exports.createSession = async (req, res) => {
  const { userId, sessionName, sessionDemand, sessionScore, sessionFeedback, messages } = req.body;
  try {
    const session = new Session({ 
      userId, 
      sessionName, 
      sessionDemand, 
      sessionScore, 
      sessionFeedback, 
      messages 
    });
    await session.save();
    res.status(200).json(session);
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getSessionDetails = async (req, res) => {
  const { uid } = req.params;
  try {
    const session = await Session.findOne({ uid });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json({ session });
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


exports.createMessage = async (req, res) => {
  const { sessionId, messageId, question, answer, messageScore, time } = req.body;
  try {
    // sessionId를 ObjectId로 변환
    const sessionObjectId = new mongoose.Types.ObjectId(sessionId);

    const message = new Message({ 
      sessionId: sessionObjectId,
      messageId, 
      question, 
      answer, 
      messageScore, 
      time: time ? new Date(time) : new Date(),
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getMessages = async (req, res) => {
  const { sessionid } = req.params;
  try {
    const message = await Message.findOne({ sessionid });
    res.status(200).json(message);
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
