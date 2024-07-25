import React, { useEffect, useState } from "react";
import { authStateListener } from "../Firebase";
import { Outlet, Navigate } from "react-router-dom";

const AuthRoute = ({ isPrivate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authStateListener((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isPrivate && !user) {
    return <Navigate to="/sign-in" />;
  }

  if (!isPrivate && user) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default AuthRoute;
