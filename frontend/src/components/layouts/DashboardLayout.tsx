import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header"
import Sidebar from "./Sidebar"
import { useEffect, useRef } from "react";


const DashboardLayout = () => {
  const { pathname } = useLocation();
  const mainRef = useRef<null | HTMLElement>(null);

  useEffect(() => {
    if(mainRef.current){
      mainRef.current.scrollTo({top: 0, left: 0, behavior: "instant"})
    }
  }, [pathname])
  
  return (
    <div>
      <Header />
      <div className="grid grid-cols-[270px_1fr] h-screen overflow-hidden">
        <Sidebar />
        <main ref={mainRef} className="mt-18 h-[calc(100vh-74px)] overflow-y-scroll bg-slate-100">
          <Outlet />
        </main>
      </div>
      
    </div>
  )
};

export default DashboardLayout;