import { ClipboardList, Dot, Ellipsis, MessageCircleQuestionMark, PencilLineIcon, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import api from '../utils/axios';


const Courses = () => {
  const [otherCourses, setOtherCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const response = await api.get(`/api/enrollments/my/`);
        const data = response.data;
        setEnrolledCourses(data);
      }catch (error: any){
        if(error.response){
          console.error(error.response);
        }else{
          console.error(error);
        }
      }
    };
    fetchEnrolledCourses();
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

  const handleCourseEnroll = async (courseId) => {
    try {
      const response = await api.post(`/api/courses/${courseId}/enroll/`);
      const data = response.data;
    } catch(err){
      console.error(err);
    }
  }

  return (
    <main className="bg-slate-100 h-full px-6 py-10 flex flex-col">
      <section>
        <h2 className="text-xl font-bold">My Courses</h2>
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {enrolledCourses.map((course, idx) => (
              <div key={idx} className="flex-flex-col bg-white p-1 rounded-lg">
                <div className="bg-red-100 w-full h-18 rounded-lg"></div>
                <div className="p-3">
                  <p className="font-bold text-sm">{course?.course.title}</p>
                  <div className='flex justify-between mt-4'>
                    <div className="flex items-center gap-x-2">
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
                    <div className="flex gap-x-2 items-center border-l border-l-slate-200 pl-2">
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
                      <p className='text-xs text-slate-500'>Last accessed 3h ago</p>
                      <Dot size={14} color='#62748e'/>
                      <span className='flex text-xs font-medium items-center'>
                        <MessageCircleQuestionMark size={20}/>
                        18 Modules
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
          <div>No Enrolled Course</div>
        )}
      </section>
      <section className='mt-12'>
        <h2 className='text-xl font-bold'>Other Courses</h2>
        {otherCourses.length > 0 ? (
          <div className='grid grid-cols-1 mt-4 gap-y-2'>
            {otherCourses.map((course, idx) => (
              <div key={idx} className='flex items-center justify-between bg-white p-4 rounded-lg'>
                <p>{course.title}</p>
                <span className='text-sm flex items-center'>
                  <ClipboardList />
                  9 Modules
                </span>
                <span className='text-sm flex items-center'>
                  <PencilLineIcon />
                  40 Lessons
                </span>
                <span className='text-sm bg-blue-200 flex items-center px-2 py-1.5 rounded-full'>{course.category.title}</span>
                <button 
                  onClick={() => handleCourseEnroll(course.id)}
                  className='bg-green-500 px-2 py-1 rounded-xl'>Enroll</button>
              </div>
            ))}
          </div>
        ) : (
          <p>You're enrolled in literally every course XD</p>
        )}
      </section>
    </main>
  )
}

export default Courses;
