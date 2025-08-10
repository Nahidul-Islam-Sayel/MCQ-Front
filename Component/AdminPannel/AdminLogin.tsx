import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { userContext } from "../../src/context/userContext";
const MySwal = withReactContent(Swal);
const primaryColor = "#122048";

const AdminLoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const context = useContext(userContext);
  if (!context) {
    throw new Error("userContext must be used within a userContext.Provider");
  }
  const [login, setLogin, checkadminlogin, setCheckAdminLogin] = context;
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    resetEmail?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate(); // for redirection

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        "https://mcq-back.onrender.com/SingUpAdmin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors({ password: data.error || "Login failed" });
        MySwal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.error || "Invalid email or password.",
        });
      } else {
        MySwal.fire({
          icon: "success",
          title: "Login Successful!",
          text: "Redirecting to Admin Home...",
          timer: 2000,
          showConfirmButton: false,
        });
        setCheckAdminLogin(true);
        setTimeout(() => {
          navigate("/adminhome");
        }, 2000);
      }
    } catch (err) {
      setErrors({ password: "Something went wrong. Try again." });
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateResetEmail = () => {
    const newErrors: typeof errors = {};
    if (!resetEmail) newErrors.resetEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(resetEmail))
      newErrors.resetEmail = "Email is invalid";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateResetEmail()) return;

    setResetLoading(true);

    setTimeout(() => {
      setResetLoading(false);
      setResetSuccess(true);
      MySwal.fire({
        icon: "success",
        title: "Reset Link Sent",
        text: "Please check your email inbox.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4ff] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full relative"
      >
        <h2
          className="text-3xl font-extrabold mb-6 text-center"
          style={{ color: primaryColor }}
        >
          Admin Login
        </h2>

        {/* Email */}
        <label
          className="block mb-2 font-semibold text-gray-700"
          htmlFor="email"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="admin@example.com"
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.email ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-600`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email}</p>
        )}

        {/* Password */}
        <label
          className="block mt-6 mb-2 font-semibold text-gray-700"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-600`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-600 hover:text-gray-900 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-600 text-sm mt-1">{errors.password}</p>
        )}

        {/* Forgot password link */}
        {/* <div className="mt-3 text-right">
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline focus:outline-none"
            onClick={() => {
              setResetSuccess(false);
              setResetEmail("");
              setErrors({});
              setIsResetOpen(true);
            }}
          >
            Forgot Password?
          </button>
        </div> */}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full bg-gradient-to-r from-[#0e2a66] to-[#122048] text-white font-semibold py-3 rounded-lg hover:from-[#122048] hover:to-[#0e2a66] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Forgot Password Modal */}
        {isResetOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 relative">
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 focus:outline-none"
                onClick={() => setIsResetOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
              <h3
                className="text-xl font-bold mb-4"
                style={{ color: primaryColor }}
              >
                Reset Password
              </h3>

              {!resetSuccess ? (
                <form onSubmit={handleResetSubmit}>
                  <label
                    className="block mb-2 font-semibold text-gray-700"
                    htmlFor="resetEmail"
                  >
                    Enter your email address
                  </label>
                  <input
                    id="resetEmail"
                    type="email"
                    placeholder="admin@example.com"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.resetEmail ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4`}
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={resetLoading}
                  />
                  {errors.resetEmail && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.resetEmail}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-gradient-to-r from-[#0e2a66] to-[#122048] text-white font-semibold py-3 rounded-lg hover:from-[#122048] hover:to-[#0e2a66] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              ) : (
                <p className="text-green-700 font-semibold text-center">
                  A password reset link has been sent to your email.
                </p>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminLoginForm;
