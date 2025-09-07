import { Book, Clipboard, ClipboardCheck, Play, Scroll } from "lucide-react";
import { useEffect, useState } from "react";
import { useEnrolledCourses } from "../hooks/useEnrolledCourses";
import api from "../utils/axios";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from "react-router-dom";


const Dashboard = () => {
  const navigate = useNavigate();
  const { enrolledCourses, fetchEnrolledCourses } = useEnrolledCourses();
  const [courseProgressSummary, setCourseProgressSummary] = useState(null);
  const [lastAccessedCourse, setLastAccessedCourse] = useState(null);
  const [enolledCoursesFilter, setEnrolledCoursesFilter] = useState<"active" | "completed">("active");

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
        console.log(data);
        if(data?.status !== 'empty'){
          setLastAccessedCourse(data);
        }
      }catch(err){
        console.error(err);
      }
    };
    fetchLastAccessedCourse();
  }, [])

  useEffect(() => {
    fetchEnrolledCourses(enolledCoursesFilter);
  }, [enolledCoursesFilter])

  const handleCourseClick = (course) => {
    if(course.resume_lesson_id){
      navigate(`/courses/${course?.course.slug}/lessons/${course?.resume_lesson_id}`)
    }else{
      alert("There are no lessons or modules for this course yet. Please try again later :)");
    }
  }

  return (
    <main className=" p-4 flex flex-col gap-y-4 select-none">
      {lastAccessedCourse && (
        <div className="flex items-center bg-white p-4 rounded-lg justify-between">
          <div className="flex gap-x-4 items-center w-[60%]">
            <div className="w-25 bg-slate-50 p-1.5 rounded-xl">
              <img className="w-full h-full object-cover" src={lastAccessedCourse?.course.thumbnail} alt="" />
            </div>
            <div className="flex flex-col gap-y-3">
              <span className="line-clamp-1">{lastAccessedCourse?.course.title}</span>
              <div className="flex bg-blue-100 w-60 h-1.5 rounded-lg">
                <div
                  className="h-full bg-blue-700"
                  style={{ width: `${lastAccessedCourse?.progress.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="w-[35%] flex justify-between">
            <div className="bg-slate-200 w-0.5"></div>
            <div className="flex items-center">
              <div className="flex items-center gap-x-3">
                <span className="flex items-center gap-1.5">
                  <Book color="gray" />
                  <span>{lastAccessedCourse?.progress.module}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Scroll color="gray" />
                  <span>{lastAccessedCourse?.progress.lesson}</span>
                </span>
                {/* <span className="flex items-center gap-1.5">
                  <Clipboard color="gray" />
                  <span>15</span>
                </span> */}
              </div>
            </div>   
            <div
              onClick={() => navigate(`/courses/${lastAccessedCourse?.course.slug}/lessons/${lastAccessedCourse?.resume_lesson_id}`)} 
              className="flex bg-slate-100 px-2 py-1.5 rounded-lg gap-x-2 cursor-pointer hover:bg-slate-200">
              <Play color="blue"/>
              <span>Resume</span>
            </div>       
          </div>
        </div>
      )}
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
                  text={`${Math.floor((courseProgressSummary?.lessons.completed / courseProgressSummary?.lessons.total) * 100) || 0}%`}
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
            <p>{courseProgressSummary?.lessons.completed > 1 ? "Lessons" : "Lesson"}</p>
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
                  text={`${Math.floor((courseProgressSummary?.modules.completed / courseProgressSummary?.modules.total) * 100) || 0}%`}
                  strokeWidth={18}
                  className='h-14'
                  styles={buildStyles({
                    textColor: 'black',
                    pathColor: 'oklch(0.8085 0.0691 17.717)',
                    trailColor: 'oklch(0.9085 0.0691 17.717)',
                  })}
                />
              </div>
            </div>
            <h3 className="font-bold text-xl">{courseProgressSummary?.modules.completed}</h3>
            <p>{courseProgressSummary?.modules.completed > 1 ? "Modules" : "Module"}</p>
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
                  text={`${Math.floor((courseProgressSummary?.courses.completed / courseProgressSummary?.courses.total) * 100) || 0}%`}
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
            <p>{courseProgressSummary?.courses.completed > 1 ? "Courses" : "Course"}</p>
            <p className="text-blue-600">of {courseProgressSummary?.courses.total} completed</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-white p-4 rounded-lg">
        <div className="flex justify-between w-full mb-4">
          <h2 className="text-xl font-bold">My Courses</h2>
          <div className="flex gap-x-1.5">
            <span 
              onClick={() => setEnrolledCoursesFilter("active")}
              className={`${enolledCoursesFilter === 'active' ?'bg-blue-100' : 'hover:bg-slate-100'} cursor-pointer px-3 py-1.5 rounded-lg text-sm`}>Active</span>
            <span
              onClick={() => setEnrolledCoursesFilter("completed")}
             className={`${enolledCoursesFilter === 'completed' ?'bg-blue-100' : 'hover:bg-slate-100'} cursor-pointer px-3 py-1.5 rounded-lg text-sm`}>Completed</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-separate border-spacing-y-4 px-2">
          <thead>
            <tr className="text-center text-gray-500 text-sm">
              <th className="w-[10%] pb-2 border-b border-slate-300">#</th>
              <th className="w-[40%] pb-2 border-b border-slate-300">Course Name</th>
              <th className="w-[35%] pb-2 border-b border-slate-300">Completed</th>
              <th className="w-[15%] pb-2 border-b border-slate-300">Status</th>
            </tr>
          </thead>
          
          <tbody>
            {enrolledCourses.length > 0 ? enrolledCourses.map((course, idx) => (
              <tr
                onClick={() => handleCourseClick(course)} 
                key={idx} 
                className="rounded-lg hover:bg-slate-50 cursor-pointer">
                <td className="py-3 px-2 flex justify-center">
                  <div className="border border-slate-300 p-0.5 w-10 h-10 rounded-xl">
                    <img 
                      className="object-contain object-center w-full h-full"
                      src={course?.course.thumbnail} alt="" />
                  </div>
                </td>
                <td className="py-3 px-2">
                  <p className="line-clamp-1">{course?.course.title}</p>
                </td>
                <td className="py-3 px-2">
                  <div className="flex bg-blue-100 w-full h-1.5 rounded-lg">
                    <div
                      className="h-full bg-blue-700"
                      style={{ width: `${course?.progress.percentage}%` }}
                    ></div>
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <div className="flex justify-center gap-x-3 items-center w-full">
                    <span className="flex gap-x-1 text-sm">
                      <Book size={18} color="gray" />
                      <span>{course?.progress.module}</span>
                    </span>
                    <span className="flex gap-x-1 text-sm">
                      <Scroll size={18} color="gray" />
                      <span>{course?.progress.lesson}</span>
                    </span>
                  </div>
                </td>
              </tr>
            )) : (
              <td className="text-center" colSpan={4}>
                <p>{enolledCoursesFilter === "active" ? "You haven't enrolled in any courses yet." : "You haven't completed any course yet."}</p>
              </td>
            )}
          </tbody>
        </table>
      </div>

      </div>
    </main>
  )
}

export default Dashboard;