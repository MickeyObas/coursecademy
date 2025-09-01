import { Book, LayoutDashboardIcon, LogOut, Pencil, Scroll, Settings, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../utils/axios";


const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-x-2 px-4 py-3 rounded-lg ${
    isActive ? "bg-slate-100 font-medium" : "hover:bg-slate-50"
  }`;

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const response = await api.post(`/api/auth/logout/`);
    localStorage.removeItem('accessToken');
    const { data } = response;
    console.log(data);
    navigate('/login/'); 
  }


  return (
    <div className="max-w-[270px] border-r bg-white border-slate-200 mt-18 h-[calc(100vh-73px)] flex flex-col select-none">
      <div className="flex flex-col py-7 px-5 gap-y-5">
          <NavLink to='/dashboard' end className={linkClasses}>
            <LayoutDashboardIcon />
            <span>Dashboard</span>
          </NavLink>
        <NavLink to='/dashboard/courses' className={linkClasses}>
          <Book />
          <span>Courses</span>
        </NavLink>
        <NavLink to='/dashboard/tests' className={linkClasses}>
          <Pencil />
          <span>Tests</span>
        </NavLink>
        <NavLink to='/dashboard/certifications' className={linkClasses}>
          <Scroll />
          <span>Certifications</span>
        </NavLink>
        <NavLink to='/dashboard/profile' className={linkClasses}>
          <User />
          <span>Profile</span>
        </NavLink>
      </div>
      <div className="flex flex-col pt-10 pb-12 px-5 gap-y-5 mt-auto border-t border-t-slate-200">
        <NavLink to='/settings' className={linkClasses}>
          <Settings />
          <span>Settings</span>
        </NavLink>
        <div 
          onClick={handleLogout}
          className="flex items-center gap-x-2 px-4 py-3 rounded-lg hover:bg-slate-50 cursor-pointer">
          <LogOut />
          <span>Logout</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar;