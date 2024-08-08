import { useState, useEffect, useRef } from "react";
import axios from "axios";
import icon_submit from "../assets/submit.svg";
import "../styles/Messages.css";

const Messages = ({
  user,
  selectedSession,
  sessionName,
  newQuestionGenerated,
}) => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedSession) {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/messages",
            { params: { sessionId: selectedSession } }
          );
          const fetchedMessages = response.data;
          setMessages(fetchedMessages);

          const latestQuestion = fetchedMessages.find(
            (msg) => msg.answer === ""
          );
          if (latestQuestion) {
            setCurrentQuestionId(latestQuestion._id);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchMessages();
  }, [selectedSession, newQuestionGenerated]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const updateMessage = async (messageId, answer) => {
    try {
      await axios.put(`http://localhost:5000/api/messages/${messageId}`, {
        answer,
      });
      const updatedMessages = await axios.get(
        "http://localhost:5000/api/messages",
        { params: { sessionId: selectedSession } }
      );
      setMessages(updatedMessages.data);
    } catch (error) {
      console.error("Error updating message:", error);
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

      const updatedMessages = await axios.get(
        "http://localhost:5000/api/messages",
        { params: { sessionId: selectedSession } }
      );
      setMessages(updatedMessages.data);

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
      const { question, fileUrl } = response.data;

      if (question) {
        const createdMessage = await createMessage(question);
        setCurrentQuestionId(createdMessage._id);

        const audio = new Audio(`http://localhost:5000${fileUrl}`);
        audio
          .play()
          .catch((error) => console.error("Error playing audio:", error));
      } else {
        console.error("No question generated.");
      }
    } catch (error) {
      console.error("Error generating question:", error);
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
      document.querySelector("textarea").style.height = "auto";
      await handleGenerateQuestion();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const handleInput = (e) => {
    e.target.style.height = "auto";
    const newHeight = Math.min(e.target.scrollHeight, 200);
    e.target.style.height = `${newHeight}px`;
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
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const transcribedText = response.data.text;
      setUserInput(transcribedText);
      await handleSubmit(new Event("submit"));
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

  return (
    <div className="messages-container">
      <div className="chat-container">
        <h2>Messages</h2>
        <div className="selected-session">
          Selected Session: {selectedSession}
        </div>
        <div className="messages">
          {messages.map((message) => (
            <div key={message._id} className="message">
              <div className="message-question">{message.question}</div>
              {message.answer.trim() !== "" && (
                <div className="message-answer">{message.answer}</div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="submission-container">
        <div className="recording-status">
          {isRecording ? "Recording..." : "Press and hold space to record"}
        </div>
        <div className="submission">
          <form onSubmit={handleSubmit}>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="or Enter your message"
              rows={1}
              onInput={handleInput}
            />
            <button type="submit">
              <img src={icon_submit} alt="submit" className="button-submit" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messages;
