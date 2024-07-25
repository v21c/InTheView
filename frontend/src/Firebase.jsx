// Import the functions you need from the SDKs you need
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
} from "firebase/auth";
import axios from "axios";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
    console.error("Firebase.js > Error during Google sign-in:", error.message);
  }
};

// Function to handle email/password sign-up
const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    await saveUserToDB(user);
  } catch (error) {
    console.error("Firebase.js > Error during email sign-up:", error.message);
  }
};

// Function to handle email/password sign-in
const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    await saveUserToDB(user);
  } catch (error) {
    console.error("Firebase.js > Error during email sign-in:", error.message);
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

export {
  auth,
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  logout,
  authStateListener,
};
