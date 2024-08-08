const express = require("express");
const connectDB = require("./db");
const User = require("./models/userModel");
const Session = require("./models/sessionModel");
const Message = require("./models/messageModel");
const sessionController = require("./controllers/sessionController");
const OpenAI = require("openai");
const multer = require("multer");
const fs = require("fs");
const { exec } = require("child_process");
const util = require("util");
const { spawn } = require('child_process');
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

app.post("/api/users", async (req, res) => {
    const {
        uid,
        email,
        displayName,
        submittedGettingStarted,
        firstName,
        lastName,
        gender,
        ageRange,
        occupation,
        experience,
        score,
        userSettings,
    } = req.body;

    try {
        if (!uid || !email) {
            throw new Error("UID and Email are required");
        }

        let user = await User.findOne({ uid });
        if (!user) {
            user = new User({
                uid,
                email,
                displayName,
                submittedGettingStarted,
                firstName,
                lastName,
                gender,
                ageRange,
                occupation,
                experience,
                score: score
                    ? {
                        averageScore: score.averageScore || 0,
                        totalScore: score.totalScore || [],
                    }
                    : { averageScore: 0, totalScore: [] },
                userSettings: userSettings
                    ? {
                        notification: {
                            email: userSettings.notification?.email ?? true,
                        },
                        theme: { darkMode: userSettings.theme?.darkMode ?? false },
                    }
                    : { notification: { email: true }, theme: { darkMode: false } },
            });
            await user.save();
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Server error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

app.put("/api/users/:uid", async (req, res) => {
    const { uid } = req.params;
    const {
        submittedGettingStarted,
        firstName,
        lastName,
        gender,
        ageRange,
        occupation,
        experience,
        score,
        userSettings,
    } = req.body;

    try {
        let user = await User.findOne({ uid });
        if (user) {
            user.submittedGettingStarted = submittedGettingStarted;
            user.firstName = firstName;
            user.lastName = lastName;
            user.gender = gender;
            user.ageRange = ageRange;
            user.occupation = occupation;
            user.experience = experience;
            user.score = score
                ? {
                    averageScore: score.averageScore || 0,
                    totalScore: score.totalScore || [],
                }
                : { averageScore: 0, totalScore: [] };
            user.userSettings = userSettings
                ? {
                    notification: { email: userSettings.notification?.email ?? true },
                    theme: { darkMode: userSettings.theme?.darkMode ?? false },
                }
                : { notification: { email: true }, theme: { darkMode: false } };
            await user.save();
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Server error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/users/:uid", async (req, res) => {
    const { uid } = req.params;

    try {
        const user = await User.findOne({ uid });
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Server error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/sessions", async (req, res) => {
    const userId = req.query.userId;
    try {
        const sessions = await Session.find({ userId }).sort({ createdAt: -1 });
        res.json(sessions);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/api/sessions", async (req, res) => {
    const {
        userId,
        sessionName,
        sessionStarted,
        sessionPurpose,
        sessionScore,
        sessionFeedback,
    } = req.body;

    try {
        const newSession = new Session({
            userId,
            sessionName,
            sessionStarted,
            sessionPurpose,
            sessionScore,
            sessionFeedback,
        });

        await newSession.save();
        res.status(201).json(newSession);
    } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.put("/api/sessions/:sessionId", async (req, res) => {
    const { sessionId } = req.params;
    const { sessionName, sessionStarted, sessionPurpose } = req.body;

    try {
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        session.sessionName = sessionName || session.sessionName;
        session.sessionStarted =
            sessionStarted !== undefined ? sessionStarted : session.sessionStarted;
        session.sessionPurpose = sessionPurpose || session.sessionPurpose; // Updated session purpose
        await session.save();

        res.json(session);
    } catch (error) {
        console.error("Error updating session:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/sessions/:sessionId", async (req, res) => {
    const { sessionId } = req.params;

    try {
        const session = await Session.findById(sessionId);
        if (session) {
            res.status(200).json(session);
        } else {
            res.status(404).json({ message: "Session not found" });
        }
    } catch (error) {
        console.error("Server error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete("/api/sessions/:sessionId", async (req, res) => {
    const { sessionId } = req.params;

    try {
        const session = await Session.findByIdAndDelete(sessionId);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        res.status(200).json({ message: "Session deleted successfully" });
    } catch (error) {
        console.error("Error deleting session:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/messages", async (req, res) => {
    const sessionId = req.query.sessionId;

    if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
    }

    try {
        const messages = await Message.find({ sessionId });
        res.json(messages);
    } catch (error) {
        console.error(`Error fetching messages for session ${sessionId}:`, error);
        res.status(500).json({ message: "Server error" });
    }
});

function runSummaryModel(sessionId) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['./models/summary.py', sessionId]);

        let resultData = '';

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            // console.log(`Python process exited with code ${code}`);
            try {
                const jsonObjects = resultData.trim().split('\n').filter(line => line.trim() !== '');
                const lastJsonObject = jsonObjects[jsonObjects.length - 1];
                const result = JSON.parse(lastJsonObject);
                resolve(result);
            } catch (error) {
                console.error('Error parsing Python output:', error, 'Raw output:', resultData);
                reject(error);
            }
        });
    });
}

app.post("/api/messages", async (req, res) => {
    const { sessionId, question, answer, messageScore } = req.body;

    try {
        const newMessage = new Message({
            sessionId,
            question,
            answer,
            messageScore,
        });

        await newMessage.save();

        // 메시지 개수 확인
        const messageCount = await Message.countDocuments({ sessionId });

        // 4의 배수일 때만 요약 모델 실행
        if (messageCount % 4 === 0) {
            try {
                const summaryResult = await runSummaryModel(sessionId);
                if (summaryResult.updated) {
                    await Session.findByIdAndUpdate(sessionId, {sessionName : summaryResult.summary });
                    // console.log('Session summary updated:', summaryResult.summary);
                }
            } catch (summaryError) {
                console.error('Error running summary model:', summaryError);
            }
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).json({ message: "Server error" });
    }
});

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

app.put("/api/messages/:messageId", async (req, res) => {
    const { messageId } = req.params;
    const { answer } = req.body;

    try {
        const message = await Message.findById(messageId);

        if (!message) {
            console.error('Message not found:', messageId);
            return res.status(404).json({ message: "Message not found" });
        }
        message.answer = answer;
        await message.save();

        // 즉시 응답 보내기
        res.status(200).json(message);

        // 비동기적으로 점수 계산 및 요약 처리
        calculateScoreAndUpdateSummary(message);

    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

async function calculateScoreAndUpdateSummary(message) {
    try {
        // 점수 계산 로직
        const pythonProcess = spawn('python', ['./models/score_model/use_model.py']);

        const data = {
            question: message.question,
            answer: message.answer
        };

        pythonProcess.stdin.write(JSON.stringify(data) + '\n');
        pythonProcess.stdin.end();

        let resultData = '';

        const processPromise = new Promise((resolve, reject) => {
            pythonProcess.stdout.on('data', (data) => {
                resultData += data.toString();
            });

            pythonProcess.stdout.on('end', () => {
                try {
                    const result = JSON.parse(resultData);
                    resolve(result);
                } catch (error) {
                    console.error('Error parsing JSON from Python script:', error);
                    reject(new Error('Error parsing JSON from Python script'));
                }
            });

            pythonProcess.on('error', (error) => {
                console.error('Error with Python process:', error);
                reject(new Error('Error with Python process'));
            });
        });

        const result = await processPromise;
        message.messageScore = result.final_score;
        await message.save();

        // 메시지 개수 확인
        const messageCount = await Message.countDocuments({ sessionId: message.sessionId });

        // 4의 배수일 때만 요약 모델 실행
        if (messageCount % 4 === 0) {
            try {
                const summaryResult = await runSummaryModel(message.sessionId);
                if (summaryResult.updated) {
                    await Session.findByIdAndUpdate(message.sessionId, {sessionName: summaryResult.summary});
                    // console.log('Session summary updated:', summaryResult.summary);
                }
            } catch (summaryError) {
                console.error('Error running summary model:', summaryError);
            }
        }
    } catch (error) {
        console.error('Error in calculateScoreAndUpdateSummary:', error);
    }
}

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
