import { useState, useEffect } from "react";
import axios from "axios";
import Messages from "./Messages";
import Purpose from "./Purpose";
import Video from "./Video";
import "../styles/Interview.css";

const Interview = ({ user, selectedSession }) => {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [newQuestionGenerated, setNewQuestionGenerated] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (selectedSession) {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/sessions/${selectedSession}`
          );
          const session = response.data;
          setSessionStarted(session.sessionStarted);
        } catch (error) {
          console.error("Error fetching session details:", error);
        }
      }
    };
    fetchSessionDetails();
  }, [selectedSession]);

  const handleNewQuestionGenerated = () => {
    setNewQuestionGenerated((prev) => !prev);
  };

  return (
    <div className="interview-container">
      {sessionStarted ? (
        <>
          <Video />
          <Messages
            user={user}
            selectedSession={selectedSession}
            newQuestionGenerated={newQuestionGenerated}
          />
        </>
      ) : (
        <Purpose
          user={user}
          selectedSession={selectedSession}
          setSessionStarted={setSessionStarted}
          onNewQuestionGenerated={handleNewQuestionGenerated}
        />
      )}
    </div>
  );
};

export default Interview;
