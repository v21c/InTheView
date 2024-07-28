import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  authStateListener,
  signInWithEmail,
  signInWithGoogle,
} from "../Firebase";
import icon_logo from "../assets/logo.png";
import icon_logo_google from "../assets/logo-google.png";
import "../styles/Auth.css";

const SignInPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password, setError);
    } catch (error) {}
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {}
  };

  return (
    <div className="page-sign-in">
      <Link to="/">
        <img src={icon_logo} alt="logo" className="website-logo" />
      </Link>
      <div className="sign-in-content">
        <h2>Sign In</h2>
        {error && <p className="error-message">{error}</p>}
        <p>
          Don't have an account yet? <Link to="/sign-up">Sign Up</Link>
        </p>
        <form className="sign-in-with-email" onSubmit={handleSignIn} noValidate>
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
          <button type="submit">Sign In</button>
        </form>
        <p>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <div className="separator">
          <span>or with</span>
        </div>
        <button className="google-button" onClick={handleGoogleSignIn}>
          <img src={icon_logo_google} alt="logo" className="google-logo" />
          Sign In with Google
        </button>
      </div>
    </div>
  );
};

export default SignInPage;
