import { createContext, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminHome from "../Component/AdminPannel/AdminDashboard";
import AdminLogin from "../Component/AdminPannel/AdminLogin";
import Home from "../Component/Home";
import Login from "../Component/Login";
import Navbar from "../Component/Navbar";
import Singup from "../Component/SignUp";
import StudentsExam from "../Component/StudentsExam";
import StudentsProfile from "../Component/StudentsProfile";
export const userContext = createContext();

function App() {
  const [login, setLogin] = useState(false);
  return (
    <userContext.Provider value={[login, setLogin]}>
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
          <Route path="/adminhome" element={<AdminHome />} />
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
          <Route
            path="/exam"
            element={
              <>
                <Navbar />
                <StudentsExam />
              </>
            }
          />
          <Route
            path="/profile"
            element={
              <>
                <Navbar />
                <StudentsProfile />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </userContext.Provider>
  );
}

export default App;
