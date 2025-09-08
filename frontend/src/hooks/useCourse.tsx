import { useEffect, useState } from "react";
import api from "../utils/axios";
import type { Course } from "../types/Course";

export const useCourse = (courseSlug: string) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchCourse();
  }, [courseSlug]);


  return { course, loading, error, refetchCourse: fetchCourse }

}