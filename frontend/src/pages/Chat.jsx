import React, { useState } from "react";
import "../styles/Chat.css"; // Importing the CSS file for styles

const Chat = ({ chatHistory, averageScore, speechFile, urlFor }) => {
  const [audioChunks, setAudioChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    recorder.addEventListener("dataavailable", (event) => {
      setAudioChunks([...audioChunks, event.data]);
    });
    recorder.start();
    setMediaRecorder(recorder);
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  };

  const sendAudioToServer = (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");
    fetch("/submit_voice_answer", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Handle success
        } else {
          console.error("Error:", data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleRecordButtonClick = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="container">
      <h1>InTheView</h1>

      {!chatHistory ? (
        <form method="POST">
          <input
            type="text"
            name="input"
            placeholder="직업/성별/경력을 입력하세요"
            required
          />
          <input type="submit" name="start_chat" value="채팅 시작" />
        </form>
      ) : (
        <div className="chat">
          {chatHistory.map((item, index) => (
            <div
              key={index}
              className={item.type === "question" ? "question" : "answer"}
            >
              {item.type === "question" ? (
                <>
                  질문: {item.content}
                  {index === chatHistory.length - 1 && speechFile && (
                    <div className="audio-controls">
                      <audio
                        id="questionAudio"
                        src={urlFor("get_audio", { file_path: speechFile })}
                      ></audio>
                      <button
                        onClick={() =>
                          document.getElementById("questionAudio").play()
                        }
                      >
                        질문 다시 듣기
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  답변: {item.content}
                  <span>점수: {item.score}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {chatHistory &&
        chatHistory.length > 0 &&
        chatHistory[chatHistory.length - 1].type === "question" && (
          <form method="POST" id="answerForm">
            <textarea
              name="user_answer"
              id="userAnswer"
              rows="4"
              placeholder="여기에 답변을 입력하세요"
              required
            ></textarea>
            <input type="submit" value="답변 제출" />
          </form>
        )}

      <button id="recordButton" onClick={handleRecordButtonClick}>
        음성 녹음 시작
      </button>

      <form method="POST">
        <input
          type="submit"
          name="restart_chat"
          value="채팅 재시작"
          className="restart-btn"
        />
      </form>

      <div className="total-score">
        <div className="score-label">평균 점수</div>
        <div className="score-value">{averageScore}</div>
        <div className="score-label">점</div>
      </div>
    </div>
  );
};

export default Chat;
