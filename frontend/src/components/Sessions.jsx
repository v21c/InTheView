import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import icon_session from "../assets/session.svg";
import icon_add_session from "../assets/add-session.svg";
import icon_options from "../assets/options.svg";
import "../styles/Sessions.css";

const Sessions = ({
  user,
  setSelectedSession,
  showSessions,
  toggleSessions,
}) => {
  const [sessions, setSessions] = useState([]);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [showOptions, setShowOptions] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [optionsVisibleFor, setOptionsVisibleFor] = useState(null);

  const optionsRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    fetchSessions();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target) &&
        (!inputRef.current || !inputRef.current.contains(event.target))
      ) {
        if (editingSessionId) {
          cancelRenameSession();
        } else if (showOptions) {
          setShowOptions(null);
          setOptionsVisibleFor(null);
        }
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        if (editingSessionId) {
          cancelRenameSession();
        } else if (showOptions) {
          setShowOptions(null);
          setOptionsVisibleFor(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [editingSessionId, showOptions]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/sessions", {
        params: { userId: user.uid },
      });
      setSessions(response.data);
      if (response.data.length > 0) {
        setSelectedSessionId(response.data[0]._id);
        setSelectedSession(response.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const createSession = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/sessions", {
        userId: user.uid,
        sessionName: "New session",
        sessionPurpose: "",
        sessionScore: 0,
        sessionFeedback: "",
      });
      console.log("Session created:", response.data);
      fetchSessions();
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleSessionClick = (sessionId) => {
    setSelectedSessionId(sessionId);
    setSelectedSession(sessionId);
  };

  const handleRenameSession = async (sessionId) => {
    const trimmedSessionName = newSessionName.trim();
    if (!trimmedSessionName) {
      cancelRenameSession();
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/sessions/${sessionId}`, {
        sessionName: trimmedSessionName,
      });
      console.log("Session renamed:", trimmedSessionName);
      fetchSessions();
      setEditingSessionId(null);
      setNewSessionName("");
      setShowOptions(null);
      setOptionsVisibleFor(null);
    } catch (error) {
      console.error("Error renaming session:", error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await axios.delete(`http://localhost:5000/api/sessions/${sessionId}`);
      console.log("Session deleted:", sessionId);
      const response = await axios.get("http://localhost:5000/api/sessions", {
        params: { userId: user.uid },
      });
      const updatedSessions = response.data;
      setSessions(updatedSessions);
      if (updatedSessions.length > 0) {
        setSelectedSessionId(updatedSessions[0]._id);
        setSelectedSession(updatedSessions[0]._id);
      } else {
        setSelectedSessionId(null);
        setSelectedSession(null);
      }
      setShowOptions(null);
      setOptionsVisibleFor(null);
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const toggleOptions = (sessionId, event) => {
    event.stopPropagation();
    if (showOptions === sessionId) {
      setShowOptions(null);
      setOptionsVisibleFor(null);
    } else {
      setShowOptions(sessionId);
      setOptionsVisibleFor(sessionId);
    }
  };

  const startRenameSession = (session, event) => {
    event.stopPropagation();
    setEditingSessionId(session._id);
    setNewSessionName(session.sessionName);
    setShowOptions(null);
    setOptionsVisibleFor(null);
  };

  const cancelRenameSession = () => {
    setEditingSessionId(null);
    setNewSessionName("");
    setShowOptions(null);
    setOptionsVisibleFor(null);
  };

  useEffect(() => {
    if (editingSessionId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingSessionId]);

  return (
    <div className={`sessions-list ${showSessions ? "open" : ""}`}>
      <div className="sessions-toggle">
        <button className="button-toggle" onClick={toggleSessions}>
          <img src={icon_session} alt="session" />
        </button>
        <button className="button-create" onClick={createSession}>
          <img src={icon_add_session} alt="session" />
        </button>
      </div>
      {showSessions && (
        <div className="sessions-content">
          <div className="sessions-container">
            {sessions.map((session) => (
              <div
                key={session._id}
                className={`session ${
                  selectedSessionId === session._id ||
                  optionsVisibleFor === session._id
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleSessionClick(session._id)}
              >
                {editingSessionId === session._id ? (
                  <input
                    type="text"
                    ref={inputRef}
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRenameSession(session._id);
                      }
                    }}
                    placeholder="Enter new session name"
                    onBlur={cancelRenameSession}
                  />
                ) : (
                  <>
                    <span>{session.sessionName}</span>
                    <div
                      className={`session-options-container ${
                        showOptions === session._id ? "hovered" : ""
                      }`}
                    >
                      <img
                        src={icon_options}
                        alt="options"
                        className="session-options"
                        onClick={(event) => toggleOptions(session._id, event)}
                      />
                      {showOptions === session._id && (
                        <div
                          className="options-box"
                          ref={optionsRef}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            onClick={(event) =>
                              startRenameSession(session, event)
                            }
                          >
                            Rename
                          </button>
                          <button
                            onClick={(event) =>
                              handleDeleteSession(session._id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
