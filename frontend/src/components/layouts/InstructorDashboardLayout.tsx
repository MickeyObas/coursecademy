import { Book, ClipboardList, Layers, LogOut } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { useAuth } from "../../contexts/AuthContext";


export default function InstructorDashboardLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    const response = await api.post(`/api/auth/logout/`);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    const { data } = response;
    console.log(data);
    navigate('/login/'); 
  }

  return (
  <div className="flex h-screen bg-gray-100">
    {/* Sidebar (desktop & mobile overlay) */}
    <div
      className={`fixed inset-y-0 left-0 z-40 transform bg-white shadow-md transition-transform duration-300 
        lg:static lg:translate-x-0 flex flex-col
        ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 lg:w-16"}
      `}
    >
      {/* Logo / Title */}
      <div className="px-4 py-3.5 font-bold text-lg border-b whitespace-nowrap overflow-hidden">
        🫠
        <span
          className={`ml-2 inline-block transition-all duration-300 ${
            isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
          }`}
        >
          Coursecademy
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-2 space-y-2">
        <NavLink
          to="/idashboard/courses"
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-200"
        >
          <Book className="shrink-0" />
          <span
            className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
              isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
          >
            Manage Courses
          </span>
        </NavLink>

        <NavLink
          to="/idashboard/module-lesson-builder"
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-200"
        >
          <Layers className="shrink-0" />
          <span
            className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
              isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
          >
            Manage Modules/Lessons
          </span>
        </NavLink>

        <NavLink
          to="/idashboard/assessment-builder"
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-200"
        >
          <ClipboardList className="shrink-0" />
          <span
            className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
              isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
          >
            Manage Assessments
          </span>
        </NavLink>

        {/* Logout */}
        <div
          onClick={handleLogout}
          className="cursor-pointer flex items-center gap-2 p-2 rounded hover:bg-gray-200"
        >
          <LogOut className="shrink-0" color="red" transform="rotate(180)" />
          <span
            className={`text-red-500 transition-all duration-300 whitespace-nowrap overflow-hidden ${
              isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
          >
            Logout
          </span>
        </div>
      </nav>

      {/* Toggle Button (Desktop only) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="hidden lg:block p-2 bg-gray-200 hover:bg-gray-300"
      >
        {isSidebarOpen ? "⏪" : "⏩"}
      </button>
    </div>

    {/* Overlay for mobile */}
    {isSidebarOpen && (
      <div
        onClick={() => setIsSidebarOpen(false)}
        className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
      />
    )}

    {/* Main Section */}
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white shadow flex items-center justify-between px-4">
        <h1 className="text-lg font-semibold">Instructor Dashboard</h1>
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            className="lg:hidden p-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>
          <span className="font-medium hidden sm:inline">Hi, {user?.full_name.split(" ")[0]}</span>
          <img
            src={`https://ui-avatars.com/api/?name=${user?.full_name.split(" ")[0]}`}
            alt="avatar"
            className="w-8 h-8 rounded-full"
          />
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

}
