import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
} from "firebase/auth";
import axios from "axios";
import { Link } from "react-router-dom";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Function to handle Google sign-in
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await saveUserToDB(user);
  } catch (error) {
    handleAuthError(error, setError);
  }
};

// Function to handle email/password sign-up
const signUpWithEmail = async (email, password, setError) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    await saveUserToDB(user);
    setError(null); // Clear any previous errors
  } catch (error) {
    handleAuthError(error, setError);
  }
};

// Function to handle email/password sign-in
const signInWithEmail = async (email, password, setError) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    await saveUserToDB(user);
    setError(null);
  } catch (error) {
    handleAuthError(error, setError);
  }
};

// Function to send password reset email
const resetPasswordWithEmail = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(error.message);
  }
};

const confirmPasswordResetEmail = async (oobCode, newPassword) => {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to handle sign-out
const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase.js > Error during sign-out:", error.message);
  }
};

// Function to listen for authentication state changes
const authStateListener = (callback) => {
  onAuthStateChanged(auth, callback);
};

// Function to save user data to MongoDB
const saveUserToDB = async (user) => {
  try {
    await axios.post("http://localhost:5000/api/users", {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
    });
  } catch (error) {
    console.error("Firebase.js > Error saving user to DB:", error.message);
  }
};

// Function to handle Firebase authentication errors
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
    default:
      errorMessage = "Error during authentication: " + error.message;
  }
  setError(errorMessage);
};

export {
  auth,
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  logout,
  authStateListener,
  resetPasswordWithEmail,
  confirmPasswordResetEmail,
};
