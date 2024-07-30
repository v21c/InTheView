import { Link } from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import axios from "axios";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const authStateListener = (callback) => {
  onAuthStateChanged(auth, callback);
};

const signUpWithEmail = async (email, password, setError) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    await saveUserToDB(user);
  } catch (error) {
    handleAuthError(error, setError);
    throw error;
  }
};

const signInWithEmail = async (email, password, setError) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    await saveUserToDB(user);
  } catch (error) {
    handleAuthError(error, setError);
    throw error;
  }
};

const signInWithGoogle = async (setError) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await saveUserToDB(user);
  } catch (error) {
    handleAuthError(error, setError);
    throw error;
  }
};

const resetPasswordWithEmail = async (email, setError) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    handleAuthError(error, setError);
    throw error;
  }
};

const confirmPasswordResetEmail = async (oobCode, newPassword) => {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
  } catch (error) {
    handleAuthError(error, setError);
    throw error;
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error during signout:", error.message);
  }
};

const saveUserToDB = async (user) => {
  try {
    if (!user) throw new Error("User object is undefined");

    await axios.post("http://localhost:5000/api/users", {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      submittedGettingStarted: false,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      gender: user.gender || "",
      ageRange: user.ageRange || "",
      experience: user.experience || "",
      score: user.score
        ? {
            averageScore: user.score.averageScore || 0,
            totalScore: user.score.totalScore || [],
          }
        : { averageScore: 0, totalScore: [] },
      userSettings: user.userSettings
        ? {
            notification: {
              email: user.userSettings.notification?.email ?? true,
            },
            theme: { darkMode: user.userSettings.theme?.darkMode ?? false },
          }
        : { notification: { email: true }, theme: { darkMode: false } },
      sessions: user.sessions || [],
    });
  } catch (error) {
    console.error("Error saving user to DB:", error.message);
  }
};

const handleAuthError = (error, setError) => {
  let errorMessage;
  switch (error.code) {
    case "auth/invalid-credential":
      errorMessage = "Wrong password. Try again.";
      break;
    case "auth/email-already-in-use":
      errorMessage = (
        <span>
          This account already exists. <Link to="/sign-in">Sign in</Link>
        </span>
      );
      break;
    case "auth/invalid-email":
      errorMessage = "The email address is not valid.";
      break;
    case "auth/missing-password":
      errorMessage = "Enter a password.";
      break;
    case "auth/user-disabled":
      errorMessage =
        "The user corresponding to the given email has been disabled.";
      break;
    case "auth/user-not-found":
      errorMessage = "There is no user corresponding to the given email.";
      break;
    case "auth/wrong-password":
      errorMessage = "The password is invalid for the given email.";
      break;
    case "auth/popup-closed-by-user":
      return;
    default:
      errorMessage = "Error during authentication: " + error.message;
  }
  setError(errorMessage);
  new Error(error.code);
};

export {
  authStateListener,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  resetPasswordWithEmail,
  confirmPasswordResetEmail,
  logout,
};
