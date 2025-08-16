import { useEffect, useState } from "react";
import type { Category } from "../types/Category";
import api from '../utils/axios';
import { useNavigate } from "react-router-dom";

const Tests = () => {

  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [testSessions, setTestSessions] = useState([]);

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

  function formatDate(inputDate) {
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
    // Check if test session still valid
    navigate(`/dashboard/take-test/${sessionId}/`)
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get(`/api/categories/`);
        const data = await response.data;
        setCategories(data);
      }catch(error: any){
        if(error.response){
          console.log(error.response.data);
        }else{
          console.error(error);
        }
      }
    };
    fetchCategories();
  }, [])

  useEffect(() => {
    const fetchTestSessions = async () => {
      try { 
        const response = await api.get(`/api/sessions/user/${1}/`);
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
          {categories.map((category, idx) => (
            <span 
              key={idx}
              onClick={() => navigate(`/dashboard/tests/${category.id}/`)}
              className="bg-blue-200 rounded-full p-2 cursor-pointer hover:bg-blue-300">{category.title}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-col bg-white p-4 rounded-lg">
        <h2 className="text-xl font-bold">My Tests</h2>
        {testSessions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 mt-4">
            {testSessions.map((testSession, idx) => (
              <div className="bg-slate-100 p-2.5 rounded-lg flex justify-between items-center">
                <div className="flex gap-x-7">
                  <p className="font-bold text-lg">{testSession?.test_assessment?.category?.title}</p>
                  <p>Status: {formatStatus(testSession.status)}</p>
                  <p>Score: {testSession.score}%</p>
                  {testSession.submitted_at && (
                    <p>Date: {formatDate(testSession.submitted_at)}</p>
                  )}
                </div>
                {(!testSession.is_expired && !(testSession.status === 'S')) && (
                  <button 
                    onClick={() => handleTestResume(testSession.id)}
                    className="bg-blue-400 px-2 py-1.5 rounded-lg text-white cursor-pointer">Resume Test</button>
                )}
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