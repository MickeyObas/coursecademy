import { BellIcon, ChevronDown, MessageCircleIcon, Search, User } from "lucide-react";


const Header = () => {
  return (
      <header className="fixed flex w-full bg-white p-4 border-b border-b-slate-300">
        <div className="container mx-auto flex w-full items-center justify-between">
          <h1 className="font-bold text-2xl">Coursecademy.</h1>
          <div className="bg-slate-100 flex items-center gap-x-1.5 py-2 px-4 rounded-xl w-1/3">
            <Search />
            <input type="text" name="" id="" placeholder="Search here..." className="border-0 outline-0"/>
          </div>
          <div className="flex gap-x-2">
            <div className="bg-slate-100 h-8 w-8 rounded-full flex items-center justify-center">
            <MessageCircleIcon size={18}/>
            </div>
            <div className="bg-slate-100 h-8 w-8 rounded-full flex items-center justify-center">
              <BellIcon size={18}/>
            </div>
            <div className="flex items-center gap-x-1.5">
              <div className="bg-slate-100 h-8 w-8 rounded-full flex items-center justify-center">
                <User />
              </div>
              <span>MickeyCodess</span>
              <ChevronDown size={16}/>
            </div>
          </div>
        </div>
      </header>
  )
}

export default Header;