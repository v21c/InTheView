import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, authStateListener } from "../Firebase";
import icon_session from "../assets/session.svg";
import icon_logo from "../assets/logo.png";
import Settings from "./Settings"; // Import the new component
import "../styles/Navbar.css";

const Navbar = ({ toggleSessions }) => {
  const [user, setUser] = useState(null);
  const [showUserOptions, setShowUserOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // New state for dialog
  const userOptionsRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = authStateListener((user) => setUser(user));
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userOptionsRef.current &&
        !userOptionsRef.current.contains(event.target)
      ) {
        setShowUserOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const toggleUserOptions = () => {
    setShowUserOptions(!showUserOptions);
  };

  const openSettings = () => {
    setShowSettings(true);
    setShowUserOptions(false);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  return (
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
          <div className="user-profile-container" ref={userOptionsRef}>
            <img
              src="https://via.placeholder.com/150"
              alt="User Profile"
              className="profile-picture"
              onClick={toggleUserOptions}
            />
            {showUserOptions && (
              <div className="user-options-box">
                <button onClick={openSettings}>Settings</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
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
      <Settings user={user} isOpen={showSettings} onClose={closeSettings} />
    </nav>
  );
};

export default Navbar;
