import { BellIcon, ChevronDown, Menu, MessageCircleIcon, Search, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 flex w-full bg-white p-4  border-b border-slate-300 z-20">
      <div className="container mx-auto flex w-full items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-x-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="sm:hidden p-2 rounded-md hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
          <h1 className="font-bold text-lg sm:text-2xl">Coursecademy.</h1>
        </div>

        {/* Search bar (hidden on mobile) */}
        <div className="hidden sm:flex bg-slate-100 items-center gap-x-1.5 py-2 px-4 rounded-xl w-1/3">
          <Search />
          <input
            type="text"
            placeholder="Search here..."
            className="flex-1 bg-transparent border-0 outline-0 text-sm sm:text-base"
          />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-x-2">
          <div className="bg-slate-100 h-8 w-8 rounded-full flex items-center justify-center">
            <MessageCircleIcon size={16} />
          </div>
          <div className="bg-slate-100 h-8 w-8 rounded-full flex items-center justify-center">
            <BellIcon size={16} />
          </div>
          <div className="hidden sm:flex items-center gap-x-1.5">
            <div className="bg-slate-100 h-8 w-8 rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
            <span className="text-sm">{user?.full_name.split(" ")[0]}</span>
            <ChevronDown size={14} />
          </div>
        </div>
      </div>
    </header>
);

}

export default Header;