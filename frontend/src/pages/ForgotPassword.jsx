import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authStateListener, resetPasswordWithEmail } from "../Firebase";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
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
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await resetPasswordWithEmail(email, setError);
      setMessage("Password reset email sent! Check your inbox.");
      setError("");
    } catch (error) {
      setError("Error sending password reset email: " + error.message);
      setMessage("");
    }
  };

  return (
    <div className="page-forgot-password">
      <h2>Forgot Password</h2>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}
      <form
        className="forgot-password-form"
        onSubmit={handlePasswordReset}
        noValidate
      >
        <input
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit">Send Password Reset Email</button>
      </form>
      <p>
        Remembered your password? <Link to="/sign-in">Sign In</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
