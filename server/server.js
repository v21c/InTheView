const express = require("express");
const connectDB = require("./db");
const User = require("./models/userModel");
const Session = require("./models/sessionModel");
const Message = require("./models/messageModel");
const Feedback = require("./models/feedbackModel");
const userController = require("./controllers/userController");
const sessionController = require("./controllers/sessionController");
const messageController = require("./controllers/messageController");
const feedbackController = require("./controllers/feedbackController");
const OpenAI = require("openai");
const multer = require("multer");
const fs = require("fs");
const { exec } = require("child_process");
const util = require("util");
const userRoute = require('./routes/userRoute');
const sessionRoute = require('./routes/sessionRoute');
const messageRoute = require('./routes/messageRoute');
const feedbackRoute = require("./routes/feedbackRoute");
const { generateFeedbackRequest, getFeedback } = require('./feedbackService');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const upload = multer({ dest: "uploads/" });

const execPromise = util.promisify(exec);

app.get("/api/generate-question", async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an interviewer who tests technical and behavioral skills. Generate a question.",
        },
        {
          role: "user",
          content:
            "Based on the following questions and answers for ICT professionals who are Male and NEW to experience. Generate a new, relevant question about career development, industry trends, or challenges faced by this group. The question should be inspired by the themes and insights present in the previous questions and answers, and should follow naturally from the previous answer.For example, if the previous question was about self-development and the answer was about reading books, the next question could be about what books they have recently read. The question should be in Korean.",
        },
      ],
      temperature: 0.7,
      max_tokens: 64,
      top_p: 1,
    });
    const question = response.choices[0];
    res.json({ question });
  } catch (error) {
    console.error("Error generating question:", error);
    res.status(500).json({ error: "Error generating question" });
  }
});

app.post("/api/speech-to-text", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  const inputPath = req.file.path;
  const outputPath = `${inputPath}.wav`;

  try {
    await execPromise(`ffmpeg -i ${inputPath} ${outputPath}`);

    const audioFile = fs.createReadStream(outputPath);
    const transcript = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    res.json({ text: transcript.text });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    res.status(500).json({ error: "Error transcribing audio" });
  }
});

app.use('/api/users', userRoute);
app.use('/api/sessions', sessionRoute); 
app.use('/api/messages', messageRoute);
app.use('/api/feedback', feedbackRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
