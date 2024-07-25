import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import AuthRoute from "./components/AuthRoute";
import Navbar from "./components/Navbar";

import "./App.css";

const App = () => {
  return (
    <Router>
      <Navbar />
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

export default App;
