import { Book, LayoutDashboardIcon, LogOut, Pencil, Scroll, Settings, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../utils/axios";


const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-x-2 px-4 py-3 rounded-lg ${
    isActive ? "bg-slate-100 font-medium" : "hover:bg-slate-50"
  }`;

type SidebarProps = {
  isOpen: boolean,
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const response = await api.post(`/api/auth/logout/`);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    const { data } = response;
    console.log(data);
    navigate('/login/'); 
  }


  return (
  <>
    {/* Mobile overlay */}
    <div
      className={`fixed inset-0 bg-black opacity-30 z-10 sm:hidden ${
        isOpen ? "block" : "hidden"
      }`}
      onClick={onClose}
    ></div>

    {/* Sidebar itself */}
    <div
      className={`overflow-y-auto
        fixed top-[70px] sm:static sm:top-[74px] sm:mt-[74px] left-0 
        w-[240px] sm:w-[270px] h-[calc(100dvh-70px)] sm:h-[calc(100dvh-74px)]
        bg-white border-r border-slate-200
        flex flex-col select-none
        z-20 transform transition-transform duration-200
        ${isOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
      `}
    >
      {/* Nav links */}
      <div className="flex flex-col py-7 px-5 gap-y-5">
        <NavLink onClick={() => onClose()} to="/dashboard/" end className={linkClasses}>
          <LayoutDashboardIcon />
          <span>Dashboard</span>
        </NavLink>
        <NavLink onClick={() => onClose()} to="/dashboard/courses" className={linkClasses}>
          <Book />
          <span>Courses</span>
        </NavLink>
        <NavLink onClick={() => onClose()} to="/dashboard/tests" className={linkClasses}>
          <Pencil />
          <span>Tests</span>
        </NavLink>
        <NavLink onClick={() => onClose()} to="/dashboard/certifications" className={linkClasses}>
          <Scroll />
          <span>Certifications</span>
        </NavLink>
        <NavLink onClick={() => onClose()} to="/dashboard/profile" className={linkClasses}>
          <User />
          <span>Profile</span>
        </NavLink>
      </div>

      {/* Bottom links */}
      <div className="flex flex-col pt-10 pb-12 px-5 gap-y-5 mt-auto border-t border-t-slate-200">
        <NavLink onClick={() => onClose()} to="/dashboard/settings" className={linkClasses}>
          <Settings />
          <span>Settings</span>
        </NavLink>
        <div
          onClick={handleLogout}
          className="flex items-center gap-x-2 px-4 py-3 rounded-lg hover:bg-slate-50 cursor-pointer"
        >
          <LogOut />
          <span>Logout</span>
        </div>
      </div>
    </div>
  </>
);

}

export default Sidebar;