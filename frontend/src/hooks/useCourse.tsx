import { useEffect, useState } from "react";
import api from "../utils/axios";

export const useCourse = (courseSlug: string) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
    try {
      const response = await api.get(`/api/courses/${courseSlug}/`);
      const data = response.data;
      setCourse(data);
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
    fetchCourse();
  }, [])

  return { course, loading, error }

}