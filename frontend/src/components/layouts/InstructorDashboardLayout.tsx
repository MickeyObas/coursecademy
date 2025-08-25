import { ReactNode, useState } from "react";
import { Outlet } from "react-router-dom";

interface Props {
  children: ReactNode;
}

export default function InstructorDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } bg-white shadow-md transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 font-bold text-lg border-b">📚 CBT Platform</div>
        <nav className="flex-1 p-2 space-y-2">
          <a
            href="/idashboard/courses"
            className="block p-2 rounded hover:bg-gray-200"
          >
            Manage Courses
          </a>
          {/* <a
            href="/idashboard/create-course"
            className="block p-2 rounded hover:bg-gray-200"
          >
            Create Course
          </a> */}
          <a
            href="/idashboard/module-lesson-builder"
            className="block p-2 rounded hover:bg-gray-200"
          >
            Manage Module/Lessons
          </a>
          <a
            href="/idashboard/assessment-builder"
            className="block p-2 rounded hover:bg-gray-200"
          >
            Manage Assessments
          </a>
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
