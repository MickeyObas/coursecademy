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
  <main className="bg-slate-100 px-4 sm:px-6 py-8 flex flex-col">
    {/* Enrolled Courses */}
    <section>
      <h2 className="text-lg sm:text-xl font-bold">My Courses</h2>
      {enrolledCourses ? (
        enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {enrolledCourses.map((course, idx) => (
              <div
                key={idx}
                onClick={() =>
                  navigate(`/dashboard/courses/${course?.course.slug}/`)
                }
                className="flex flex-col bg-white rounded-lg hover:shadow cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="bg-blue-100 w-full h-36 sm:h-40 rounded-t-lg overflow-hidden">
                  <img
                    className="object-cover w-full h-full"
                    src={course?.course.thumbnail}
                    alt=""
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-y-2 p-3 flex-1">
                  {/* Title */}
                  <div className="min-h-[2.25rem]">
                    <p className="font-bold text-sm sm:text-base line-clamp-2">
                      {course?.course.title}
                    </p>
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-col sm:flex-row justify-between gap-3 mt-3">
                    {/* Accuracy */}
                    <div className="flex items-center gap-x-2 flex-1">
                      <div className="flex w-6 h-6">
                        <CircularProgressbar
                          value={60}
                          strokeWidth={18}
                          className="h-6 w-6"
                          styles={buildStyles({
                            textColor: "#3B82F6",
                            pathColor: "#3B82F6",
                            trailColor: "#E5E7EB",
                          })}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Accuracy</span>
                        <span className="text-sm font-medium">60%</span>
                      </div>
                    </div>

                    {/* Completion */}
                    <div className="flex items-center gap-x-2 flex-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-2">
                      <div className="flex w-6 h-6">
                        <CircularProgressbar
                          value={course?.progress.percentage}
                          strokeWidth={18}
                          className="h-6 w-6"
                          styles={buildStyles({
                            textColor: "#3B82F6",
                            pathColor: "#3B82F6",
                            trailColor: "#E5E7EB",
                          })}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">
                          Completion
                        </span>
                        <span className="text-sm font-medium">
                          {course.progress.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category + UserCheck */}
                  <div className="flex justify-between mt-4">
                    <span className="bg-slate-100 text-xs rounded-2xl px-2 py-1">
                      {course?.course.category}
                    </span>
                    <span className="flex items-center rounded-full bg-white border border-slate-300 p-1">
                      <UserCheck size={16} />
                    </span>
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center mt-4 justify-between">
                    <div className="flex items-center text-xs text-slate-500 gap-x-2">
                      {course?.last_accessed_at ? (
                        <p>Last accessed {timeAgo(course?.last_accessed_at)}</p>
                      ) : (
                        <p>New Course</p>
                      )}
                      <Dot size={14} color="#62748e" />
                      <span className="flex items-center font-medium">
                        <Book size={16} className="mr-1" />
                        {course?.course.module_count}{" "}
                        {course?.course.module_count === 1
                          ? "Module"
                          : "Modules"}
                      </span>
                    </div>
                    <span className="border border-slate-300 rounded-full p-1">
                      <Ellipsis size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-3 text-center bg-white mt-4 rounded-lg">
            Your courses will appear here 🫠
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <div className="h-72 flex flex-col bg-white animate-pulse rounded-lg"></div>
          <div className="h-72 flex flex-col bg-white animate-pulse rounded-lg"></div>
          <div className="h-72 flex flex-col bg-white animate-pulse rounded-lg"></div>
        </div>
      )}
    </section>

    {/* Other Courses */}
    <section className="mt-12">
      <h2 className="text-lg sm:text-xl font-bold">Other Courses</h2>
      {otherCourses ? (
        otherCourses.length > 0 ? (
          <div className="mt-4 space-y-3">
            {/* Table-like layout */}
            {otherCourses.map((course, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-12 items-center bg-white p-4 rounded-lg gap-3"
              >
                {/* Title */}
                <div className="sm:col-span-4">
                  <p className="text-sm sm:text-base truncate">
                    {course.title}
                  </p>
                </div>

                {/* Modules */}
                <div className="sm:col-span-2">
                  <span className="text-sm flex items-center gap-x-1">
                    <ClipboardList />
                    {course?.module_count}{" "}
                    {course?.module_count === 1 ? "Module" : "Modules"}
                  </span>
                </div>

                {/* Lessons */}
                <div className="sm:col-span-2">
                  <span className="text-sm flex items-center gap-x-1">
                    <PencilLineIcon />
                    {course?.lesson_count}{" "}
                    {course?.lesson_count === 1 ? "Lesson" : "Lessons"}
                  </span>
                </div>

                {/* Category */}
                <div className="sm:col-span-2">
                  <span className="text-sm bg-green-200 px-2.5 py-2 rounded-full flex items-center justify-center text-center">
                    {course.category.title}
                  </span>
                </div>

                {/* Action */}
                <div className="sm:col-span-2 flex justify-start sm:justify-end">
                  <button
                    onClick={() =>
                      navigate(`/dashboard/courses/${course?.slug}/`)
                    }
                    className="cursor-pointer bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-xl text-white w-full"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4">You're enrolled in literally every course XD</p>
        )
      ) : (
        <div className="flex flex-col gap-3 mt-4">
          <div className="bg-white rounded-lg h-20 animate-pulse"></div>
          <div className="bg-white rounded-lg h-20 animate-pulse"></div>
          <div className="bg-white rounded-lg h-20 animate-pulse"></div>
        </div>
      )}
    </section>
  </main>
);
}

export default Courses;
