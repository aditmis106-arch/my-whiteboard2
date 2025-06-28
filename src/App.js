import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Board from "./components/Board";
import Toolbar from "./components/Toolbar";
import Toolbox from "./components/Toolbox";
import Sidebar from "./components/Sidebar";
import BoardProvider from "./store/BoardProvider";
import ToolboxProvider from "./store/ToolboxProvider";
import Login from "./components/Login";
import Register from "./components/Register";
import LandingPage from "./components/LandingPage";
import About from "./components/About";
import Contact from "./components/Contact";
import Help from "./components/Help";
import EmailVerification from "./components/EmailVerification";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { useParams } from "react-router-dom";

function WhiteboardApp() {
  const { id } = useParams();
  return (
    <ToolboxProvider>
      <div className="app-container">
        <Toolbar />
        <Board id={id}/>
        <Toolbox />
        <Sidebar /> 
      </div>
    </ToolboxProvider>
  );
}

function App() {
  return (
    <BoardProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<Help />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/whiteboard" element={<WhiteboardApp />} />
          <Route path="/whiteboard/:id" element={<WhiteboardApp />} />
          <Route path="/demo" element={<WhiteboardApp />} />
        </Routes>
      </Router>
    </BoardProvider>
  );
}

export default App;