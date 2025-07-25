import { Routes, Route } from "react-router-dom";
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyEmail from '../pages/VerifyEmail';
import EnterCode from '../pages/EnterCode';
import { PrivateRoutes } from "../components/PrivateRoutes";
import Dashboard from "../pages/Dashboard";
import DashboardLayout from "../components/layouts/DashboardLayout";


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
        </Route>
      </Route>

    </Routes>
  )
}

export default AppRoutes;