import Session from "../models/sessionModel.js";
import Message from "../models/messageModel.js";

export const createSession = async (req, res) => {
  const {
    uid,
    sessionName,
    sessionStarted,
    sessionPurpose,
    sessionScore,
    sessionFeedback,
  } = req.body;
  try {
    const session = new Session({
      userId: uid,
      sessionName,
      sessionStarted,
      sessionPurpose,
      sessionScore,
      sessionFeedback,
    });
    await session.save();
    res.status(200).json(session);
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSessionDetails = async (req, res) => {
  const { sessionid } = req.params;
  try {
    const session = await Session.findById(sessionid);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json(session);
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const createMessage = async (req, res) => {
  const { sessionid, time, messages } = req.body;
  try {
    const message = new Message({ sessionid, time, messages });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  const { sessionid } = req.params;
  try {
    const message = await Message.findOne({ sessionid });
    res.status(200).json(message);
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export default { getSessionDetails, createMessage, getMessages };
