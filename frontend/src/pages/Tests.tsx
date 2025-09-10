import { useEffect, useState } from "react";
import api from '../utils/axios';
import { useNavigate } from "react-router-dom";
import type { Category } from "../types/Course";
import { usePageTitle } from "../hooks/usePageTitle";


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
  usePageTitle("Tests");
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);

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

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       const response = await api.get(`/api/categories/`);
  //       const data = await response.data;
  //       setCategories(data);
  //     }catch(error: any){
  //       if(error.response){
  //         console.log(error.response.data);
  //       }else{
  //         console.error(error);
  //       }
  //     }
  //   };
  //   fetchCategories();
  // }, [])

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
    <main className="bg-slate-100 h-full px-6 py-10 flex flex-col gap-y-4">
      <div className="flex flex-col bg-white p-4 rounded-lg">
        <h2 className="text-xl font-bold">Available Tests</h2>
        <div className="flex flex-wrap mt-4 gap-3">
          {tests.map((test, idx) => (
            <span 
              key={idx}
              onClick={() => navigate(`/dashboard/tests/${test.category.id}/`)}
              className="bg-blue-200 rounded-full p-2 cursor-pointer hover:bg-blue-300">{test.category.title}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-col bg-white p-4 rounded-lg">
        <h2 className="text-xl font-bold">My Tests</h2>
        {testSessions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 mt-4">
            {testSessions.map((testSession) => (
              <div className="bg-slate-100 p-2.5 rounded-lg flex justify-between items-center">
                <div className="flex w-full gap-x-7">
                  <div className="w-[25%]">
                    <p className="font-bold text-lg">{testSession?.test_assessment?.category?.title}</p>
                  </div>
                  <div className="w-[15%]">
                    <p>Status: {formatStatus(testSession.status)}</p>
                  </div>
                  <div className="w-[15%]">
                    <p>Score: {testSession.score}%</p>
                  </div>
                  <div className='w-[40%]'>
                    {testSession.submitted_at ? (
                      <p>Date: {formatDate(testSession.submitted_at)}</p>
                    ) : (
                      <div className="flex w-full justify-between items-center h-full">
                        <p>N/A</p>
                        {!testSession.is_expired && (
                          <div className="">
                            <button 
                            onClick={() => handleTestResume(testSession.id)}
                            className="bg-blue-400 px-2 py-1.5 rounded-lg text-white cursor-pointer">Resume Test</button>
                          </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center p-10">You have not taken any test yet.</p>
        )}        
      </div>
    </main>
  )
}

export default Tests;