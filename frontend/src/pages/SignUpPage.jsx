import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  authStateListener,
  signUpWithEmail,
  signInWithGoogle,
} from "../Firebase";
import icon_logo from "../assets/logo.png";
import icon_logo_google from "../assets/logo-google.png";
import "../styles/Auth.css";

const SignUpPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = authStateListener((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate("/getting-started");
    }
  }, [user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await signUpWithEmail(email, password, setError);
    } catch (error) {}
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle(setError);
    } catch (error) {}
  };

  return (
    <div className="page-sign-up">
      <Link to="/">
        <img src={icon_logo} alt="logo" className="website-logo" />
      </Link>
      <div className="sign-up-content">
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="sign-up-with-email" onSubmit={handleSignUp} noValidate>
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <input
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />
          <button type="submit">Sign Up</button>
        </form>
        <div className="separator">
          <span>or with</span>
        </div>
        <button className="google-button" onClick={handleGoogleSignUp}>
          <img src={icon_logo_google} alt="logo" className="google-logo" />
          Sign Up with Google
        </button>
      </div>
    </div>
  );
};

export default SignUpPage;
