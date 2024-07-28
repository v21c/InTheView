import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, authStateListener } from "../Firebase";
import icon_session from "../assets/session.svg";
import icon_logo from "../assets/logo.png";
import "../styles/Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showSessions, setShowSessions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = authStateListener((user) => setUser(user));
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const toggleSessions = () => {
    setShowSessions(!showSessions);
  };

  return (
    <div className="relative">
      <nav className="navbar">
        <div className="navbar-left">
          {user ? (
            <>
              <button className="button-toggle" onClick={toggleSessions}>
                <img src={icon_session} alt="session" />
              </button>
              <Link to="/">
                <img src={icon_logo} alt="logo" className="website-logo" />
              </Link>
            </>
          ) : (
            <>
              <Link to="/">
                <img src={icon_logo} alt="logo" className="website-logo" />
              </Link>
              <Link to="/about">About</Link>
              <Link to="/pricing">Pricing</Link>
            </>
          )}
        </div>
        <div className="navbar-right">
          {user ? (
            <>
              <img
                src="https://via.placeholder.com/150"
                alt="User Profile"
                className="profile-picture"
              />
              <button className="button-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/sign-in">
                <button className="button-sign-in">Sign In</button>
              </Link>
              <Link to="/sign-up">
                <button className="button-sign-up">Sign Up</button>
              </Link>
            </>
          )}
        </div>
      </nav>
      {user && (
        <div className={`sessions-list ${showSessions ? "open" : ""}`}>
          <div className="sessions-toggle">
            <button className="button-toggle" onClick={toggleSessions}>
              <img src={icon_session} alt="session" />
            </button>
          </div>
          <div className="sessions-content">
            <ul>
              <li>Session 1</li>
              <li>Session 2</li>
              <li>Session 3</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
