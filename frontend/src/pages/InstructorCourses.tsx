import { useEffect, useState } from "react";
import api from "../utils/axios";
import CourseForm from "./CourseForm";
import type { Course } from "../types/Course";

const InstructorCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [addingCourse, setAddingCourse] = useState(false);

  // Load user’s courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get(`/api/courses/instructed/`);
        console.log(res.data);
        setCourses(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseSave = (data: Course) => {
    setAddingCourse(false);
    setCourses((prev) => ([...prev, data])); 
  }

  return (
  <div className="max-w-4xl mx-auto p-6">
    {/* Header */}
    <h2 className="text-2xl font-bold mb-6">My Courses</h2>

    {/* Courses Section */}
    {!addingCourse && courses.length > 0 && (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {courses.map((course, idx) => (
          <div
            key={course.id || idx}
            className="p-5 border rounded-xl shadow-sm bg-white hover:shadow-md transition cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              {course.title}
            </h3>
            {/* <p className="text-sm text-gray-600 mt-2">
              {course.module_count || 0} Modules
            </p> */}
          </div>
        ))}
      </div>
    )}

    {/* Empty State */}
    {!addingCourse && courses.length === 0 && (
      <div className="text-center py-16 bg-white border rounded-xl shadow-sm">
        <p className="text-gray-500 mb-4">
          You haven’t created any courses yet.
        </p>
        <button
          onClick={() => setAddingCourse(true)}
          className="cursor-pointer px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Create Your First Course
        </button>
      </div>
    )}

    {/* Course Form */}
    {addingCourse && (
      <div className="mt-6">
        <CourseForm onCourseSave={handleCourseSave} />
      </div>
    )}

    {/* Add Course Button */}
    {!addingCourse && courses.length > 0 && (
      <div className="mt-6">
        <button
          onClick={() => setAddingCourse(true)}
          className="cursor-pointer px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Add Course
        </button>
      </div>
    )}
  </div>
);

}

export default InstructorCourses