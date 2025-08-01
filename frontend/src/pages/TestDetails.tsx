import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/axios";
import type { Category } from "../types/Category";


const TestDetails = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<string>('EASY');

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const [categoryRes, descriptionRes] = await Promise.all([
          api.get(`/api/categories/${categoryId}/`),
          api.get(`/api/categories/${categoryId}/testdescription/`)
        ])
        setCategory(categoryRes.data);
        setDescription(descriptionRes.data);
        console.log(categoryRes, descriptionRes);
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
      const data = await response.data;
      console.log(data);
      navigate(`/take-test/${data.sessionId}`, {state: {questions: data.questions}})
    }catch(err: any){
      if(err.response){
        console.error(err.response.data);
      }else{
        console.error(err);
      }
    }
    
    };

  return (
    <div className="px-6 py-10 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">{category?.title}</h1>

      <p className="text-gray-700 mb-4">{description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
        <p>
          <span className="font-medium">Duration:</span> 15 minutes
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
        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
      >
        Start Test
      </button>
    </div>
  );
};

export default TestDetails;
