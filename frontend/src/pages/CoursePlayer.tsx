import { useEffect, useRef, useState } from "react";
import { data, useLocation, useNavigate, useParams } from "react-router-dom";
import { useCourse } from "../hooks/useCourse";
import api from "../utils/axios";


export default function CoursePlayer() {
  // Lowkey don't think this is a good way to use location.state
  // NOTE: Rewrite state mgmt logic later

  const location = useLocation();
  const { assessmentResult } = location.state || {};
  const { courseSlug, lessonId } = useParams();
  const { course, refetchCourse } = useCourse(courseSlug || '');
  const navigate = useNavigate();
  const lessonBody = useRef(null);


  const allLessons = course?.modules?.flatMap(module => module.lessons.map((lesson => ({...lesson})))) || [];
  const [currentLessonIndex, setCurrentLessonIndex] = useState<null | number>(null);
  const currentLesson = allLessons.find((l) => l.id == lessonId);
  console.log(currentLesson);
  const [lessonContent, setLessonContent] = useState(null);
  const lastLessonSpawned = useRef(false);

  const handleLessonSelect = (lessonId) => {
    const selectedLessonIndex = allLessons.findIndex((lesson) => lesson.id == lessonId);
    const selectedLesson = allLessons[selectedLessonIndex];
    if(!selectedLesson.is_unlocked) return;
    setCurrentLessonIndex(selectedLessonIndex);
    navigate(`/courses/${courseSlug}/lessons/${lessonId}`);
    return;
  };

  const goToNext = async () => {

    if(currentLesson.has_assessment){
      const response = await api.post(`/api/assessments/lessons/${currentLesson?.id}/start/`);
      const data = response.data;
      const assessmentSessionId = data.assessment_session_id;
      navigate(`/take-assessment/lesson/${currentLesson?.id}/sessions/${assessmentSessionId}/`);
      return;
    }

    if(currentLessonIndex < allLessons.length - 1 || allLessons[currentLessonIndex+1]?.is_unlocked){
      const response = await api.patch(`/api/lessons/${currentLesson?.id}/complete/`);
      refetchCourse();
      const data = response.data;
      // await refetchCourse();
      console.log("Current lesson IDX --->", currentLessonIndex);
      const nextLesson = allLessons[currentLessonIndex+1];
      navigate(`/courses/${courseSlug}/lessons/${nextLesson.id}`)
      setCurrentLessonIndex(prev => prev + 1);
    }
  }

  const goToPrevious = () => {
    if(currentLessonIndex > 0){
      const previousLesson = allLessons[currentLessonIndex-1];
      navigate(`/courses/${courseSlug}/lessons/${previousLesson.id}`)
      setCurrentLessonIndex(prev => prev - 1);
    }
  }

  const handleFinishCourse = async () => {
    const response = await api.patch(`/api/lessons/${currentLesson?.id}/complete/`);
    const { data } = response.data;
    console.log(data);
    navigate(`/courses/${courseSlug}/assessment/`);
  }

  useEffect(() => {
    // Scroll to top
    if(lessonBody.current){
      lessonBody.current.scrollTo({top: 0, left: 0, behavior: 'instant'})
    }
  }, [currentLessonIndex])

  useEffect(() => {
    const fetchLessonContent = async () => {
      // if(!currentLesson) return;
      try{
        const response = await api.get(`/api/lessons/${lessonId}/`);
        const data = response.data;
        console.log("Lesson Content", data);
        setLessonContent(data);
      }catch(err){
        console.error(err);
      }
    };
    fetchLessonContent();
  }, [lessonId])

  useEffect(() => {
  if (allLessons.length > 0 && lessonId) {
    const lessonIndex = allLessons.findIndex(
      (lesson) => Number(lesson.id) === Number(lessonId)
    );
    if (lessonIndex !== -1) {
      setCurrentLessonIndex(lessonIndex);
    }
  }
}, [allLessons, lessonId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if(currentLesson){
        api.post(`/api/lessons/${currentLesson.id}/accessed/`);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [currentLesson?.id])
 

  if (!course || !currentLesson || !lessonContent) {
  return <div className="p-6">Loading lesson...</div>;
}

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
      <div ref={lessonBody} className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-xl font-bold mb-4">{currentLesson?.title}</h1>

        {currentLesson?.type === "VIDEO" ? (
          <VideoPlayer 
            lessonId={lessonId}
            videoUrl={lessonContent?.video_file}
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
          ) : currentLessonIndex == allLessons.length - 1 
            ? (
              <button
                onClick={handleFinishCourse} // Take course assessment
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
              Finish Course
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

const VideoPlayer = ({lessonId, videoUrl}) => {
  const videoRef = useRef(null);
  const [savedProgress, setSavedProgress] = useState(null);

  useEffect(() => {
    const fetchLessonVideoProgress = async () => {
      const response = await api.get(`/api/lessons/${lessonId}/progress/`);
      const { data } = response;
      console.log(data);
      setSavedProgress(data.progress);
    };
    fetchLessonVideoProgress(); 
  }, [lessonId])

  useEffect(() => {
  if(!videoRef.current || savedProgress == null) return;

    const video = videoRef.current;

    const seekToSaved = () => {
      if(savedProgress > 0 && video.readyState >= 1){
        video.currentTime = savedProgress;
      }
    }

    video.addEventListener("loadedmetadata", seekToSaved);

    return () => {
      video.removeEventListener("loadedmetadata", seekToSaved)
    }
  }, [savedProgress]);

  useEffect(() => {
    const interval = setInterval(() => {
      if(videoRef.current){
        const currentTime = Math.floor(videoRef.current.currentTime);
        if(currentTime > 0){
          api.post(`/api/lessons/${lessonId}/progress/update/`, {
            current_time: Math.floor(videoRef.current.currentTime)}
          );
        }
      }
    }, 5000)
    return () => clearInterval(interval);
  }, [lessonId])

  return (
    <video
      ref={videoRef}
      controls
      className="w-full max-w-4xl mb-6 rounded-lg shadow"
      src={videoUrl}
    />
  )

}