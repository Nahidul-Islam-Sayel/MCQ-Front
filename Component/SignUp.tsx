import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaEnvelope,
  FaGlobe,
  FaLock,
  FaUser,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);
const primaryColor = "#122048";
const API_BASE = "https://mcq-back.onrender.com/StudentsSection";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  dob: string;
  code: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    dob: "",
    code: "",
  });

  const [emailVerified, setEmailVerified] = useState(false);
  const [showVerifyButton, setShowVerifyButton] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [signingUp, setSigningUp] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setEmailVerified(false);
      setShowCodeInput(false);
      setShowVerifyButton(isValidEmail(value));
      setFormData((prev) => ({ ...prev, code: "" }));
    }
  };

  // Send verification code
  const sendVerificationCode = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/send-verification-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        MySwal.fire({
          icon: "info",
          title: "Verification code sent",
          text: `A verification code has been sent to ${formData.email}`,
          timer: 4000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        setShowCodeInput(true);
      } else {
        throw new Error(data.error || "Failed to send verification code");
      }
    } catch (err) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setVerifying(false);
    }
  };

  // Confirm verification code
  const verifyCode = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/confirm-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: formData.code }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEmailVerified(true);
        setShowCodeInput(false); // hide code input
        setShowVerifyButton(false); // hide verify button
        setFormData((prev) => ({ ...prev, code: "" })); // clear code
        MySwal.fire({
          icon: "success",
          title: "Email Verified",
          text: "You can now complete registration.",
        });
      } else {
        throw new Error(data.error || "Invalid verification code");
      }
    } catch (err) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setVerifying(false);
    }
  };

  // Register
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!emailVerified) {
      MySwal.fire({
        icon: "warning",
        title: "Email not verified",
        text: "Please verify your email before registering.",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      MySwal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Passwords do not match.",
      });
      return;
    }

    setSigningUp(true);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          country: formData.country,
          dob: formData.dob,
          code: formData.code, // still send code for backend verification
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        MySwal.fire({
          icon: "success",
          title: "Success!",
          text: "Your account has been created.",
        }).then(() => {
          navigate("/login");
        });
      } else {
        throw new Error(data.error || "Registration failed");
      }
    } catch (err) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setSigningUp(false);
    }
  };

  const isFormComplete = () =>
    formData.name &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.country &&
    formData.dob &&
    emailVerified; // ✅ only enabled if verified

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 mt-20">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2
          className="text-3xl font-bold text-center mb-8"
          style={{ color: primaryColor }}
        >
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Name</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FaUser className="text-gray-500 mr-2" />
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className="w-full outline-none"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FaEnvelope className="text-gray-500 mr-2" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full outline-none"
                required
              />
              {showVerifyButton && !emailVerified && (
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={verifying}
                  className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md"
                >
                  {verifying ? "Verifying..." : "Verify"}
                </button>
              )}
              {emailVerified && (
                <span className="ml-2 text-green-600 font-semibold">
                  Verified ✓
                </span>
              )}
            </div>
          </div>

          {/* Verification Code */}
          {showCodeInput && !emailVerified && (
            <div className="flex space-x-2">
              <input
                type="text"
                name="code"
                placeholder="Enter code"
                value={formData.code}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
              <button
                type="button"
                onClick={verifyCode}
                disabled={verifying}
                className="px-3 py-2 bg-green-600 text-white rounded-md"
              >
                {verifying ? "Verifying..." : "Confirm"}
              </button>
            </div>
          )}

          {/* Other fields */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Country
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FaGlobe className="text-gray-500 mr-2" />
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full outline-none bg-transparent"
                required
              >
                <option value="">Select your country</option>
                <option value="Bangladesh">Bangladesh</option>
                <option value="Italy">Italy</option>
                <option value="Pakistan">Pakistan</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Date of Birth
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FaCalendarAlt className="text-gray-500 mr-2" />
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Password
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FaLock className="text-gray-500 mr-2" />
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className="w-full outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FaLock className="text-gray-500 mr-2" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-semibold shadow-md disabled:opacity-60"
            style={{ backgroundColor: primaryColor }}
            disabled={!isFormComplete() || signingUp}
          >
            {signingUp ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold hover:underline"
            style={{ color: primaryColor }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
``;
