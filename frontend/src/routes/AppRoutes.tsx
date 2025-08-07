import { Routes, Route, Navigate } from "react-router-dom";
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyEmail from '../pages/VerifyEmail';
import EnterCode from '../pages/EnterCode';
import { PrivateRoutes } from "../components/PrivateRoutes";
import Dashboard from "../pages/Dashboard";
import DashboardLayout from "../components/layouts/DashboardLayout";
import Courses from "../pages/Courses";
import Tests from "../pages/Tests";
import Certifications from "../pages/Certifications";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import TestDetails from "../pages/TestDetails";
import TakeTest from "../pages/TakeTest";
import CourseDetail from "../pages/CourseDetail";
import CoursePlayer from "../pages/CoursePlayer";
import { CoursePlayerLayout } from "../components/layouts/CoursePlayerLayout";


const AppRoutes = () => {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<VerifyEmail />} />
      <Route path="/complete-registration" element={<Register />} />
      <Route path="/enter-code" element={<EnterCode />} />
      
      {/* Private Routes */}
      <Route element={<PrivateRoutes />}>

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="tests" element={<Tests />} />
          <Route path="tests/:categoryId" element={<TestDetails />} />
          <Route path="take-test/:sessionId" element={<TakeTest />} />
          <Route path="certifications" element={<Certifications />} />
          <Route path="courses/:courseSlug/" element={<CourseDetail />} />
        </Route>

        <Route path="/course-player/:courseSlug/" element={<CoursePlayerLayout />}>
          <Route index element={<CoursePlayer />} />
        </Route>

      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  )
}

export default AppRoutes;