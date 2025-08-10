import { ReactNode, useEffect, useState } from "react";
import {
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
  <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
    <div className="text-3xl text-[#3E7CF5]">{icon}</div>
    <div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-gray-500">{title}</div>
    </div>
  </div>
);

// Tab Components
const Dashboard: React.FC = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card title="Total Users" value="350" icon={<FaUser />} />
      <Card title="Team Members" value="40" icon={<FaUsers />} />
      <Card title="Proposals" value="120" icon={<FaChartBar />} />
      <Card title="Visits" value="800" icon={<FaChartBar />} />
    </div>
  </div>
);

// const QuestionSetup: React.FC = () => (
//   <div className="p-4">Question Setup Component</div>
// );

const TeamMembers: React.FC = () => (
  <div className="p-4">Team Members Component</div>
);

const Reports: React.FC = () => <div className="p-4">Reports Component</div>;

const MySwal = withReactContent(Swal);

const AdminHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const navigate = useNavigate(); // for redirection
  useEffect(() => {
    MySwal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Welcome to Admin Dashboard",
      showConfirmButton: false,
      timer: 2000,
    });
  }, []);

  const menuItems: MenuItem[] = [
    { name: "Dashboard", icon: <FaHome /> },
    { name: "Question Setup", icon: <FaTable /> },
    { name: "Team Members", icon: <FaUsers /> },
    { name: "Reports", icon: <FaChartBar /> },
  ];

  const logout = () => {
    localStorage.clear();
    navigate("/");
    MySwal.fire("Logged Out", "You have been logged out", "success");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#3E7CF5] text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-blue-300">
          Admin Panel
        </div>
        <nav className="flex flex-col gap-2 p-4 text-base flex-grow">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
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

      {/* Main content */}
      <div className="flex-1 p-6">
        {activeTab === "Dashboard" && <Dashboard />}
        {activeTab === "Question Setup" && <QuestionSetup />}
        {activeTab === "Team Members" && <TeamMembers />}
        {activeTab === "Reports" && <Reports />}
      </div>
    </div>
  );
};

export default AdminHome;
