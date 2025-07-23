import { Outlet } from "react-router-dom";
import Header from "./Header"
import Sidebar from "./Sidebar"


const DashboardLayout = () => {
  return (
    <div>
      <Header />
      <div className="grid grid-cols-[270px_1fr]">
        <Sidebar />
        <main>
          <Outlet />
        </main>
      </div>
      
    </div>
  )
};

export default DashboardLayout;