import { useState, useEffect, useRef } from "react";
import axios from "axios";

const Purpose = ({
  user,
  selectedSession,
  setSessionStarted,
  onNewQuestionGenerated,
}) => {
  const [sessionPurpose, setSessionPurpose] = useState("");
  const sessionPurposeRef = useRef(null);

  useEffect(() => {
    const textarea = sessionPurposeRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      if (textarea.scrollHeight <= 200) {
        textarea.style.height = `${textarea.scrollHeight}px`;
      } else {
        textarea.style.height = "200px";
      }
    }
  }, [sessionPurpose]);

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
      return response.data;
    } catch (error) {
      console.error("Error creating message:", error);
    }
  };

  const handleGenerateQuestion = async () => {
    if (!user) return;

    try {
      const response = await axios.get(
        "http://localhost:5000/api/generate-question"
      );
      const question = response.data.question.message.content;

      if (question) {
        await createMessage(question);
        onNewQuestionGenerated();
      } else {
        console.error("No question generated.");
      }
    } catch (error) {
      console.error("Error generating question:", error);
    }
  };

  const startInterview = async () => {
    if (!selectedSession) return;
    try {
      await axios.put(`http://localhost:5000/api/sessions/${selectedSession}`, {
        sessionStarted: true,
        sessionPurpose,
      });
      setSessionStarted(true);
      await handleGenerateQuestion();
    } catch (error) {
      console.error("Error updating session:", error);
    }
  };

  return (
    <div className="purpose-container">
      <h2>What is the interview going to be about?</h2>
      <textarea
        ref={sessionPurposeRef}
        className="session-purpose"
        value={sessionPurpose}
        onChange={(e) => setSessionPurpose(e.target.value)}
        placeholder="Enter session purpose..."
      ></textarea>
      <button onClick={startInterview} disabled={!selectedSession}>
        Start Interview
      </button>
    </div>
  );
};

export default Purpose;
