const express = require("express");
const connectDB = require("./db");
const User = require("./models/userModel");
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
  } = req.body;
  try {
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
      });
      await user.save();
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ message: "Server error " });
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
