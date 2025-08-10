import type { ReactNode } from "react";
import React, { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminHome from "../Component/AdminPannel/AdminDashboard";
import AdminLogin from "../Component/AdminPannel/AdminLogin";
import Home from "../Component/Home";
import Login from "../Component/Login";
import Navbar from "../Component/Navbar";
import Singup from "../Component/SignUp";
import StudentsExam from "../Component/StudentsExam";
import StudentsProfile from "../Component/StudentsProfile";
import { userContext } from "./context/userContext";
// Define the shape of your context value

// Create context with a default value or undefined

// Props for ProtectedRoute
interface ProtectedRouteProps {
  isAllowed: boolean | string | null; // since you use localStorage values (string | null), widen type here
  redirectPath?: string;
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAllowed,
  redirectPath = "/login",
  children,
}) => {
  // Treat localStorage strings as boolean flags:
  const allowed =
    typeof isAllowed === "boolean" ? isAllowed : Boolean(isAllowed);

  if (!allowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [login, setLogin] = useState(false);
  const [checkadminlogin, setCheckAdminLogin] = useState(false);
  const isAdminLoggedIn = localStorage.getItem("adminlogin"); // string|null
  const isLogin = localStorage.getItem("userid"); // string|null

  return (
    <userContext.Provider
      value={[login, setLogin, checkadminlogin, setCheckAdminLogin]}
    >
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Home />
              </>
            }
          />
          <Route path="/admin" element={<AdminLogin />} />
          {(isAdminLoggedIn || checkadminlogin) && (
            <Route path="/adminhome" element={<AdminHome />} />
          )}
          <Route
            path="/signup"
            element={
              <>
                <Navbar />
                <Singup />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <Navbar />
                <Login />
              </>
            }
          />

          {/* Protected routes */}
          <Route
            path="/exam"
            element={
              <ProtectedRoute isAllowed={login || isLogin}>
                <>
                  <Navbar />
                  <StudentsExam />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAllowed={login || isLogin}>
                <>
                  <Navbar />
                  <StudentsProfile />
                </>
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <div className="flex items-center justify-center min-h-[70vh] text-4xl font-bold text-red-600">
                  404 Not Found
                </div>
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </userContext.Provider>
  );
};

export default App;
