import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  getAuth,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"; // Import necessary functions
import "../styles/Settings.css";

const Settings = ({ user, isOpen, onClose }) => {
  const [selectedTab, setSelectedTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    ageRange: "",
    occupation: "",
    experience: "",
  });
  const [newEmail, setNewEmail] = useState(user ? user.email : "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && user) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/users/${user.uid}`
          );
          setProfileData({
            firstName: response.data.firstName || "",
            lastName: response.data.lastName || "",
            gender: response.data.gender || "",
            ageRange: response.data.ageRange || "",
            occupation: response.data.occupation || "",
            experience: response.data.experience || "",
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${user.uid}`,
        profileData
      );
      console.log("Profile updated:", response.data);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const reauthenticateUser = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    try {
      await reauthenticateWithCredential(user, credential);
    } catch (error) {
      console.error("Error reauthenticating user:", error);
      setError("Failed to reauthenticate user");
      throw error; // Rethrow the error to prevent further execution
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    try {
      await reauthenticateUser(); // Reauthenticate the user before updating the email

      const auth = getAuth();
      const user = auth.currentUser;

      // Update email in Firebase Authentication
      await updateEmail(user, newEmail);
      console.log("Email updated successfully in Firebase");

      // Update email in backend database
      await axios.put(`http://localhost:5000/api/users/${user.uid}`, {
        email: newEmail,
      });
      console.log("Email updated successfully in backend");
    } catch (error) {
      console.error("Error updating email:", error);
      setError("Failed to update email");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    try {
      await reauthenticateUser(); // Reauthenticate the user before updating the password

      const auth = getAuth();
      const user = auth.currentUser;

      // Update password in Firebase Authentication
      await updatePassword(user, newPassword);
      console.log("Password updated successfully");

      // Clear the password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      setError("Failed to update password");
    }
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "profile":
        return (
          <form className="dialog-content" onSubmit={handleProfileUpdate}>
            <div className="profile-item">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div className="profile-item">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profileData.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div className="profile-item">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={profileData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div className="profile-item">
              <label htmlFor="ageRange">Age Range</label>
              <select
                id="ageRange"
                name="ageRange"
                value={profileData.ageRange}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Age Range</option>
                <option value="-34">-34</option>
                <option value="35-44">35-44</option>
                <option value="45-54">45-54</option>
                <option value="55-">55-</option>
              </select>
            </div>
            <div className="profile-item">
              <label htmlFor="occupation">Occupation</label>
              <select
                id="occupation"
                name="occupation"
                value={profileData.occupation}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Occupation</option>
                <option value="ICT">ICT</option>
              </select>
            </div>
            <div className="profile-item">
              <label htmlFor="experience">Experience</label>
              <select
                id="experience"
                name="experience"
                value={profileData.experience}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Experience</option>
                <option value="NEW">NEW</option>
                <option value="EXPERIENCED">EXPERIENCED</option>
              </select>
            </div>
            <button type="submit">Save</button>
          </form>
        );
      case "general":
        return (
          <div className="dialog-content">
            <div className="general-item">
              <label>Theme</label>
              <select>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
            <div className="general-item">
              <label>Language</label>
              <select>
                <option>English</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>
        );
      case "account":
        return (
          <div className="dialog-content">
            <div className="account-item">
              <form onSubmit={handleEmailChange} className="change-email">
                <h3>Change Email</h3>
                <div className="change-email-new">
                  <label>New Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="change-email-confirm">
                  <label>Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit">Update Email</button>
              </form>
            </div>
            <div className="account-item">
              <form onSubmit={handlePasswordChange} className="change-password">
                <h3>Change Password</h3>
                <div className="change-password-current">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="change-password-new">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="change-password-confirm">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit">Update Password</button>
              </form>
            </div>
            <div className="account-item">
              <div className="delete-account">
                <label>Delete Account</label>
                <button>Delete</button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="user-dialog-overlay">
      <div className="user-dialog">
        <div className="dialog-header">
          <h2 className="dialog-name">Settings</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="dialog-container">
          <div className="dialog-sidebar">
            <button
              className={selectedTab === "general" ? "active" : ""}
              onClick={() => setSelectedTab("general")}
            >
              General
            </button>
            <button
              className={selectedTab === "profile" ? "active" : ""}
              onClick={() => setSelectedTab("profile")}
            >
              Profile
            </button>
            <button
              className={selectedTab === "account" ? "active" : ""}
              onClick={() => setSelectedTab("account")}
            >
              Account
            </button>
          </div>
          <div className="dialog-main">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
