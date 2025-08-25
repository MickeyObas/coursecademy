import { useEffect, useState } from "react";
import api from "../utils/axios";
import CourseForm from "./CourseForm";

const InstructorCourses = () => {
  const [courses, setCourses] = useState<any[]>([]);
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

  return (
    <div>
      <h2 className="text-2xl mb-8 font-bold">My Courses</h2>
      {/* Courses List */}
      <div className="space-y-4">
        {!addingCourse && courses.length > 0 && courses.map((course, idx) => (
          <div className="space-y-4">
            <div
              key={course.id}
              className="p-4 border rounded-lg shadow cursor-pointer hover:bg-gray-50"
            >
              <h3 className="font-medium">{course.title}</h3>
              {/* <p className="text-sm text-gray-600">{course.modules?.length} modules</p> */}
            </div>
        </div>
        ))}
      </div>

      {addingCourse && <CourseForm onCourseSave={() => setAddingCourse(false)} />}

      {!addingCourse && <button
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        onClick={() => setAddingCourse(true)}
      >
        + Add Course
      </button>}
    </div>
  )
}

export default InstructorCourses