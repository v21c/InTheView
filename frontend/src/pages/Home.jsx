import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authStateListener } from "../Firebase";
import Messages from "../components/Messages";
import Navbar from "../components/Navbar";
import Interview from "../components/Interview";

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
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
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!loading && user) {
      const checkGettingStarted = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/users/${user.uid}`
          );
          if (!response.data.submittedGettingStarted) {
            navigate("/getting-started");
          }
        } catch (error) {
          console.error("Error calling data:", error.message);
        }
      };

      checkGettingStarted();
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar setSelectedSession={setSelectedSession} />
      {user ? (
        <div>
          {selectedSession ? (
            <>
              <Messages user={user} selectedSession={selectedSession} />
              {/* <Interview /> */}
            </>
          ) : (
            <h1>안녕하세요, {user.displayName || user.email}님</h1>
          )}
        </div>
      ) : (
        <div>
          <h1>면접에 통과하고 싶은가요?</h1>
          <h1>인더뷰에 가입하세요!</h1>
        </div>
      )}
    </div>
  );
};

export default Home;
