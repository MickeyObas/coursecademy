import { Clipboard, ClipboardCheck, Play } from "lucide-react";

const Dashboard = () => {
  return (
    <main className="bg-slate-100 h-full p-4 flex flex-col gap-y-4">
      <div className="flex items-center bg-white p-4 rounded-lg">
        <div className="flex gap-x-4 items-center">
          <div className="bg-red-200 w-10 h-10 rounded-xl"></div>
          <div className="flex flex-col gap-y-1.5">
            <span>The name of the course</span>
            <div className="flex bg-blue-100 w-60 h-1.5 rounded-lg">
              <div className="h-full w-3/4 bg-blue-700"></div>
            </div>
          </div>
        </div>
        <div className="bg-slate-100 h-3/4 w-0.5 mx-15"></div>
        <div className="flex items-center w-full ">
          <div className="flex gap-x-3">
            <span className="flex items-center gap-1.5">
              <Clipboard color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clipboard color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clipboard color="gray" />
              <span>15</span>
            </span>
          </div>
          <div className="flex bg-slate-100 px-2 py-1.5 rounded-lg ms-auto gap-x-2">
            <Play color="blue"/>
            <span>Resume</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-white p-4 rounded-lg">
        <h2 className="text-xl font-bold">Status</h2>
        <div className="grid grid-cols-3 mt-5 gap-x-3">
          <div className="bg-orange-100 p-4 flex flex-col rounded-lg gap-y-1">
            <div className="flex mb-2.5">
              <div className="bg-orange-300 flex items-center justify-center w-10 h-10 rounded-full">
                <ClipboardCheck color="#f1f5f9"/>
              </div>
              <div></div>
            </div>
            <h3 className="font-bold text-xl">99</h3>
            <p>Lessons</p>
            <p className="text-blue-600">of 99 completed</p>
          </div>
          <div className="bg-red-100 p-4 flex flex-col rounded-lg gap-y-1">
            <div className="flex mb-2.5">
              <div className="bg-orange-300 flex items-center justify-center w-10 h-10 rounded-full">
                <ClipboardCheck color="#f1f5f9"/>
              </div>
              <div></div>
            </div>
            <h3 className="font-bold text-xl">99</h3>
            <p>Lessons</p>
            <p className="text-blue-600">of 99 completed</p>
          </div>
          <div className="bg-green-100 p-4 flex flex-col rounded-lg gap-y-1">
            <div className="flex mb-2.5">
              <div className="bg-orange-300 flex items-center justify-center w-10 h-10 rounded-full">
                <ClipboardCheck color="#f1f5f9"/>
              </div>
              <div></div>
            </div>
            <h3 className="font-bold text-xl">99</h3>
            <p>Lessons</p>
            <p className="text-blue-600">of 99 completed</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-white p-4 rounded-lg">
        <div className="flex justify-between w-full mb-4">
          <h2 className="text-xl font-bold">My Courses</h2>
          <div className="flex">
            <span className="bg-blue-100 px-3 py-1.5 rounded-lg text-sm">Active</span>
            <span className="px-3 py-1.5 rounded-lg text-sm">Completed</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-separate border-spacing-y-4 px-2">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="w-[10%] pb-2 border-b border-slate-300">#</th>
              <th className="w-[40%] pb-2 border-b border-slate-300">Course Name</th>
              <th className="w-[35%] pb-2 border-b border-slate-300">Completed</th>
              <th className="w-[15%] pb-2 border-b border-slate-300">Status</th>
            </tr>
          </thead>

          <tbody>
            {[1, 2, 3, 4, 5].map((_, i) => (
              <tr key={i} className="rounded-lg">
                <td className="py-3 px-2">
                  <div className="bg-red-200 w-10 h-10 rounded-xl"></div>
                </td>
                <td className="py-3 px-2">
                  <p className="truncate">Web Design and some other...</p>
                </td>
                <td className="py-3 px-2">
                  <div className="flex bg-blue-100 w-full h-1.5 rounded-lg">
                    <div className="h-full w-3/4 bg-blue-700 rounded-lg"></div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex gap-x-2">
                    <span className="flex items-center gap-1 text-sm">
                      <Clipboard size={18} color="gray" />
                      <span>15</span>
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <Clipboard size={18} color="gray" />
                      <span>15</span>
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <Clipboard size={18} color="gray" />
                      <span>15</span>
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        {/* <div className="grid grid-cols-[10%_1fr_1fr_0.5fr] mt-2">
          <span>#</span>
          <span>Course Name</span>
          <span>Completed</span>
          <span>Status</span>
        </div> */}
        {/* <div className="grid grid-cols-[10%_1fr_1fr_0.5fr] mt-5">
          <div className="bg-red-200 w-10 h-10 rounded-xl"></div>
          <div className="flex items-center">
            <p className="">Web Design and some other...</p>  
          </div>
          <div className="flex items-center">
            <div className="flex bg-blue-100 w-60 h-1.5 rounded-lg">
              <div className="h-full w-3/4 bg-blue-700"></div>
            </div>
          </div>
          <div className="flex gap-x-3">
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-[10%_1fr_1fr_0.5fr] mt-5">
          <div className="bg-red-200 w-10 h-10 rounded-xl"></div>
          <div className="flex items-center">
            <p className="">Web Design and some other...</p>  
          </div>
          <div className="flex items-center">
            <div className="flex bg-blue-100 w-60 h-1.5 rounded-lg">
              <div className="h-full w-3/4 bg-blue-700"></div>
            </div>
          </div>
          <div className="flex gap-x-3">
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-[10%_1fr_1fr_0.5fr] mt-5">
          <div className="bg-red-200 w-10 h-10 rounded-xl"></div>
          <div className="flex items-center">
            <p className="">Web Design and some other...</p>  
          </div>
          <div className="flex items-center">
            <div className="flex bg-blue-100 w-60 h-1.5 rounded-lg">
              <div className="h-full w-3/4 bg-blue-700"></div>
            </div>
          </div>
          <div className="flex gap-x-3">
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-[10%_1fr_1fr_0.5fr] mt-5">
          <div className="bg-red-200 w-10 h-10 rounded-xl"></div>
          <div className="flex items-center">
            <p className="">Web Design and some other...</p>  
          </div>
          <div className="flex items-center">
            <div className="flex bg-blue-100 w-60 h-1.5 rounded-lg">
              <div className="h-full w-3/4 bg-blue-700"></div>
            </div>
          </div>
          <div className="flex gap-x-3">
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-[10%_1fr_1fr_0.5fr] mt-5">
          <div className="bg-red-200 w-10 h-10 rounded-xl"></div>
          <div className="flex items-center">
            <p className="">Web Design and some other...</p>  
          </div>
          <div className="flex items-center">
            <div className="flex bg-blue-100 w-60 h-1.5 rounded-lg">
              <div className="h-full w-3/4 bg-blue-700"></div>
            </div>
          </div>
          <div className="flex gap-x-3">
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-[10%_1fr_1fr_0.5fr] mt-5">
          <div className="bg-red-200 w-10 h-10 rounded-xl"></div>
          <div className="flex items-center">
            <p className="">Web Design and some other...</p>  
          </div>
          <div className="flex items-center">
            <div className="flex bg-blue-100 w-60 h-1.5 rounded-lg">
              <div className="h-full w-3/4 bg-blue-700"></div>
            </div>
          </div>
          <div className="flex gap-x-3">
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-[10%_1fr_1fr_0.5fr] mt-5">
          <div className="bg-red-200 w-10 h-10 rounded-xl"></div>
          <div className="flex items-center">
            <p className="">Web Design and some other...</p>  
          </div>
          <div className="flex items-center">
            <div className="flex bg-blue-100 w-60 h-1.5 rounded-lg">
              <div className="h-full w-3/4 bg-blue-700"></div>
            </div>
          </div>
          <div className="flex gap-x-3">
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-[10%_1fr_1fr_0.5fr] mt-5">
          <div className="bg-red-200 w-10 h-10 rounded-xl"></div>
          <div className="flex items-center">
            <p className="">Web Design and some other...</p>  
          </div>
          <div className="flex items-center">
            <div className="flex bg-blue-100 w-60 h-1.5 rounded-lg">
              <div className="h-full w-3/4 bg-blue-700"></div>
            </div>
          </div>
          <div className="flex gap-x-3">
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
            <span className="flex items-center gap-1">
              <Clipboard size={18} color="gray" />
              <span>15</span>
            </span>
          </div>
        </div> */}
      </div>
    </main>
  )
}

export default Dashboard;