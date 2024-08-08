const User = require('../models/userModel');

exports.createUser = async (req, res) => {
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
      throw new Error('UID and Email are required');
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
    console.error('Server error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
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
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserScore = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid }, 'score');
    if (user) {
      res.status(200).json(user.score);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user scores:', error.message);
    res.status(500).json({ message: 'Error fetching user scores' });
  }
};
