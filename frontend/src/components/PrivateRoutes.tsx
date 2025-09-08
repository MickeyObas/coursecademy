import { useLocation } from "react-router-dom";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { Role } from "../types/User";


export function PrivateRoutes({ allowedRoles }: {allowedRoles: Role[]}){
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
