import { ReactNode, useEffect, useState } from "react";
import {
  FaBars,
  FaChartBar,
  FaHome,
  FaSignOutAlt,
  FaTable,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import QuestionSetup from "./QuestionSetup";
import Reports from "./Reports";
import VisitorAnalysis from "./VisitorAnalysis";
interface CardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

interface MenuItem {
  name: string;
  icon: ReactNode;
}

// Card Component
const Card: React.FC<CardProps> = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4 w-full">
    <div className="text-3xl text-[#3E7CF5]">{icon}</div>
    <div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-gray-500">{title}</div>
    </div>
  </div>
);

// Tab Components

const MySwal = withReactContent(Swal);

const AdminHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalVisit, setTotalVisit] = useState<number | null>(null);
  const [topCountry, setTopCountry] = useState<string | null>(null);
  const [topCountryCount, setTopCountryCount] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const Dashboard: React.FC = () => (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          title="Total Students"
          value={totalUsers !== null ? totalUsers : "Loading..."}
          icon={<FaUser />}
        />
        <Card
          title="Visits"
          value={totalVisit !== null ? totalVisit : "Loading..."}
          icon={<FaChartBar />}
        />

        <Card
          title="Top Visitor Country"
          value={
            topCountry !== null
              ? `${topCountry} (${topCountryCount})`
              : "Loading..."
          }
          icon={<FaUsers />}
        />
      </div>
    </div>
  );

  useEffect(() => {
    MySwal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Welcome to Admin Dashboard",
      showConfirmButton: false,
      timer: 2000,
    });

    fetch("https://mcq-back.onrender.com/SingUpAdmin/count")
      .then((res) => res.json())
      .then((data) => setTotalUsers(data.totalUsers))
      .catch((err) => console.error("Failed to fetch user count:", err));

    fetch("https://mcq-back.onrender.com/SingUpAdmin/visits")
      .then((res) => res.json())
      .then((data) => {
        setTotalVisit(data.length);

        const countryCount = data.reduce((acc, { country = "Unknown" }) => {
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const [maxCountry, maxCount] = Object.entries(countryCount).reduce(
          (maxEntry, currentEntry) =>
            currentEntry[1] > maxEntry[1] ? currentEntry : maxEntry,
          ["", 0]
        );

        setTopCountry(maxCountry);
        setTopCountryCount(maxCount);
      })
      .catch((err) => console.error("Failed to fetch visits:", err));
  }, []);

  const menuItems: MenuItem[] = [
    { name: "Dashboard", icon: <FaHome /> },
    { name: "Question Setup", icon: <FaTable /> },
    { name: "Visitors Analysis", icon: <FaUsers /> },
    { name: "Reports", icon: <FaChartBar /> },
  ];

  const logout = () => {
    localStorage.clear();
    navigate("/");
    MySwal.fire("Logged Out", "You have been logged out", "success");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-100">
      {/* Top Navbar (Mobile) */}
      <div className="lg:hidden bg-[#0E2A66] text-white flex justify-between items-center px-4 py-3 shadow">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-2xl focus:outline-none"
        >
          <FaBars />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`bg-[#0E2A66] text-white w-64 flex flex-col fixed lg:static top-0 left-0 min-h-screen transform lg:translate-x-0 transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden lg:block p-6 text-2xl font-bold border-b border-blue-300">
          Admin Panel
        </div>
        <nav className="flex flex-col gap-2 p-4 text-base flex-grow">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded text-left transition ${
                activeTab === item.name ? "bg-blue-700" : "hover:bg-blue-600"
              }`}
            >
              {item.icon} {item.name}
            </button>
          ))}
          <button
            onClick={logout}
            className="flex items-center gap-2 hover:bg-blue-600 px-3 py-2 rounded mt-auto"
          >
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 mt-4 lg:mt-0 lg:ml-0">
        {activeTab === "Dashboard" && <Dashboard />}
        {activeTab === "Question Setup" && <QuestionSetup />}
        {activeTab === "Visitors Analysis" && <VisitorAnalysis />}
        {activeTab === "Reports" && <Reports />}
      </main>
    </div>
  );
};

export default AdminHome;
