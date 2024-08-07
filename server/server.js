const express = require("express");
const connectDB = require("./db");
const User = require("./models/userModel");
const sessionController = require("./controllers/sessionController");
const sessionRoute = require("./routes/sessionRoute");
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
    experience,
    score,
    userSettings,
    sessions,
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
        sessions: sessions || [],
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
    experience,
    score,
    userSettings,
    sessions,
  } = req.body;

  try {
    let user = await User.findOne({ uid });
    if (user) {
      user.submittedGettingStarted = submittedGettingStarted;
      user.firstName = firstName;
      user.lastName = lastName;
      user.gender = gender;
      user.ageRange = ageRange;
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
      user.sessions = sessions || [];
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

app.get("/api/users/score/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const user = await User.findOne({ uid }, 'score');
    if (user) {
      res.status(200).json(user.score);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user scores:", error.message);
    res.status(500).json({ message: "Error fetching user scores" });
  }
});

app.use('/api/sessions', sessionRoute);

app.post("/api/feedback", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const requestId = await generateFeedbackRequest(userId);
    res.status(201).json({ requestId });
  } catch(error) {
    console.error("Error generating feedback request:", error);
    res.status(500).json({ message: "Error generating feedback request" });
  }
})

app.get("/api/feedback/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    const feedback = await getFeedback(requestId);
    res.status(200).json(feedback)
  } catch(error) {
    console.error("Error getting feedback:", error);
    res.status(500).json({ message: "Error getting feedback" });
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
