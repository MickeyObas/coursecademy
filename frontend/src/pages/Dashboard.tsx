import { Clipboard, ClipboardCheck, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useEnrolledCourses } from "../hooks/useEnrolledCourses";
import api from "../utils/axios";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from "react-router-dom";


const Dashboard = () => {
  const navigate = useNavigate();
  const { enrolledCourses } = useEnrolledCourses();
  const [courseProgressSummary, setCourseProgressSummary] = useState(null);
  const [lastAccessedCourse, setLastAccessedCourse] = useState(null);

  useEffect(() => {
    const fetchCourseProgressSummary = async () => {
      try {
        const response = await api.get('/api/courses/progress/summary/');
        const data = response.data;
        setCourseProgressSummary(data);
      }catch (err: any){
        if(err.response){
          console.error(err.response);
        }else{
          console.error(err);
        }
      }
    };
    fetchCourseProgressSummary();
  }, [])

  useEffect(() => {
    const fetchLastAccessedCourse = async () => {
      try {
        const response = await api.get('/api/courses/last-accessed/');
        const data = response.data;
        setLastAccessedCourse(data);
      }catch(err){
        console.error(err);
      }
    };
    fetchLastAccessedCourse();
  }, [])


  return (
    <main className="bg-slate-100 h-full p-4 flex flex-col gap-y-4">
      <div className="flex items-center bg-white p-4 rounded-lg">
        <div className="flex gap-x-4 items-center">
          <div className="bg-red-200 w-10 h-10 rounded-xl"></div>
          <div className="flex flex-col gap-y-1.5">
            <span>{lastAccessedCourse?.course.title}</span>
            <div className="flex bg-blue-100 w-60 h-1.5 rounded-lg">
              <div
                className="h-full bg-blue-700"
                style={{ width: `${lastAccessedCourse?.progress.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="bg-slate-100 h-3/4 w-0.5 mx-15"></div>
        <div className="flex items-center w-full ">
          <div className="flex gap-x-3">
            <span className="flex items-center gap-1.5">
              <Clipboard color="gray" />
              <span>{lastAccessedCourse?.progress.module}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clipboard color="gray" />
              <span>{lastAccessedCourse?.progress.lesson}</span>
            </span>
            {/* <span className="flex items-center gap-1.5">
              <Clipboard color="gray" />
              <span>15</span>
            </span> */}
          </div>
          <div
            onClick={() => navigate(`/course-player/${lastAccessedCourse?.course.slug}/`)} 
            className="flex bg-slate-100 px-2 py-1.5 rounded-lg ms-auto gap-x-2">
            <Play color="blue"/>
            <span>Resume</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-white p-4 rounded-lg">
        <h2 className="text-xl font-bold">Status</h2>
        <div className="grid grid-cols-3 mt-5 gap-x-3">
          <div className="bg-orange-100 p-4 flex flex-col rounded-lg gap-y-1">
            <div className="flex mb-2.5 justify-between items-center">
              <div className="bg-orange-300 flex items-center justify-center w-10 h-10 rounded-full">
                <ClipboardCheck color="#f1f5f9"/>
              </div>
              <div>
                <CircularProgressbar
                  value={(courseProgressSummary?.lessons.completed / courseProgressSummary?.lessons.total) * 100}
                  text={`${(courseProgressSummary?.lessons.completed / courseProgressSummary?.lessons.total) * 100}%`}
                  strokeWidth={18}
                  className='h-14'
                  styles={buildStyles({
                    textColor: 'black',
                    pathColor: 'oklch(83.7% 0.128 66.29)',
                    trailColor: 'oklch(0.9091 0.0567 75.164)',
                  })}
                />
              </div>
            </div>
            <h3 className="font-bold text-xl">{courseProgressSummary?.lessons.completed}</h3>
            <p>Lessons</p>
            <p className="text-blue-600">of {courseProgressSummary?.lessons.total} completed</p>
          </div>
          <div className="bg-red-100 p-4 flex flex-col rounded-lg gap-y-1">
            <div className="flex mb-2.5 justify-between items-center">
              <div className="bg-orange-300 flex items-center justify-center w-10 h-10 rounded-full">
                <ClipboardCheck color="#f1f5f9"/>
              </div>
              <div>
                <CircularProgressbar
                  value={(courseProgressSummary?.modules.completed / courseProgressSummary?.modules.total) * 100}
                  text={`${(courseProgressSummary?.modules.completed / courseProgressSummary?.modules.total) * 100}%`}
                  strokeWidth={18}
                  className='h-14'
                  styles={buildStyles({
                    textColor: 'black',
                    pathColor: 'oklch(0.8085 0.0691 17.717)',
                    trailColor: 'oklch(95.4% 0.038 75.164)',
                  })}
                />
              </div>
            </div>
            <h3 className="font-bold text-xl">{courseProgressSummary?.modules.completed}</h3>
            <p>Modules</p>
            <p className="text-blue-600">of {courseProgressSummary?.modules.total} completed</p>
          </div>
          <div className="bg-green-100 p-4 flex flex-col rounded-lg gap-y-1">
            <div className="flex mb-2.5 justify-between items-center">
              <div className="bg-orange-300 flex items-center justify-center w-10 h-10 rounded-full">
                <ClipboardCheck color="#f1f5f9"/>
              </div>
              <div>
                <CircularProgressbar
                  value={(courseProgressSummary?.courses.completed / courseProgressSummary?.courses.total) * 100}
                  text={`${Math.floor((courseProgressSummary?.courses.completed / courseProgressSummary?.courses.total) * 100)}%`}
                  strokeWidth={18}
                  className='h-14'
                  styles={buildStyles({
                    textColor: 'black',
                    pathColor: 'oklch(0.8761 0.1061 156.743)',
                    trailColor: 'oklch(0.924 0.0419 156.743)',
                  })}
                />
              </div>
            </div>
            <h3 className="font-bold text-xl">{courseProgressSummary?.courses.completed}</h3>
            <p>Courses</p>
            <p className="text-blue-600">of {courseProgressSummary?.courses.total} completed</p>
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
            {enrolledCourses.map((course, idx) => (
              <tr key={idx} className="rounded-lg">
                <td className="py-3 px-2">
                  <div className="bg-red-200 w-10 h-10 rounded-xl"></div>
                </td>
                <td className="py-3 px-2">
                  <p className="truncate">{course?.course.title}</p>
                </td>
                <td className="py-3 px-2">
                  <div className="flex bg-blue-100 w-full h-1.5 rounded-lg">
                    <div
                      className="h-full bg-blue-700"
                      style={{ width: `${course?.progress.percentage}%` }}
                    ></div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex gap-x-2">
                    <span className="flex items-center gap-1 text-sm">
                      <Clipboard size={18} color="gray" />
                      <span>{course?.progress.module}</span>
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <Clipboard size={18} color="gray" />
                      <span>{course?.progress.lesson}</span>
                    </span>
                    {/* <span className="flex items-center gap-1 text-sm">
                      <Clipboard size={18} color="gray" />
                      <span>15</span>
                    </span> */}
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