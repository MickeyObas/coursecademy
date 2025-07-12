import { useLocation } from "react-router-dom";
import { Outlet, Navigate } from "react-router-dom";


export function PrivateRoutes(){
    const isAuthenticated = !!localStorage.getItem('accessToken');
    const location = useLocation();
    
    return (
        isAuthenticated ?
        <Outlet /> :
        <Navigate to='/login' state={{ from: location }} replace />
    )
}
