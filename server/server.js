const express = require("express");
const connectDB = require("./db");
const User = require("./models/userModel");
const Session = require("./models/sessionModel");
const Message = require("./models/messageModel");
const sessionController = require("./controllers/sessionController");
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
    const sessions = await Session.find({ userId });
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/sessions", async (req, res) => {
  const { userId, sessionName, sessionPurpose, sessionScore, sessionFeedback } =
    req.body;

  try {
    const newSession = new Session({
      userId,
      sessionName,
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
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// app.post("/api/sessions", sessionController.createSession);
// app.get("/api/sessions/:sessionid", sessionController.getSessionDetails);
// app.post("/api/messages", sessionController.createMessage);
// app.get("/api/messages/:messageid", sessionController.getMessages);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
