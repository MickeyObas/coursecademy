import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/axios";

export default function CourseAsessmentDetail() {
  const navigate = useNavigate();
  const { courseSlug } = useParams();

  // TODO: Set up actual course assessments
  const assessment = {
    id: 1,
    title: "Course Assessment",
    description:
      "This assessment will test your knowledge of the course content. Make sure you are ready before starting.",
    totalQuestions: 10,
    duration: "30 minutes",
    passingScore: "70%",
    attemptsAllowed: 1,
  };

  const handleStart = async () => {
    // Create Course Assessment Session 
    const response = await api.post(`/api/assessments/courses/${courseSlug}/start/`, {
      course_slug: courseSlug
    });
    const data = response.data;
    console.log(data);
    
    navigate(`/take-assessment/course/${data.courseId}/sessions/${data.assessmentSessionId}/`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{assessment.title}</h1>
      <p className="text-gray-700 mb-6">{assessment.description}</p>

      <div className="border rounded-xl shadow p-4 mb-6 bg-white">
        <ul className="space-y-2 text-gray-800">
          <li>
            <span className="font-semibold">Total Questions:</span>{" "}
            {assessment.totalQuestions}
          </li>
          <li>
            <span className="font-semibold">Duration:</span>{" "}
            {assessment.duration}
          </li>
          <li>
            <span className="font-semibold">Passing Score:</span>{" "}
            {assessment.passingScore}
          </li>
          <li>
            <span className="font-semibold">Attempts Allowed:</span>{" "}
            {assessment.attemptsAllowed}
          </li>
        </ul>
      </div>

      <button
        onClick={handleStart}
        className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition"
      >
        Start Assessment
      </button>
    </div>
  );
}
