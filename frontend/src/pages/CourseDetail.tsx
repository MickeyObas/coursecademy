import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/axios";
import type { Course } from "../types/Course";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { courseSlug } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);

  const fetchCourse = async () => {
      try{
        const response = await api.get(`/api/courses/${courseSlug}/`);
        const data = response.data;
        setCourse(data);
        setIsEnrolled(data.is_enrolled);
      }catch(error: any){
        console.error;
      }finally{
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchCourse();
  }, [courseSlug])

  if (loading) return <div className="text-center mt-10 text-lg">Loading...</div>;
  if (!course) return <div className="text-center mt-10 text-red-500">Course not found</div>;

  const handleCourseEnroll = async (courseId: number) => {
    try {
      setIsEnrolling(true);
      const response = await api.post(`/api/courses/${courseId}/enroll/`);
      const data = response.data;
      console.log(data);
      setIsEnrolled(true);
      alert("Course enrollment successful");
    } catch(err){
      console.error(err);
    }finally {
      setIsEnrolling(false);
    }
  }

  const handleCourseStart = () => {
    if(course.resume_lesson_id){
      navigate(`/courses/${courseSlug}/lessons/${course.resume_lesson_id}/`);
    }else{
      alert("There is no lesson for this course yet. Please try again later.");
    }
  }

  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto p-6 bg-white">
      {/* Course Header */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Thumbnail */}
          <div className="w-full md:w-1/3">
            <img
              src={course.thumbnail || "/images/placeholder-course.png"}
              alt={course.title}
              className="rounded-xl w-full object-cover shadow-lg"
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-gray-600">Category: {course.category.title}</p>
            <div className="flex items-center gap-4 text-sm">
              <span>Enrolled: {course.enrollment_count}</span>
              <span>Rating: {course.average_rating} ({course.rating_count} reviews)</span>
              <span>Price: ₦{course.price}</span>
            </div>
            <div>
              {
                isEnrolled
                  ? (
                    <button
                      onClick={handleCourseStart} 
                      className="cursor-pointer mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                      Resume Course
                    </button>
                  )
                  : course.price === "0.00"
                    ? (
                        <button 
                          onClick={() => handleCourseEnroll(course.id)}
                          className="cursor-pointer mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                          {isEnrolling ? "Loading..." : "Start Course"}
                        </button>
                    )
                    : (
                      <button 
                        onClick={() => handleCourseEnroll(course.id)}
                        className="cursor-pointer mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                        {isEnrolling ? "Loading..." : "Enroll Course"}
                      </button>
                    )
                }
            </div>
          </div>
        </div>

        {/* Learning Points */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">What You'll Learn</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-800">
            {course.learning_points.length > 0 ? (
              course.learning_points.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))
            ) : (
              <p className="text-gray-500">No learning objectives listed.</p>
            )}
          </ul>
        </div>

        {/* Skills (if any) */}
        {course.skills.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Skills You'll Gain</h2>
            <div className="flex flex-wrap gap-2">
              {course.skills.map((skill, idx) => (
                <span key={idx} className="bg-gray-200 text-sm px-3 py-1 rounded-full">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Tags (if any) */}
        {course.tags && course.tags.trim() !== "" && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {course.tags.split(",").map((tag, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">{tag.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {/* Instructor */}
        <div className="mt-8 text-sm text-gray-600">
          Instructor: {course.instructor ? course.instructor.full_name : "Not yet assigned"}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
