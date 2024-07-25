import React, { useEffect, useState } from "react";
import { authStateListener, logout } from "../Firebase";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = authStateListener((user) => {
      setUser(user);
    });
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div>
      {user ? (
        <div>
          <h1>안녕하세요, {user.displayName || user.email}</h1>
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

export default HomePage;
