import React, { useState, useEffect } from "react";
import axios from "axios";

const Chat = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newSessionName, setNewSessionName] = useState("");
  const [newMessageQuestion, setNewMessageQuestion] = useState("");
  const [userInput, setUserInput] = useState("");
  const [averageScore, setAverageScore] = useState(0);

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/sessions", {
        params: { userId: user.uid },
      });
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

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

  const createSession = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/sessions", {
        userId: user.uid,
        sessionName: newSessionName,
        sessionPurpose: "",
        sessionScore: 0,
        sessionFeedback: "",
      });
      console.log("Session created:", response.data);
      fetchSessions();
      setNewSessionName("");
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const createMessage = async (question) => {
    if (!selectedSession) {
      console.error("No session selected to create message for.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/messages", {
        sessionId: selectedSession,
        question,
        answer: "",
        messageScore: 0,
      });
      console.log("Message created:", response.data);
      fetchMessages(selectedSession);
    } catch (error) {
      console.error("Error creating message:", error);
    }
  };

  // const generateQuestion = async () => {
  //   try {
  //     const response = await axios.get(
  //       "http://localhost:5000/api/generate-question",
  //       {
  //         params: { userId: user.uid },
  //       }
  //     );
  //     const question = response.data.question;
  //     setNewMessageQuestion(question);
  //   } catch (error) {
  //     console.error("Error generating question:", error);
  //   }
  // };

  const handleSessionClick = (sessionId) => {
    fetchMessages(sessionId);
    setSelectedSession(sessionId);
    // fetchAverageScore(sessionId);
  };

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userInput || !selectedSession) return;

    await createMessage(userInput);
    setUserInput("");
  };

  const handleGenerateAndSubmit = async () => {
    await createMessage(newMessageQuestion);
    setNewMessageQuestion("");
  };

  // const fetchAverageScore = async (sessionId) => {
  //   try {
  //     const response = await axios.get("http://localhost:5000/api/users", {
  //       params: { uid: user.uid },
  //     });
  //     const userData = response.data;
  //     const session = userData.sessions.find((s) => s._id === sessionId);
  //     if (session) {
  //       setAverageScore(session.sessionScore);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching average score:", error);
  //   }
  // };

  // const handleRestartChat = async () => {
  //   try {
  //     await axios.post("http://localhost:5000/api/sessions", {
  //       userId: user.uid,
  //       sessionName: "",
  //       sessionPurpose: "",
  //       sessionScore: 0,
  //       sessionFeedback: "",
  //     });
  //     fetchSessions();
  //     setSelectedSession(null);
  //     setMessages([]);
  //   } catch (error) {
  //     console.error("Error restarting chat:", error);
  //   }
  // };

  return (
    <div className="chat-container">
      {/* Sessions section */}
      <div className="sessions-container">
        <h2>Sessions</h2>
        {sessions.map((session) => (
          <div
            key={session._id}
            className={`session ${
              selectedSession === session._id ? "active" : ""
            }`}
            onClick={() => handleSessionClick(session._id)}
          >
            {session.sessionName}
          </div>
        ))}
        {/* Input and button to create new session */}
        <input
          type="text"
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
          placeholder="Enter new session name"
        />
        <button onClick={createSession}>Create Session</button>
      </div>

      {/* Messages section */}
      <div className="messages-container">
        <h2>Messages</h2>
        {selectedSession && (
          <>
            <div className="selected-session">
              Selected Session: {selectedSession}
            </div>
            <div className="average-score">Average Score: {averageScore}</div>
            {messages.map((message) => (
              <div key={message._id} className="message">
                <div className="message-question">{message.question}</div>
                <div className="message-answer">{message.answer}</div>
              </div>
            ))}
            {/* Input and button to create new message */}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Enter your message..."
              />
              <button type="submit">Submit Message</button>
            </form>
            {/* <button onClick={generateQuestion}>Generate Question</button>
            <button onClick={handleGenerateAndSubmit}>
              Submit Generated Question
            </button> */}
            {/* <button onClick={handleRestartChat}>Restart Chat</button> */}
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
