import { useEffect, useState } from "react";
import api from '../utils/axios';
import { useNavigate } from "react-router-dom";
import type { Category } from "../types/Course";
import { usePageTitle } from "../hooks/usePageTitle";
import { useRateLimit } from "../contexts/RateLimitContext";
import toast from "react-hot-toast";


type Test = {
  id: number,
  category: Category,
  description: string,
  duration_minutes: number
}

type TestSession = {
  id: number,
  test_assessment: Test,
  status: "IP" | "S" | "ERR",
  score: number,
  submitted_at: string,
  is_expired: boolean
}


const Tests = () => {
  const { isRateLimited, cooldown } = useRateLimit();
  usePageTitle("Tests");
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[] | null>(null);
  const [testSessions, setTestSessions] = useState<TestSession[] | null>(null);

  const formatStatus = (statusChar: string) => {
    switch(statusChar){
      case 'S':
        return 'Submitted';
      case 'IP':
        return 'In Progress';
      case 'ERR':
        return 'Error'
    }
  }

  function formatDate(inputDate: string) {
    const date = new Date(inputDate);

    return date.toLocaleString("en-US", {
      timeZone: "Africa/Lagos", // optional, remove if you want local time
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }


  const handleTestResume = (sessionId: number) => {
    console.log(sessionId);
    // Check if test session still valid
    navigate(`/dashboard/take-test/${sessionId}/`)
  }

  useEffect(() => {
    if(isRateLimited){
      toast.error(`Sorry about that, you're being rate-limited. Please try again in ${cooldown} seconds.`, {duration: 4000})
    }
  }, [])

  useEffect(() => {
    const fetchTestAssessments = async () => {
      try {
        const response = await api.get(`/api/assessments/tests/`);
        const data = await response.data;
        setTests(data);
      }catch(error: any){
        if(error.response){
          console.log(error.response.data);
        }else{
          console.error(error);
        }
      }
    };
    fetchTestAssessments();
  }, [])

  useEffect(() => {
    const fetchTestSessions = async () => {
      try { 
        const response = await api.get(`/api/sessions/tests/my/`);
        const data = response.data;
        setTestSessions(data);
        console.log(data);
      }catch (error: any){
        if(error.response.data){
          console.error(error.response.data);
        }else{
          console.error(error);
        }
      }
    };
    fetchTestSessions();
  }, [])

  return (
  <main className="bg-slate-100 h-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-y-4">
    
    {/* Available Tests */}
    <div className="flex flex-col bg-white p-4 rounded-lg">
      <h2 className="text-lg sm:text-xl font-bold">Available Tests</h2>
      {tests ? (
        tests.length > 0 ? (
          <div className="flex flex-wrap mt-4 gap-3">
            {tests.map((test, idx) => (
              <span
                key={idx}
                onClick={() => navigate(`/dashboard/tests/${test.category.id}/`)}
                className="bg-blue-200 rounded-full px-4 py-2 min-w-[100px] text-center cursor-pointer hover:bg-blue-300 transition"
              >
                {test.category.title}
              </span>
            ))}
          </div>
        ) : (
          <div className="my-2 text-center">
            Whoops, there are no tests available at the moment 😞
          </div>
        )
      ) : (
        <div className="flex flex-wrap mt-4 gap-3 animate-pulse">
          {Array(5)
            .fill(null)
            .map((_, idx) => (
              <span
                key={idx}
                className="bg-slate-100 rounded-full w-28 h-8"
              ></span>
            ))}
        </div>
      )}
    </div>

    {/* My Tests */}
    <div className="flex flex-col bg-white p-4 rounded-lg">
      <h2 className="text-lg sm:text-xl font-bold">My Tests</h2>
      {testSessions ? (
        testSessions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 mt-4">
            {testSessions.map((testSession) => (
              <div
                key={testSession.id}
                className="bg-slate-100 p-2.5 rounded-lg grid grid-cols-1 md:grid-cols-[1fr_0.5fr_0.5fr_1fr] gap-y-2 md:gap-y-0 items-center"
              >
                {/* Category */}
                <p className="font-bold text-lg">
                  {testSession?.test_assessment?.category?.title}
                </p>

                {/* Status */}
                <p className="text-sm sm:text-base">
                  Status: {formatStatus(testSession.status)}
                </p>

                {/* Score */}
                <p className="text-sm sm:text-base">
                  Score: {testSession.score}%
                </p>

                {/* Date / Actions */}
                {testSession.submitted_at ? (
                  <p className="text-sm sm:text-base">
                    Date: {formatDate(testSession.submitted_at)}
                  </p>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="text-sm sm:text-base">N/A</p>
                    {!testSession.is_expired && (
                      <button
                        onClick={() => handleTestResume(testSession.id)}
                        className="bg-blue-400 px-3 py-1.5 rounded-lg text-white hover:bg-blue-500 transition w-auto sm:w-auto md:ms-auto cursor-pointer"
                      >
                        Resume Test
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center p-10">You have not taken any test yet.</p>
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 mt-4 animate-pulse">
          {Array(5)
            .fill(null)
            .map((_, idx) => (
              <div
                key={idx}
                className="bg-slate-100 h-24 sm:h-20 p-2.5 rounded-lg grid grid-cols-1 md:grid-cols-[1fr_0.5fr_0.5fr_1fr]"
              ></div>
            ))}
        </div>
      )}
    </div>
  </main>
)


}

export default Tests;