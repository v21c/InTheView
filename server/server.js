const express = require("express");
const connectDB = require("./db");
const User = require("./models/userModel");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// var whitelist = ["http://localhost:5173", "http://127.0.0.1:5173"];
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
// };

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions)); // define this middeware before the all routes as you defined.

// Middleware
// app.use(cors()); // Enable CORS
app.use(express.json());

// Route to handle user creation
app.post("/api/users", async (req, res) => {
  const { uid, email, displayName } = req.body;
  try {
    let user = await User.findOne({ uid });
    if (!user) {
      user = new User({ uid, email, displayName });
      await user.save();
    }
    res.status(201).json(user);
  } catch (error) {
    console.error("server.js > Server error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`server.js > Server is running on port ${PORT}`);
});
