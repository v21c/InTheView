import { useState, useEffect } from "react";
import Messages from "./Messages";
import Sessions from "./Sessions";

const SessionManager = ({ user }) => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionName, setSessionName] = useState("");

  const handleSessionChange = (sessionId) => {
    setSelectedSession(sessionId);
    fetchSessionName(sessionId);
  };

  const fetchSessionName = async (sessionId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/sessions/${sessionId}`
      );
      setSessionName(response.data.sessionName);
    } catch (error) {
      console.error("Error fetching session name:", error);
    }
  };

  const handleSessionNameUpdate = (newSessionName) => {
    setSessionName(newSessionName);
  };

  return (
    <div className="interview-manager">
      <Sessions
        user={user}
        setSelectedSession={handleSessionChange}
        showSessions={true}
        toggleSessions={() => {}}
        onSessionNameUpdate={handleSessionNameUpdate}
      />
      {selectedSession && (
        <Messages
          user={user}
          selectedSession={selectedSession}
          newQuestionGenerated={false}
          sessionName={sessionName}
        />
      )}
    </div>
  );
};

export default SessionManager;
