import { useLocation } from "react-router-dom";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";


export function PrivateRoutes({ allowedRoles }){
    const { user } = useAuth();
    const location = useLocation();

    if(!user){
      return <Navigate to='/login' state={{ from: location }} replace />
    }
    
    if (allowedRoles && !allowedRoles.includes(user.account_type)) {
      return user.account_type === "I"
      ? <Navigate to="/idashboard" replace />
      : <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}
