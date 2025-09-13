import { Book, ClipboardList, Dot, Ellipsis, PencilLineIcon, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import api from '../utils/axios';
import { useEnrolledCourses } from '../hooks/useEnrolledCourses';
import { timeAgo } from '../utils/utils';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from "../hooks/usePageTitle";
import type { Course } from '../types/Course';
import { useRateLimit } from '../contexts/RateLimitContext';
import toast from 'react-hot-toast';


const Courses = () => {
  const { cooldown, isRateLimited } = useRateLimit();
  console.log(isRateLimited, cooldown);
  usePageTitle("Courses");
  const navigate = useNavigate();
  const [otherCourses, setOtherCourses] = useState<Course[] | null>(null);
  const { enrolledCourses } = useEnrolledCourses();

  useEffect(() => {
    if(isRateLimited){
      toast.error(`Sorry about that, you're being rate-limited. Please try again in ${cooldown} seconds.`, {duration: 4000})
    }
  }, [])

  useEffect(() => {
    const fetchOtherCourses = async () => {
      try {
        const response = await api.get(`/api/courses/other-courses/`);
        const data = response.data;
        setOtherCourses(data);
      }catch (error: any){
        if(error.response){
          console.error(error.response);
        }else{
          console.error(error);
        }
      }
    };
    fetchOtherCourses();
  }, [])

  return (
    <main className="bg-slate-100 px-6 py-10 flex flex-col">
      <section>
        <h2 className="text-xl font-bold">My Courses</h2>
        {enrolledCourses
          ? enrolledCourses.length > 0 
            ? (
              <div className="grid grid-cols-3 gap-4 mt-8">
                {enrolledCourses.map((course, idx) => (
                  <div 
                    onClick={() => navigate(`/dashboard/courses/${course?.course.slug}/`)}
                    key={idx} className="flex flex-col bg-white p-1 rounded-lg hover:shadow cursor-pointer">
                    <div className="bg-blue-100 w-full h-25 rounded-lg">
                      <img 
                        className='object-contain w-full h-full'
                        src={course?.course.thumbnail}
                        alt="" />
                    </div>
                    <div className="flex flex-col gap-y-1 p-3">
                      <div className='min-h-[2.25rem]'>
                        <p className="font-bold text-sm line-clamp-2">{course?.course.title}</p>
                      </div>
                      <div className='flex justify-between mt-4'>
                        <div className="flex items-center gap-x-2 w-1/2">
                          <div className='flex'>
                            <CircularProgressbar
                              value={60}
                              strokeWidth={18}
                              className='h-6'
                              styles={buildStyles({
                                textColor: '#3B82F6',
                                pathColor: '#3B82F6',
                                trailColor: '#E5E7EB',
                              })}
                            />
                          </div>
                          <div className='flex flex-col'>
                            <span className='text-xs text-slate-500'>Accuracy</span>
                            <span className='text-sm font-medium'>60%</span>
                          </div>
                        </div>
                        <div className="flex gap-x-2 items-center border-l border-l-slate-200 pl-2 w-1/2">
                          <div className='flex'>
                            <CircularProgressbar
                              value={course?.progress.percentage}
                              strokeWidth={18}
                              className='h-6'
                              styles={buildStyles({
                                textColor: '#3B82F6',
                                pathColor: '#3B82F6',
                                trailColor: '#E5E7EB',
                              })}
                            />
                          </div>
                          <div className='flex flex-col'>
                            <span className='text-xs text-slate-500'>Completion Rate</span>
                            <span className='text-sm font-medium'>{course.progress.percentage}%</span>
                          </div>
                        </div>
                      </div>
                      <div className='flex justify-between mt-4'>
                        <div className='flex w-[80%]'>
                          <span className='bg-slate-100 text-xs rounded-2xl px-2 py-1'>{course?.course.category}</span>
                        </div>
                        <span className='flex items-center rounded-full bg-white justify-end border border-slate-300 p-1'>
                          <UserCheck size={16}/>
                        </span>
                      </div>
                      <div className='flex items-center mt-4 justify-between'>
                        <div className='flex items-center'>
                          {course?.last_accessed_at ? (
                            <p className='text-xs text-slate-500'>
                              Last accessed {timeAgo(course?.last_accessed_at)}</p>
                          ) : (
                            <p className='text-xs text-slate-500'>New Course</p>
                          )}

                          <Dot size={14} color='#62748e'/>
                          <span className='flex text-xs font-medium items-center'>
                            <Book size={20}/>
                            {course?.course.module_count} {(course?.course.module_count === 0 || course?.course.module_count > 1) ? "Modules" : "Module"}
                          </span>
                        </div>
                        <span className='border border-slate-300 rounded-full p-1'>
                          <Ellipsis size={14}/>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='py-3 text-center bg-white mt-4 rounded-lg'>Your courses will appear here 🫠</div>
            ) : (
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className='h-72 flex flex-col bg-white animate-pulse p-1 rounded-lg hover:shadow cursor-pointer'></div>
                <div className='h-72 flex flex-col bg-white animate-pulse p-1 rounded-lg hover:shadow cursor-pointer'></div>
                <div className='h-72 flex flex-col bg-white animate-pulse p-1 rounded-lg hover:shadow cursor-pointer'></div>
              </div>
            )}
      </section>
      <section className='mt-12'>
        <h2 className='text-xl font-bold'>Other Courses</h2>
        {otherCourses 
          ? otherCourses.length > 0 
            ? (
              <div className='grid grid-cols-1 mt-4 gap-y-2'>
                {otherCourses.map((course, idx) => (
                  <div key={idx} className='flex items-center justify-between bg-white p-4 rounded-lg'>
                    <div className='w-[35%]'>
                      <p>{course.title}</p>
                    </div>
                    <div className='w-[15%]'>
                      <span className='text-sm flex items-center'>
                        <ClipboardList />
                        {course?.module_count} {course?.module_count === 0 || course?.module_count > 1 ? "Modules" : "Module"}
                      </span>
                    </div>
                    <div className='w-[15%]'>
                      <span className='text-sm flex items-center '>
                        <PencilLineIcon />
                        {course?.lesson_count} {course?.lesson_count === 0 || course?.lesson_count > 1 ? "Lessons" : "Lesson"}
                      </span>
                    </div>
                    <div className='w-[15%]'>
                      <span className='text-sm bg-green-200 items-center px-2.5 py-3 rounded-full flex justify-center justify-self-center'>{course.category.title}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/dashboard/courses/${course?.slug}/`)}
                      className='cursor-pointer bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-xl w-[13%] text-white'>View Course</button>
                  </div>
                ))}
              </div>
        ) : (
          <p>You're enrolled in literally every course XD</p>
        ) : (
          <div className='grid grid-cols-1 mt-4 gap-y-2'>
            <div className='flex items-center justify-between bg-white p-4 rounded-lg h-25 animate-pulse'></div>
            <div className='flex items-center justify-between bg-white p-4 rounded-lg h-25 animate-pulse'></div>
            <div className='flex items-center justify-between bg-white p-4 rounded-lg h-25 animate-pulse'></div>
          </div>
        )}
      </section>
    </main>
  )
}

export default Courses;
