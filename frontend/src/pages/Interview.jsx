import { useRef, useState, useEffect } from "react";

const MainInterview = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedBlobs, setRecordedBlobs] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const gumVideoRef = useRef(null);
  const recordedVideoRef = useRef(null);
  const recordButtonRef = useRef(null);
  const playButtonRef = useRef(null);
  const transcriptRef = useRef(null);

  const saveTranscript = () => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "transcript.txt";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleDataAvailable = (e) => {
      if (e.data && e.data.size > 0) {
        setRecordedBlobs((prev) => [...prev, e.data]);
      }
    };

    const startRecording = () => {
      setRecordedBlobs([]);
      setTranscript("");
      let options = { mimeType: "video/webm;codecs=vp9,opus" };
      try {
        const recorder = new MediaRecorder(window.stream, options);
        setMediaRecorder(recorder);
        recordButtonRef.current.textContent = "Stop Recording";
        playButtonRef.current.disabled = true;
        recorder.onstop = (e) => {
          console.log("MediaRecorder stopped:", e);
          if (recognition) {
            recognition.stop();
            console.log("SpeechRecognition stopped.");
          }
        };
        recorder.ondataavailable = handleDataAvailable;
        recorder.start();
        if (recognition) {
          recognition.start();
          console.log("SpeechRecognition started.");
        }
        console.log("MediaRecorder started", recorder);
      } catch (error) {
        console.error("Exception while creating MediaRecorder:", error.message);
        setErrorMsg(
          `Exception while creating MediaRecorder: ${JSON.stringify(error)}`
        );
      }
    };

    const stopRecording = () => {
      mediaRecorder.stop();
    };

    const handleRecordButtonClick = () => {
      if (recordButtonRef.current.textContent === "Record") {
        startRecording();
      } else {
        stopRecording();
        recordButtonRef.current.textContent = "Record";
        playButtonRef.current.disabled = false;
      }
    };

    const handlePlayButtonClick = () => {
      const superBuffer = new Blob(recordedBlobs, { type: "video/webm" });
      recordedVideoRef.current.src = null;
      recordedVideoRef.current.srcObject = null;
      recordedVideoRef.current.src = window.URL.createObjectURL(superBuffer);
      recordedVideoRef.current.controls = true;
      recordedVideoRef.current.play();
    };

    if (recordButtonRef.current) {
      recordButtonRef.current.addEventListener(
        "click",
        handleRecordButtonClick
      );
    }

    if (playButtonRef.current) {
      playButtonRef.current.addEventListener("click", handlePlayButtonClick);
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        recordButtonRef.current.disabled = false;
        window.stream = stream;
        gumVideoRef.current.srcObject = stream;
        const recognition = new (window.SpeechRecognition ||
          window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onstart = () => {
          console.log("SpeechRecognition started.");
        };
        recognition.onend = () => {
          console.log("SpeechRecognition ended.");
        };
        recognition.onerror = (event) => {
          console.error("SpeechRecognition error:", event.error);
          setErrorMsg(`SpeechRecognition error: ${event.error}`);
        };
        recognition.onresult = (event) => {
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              setTranscript((prev) => prev + event.results[i][0].transcript);
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          transcriptRef.current.textContent = interimTranscript;
        };
        setRecognition(recognition);
      } catch (error) {
        console.error("navigator.getUserMedia error:", error.message);
        setErrorMsg(`navigator.getUserMedia error: ${error.toString()}`);
      }
    };

    const cleanup = () => {
      const startButton = document.querySelector("button#start");
      if (startButton) {
        startButton.removeEventListener("click", startCamera);
      }
      if (mediaRecorder) {
        mediaRecorder.ondataavailable = null;
        mediaRecorder.onstop = null;
      }
      if (recordButtonRef.current) {
        recordButtonRef.current.removeEventListener(
          "click",
          handleRecordButtonClick
        );
      }
      if (playButtonRef.current) {
        playButtonRef.current.removeEventListener(
          "click",
          handlePlayButtonClick
        );
      }
    };

    document
      .querySelector("button#start")
      ?.addEventListener("click", startCamera);

    return cleanup;
  }, [mediaRecorder, recordedBlobs, recognition]);

  return (
    <main id="container">
      <video ref={gumVideoRef} id="gum" playsInline autoPlay muted></video>
      <video ref={recordedVideoRef} id="recorded" playsInline loop></video>

      <section>
        <button id="start">Start camera</button>
        <button ref={recordButtonRef} id="record" disabled>
          Record
        </button>
        <button ref={playButtonRef} id="play" disabled>
          Play
        </button>
        <button onClick={saveTranscript} id="save">
          Save Transcript
        </button>
      </section>
      <div>
        <h3>Transcript:</h3>
        <div ref={transcriptRef} id="transcript"></div>
      </div>
      {errorMsg && <span id="errorMsg">{errorMsg}</span>}
    </main>
  );
};

export default MainInterview;
