import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authStateListener, confirmPasswordResetEmail } from "../Firebase";
import "../styles/ResetPasswordPage.css";

const ResetPasswordPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const oobCode = query.get("oobCode");

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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await confirmPasswordResetEmail(oobCode, newPassword);
      setMessage("Password has been reset successfully!");
      setError("");
      navigate("/sign-in");
    } catch (error) {
      setError("Error resetting password: " + error.message);
      setMessage("");
    }
  };

  return (
    <div className="page-reset-password">
      <h2>Reset Password</h2>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}
      <form
        className="reset-password-form"
        onSubmit={handleResetPassword}
        noValidate
      >
        <input
          type="password"
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          required
        />
        <input
          type="password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
