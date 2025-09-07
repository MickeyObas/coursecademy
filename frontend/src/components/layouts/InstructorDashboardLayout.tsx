import { Book, ClipboardList, Layers, LogOut } from "lucide-react";
import { ReactNode, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import api from "../../utils/axios";

interface Props {
  children: ReactNode;
}

export default function InstructorDashboardLayout() {
  const navigate = useNavigate();
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
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } bg-white shadow-md transition-all duration-300 flex flex-col`}
      >
        <div className="px-4 py-3.5 font-bold text-lg border-b whitespace-nowrap overflow-hidden">
          📚 
          <span
            className={`ml-2 inline-block transition-all duration-300 ${
              isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
          >
            CBT Platform
          </span>
        </div>

        <nav className="flex-1 p-2 space-y-2">
          <NavLink 
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-200" to='/idashboard/courses'>
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
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-200" to='/idashboard/module-lesson-builder'>
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
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-200" to='/idashboard/assessment-builder'>
              <ClipboardList className="shrink-0" />
              <span
                className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                  isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                }`}
              >
                Manage Assessments
              </span>
            </NavLink>
          <div
            onClick={handleLogout} 
            className="cursor-pointer flex items-center gap-2 p-2 rounded hover:bg-gray-200">
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

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-gray-200 hover:bg-gray-300"
        >
          {isSidebarOpen ? "⏪" : "⏩"}
        </button>
      </div>


      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 bg-white shadow flex items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Instructor Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="font-medium">Hi, Instructor</span>
            <img
              src="https://ui-avatars.com/api/?name=Instructor"
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
