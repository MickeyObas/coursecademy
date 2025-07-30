import { useEffect, useState } from "react";
import type { Category } from "../types/Category";
import api from '../utils/axios';
import { useNavigate } from "react-router-dom";

const Tests = () => {

  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get(`/api/categories/`);
        const data = await response.data;
        console.log(data);
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

  return (
    <main className="bg-slate-100 h-full px-6 py-10 flex flex-col gap-y-4">
      <div className="flex flex-col bg-white p-4 rounded-lg">
        <h2 className="text-xl font-bold">Available Tests</h2>
        <div className="flex flex-wrap mt-4 gap-3">
          {categories.map((category, idx) => (
            <span 
              key={idx}
              onClick={() => navigate(`/tests/${category.id}/`)}
              className="bg-blue-200 rounded-full p-2 cursor-pointer hover:bg-blue-300">{category.title}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-col bg-white p-4 rounded-lg">
        <h2 className="text-xl font-bold">My Test Results</h2>
        <p className="text-center p-10">You have not taken any test yet.</p>
      </div>
    </main>
  )
}

export default Tests;