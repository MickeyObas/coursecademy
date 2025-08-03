import { useEffect, useState } from "react";
import api from "../utils/axios";

export const useEnrolledCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
    try {
      const response = await api.get(`/api/enrollments/my/`);
      const data = response.data;
      setEnrolledCourses(data);
    }catch (error: any){
      if(error.response){
        setError(error.response || error)
        console.error(error.response);
      }else{
        console.error(error);
      }
    }finally {
      setLoading(false);
    }
  };
    fetchEnrolledCourses();
  }, [])

  return { enrolledCourses, loading, error }

}