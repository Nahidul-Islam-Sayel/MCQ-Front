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

  // --- existing login / otp flow (unchanged) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        "https://mcq-back.onrender.com/StudentsSection/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

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

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        "https://mcq-back.onrender.com/StudentsSection/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError("Server error during OTP verification");
      setLoading(false);
    }
  };

  // ---------------------------
  // Forgot password modal flow
  // ---------------------------
  const handleForgotPassword = async () => {
    try {
      // Step 1: ask for email
      const { value: enteredEmail } = await MySwal.fire({
        title: "Forgot Password",
        input: "email",
        inputLabel: "Enter your account email",
        inputPlaceholder: "name@example.com",
        showCancelButton: true,
        confirmButtonText: "Send Code",
        preConfirm: (val) => {
          if (!val) {
            MySwal.showValidationMessage("Email is required");
          }
          return val;
        },
      });

      if (!enteredEmail) return; // user cancelled

      // show loading
      MySwal.fire({
        title: "Sending code...",
        didOpen: () => {
          MySwal.showLoading();
        },
        allowOutsideClick: false,
        showConfirmButton: false,
      });

      // Call backend to send code
      const sendRes = await fetch(
        "https://mcq-back.onrender.com/StudentsSection/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: enteredEmail }),
        }
      );

      const sendData = await sendRes.json();
      MySwal.close();

      if (!sendRes.ok) {
        await MySwal.fire({
          icon: "error",
          title: "Error",
          text: sendData.error || "Failed to send code",
        });
        return;
      }

      await MySwal.fire({
        icon: "success",
        title: "Code Sent",
        text: "A verification code has been sent to your email.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      // Step 2: ask for code
      const { value: enteredCode } = await MySwal.fire({
        title: "Enter the code",
        input: "text",
        inputLabel: "6-digit code sent to your email",
        inputPlaceholder: "Enter code",
        showCancelButton: true,
        confirmButtonText: "Verify Code",
        inputValidator: (val) => {
          if (!val) return "Code is required";
          if (!/^\d{6}$/.test(val)) return "Enter a valid 6-digit code";
          return null;
        },
      });

      if (!enteredCode) return;

      // Verify code on backend
      MySwal.fire({
        title: "Verifying code...",
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
        showConfirmButton: false,
      });

      const verifyRes = await fetch(
        "https://mcq-back.onrender.com/StudentsSection/verify-reset-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: enteredEmail, code: enteredCode }),
        }
      );
      const verifyData = await verifyRes.json();
      MySwal.close();

      if (!verifyRes.ok) {
        await MySwal.fire({
          icon: "error",
          title: "Invalid Code",
          text: verifyData.error || "Code verification failed",
        });
        return;
      }

      await MySwal.fire({
        icon: "success",
        title: "Code Verified",
        text: "You may now set a new password.",
        timer: 1500,
        showConfirmButton: false,
      });

      // Step 3: ask for new password & confirm
      const { value: pwResult } = await MySwal.fire({
        title: "Set New Password",
        html:
          `<input id="swal-new-pw" class="swal2-input" placeholder="New password" type="password">` +
          `<input id="swal-confirm-pw" class="swal2-input" placeholder="Confirm password" type="password">`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Update Password",
        preConfirm: () => {
          const newPw = (
            document.getElementById("swal-new-pw") as HTMLInputElement
          ).value;
          const confirmPw = (
            document.getElementById("swal-confirm-pw") as HTMLInputElement
          ).value;
          if (!newPw || !confirmPw) {
            MySwal.showValidationMessage("Both fields are required");
            return;
          }
          if (newPw.length < 6) {
            MySwal.showValidationMessage(
              "Password must be at least 6 characters"
            );
            return;
          }
          if (newPw !== confirmPw) {
            MySwal.showValidationMessage("Passwords do not match");
            return;
          }
          return { newPassword: newPw };
        },
      });

      if (!pwResult) return; // cancelled

      // call backend to set new password
      MySwal.fire({
        title: "Updating password...",
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
        showConfirmButton: false,
      });

      const resetRes = await fetch(
        "https://mcq-back.onrender.com/StudentsSection/reset-password-with-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: enteredEmail,
            code: enteredCode,
            newPassword: pwResult.newPassword,
          }),
        }
      );

      const resetData = await resetRes.json();
      MySwal.close();

      if (!resetRes.ok) {
        await MySwal.fire({
          icon: "error",
          title: "Error",
          text: resetData.error || "Failed to update password",
        });
        return;
      }

      await MySwal.fire({
        icon: "success",
        title: "Password Updated",
        text: "Your password has been updated. Please login with the new password.",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Forgot password flow error:", err);
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Try again.",
      });
    }
  };

  // ---------------------------
  // JSX (same as your provided UI; only minor change: forgot password uses handler)
  // ---------------------------
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
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

      <div className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-8 py-10 sm:py-12 lg:py-16 min-h-screen mt-10">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          <h2
            className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6"
            style={{ color: primaryColor }}
          >
            Login
          </h2>

          {!otpSent ? (
            <form onSubmit={handleLogin} className="space-y-5">
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

              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs sm:text-sm md:text-base font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  Forgot Password?
                </button>
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
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
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
