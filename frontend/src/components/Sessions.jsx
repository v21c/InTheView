import React, { useState, useEffect } from "react";
import axios from "axios";

const Sessions = ({ user, setSelectedSession }) => {
  const [sessions, setSessions] = useState([]);
  const [newSessionName, setNewSessionName] = useState("");

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

  const handleSessionClick = (sessionId) => {
    setSelectedSession(sessionId);
  };

  return (
    <div className="sessions-container">
      <h2>Sessions</h2>
      {sessions.map((session) => (
        <div
          key={session._id}
          className="session"
          onClick={() => handleSessionClick(session._id)}
        >
          {session.sessionName}
        </div>
      ))}
      <input
        type="text"
        value={newSessionName}
        onChange={(e) => setNewSessionName(e.target.value)}
        placeholder="Enter new session name"
      />
      <button onClick={createSession}>Create Session</button>
    </div>
  );
};

export default Sessions;
