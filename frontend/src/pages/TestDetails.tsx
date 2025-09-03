import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/axios";
import type { TestAssessment } from "../types/TestAssessment";


const TestDetails = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [difficulty, setDifficulty] = useState<string>('EASY');
  const [test, setTest] = useState<TestAssessment | null>(null);

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await api.get(`/api/assessments/${categoryId}/test/`);
        const data = response.data;
        setTest(data);
      }catch(error: any){
        if(error.response){
          console.log(error.response.data);
        }else{
          console.error(error);
        }
      }
    };
    fetchTestData();
  }, [])

  const handleStartTest =  async() => {
    try{
      const response = await api.post(`/api/assessments/${categoryId}/test/start/`, {
        difficulty: difficulty
      });
      console.log(response);
      if(response.status === 200){
        const data = await response.data;
        navigate(`/dashboard/take-test/${data.sessionId}`, {
          // Move state to database
          state: {
            questions: data.questions,
            startedAt: data.started_at,
            durationMinutes: data.duration_minutes
          }
        })
      }
    }catch(err: any){
      if(err.response.status === 404){
        alert("There is no test that matches this difficulty.");
      }
    }
  };

  return (
    <div className="px-6 py-10 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">{test?.category?.title}</h1>

      <p className="text-gray-700 mb-4">{test?.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
        <p>
          <span className="font-medium">Duration:</span> {test?.duration_minutes} minutes
        </p>
        <p>
          <span className="font-medium">Total Questions:</span> 15 Questions
        </p>
        <div>
          <label htmlFor="difficulty" className="font-medium block mb-1">
            Difficulty Level:
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
          >
            {["easy", "normal", "hard"].map((level) => (
              <option key={level} value={level.toUpperCase()}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleStartTest}
        className="cursor-pointer bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
      >
        Start Test
      </button>
    </div>
  );
};

export default TestDetails;
