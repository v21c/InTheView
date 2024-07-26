import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import AuthRoute from "./components/AuthRoute";
import Navbar from "./components/Navbar";

import "./App.css";

const App = () => {
  return (
    <Router>
      <ConditionalNavbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<AuthRoute isPrivate={false} />}>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
        </Route>
        <Route element={<AuthRoute isPrivate={true} />}>
          <Route path="/dashboard" element={<HomePage />} />
        </Route>
      </Routes>
    </Router>
  );
};

// A component to conditionally render the Navbar based on the current route
const ConditionalNavbar = () => {
  const location = useLocation();
  const hideNavbarRoutes = ["/sign-in", "/sign-up"];

  if (hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }

  return <Navbar />;
};

export default App;
