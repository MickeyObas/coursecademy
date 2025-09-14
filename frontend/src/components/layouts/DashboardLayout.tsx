import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header"
import Sidebar from "./Sidebar"
import { useEffect, useRef, useState } from "react";


const DashboardLayout = () => {
  const { pathname } = useLocation();
  const mainRef = useRef<null | HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if(mainRef.current){
      mainRef.current.scrollTo({top: 0, left: 0, behavior: "instant"})
    }
  }, [pathname])
  
  return (
  <div className="flex flex-col min-h-screen">
    <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar (hidden on small, fixed on desktop) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main
        ref={mainRef}
        className="flex-1 mt-[74px] h-[calc(100vh-74px)] overflow-y-scroll bg-slate-100"
      >
        <Outlet />
      </main>
    </div>
  </div>
);

};

export default DashboardLayout;