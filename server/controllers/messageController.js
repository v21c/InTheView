const Session = require("../models/sessionModel");
const Message = require("../models/messageModel");

/*  dev version
exports.createMessage = async (req, res) => {
  const { sessionid, time, messages } = req.body;
  try {
    const message = new Message({ sessionid, time, messages });
*/

exports.createMessage = async (req, res) => {
    const { sessionId, messageId, question, answer, messageScore, time } = req.body;
    try {
      const message = new Message({ 
        sessionId,
        messageId, 
        question, 
        answer, 
        messageScore, 
        time,
      });
      await message.save();
      res.status(201).json(message);
    } catch (error) {
      console.error("Server error:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.getMessages = async (req, res) => {
    const { sessionId } = req.query; // 수정된 부분
    try {
        const messages = await Message.find({ sessionId });
       // const message = await Message.findOne({ sessionid });    dev version
        res.status(200).json(messages);
    } catch (error) {
        console.error("Server error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

  exports.updateMessages = async (req, res) => {
    const { messageId } = req.params;
    const { answer } = req.body;
  
    try {
      const message = await Message.findById(messageId);
  
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
  
      message.answer = answer;
      await message.save();
  
      res.status(200).json(message);
    } catch (error) {
      console.error("Error updating message:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
