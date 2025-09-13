import { useEffect, useState } from "react";
import api from "../utils/axios";
import type { EnrolledCourse } from "../types/Course";

export const useEnrolledCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrolledCourses = async (filter: "active" | "completed") => {
    try {
      const response = await api.get(`/api/enrollments/my/?filter=${filter}`);
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

  useEffect(() => {
    fetchEnrolledCourses("active");
  }, [])

  return { enrolledCourses, loading, error, fetchEnrolledCourses }

}