import { Routes, Route } from "react-router-dom";
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
        <Route path="/" element={<DashboardLayout />}>
          <Route index path="" element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:courseSlug/" element={<CourseDetail />} />
          <Route path="tests" element={<Tests />} />
          <Route path="tests/:categoryId" element={<TestDetails />} />
          <Route path="take-test/:sessionId" element={<TakeTest />} />
          <Route path="certifications" element={<Certifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

    </Routes>
  )
}

export default AppRoutes;