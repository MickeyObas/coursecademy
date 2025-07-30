import { Dot, Ellipsis, MessageCircleQuestionMark, UserCheck } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


const Courses = () => {
  return (
    <main className="bg-slate-100 h-full px-6 py-10 flex flex-col">
      <h2 className="text-xl font-bold">My Courses</h2>
      <div className="grid grid-cols-3 gap-4">
        {Array(5).fill(null).map((_, idx) => (
          <div key={idx} className="flex-flex-col bg-white p-1 rounded-lg">
            <div className="bg-red-100 w-full h-18 rounded-lg"></div>
            <div className="p-3">
              <p className="font-bold text-sm">Mastering SQL and Query Optimization</p>
              <div className='flex justify-between mt-4'>
                <div className="flex items-center gap-x-2">
                  <div className='flex'>
                    <CircularProgressbar
                      value={75}
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
                      value={75}
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
                    <span className='text-sm font-medium'>60%</span>
                  </div>
                </div>
              </div>
              <div className='flex justify-between mt-4'>
                <div className='flex w-[80%]'>
                  <span className='bg-slate-100 text-xs rounded-2xl px-2 py-1'>Databases</span>
                  <span className='bg-slate-100 text-xs rounded-2xl px-2 py-1'>SQL</span>
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
    </main>
  )
}

export default Courses;
