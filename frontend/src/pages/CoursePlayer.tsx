import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserRound, Loader2 } from "lucide-react";
import { useCourse } from "../hooks/useCourse";
import api from "../utils/axios";

// Dummy data
const dummyCourse = {
  id: 1,
  title: "Mastering JavaScript",
  modules: [
    {
      id: 1,
      title: "Introduction",
      lessons: [
        {
          id: 101,
          title: "Welcome to the Course",
          type: "text",
          content: "<p>This course will teach you the fundamentals of JavaScript step-by-step.</p>",
        },
        {
          id: 102,
          title: "What is JavaScript?",
          type: "video",
          content: "https://www.w3schools.com/html/mov_bbb.mp4", // demo video
        },
      ],
    },
    {
      id: 2,
      title: "Core Concepts",
      lessons: [
        {
          id: 201,
          title: "Variables and Data Types",
          type: "text",
          content: "<p>Learn about <strong>var</strong>, <strong>let</strong>, and <strong>const</strong> in JavaScript.</p>",
        },
        {
          id: 202,
          title: "Functions and Scope",
          type: "video",
          content: "https://www.w3schools.com/html/movie.mp4",
        },
      ],
    },
  ],
};

export default function CoursePlayer() {
  const { courseSlug } = useParams();
  const {course} = useCourse(courseSlug || '');
  // console.log(course);
  const navigate = useNavigate();
  const allLessons = course?.modules?.flatMap(module => module.lessons.map((lesson => ({...lesson})))) || [];
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const currentLesson = allLessons[currentLessonIndex];
  const [lessonContent, setLessonContent] = useState(null);
  // console.log("CURRENT: ", currentLesson);


  // console.log("All Lessons: ", allLessons);

  const handleLessonSelect = (lessonId) => {
    const selectedLessonIndex = allLessons.findIndex((lesson) => lesson.id == lessonId);
    const selectedLesson = allLessons[selectedLessonIndex];
    if(!selectedLesson.is_unlocked) return;
    setCurrentLessonIndex(selectedLessonIndex);
  };

  const goToNext = () => {
    if(currentLessonIndex < allLessons.length - 1 || allLessons[currentLessonIndex+1]?.is_unlocked){
      setCurrentLessonIndex(prev => prev + 1);
    }
  }

  const goToPrevious = () => {
    if(currentLessonIndex > 0){
      setCurrentLessonIndex(prev => prev - 1);
    }
  }

  useEffect(() => {
    const fetchLessonContent = async () => {
      if(!currentLesson) return;
      try{
        const response = await api.get(`/api/lessons/${currentLesson?.id}/`);
        const data = response.data;
        setLessonContent(data);
        console.log("Lesson Content --------->", data);
      }catch(err){
        console.error(err);
      }
    };
    fetchLessonContent();
  }, [currentLesson?.id])

  useEffect(() => {
    const timer = setTimeout(() => {
      if(currentLesson){
        api.post(`/api/lessons/${currentLesson.id}/accessed/`);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [currentLesson?.id])

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <div className="w-72 border-r bg-slate-50 overflow-y-auto p-4">
        <button
          onClick={() => navigate("/dashboard/")}
          className="mb-4 text-blue-600 text-sm hover:underline"
        >
          ← Back to Dashboard
        </button>

        <h2 className="font-bold text-lg mb-2">{course?.title}</h2>
        {course?.modules.map((module) => (
          <div key={module.id} className="mb-4">
            <h3 className="font-semibold text-sm mb-1">{module?.title}</h3>
            <ul className="ml-2">
              {module?.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  onClick={() => handleLessonSelect(lesson.id)}
                  className={`cursor-pointer px-2 py-1 rounded text-sm ${
                    currentLesson?.id === lesson.id
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-slate-100"
                  } ${
                    lesson?.is_unlocked
                      ? ""
                      : "text-gray-400 !cursor-not-allowed hover:!bg-slate-50"
                  }`}
                >
                  {lesson?.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-xl font-bold mb-4">{currentLesson?.title}</h1>

        {currentLesson?.type === "VIDEO" ? (
          <video
            controls
            className="w-full max-w-4xl mb-6 rounded-lg shadow"
            src={lessonContent?.content}
          />
        ) : (
          <div
            className="prose max-w-3xl mb-6"
            dangerouslySetInnerHTML={{ __html: lessonContent?.content }}
          />
        )}

        <div className="flex gap-4">
          <button
            onClick={goToPrevious}
            disabled={currentLessonIndex == 0}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={goToNext}
            disabled={currentLessonIndex == allLessons.length-1 || !allLessons[currentLessonIndex+1]?.is_unlocked }
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
