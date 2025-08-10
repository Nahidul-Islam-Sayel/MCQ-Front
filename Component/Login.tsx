import React, { useContext, useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { userContext } from "../src/App";
import loginImg from "../src/assets/HomePage/HeroImage.jpg";
const MySwal = withReactContent(Swal);
const primaryColor = "#122048";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, setLogin] = useContext(userContext);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  // Step 1: handle initial login (send credentials and send OTP to email)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/StudentsSection/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Backend sends success response & OTP sent to email
      // Now show OTP input form
      setOtpSent(true);
      setLoading(false);

      await MySwal.fire({
        icon: "info",
        title: "OTP Sent",
        text: "An OTP has been sent to your email. Please enter it below to complete login.",
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
      setLoading(false);
    }
  };

  // Step 2: handle OTP verification
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        "http://localhost:5000/StudentsSection/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "OTP verification failed");
        setLoading(false);
        return;
      }

      // OTP correct, backend sends tokens and userid
      const { accessToken, userid } = data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userid", userid);

      await MySwal.fire({
        icon: "success",
        title: "Login Successful",
        text: "You have logged in successfully.",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      setLoading(false);
      setLogin(true);
      console.log(login);
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError("Server error during OTP verification");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left Side - Image (hidden on mobile) */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginImg})` }}
      >
        <div className="bg-black/40 w-full flex items-center justify-center">
          <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold p-4 sm:p-6 text-center leading-snug">
            Welcome Back to{" "}
            <span style={{ color: "#ffcd3c" }}>Pro Coder Hero</span>
          </h1>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-8 py-10 sm:py-12 lg:py-16 min-h-screen mt-10">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          <h2
            className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6"
            style={{ color: primaryColor }}
          >
            Admin Login
          </h2>

          {!otpSent ? (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  className="block mb-2 font-medium text-xs sm:text-sm md:text-base"
                  style={{ color: primaryColor }}
                >
                  Email
                </label>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <span className="px-3 text-gray-500">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full p-2 sm:p-3 outline-none text-xs sm:text-sm md:text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  className="block mb-2 font-medium text-xs sm:text-sm md:text-base"
                  style={{ color: primaryColor }}
                >
                  Password
                </label>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <span className="px-3 text-gray-500">
                    <FaLock />
                  </span>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full p-2 sm:p-3 outline-none text-xs sm:text-sm md:text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm md:text-base font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-600 text-center text-sm font-semibold">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                className={`w-full py-2 sm:py-3 rounded-lg text-white font-bold text-sm sm:text-lg lg:text-xl transition-transform transform hover:scale-105 ${
                  loading ? "bg-gray-500 cursor-not-allowed" : ""
                }`}
                style={{ backgroundColor: primaryColor }}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
            // OTP Form
            <form onSubmit={handleOtpVerify} className="space-y-5">
              <div>
                <label
                  className="block mb-2 font-medium text-xs sm:text-sm md:text-base"
                  style={{ color: primaryColor }}
                >
                  Enter OTP sent to your email
                </label>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full p-3 border rounded-lg text-center text-xl font-semibold tracking-widest"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <p className="text-red-600 text-center text-sm font-semibold">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className={`w-full py-2 sm:py-3 rounded-lg text-white font-bold text-sm sm:text-lg lg:text-xl transition-transform transform hover:scale-105 ${
                  loading ? "bg-gray-500 cursor-not-allowed" : ""
                }`}
                style={{ backgroundColor: primaryColor }}
                disabled={loading}
              >
                {loading ? "Verifying OTP..." : "Verify OTP"}
              </button>

              <button
                type="button"
                className="mt-2 w-full py-2 rounded-lg text-primary font-semibold border border-primary hover:bg-primary hover:text-white transition-colors"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setError(null);
                }}
                disabled={loading}
              >
                Back to Login
              </button>
            </form>
          )}

          {/* Sign Up Link */}
          {!otpSent && (
            <p className="text-center mt-6 text-gray-600 text-xs sm:text-sm md:text-base">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="font-medium hover:underline"
                style={{ color: primaryColor }}
              >
                Sign Up
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
