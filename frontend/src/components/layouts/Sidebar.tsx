import { Book, LayoutDashboardIcon, LogOut, Pencil, Scroll, Settings, User } from "lucide-react";
import { NavLink } from "react-router-dom";


const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-x-2 px-4 py-3 rounded-lg ${
    isActive ? "bg-slate-100 font-medium" : "hover:bg-slate-50"
  }`;

const Sidebar = () => {
  return (
    <div className="max-w-[270px] border-r bg-white border-slate-200 h-[calc(100vh-73px)] flex flex-col select-none">
      <div className="flex flex-col py-7 px-5 gap-y-5">
          <NavLink to='/' className={linkClasses}>
            <LayoutDashboardIcon />
            <span>Dashboard</span>
          </NavLink>
        <NavLink to='/courses' className={linkClasses}>
          <Book />
          <span>Courses</span>
        </NavLink>
        <NavLink to='/tests' className={linkClasses}>
          <Pencil />
          <span>Tests</span>
        </NavLink>
        <NavLink to='/certifications' className={linkClasses}>
          <Scroll />
          <span>Certifications</span>
        </NavLink>
        <NavLink to='/profile' className={linkClasses}>
          <User />
          <span>Profile</span>
        </NavLink>
      </div>
      <div className="flex flex-col pt-10 pb-12 px-5 gap-y-5 mt-auto border-t border-t-slate-200">
        <NavLink to='/settings' className={linkClasses}>
          <Settings />
          <span>Settings</span>
        </NavLink>
        <div className="flex items-center gap-x-2 px-4 py-3 rounded-lg hover:bg-slate-50 cursor-pointer">
          <LogOut />
          <span>Logout</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar;