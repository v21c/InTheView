import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/Messages.css";

const Messages = ({ user, selectedSession }) => {
  const [userInput, setUserInput] = useState("");
  const [averageScore, setAverageScore] = useState(0);
  const [messages, setMessages] = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionPurpose, setSessionPurpose] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [shouldSubmit, setShouldSubmit] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (selectedSession) {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/sessions/${selectedSession}`
          );
          const session = response.data;
          setSessionStarted(session.sessionStarted);
          setSessionPurpose(session.sessionPurpose || "");
          setMessages(await fetchMessages(selectedSession));
        } catch (error) {
          console.error(`Error fetching session details:`, error);
        }
      }
    };

    fetchSessionDetails();
  }, [selectedSession]);

  const fetchMessages = async (sessionId) => {
    try {
      const response = await axios.get("http://localhost:5000/api/messages", {
        params: { sessionId },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching messages for session ${sessionId}:`, error);
      return [];
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
        { answer }
      );
      console.log("Message updated:", response.data);
      setMessages(await fetchMessages(selectedSession));
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userInput.trim() || !selectedSession || !currentQuestionId) {
      return;
    }
    try {
      await updateMessage(currentQuestionId, userInput);
      setUserInput("");
      console.log("Message updated successfully");
      await handleGenerateQuestion();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const startInterview = async () => {
    if (!selectedSession) return;

    try {
      await axios.put(`http://localhost:5000/api/sessions/${selectedSession}`, {
        sessionStarted: true,
        sessionPurpose, // Update session purpose on server
      });
      setSessionStarted(true);
    } catch (error) {
      console.error("Error updating session:", error);
    }

    await handleGenerateQuestion();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      const response = await axios.post(
        "http://localhost:5000/api/speech-to-text",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const transcribedText = response.data.text;
      setUserInput(transcribedText);
      setShouldSubmit(true);
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space" && !isRecording) {
        if (document.activeElement.tagName !== "INPUT") {
          event.preventDefault();
          startRecording();
        }
      }
    };
    const handleKeyUp = (event) => {
      if (event.code === "Space" && isRecording) {
        event.preventDefault();
        stopRecording();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isRecording]);

  // Submit right after processAudio
  // useEffect(() => {
  //   if (shouldSubmit) {
  //     if (userInput.trim()) {
  //       handleSubmit(new Event("submit"));
  //     }
  //     setShouldSubmit(false);
  //   }
  // }, [shouldSubmit, userInput]);

  return (
    <div className="chat-container">
      <div className="messages-container">
        {!sessionStarted && (
          <>
            <input
              type="text"
              value={sessionPurpose}
              onChange={(e) => setSessionPurpose(e.target.value)}
              placeholder="Enter session purpose..."
            />
            <button onClick={startInterview} disabled={!selectedSession}>
              Start Interview
            </button>
          </>
        )}
        {sessionStarted && (
          <>
            <h2>Messages</h2>
            {selectedSession && (
              <>
                <div className="selected-session">
                  Selected Session: {selectedSession}
                </div>
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
                    placeholder="Enter your message or press space to record..."
                  />
                  <button type="submit">Submit Message</button>
                </form>
                <div className="recording-status">
                  {isRecording
                    ? "Recording..."
                    : "Press and hold space to record"}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
