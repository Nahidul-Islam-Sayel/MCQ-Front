import React, { useContext, useEffect, useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { userContext } from "../src/App";
const primaryColor = "#122048";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [login, setLogin] = useContext(userContext);
  const navigate = useNavigate();

  useEffect(() => {
    const userid = localStorage.getItem("userid");

    setIsLoggedIn(!!userid);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsOpen(false);

    Swal.fire({
      icon: "success",
      title: "Logged out",
      text: "You have logged out successfully.",
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
    }).then(() => {
      navigate("/");
    });
  };

  const navLinks = [
    { name: "Home", to: "/" },
    { name: "Features", to: "/#features" },
    { name: "Certification", to: "/#certification" },
    { name: "Contact", to: "/#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-3xl font-extrabold tracking-wide bg-gradient-to-r from-[#0e2a66] to-[#122048] bg-clip-text text-transparent select-none"
          >
            ProCoderHero
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className="relative text-gray-700 font-semibold hover:text-primary transition-colors duration-300"
                style={{ color: primaryColor }}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
                <span
                  className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-[#0e2a66] to-[#122048] transition-all duration-300"
                  style={{ backgroundColor: primaryColor }}
                />
                <style>
                  {`
                    a:hover > span {
                      width: 100%;
                    }
                  `}
                </style>
              </Link>
            ))}

            {/* Conditionally render login/profile/logout */}
            {isLoggedIn || login ? (
              <>
                <Link
                  to="/profile"
                  className="relative text-gray-700 font-semibold hover:text-primary transition-colors duration-300"
                  style={{ color: primaryColor }}
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                  <span
                    className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-[#0e2a66] to-[#122048] transition-all duration-300"
                    style={{ backgroundColor: primaryColor }}
                  />
                </Link>
                <Link
                  to="/exam"
                  className="relative text-gray-700 font-semibold hover:text-primary transition-colors duration-300"
                  style={{ color: primaryColor }}
                  onClick={() => setIsOpen(false)}
                >
                  Exam
                  <span
                    className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-[#0e2a66] to-[#122048] transition-all duration-300"
                    style={{ backgroundColor: primaryColor }}
                  />
                </Link>
                <button
                  onClick={handleLogout}
                  className="relative text-gray-700 font-semibold hover:text-primary transition-colors duration-300 bg-transparent border-none cursor-pointer"
                  style={{ color: primaryColor }}
                >
                  Logout
                  <span
                    className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-[#0e2a66] to-[#122048] transition-all duration-300"
                    style={{ backgroundColor: primaryColor }}
                  />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="relative text-gray-700 font-semibold hover:text-primary transition-colors duration-300"
                style={{ color: primaryColor }}
                onClick={() => setIsOpen(false)}
              >
                Login
                <span
                  className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-[#0e2a66] to-[#122048] transition-all duration-300"
                  style={{ backgroundColor: primaryColor }}
                />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ color: primaryColor }}
            >
              {isOpen ? (
                <HiX className="w-8 h-8 transition-transform duration-300" />
              ) : (
                <HiMenu className="w-8 h-8 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-16 left-4 right-4 bg-white rounded-xl shadow-xl py-6 px-6 space-y-4 transition-transform duration-300 ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-10 opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: 999 }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.to}
            className="block text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gradient-to-r hover:from-[#0e2a66] hover:to-[#122048] hover:text-white transition-colors duration-300"
            onClick={() => setIsOpen(false)}
          >
            {link.name}
          </Link>
        ))}

        {!isLoggedIn ? (
          <Link
            to="/login"
            className="block text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gradient-to-r hover:from-[#0e2a66] hover:to-[#122048] hover:text-white transition-colors duration-300"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>
        ) : (
          <>
            <Link
              to="/profile"
              className="block text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gradient-to-r hover:from-[#0e2a66] hover:to-[#122048] hover:text-white transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full text-left text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gradient-to-r hover:from-[#0e2a66] hover:to-[#122048] hover:text-white transition-colors duration-300 bg-transparent border-none cursor-pointer"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
