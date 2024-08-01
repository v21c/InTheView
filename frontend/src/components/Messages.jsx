import React, { useState, useEffect } from "react";
import axios from "axios";

const Messages = ({ user, selectedSession }) => {
  const [userInput, setUserInput] = useState("");
  const [averageScore, setAverageScore] = useState(0);
  const [messages, setMessages] = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);

  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession);
    }
  }, [selectedSession]);

  const fetchMessages = async (sessionId) => {
    try {
      const response = await axios.get("http://localhost:5000/api/messages", {
        params: { sessionId },
      });
      setMessages(response.data);
    } catch (error) {
      console.error(`Error fetching messages for session ${sessionId}:`, error);
    }
  };

  const handleGenerateQuestion = async () => {
    if (!user) return;

    try {
      const response = await axios.get(
        "http://localhost:5000/api/generate-question",
        {
          params: { userId: user.uid },
        }
      );
      const question = response.data.question.message.content;

      if (question) {
        const createdMessage = await createMessage(question);
        setCurrentQuestionId(createdMessage._id);
      } else {
        console.error("No question generated.");
      }
    } catch (error) {
      console.error("Error generating question:", error);
    }
  };

  const createMessage = async (question, answer = "") => {
    if (!selectedSession) {
      console.error("No session selected to create message for.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/messages", {
        sessionId: selectedSession,
        question,
        answer,
        messageScore: 0,
      });
      console.log("Message created:", response.data);

      setMessages((prevMessages) => [...prevMessages, response.data]);

      return response.data;
    } catch (error) {
      console.error("Error creating message:", error);
    }
  };

  const updateMessage = async (messageId, answer) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/messages/${messageId}`,
        {
          answer,
        }
      );
      console.log("Message updated:", response.data);
      fetchMessages(selectedSession);
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userInput || !selectedSession || !currentQuestionId) return;

    await updateMessage(currentQuestionId, userInput);
    setUserInput("");

    await handleGenerateQuestion();
  };

  const startInterview = async () => {
    if (!selectedSession) return;

    await handleGenerateQuestion();
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        <button onClick={startInterview} disabled={!selectedSession}>
          Start Interview
        </button>
        <h2>Messages</h2>
        {selectedSession && (
          <>
            <div className="selected-session">
              Selected Session: {selectedSession}
            </div>
            {/* TODO
            <div className="average-score">Average Score: {averageScore}</div> */}
            {messages.map((message) => (
              <div key={message._id} className="message">
                <div className="message-question">{message.question}</div>
                <div className="message-answer">{message.answer}</div>
              </div>
            ))}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter your message..."
              />
              <button type="submit">Submit Message</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
