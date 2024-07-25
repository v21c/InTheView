import React, { useState } from "react";
import { signUpWithEmail, signInWithGoogle } from "../Firebase";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await signUpWithEmail(email, password);
      navigate("/");
    } catch (error) {
      console.error("Error signing up:", error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (error) {
      console.error("Error signing up with Google:", error.message);
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <button onClick={handleGoogleSignUp}>Sign Up with Google</button>
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpPage;
