const Session = require("../models/sessionModel");
const Message = require("../models/messageModel");

exports.createSession = async (req, res) => {
  const {
    userId,
    sessionName,
    sessionStarted,
    sessionPurpose,
    sessionScore,
    sessionFeedback,
  } = req.body;
  try {
    const session = new Session({
      userId,
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

exports.getSession = async (req, res) => {
  const userId = req.query.userId;
  try {
    const sessions = await Session.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Server error" });
  }
}

exports.getSessionDetails = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json(session);
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateSession = async (req, res) => {
  const { sessionId } = req.params;
  const { sessionName, sessionStarted, sessionPurpose } = req.body;

  try {
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.sessionName = sessionName || session.sessionName;
    session.sessionStarted =
      sessionStarted !== undefined ? sessionStarted : session.sessionStarted;
    session.sessionPurpose = sessionPurpose || session.sessionPurpose; // Updated session purpose
    await session.save();

    res.json(session);
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteSession = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await Session.findByIdAndDelete(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ message: "Server error" });
  }
};


