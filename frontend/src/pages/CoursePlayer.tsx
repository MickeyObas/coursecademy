import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCourse } from "../hooks/useCourse";
import api from "../utils/axios";


export default function CoursePlayer() {
  const location = useLocation();
  const { assessmentResult, lessonId } = location.state || {};
  console.log("This is the STAttettee ---> ", assessmentResult, lessonId);
  const { courseSlug } = useParams();
  const { course, refetchCourse } = useCourse(courseSlug || '');
  const navigate = useNavigate();
  const allLessons = course?.modules?.flatMap(module => module.lessons.map((lesson => ({...lesson})))) || [];
  console.log(allLessons);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const currentLesson = allLessons[currentLessonIndex];
  const [lessonContent, setLessonContent] = useState(null);

  const handleLessonSelect = (lessonId) => {
    const selectedLessonIndex = allLessons.findIndex((lesson) => lesson.id == lessonId);
    const selectedLesson = allLessons[selectedLessonIndex];
    if(!selectedLesson.is_unlocked) return;
    setCurrentLessonIndex(selectedLessonIndex);
  };

  const goToNext = async () => {

    if(currentLesson.has_assessment){
      const response = await api.post(`/api/assessments/lessons/${currentLesson?.id}/start/`);
      const data = response.data;
      const assessment = {
        assessmentId: data.assessmentId,
        sessionId: data.sessionId,
        questions: data.questions,
        courseSlug: courseSlug
      }
      navigate(`/take-assessment/lesson/${currentLesson?.id}/`, {
        state: assessment
      })
      sessionStorage.setItem('assessment', JSON.stringify(assessment));
      return;
    }

    if(currentLessonIndex < allLessons.length - 1 || allLessons[currentLessonIndex+1]?.is_unlocked){
      // Hit endpoint to mark lesson as completed
      const response = await api.patch(`/api/lessons/${currentLesson?.id}/complete/`);
      const data = response.data;
      await refetchCourse();
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

  useEffect(() => {
    if(!allLessons.length) return;
    console.log("ALL LESSONS ---> ", allLessons);
    if(assessmentResult && lessonId){
      console.log(lessonId, typeof lessonId, allLessons[0]?.id, typeof allLessons[0]?.id);
      const lessonIndex = allLessons.findIndex(lesson => String(lesson.id) === String(lessonId));
      if(assessmentResult == 'pass'){
        console.log("New lesson Index ---> ", lessonIndex);
        setCurrentLessonIndex(lessonIndex + 1);
      }else{
        setCurrentLessonIndex(lessonIndex);
        
      }

      navigate(location.pathname, { replace: true, state: null})
    }
  }, [assessmentResult, lessonId, allLessons])

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
          {currentLesson?.has_assessment ? (
            <button
              onClick={goToNext}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Proceed to Test
            </button>
          ) : (
            <button
              onClick={goToNext}
              disabled={currentLessonIndex == allLessons.length-1 }
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
