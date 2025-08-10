import React, { useEffect, useState } from "react";

interface UserProfileData {
  name: string;
  email: string;
  country: string;
  dob: string; // ISO string date
  // Add more fields if needed
}

const primaryColor = "#0E2964";

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get initials (first letter of first two words)
  const getInitials = (fullName: string) => {
    const names = fullName.split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[1][0]).toUpperCase();
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userid = localStorage.getItem("userid");
      if (!userid) {
        setError("User ID not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(
          `http://localhost:5000/StudentsProfile/user/${userid}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          }
        );

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to fetch user data");
          setLoading(false);
          return;
        }

        const data: UserProfileData = await res.json();
        setUser(data);
        setLoading(false);
      } catch (err) {
        setError("Server error. Please try again later.");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-xl font-semibold text-gray-600">
        Loading profile...
      </div>
    );
  if (error)
    return (
      <div className="text-red-600 text-center mt-10 font-semibold text-lg px-4">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-20 py-12 mt-20">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left Panel */}
        <div
          className="md:w-1/2 p-8 sm:p-10 flex flex-col justify-center text-white relative"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Avatar */}
          <div className="flex items-center mb-8">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white flex items-center justify-center text-4xl sm:text-5xl font-extrabold text-primary"
              style={{ color: primaryColor }}
            >
              {user ? getInitials(user.name) : ""}
            </div>
            <div className="ml-5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-wide leading-tight drop-shadow-md">
                {user?.name}
              </h1>
              <p className="text-sm sm:text-base opacity-80">{user?.email}</p>
            </div>
          </div>

          {/* Profile Details Title */}
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 tracking-wide drop-shadow-md">
            Profile Details
          </h2>

          {/* User Details Table - no visible borders */}
          <table
            className="w-full text-white text-base sm:text-lg"
            style={{ borderCollapse: "separate", borderSpacing: "0 1rem" }}
          >
            <tbody>
              <tr>
                <td className="font-semibold py-2 pr-6 align-top">Name:</td>
                <td className="py-2">{user?.name}</td>
              </tr>
              <tr>
                <td className="font-semibold py-2 pr-6 align-top">Email:</td>
                <td className="py-2">{user?.email}</td>
              </tr>
              <tr>
                <td className="font-semibold py-2 pr-6 align-top">Country:</td>
                <td className="py-2">{user?.country}</td>
              </tr>
              <tr>
                <td className="font-semibold py-2 pr-6 align-top">
                  Date of Birth:
                </td>
                <td className="py-2">
                  {new Date(user!.dob).toLocaleDateString()}
                </td>
              </tr>
              <tr>
                <td className="font-semibold py-2 pr-6 align-top">User ID:</td>
                <td className="py-2">{localStorage.getItem("userid")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Panel - Achievements Cards */}
        <div className="md:w-1/2 p-6 sm:p-8 bg-gray-100 flex flex-col gap-6">
          <h2
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6"
            style={{ color: primaryColor }}
          >
            Achievements & Certifications
          </h2>

          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6 hover:shadow-xl transition-shadow cursor-default">
            <h3 className="text-lg sm:text-xl font-semibold mb-1">
              Certification
            </h3>
            <p className="text-gray-700 text-sm sm:text-base">
              React Professional
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6 hover:shadow-xl transition-shadow cursor-default">
            <h3 className="text-lg sm:text-xl font-semibold mb-1">
              Best Score
            </h3>
            <p className="text-gray-700 text-sm sm:text-base">98%</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6 hover:shadow-xl transition-shadow cursor-default">
            <h3 className="text-lg sm:text-xl font-semibold mb-1">
              Completed Courses
            </h3>
            <p className="text-gray-700 text-sm sm:text-base">12</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6 hover:shadow-xl transition-shadow cursor-default">
            <h3 className="text-lg sm:text-xl font-semibold mb-1">
              Member Since
            </h3>
            <p className="text-gray-700 text-sm sm:text-base">2023</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
