// src/components/UserProfile.tsx
import React, { useEffect, useState } from "react";

interface UserProfileData {
  name: string;
  email: string;
  country: string;
  dob: string; // ISO string date
}

interface ExamAttempt {
  _id: string;
  step: number;
  level: string;
  score: number;
  total: number;
  percentage: number;
  certification: string;
  date: string;
  certificateUrl?: string | null;
}

const primaryColor = "#0E2964";

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // For reset password
  const [showResetForm, setShowResetForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Exam attempts states
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [showExamReports, setShowExamReports] = useState(false);
  const [examsError, setExamsError] = useState<string | null>(null);

  const getInitials = (fullName: string) => {
    const names = fullName.split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[1][0]).toUpperCase();
  };

  useEffect(() => {
    const userid = localStorage.getItem("userid");
    if (!userid) {
      setError("User ID not found. Please login again.");
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
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
      } catch {
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // ✅ Call both at once
    fetchUserProfile();
    fetchExamAttempts();
  }, []);

  // fetch exam attempts for user
  const fetchExamAttempts = async () => {
    const userid = localStorage.getItem("userid");
    if (!userid) return;
    setExamsLoading(true);
    setExamsError(null);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(
        `http://localhost:5000/StudentsExam/user-exams/${userid}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.text();
        setExamsError("Failed to load exam attempts");
        setExamsLoading(false);
        console.error("Failed fetch exams:", err);
        return;
      }

      const data: ExamAttempt[] = await res.json();
      // normalize date strings
      const parsed = data.map((d) => ({
        ...d,
        date: new Date(d.date).toISOString(),
      }));
      setExamAttempts(parsed);
    } catch (err) {
      console.error(err);
      setExamsError("Server error while loading exams");
    } finally {
      setExamsLoading(false);
    }
  };

  const toggleExamReports = () => {
    if (!showExamReports && examAttempts.length === 0) {
      fetchExamAttempts();
    }
    setShowExamReports((prev) => !prev);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);

    if (newPassword !== confirmPassword) {
      setResetMessage("New passwords do not match.");
      return;
    }

    try {
      setResetLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(
        "http://localhost:5000/StudentsSection/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setResetMessage(data.error || "Failed to reset password");
      } else {
        setResetMessage("Password reset successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowResetForm(false);
      }
    } catch (err) {
      setResetMessage("Server error. Please try again later.");
    } finally {
      setResetLoading(false);
    }
  };

  // Derived stats from examAttempts
  const totalExams = examAttempts.length;
  const bestScore = examAttempts.length
    ? Math.max(...examAttempts.map((e) => e.percentage))
    : 0;
  const bestAttempt = examAttempts.find((e) => e.percentage === bestScore);
  // completedCourses: number of attempts with a "successful" certification (not Fail, not 'Remain', not No certification)
  const completedCourses = examAttempts.filter(
    (e) =>
      e.certification &&
      e.certification !== "Fail" &&
      !e.certification.startsWith("Remain") &&
      e.certification !== "No certification"
  ).length;
  // unique certifications
  const uniqueCerts = Array.from(
    new Set(examAttempts.map((e) => e.certification))
  );
  // member since: earliest exam date if exists
  const memberSince = examAttempts.length
    ? new Date(examAttempts[examAttempts.length - 1].date).getFullYear()
    : null;
  // latest certification (most recent exam)
  const latestCertification = examAttempts.length
    ? examAttempts[0].certification
    : "N/A";

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
        {/* Left Panel: unchanged */}
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

          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 tracking-wide drop-shadow-md">
            Profile Details
          </h2>

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

          {/* Reset Password Button */}
          <button
            onClick={() => setShowResetForm((prev) => !prev)}
            className="mt-6 bg-white text-sm sm:text-base text-primary font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-200 transition"
            style={{ color: primaryColor }}
          >
            {showResetForm ? "Cancel" : "Reset Password"}
          </button>

          {/* Reset Password Form */}
          {showResetForm && (
            <form
              onSubmit={handlePasswordReset}
              className="mt-4 bg-white p-4 rounded-lg shadow text-gray-800"
            >
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Old Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {resetMessage && (
                <p
                  className={`text-sm mb-2 ${
                    resetMessage.includes("success")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {resetMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                {resetLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>

        {/* Right Panel - dynamic */}
        <div className="md:w-1/2 p-6 sm:p-8 bg-gray-100 flex flex-col gap-6">
          <h2
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
            style={{ color: primaryColor }}
          >
            Achievements & Certifications
          </h2>
          {examsLoading ? (
            <div className="flex justify-center items-center py-8">
              <span className="text-gray-600 font-medium">
                Loading achievements...
              </span>
            </div>
          ) : (
            <>
              {/* Dynamic statistic cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
                  <div className="text-sm font-medium text-gray-600">
                    Total Exams
                  </div>
                  <div className="text-2xl font-bold">{totalExams}</div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
                  <div className="text-sm font-medium text-gray-600">
                    Best Score
                  </div>
                  <div className="text-2xl font-bold">
                    {bestScore ? `${bestScore.toFixed(2)}%` : "N/A"}
                    {bestAttempt ? (
                      <div className="text-xs text-gray-500">
                        ({`Step ${bestAttempt.step} ${bestAttempt.level}`})
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
                  <div className="text-sm font-medium text-gray-600">
                    Completed Courses
                  </div>
                  <div className="text-2xl font-bold">{completedCourses}</div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
                  <div className="text-sm font-medium text-gray-600">
                    Member Since
                  </div>
                  <div className="text-2xl font-bold">
                    {memberSince || new Date().getFullYear()}
                  </div>
                </div>
              </div>

              {/* Latest certification & unique cert list */}
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="font-semibold">Latest Certification</h3>
                <p className="text-gray-700">{latestCertification}</p>
                <hr className="my-3" />
                <h4 className="text-sm font-medium text-gray-600">
                  All Certifications
                </h4>
                <div className="flex gap-2 flex-wrap mt-2">
                  {uniqueCerts.length ? (
                    uniqueCerts.map((c) => (
                      <span
                        key={c}
                        className="text-xs px-2 py-1 bg-blue-50 rounded text-blue-700 border"
                      >
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">
                      No certifications yet
                    </span>
                  )}
                </div>
              </div>

              {/* Exam Participation Section with toggle + scroll */}
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Exam Participation</h3>
                  <button
                    onClick={toggleExamReports}
                    aria-label="toggle-exams"
                    className="text-2xl font-bold"
                    style={{ color: primaryColor }}
                  >
                    {showExamReports ? "−" : "+"}
                  </button>
                </div>

                <p className="text-gray-700 mb-3">
                  Total exams participated: <strong>{totalExams}</strong>
                </p>

                {showExamReports && (
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded p-2">
                    {examsLoading ? (
                      <p className="text-center text-gray-600">
                        Loading exams...
                      </p>
                    ) : examsError ? (
                      <p className="text-center text-red-500">{examsError}</p>
                    ) : examAttempts.length === 0 ? (
                      <p className="text-center text-gray-600">
                        No exam records found.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {examAttempts.map((exam) => (
                          <li key={exam._id} className="p-3 rounded border">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">
                                  Step {exam.step} — {exam.level}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {new Date(exam.date).toLocaleString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">
                                  {exam.percentage.toFixed(2)}%
                                </div>
                                <div className="text-sm text-gray-600">
                                  {exam.score}/{exam.total}
                                </div>
                              </div>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-sm text-gray-700">
                                Certification:{" "}
                                <strong>{exam.certification}</strong>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
