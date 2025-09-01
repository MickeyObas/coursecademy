import { Outlet } from "react-router-dom";
import Header from "./Header"
import Sidebar from "./Sidebar"


const DashboardLayout = () => {
  return (
    <div>
      <Header />
      <div className="grid grid-cols-[270px_1fr] h-screen overflow-hidden">
        <Sidebar />
        <main className="mt-18 h-[calc(100vh-74px)] overflow-y-scroll bg-slate-100">
          <Outlet />
        </main>
      </div>
      
    </div>
  )
};

export default DashboardLayout;