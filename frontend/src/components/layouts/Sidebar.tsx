import { Settings } from "lucide-react";


const Sidebar = () => {
  return (
    <div className="max-w-[270px] border-r bg-white border-slate-200 h-[calc(100vh-73px)] flex flex-col">
      <div className="flex flex-col py-7 px-5 gap-y-5">
        <div className="flex items-center gap-x-2 bg-red-200 px-4 py-3 rounded-lg">
          <Settings />
          <span>Dashboard</span>
        </div>
        <div className="flex items-center gap-x-2 bg-red-200 px-4 py-3 rounded-lg">
          <Settings />
          <span>Dashboard</span>
        </div>
        <div className="flex items-center gap-x-2 bg-red-200 px-4 py-3 rounded-lg">
          <Settings />
          <span>Dashboard</span>
        </div>
        <div className="flex items-center gap-x-2 bg-red-200 px-4 py-3 rounded-lg">
          <Settings />
          <span>Dashboard</span>
        </div>
        <div className="flex items-center gap-x-2 bg-red-200 px-4 py-3 rounded-lg">
          <Settings />
          <span>Dashboard</span>
        </div>
      </div>
      <div className="flex flex-col pt-10 pb-12 px-5 gap-y-5 mt-auto border-t border-t-slate-200">
        <div className="flex items-center gap-x-2 bg-red-200 px-4 py-3 rounded-lg">
          <Settings />
          <span>Dashboard</span>
        </div>
        <div className="flex items-center gap-x-2 bg-red-200 px-4 py-3 rounded-lg">
          <Settings />
          <span>Dashboard</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar;