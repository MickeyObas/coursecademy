import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCourse } from "../hooks/useCourse";
import api from "../utils/axios";
import type { Lesson } from "../types/Course";
import { useRateLimit } from "../contexts/RateLimitContext";
import toast from "react-hot-toast";
import { X, Menu } from "lucide-react"; 


export default function CoursePlayer() {
  const { isRateLimited, cooldown } = useRateLimit();
  console.log(isRateLimited, cooldown);
  const { courseSlug, lessonId } = useParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { course, refetchCourse } = useCourse(courseSlug || '');
  const navigate = useNavigate();
  const prevLessonId = useRef<string | undefined>(undefined);
  const lessonBody = useRef<HTMLDivElement | null>(null);

  const allLessons = course?.modules?.flatMap(module => module.lessons.map((lesson => ({...lesson})))) || [];
  const [currentLessonIndex, setCurrentLessonIndex] = useState<null | number>(null);
  const currentLesson = allLessons.find((l) => l.id === Number(lessonId));
  const [lessonContent, setLessonContent] = useState<Lesson | null>(null); 

  useEffect(() => {
    if(isRateLimited){
      toast.error(`Sorry about that, you're being rate-limited. Please try again in ${cooldown} seconds.`, {duration: 4000})
    }
  }, [lessonId])

  const handleLessonSelect = (lessonId: number) => {
    const selectedLessonIndex = allLessons.findIndex((lesson) => lesson.id == lessonId);
    const selectedLesson = allLessons[selectedLessonIndex];
    if(!selectedLesson.is_unlocked) return;
    setCurrentLessonIndex(selectedLessonIndex);
    navigate(`/courses/${courseSlug}/lessons/${lessonId}`);
    setMobileSidebarOpen(false);
    return;
  };

  const goToNext = async () => {
    try {
      const response = await api.get(`/api/courses/${courseSlug}/next-step/`, {
        params: { current_lesson: lessonId}
      });
      const next = response.data;
      if(next.type === "lesson"){
        navigate(next.url);
      }else if(next.type === "assessment"){
        navigate(next.url);
      }
      console.log(next);
    }catch (err){
      console.error(err);
    }finally {
      refetchCourse();
    }
  }

  const goToPrevious = () => {
    if(!currentLessonIndex) return;
    if(currentLessonIndex > 0){
      const previousLesson = allLessons[currentLessonIndex-1];
      navigate(`/courses/${courseSlug}/lessons/${previousLesson.id}`)
      setCurrentLessonIndex(prev => prev && prev - 1);
    }
  }

  const handleFinishCourse = async () => {
    const response = await api.patch(`/api/lessons/${currentLesson?.id}/complete/`);
    const { data } = response.data;
    console.log(data);
    navigate(`/courses/${courseSlug}/assessment/`);
  }

  useLayoutEffect(() => {
    // Scroll to top
    if(lessonBody.current){
      lessonBody.current.scrollTo({top: 0, left: 0, behavior: 'instant'})
    }
  }, [lessonContent])

  useEffect(() => {
    const fetchLessonContent = async () => {
      // if(!currentLesson) return;
      try{
        const response = await api.get(`/api/lessons/${lessonId}/`);
        const data = response.data;
        setLessonContent(data);
        prevLessonId.current = lessonId;
      }catch(err: any){
        console.error(err);
        if(err.response.status === 403){
          alert("You do not have access to lesson.");
          if(prevLessonId.current){
            navigate(`/courses/${courseSlug}/lessons/${prevLessonId.current}/`);
          }else{
            navigate(`/dashboard/courses/${courseSlug}/`);
          }
        }
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
    }, 1000);
    return () => clearInterval(timer);
  }, [currentLesson?.id])
 

  if (!course || !currentLesson || !lessonContent) {
  return <div className="p-6">Loading lesson...</div>;
}

  return (
    <div className="flex h-dvh font-sans">
      {/* Mobile Sidebar (Drawer) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="w-72 bg-slate-50 border-r p-4 overflow-y-auto relative">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X size={20} />
            </button>

            <button
              onClick={() => navigate("/dashboard/")}
              className="cursor-pointer mb-4 text-blue-600 text-sm hover:underline"
            >
              ← Back to Dashboard
            </button>

            <h2 className="font-bold text-lg mb-2">{course?.title}</h2>

            {course?.modules.map((module) => (
              <div key={module.id} className="mb-4">
                <h3 className="font-semibold text-sm mb-1">{module?.title}</h3>
                <ul className="ml-2 space-y-1">
                  {module?.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      onClick={() =>
                        lesson?.is_unlocked ? handleLessonSelect(lesson.id) : null
                      }
                      className={`cursor-pointer px-2 py-1 rounded text-sm transition ${
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
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 border-r bg-slate-50 overflow-y-auto p-4">
        <button
          onClick={() => navigate("/dashboard/")}
          className="cursor-pointer mb-4 text-blue-600 text-sm hover:underline"
        >
          ← Back to Dashboard
        </button>

        <h2 className="font-bold text-lg mb-2">{course?.title}</h2>

        {course?.modules.map((module) => (
          <div key={module.id} className="mb-4">
            <h3 className="font-semibold text-sm mb-1">{module?.title}</h3>
            <ul className="ml-2 space-y-1">
              {module?.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  onClick={() =>
                    lesson?.is_unlocked ? handleLessonSelect(lesson.id) : null
                  }
                  className={`cursor-pointer px-2 py-1 rounded text-sm transition ${
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
      </aside>

      {/* Main Content */}
      <main
        ref={lessonBody}
        className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto"
      >
        {/* Mobile Nav Button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex items-center gap-2 text-sm text-blue-600"
          >
            <Menu size={18} /> Lessons
          </button>
        </div>

        {/* Lesson Title */}
        <h1 className="text-xl font-bold mb-4">{currentLesson?.title}</h1>

        {/* Video or Content */}
        {currentLesson?.type === "VIDEO" ? (
          <div className="w-full max-w-4xl aspect-video mb-6">
            <VideoPlayer
              lessonId={lessonId}
              videoUrl={lessonContent?.video_file}
            />
          </div>
        ) : (
          <div
            className="prose max-w-3xl mb-6"
            dangerouslySetInnerHTML={{
              __html: lessonContent?.content || "",
            }}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-3 mt-auto">
          <button
            onClick={goToPrevious}
            disabled={currentLessonIndex === 0}
            className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentLesson?.has_assessment ? (
            <button
              onClick={goToNext}
              className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Proceed to Test
            </button>
          ) : currentLessonIndex === allLessons.length - 1 ? (
            <button
              onClick={handleFinishCourse}
              className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Finish Course
            </button>
          ) : (
            <button
              onClick={goToNext}
              disabled={currentLessonIndex === allLessons.length - 1}
              className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      </main>
    </div>
  );
}



const VideoPlayer = ({lessonId, videoUrl}: {lessonId: string | undefined, videoUrl: string | undefined}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [savedProgress, setSavedProgress] = useState(null);

  useEffect(() => {
    const fetchLessonVideoProgress = async () => {
      const response = await api.get(`/api/lessons/${lessonId}/progress/`);
      const { data } = response;
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
  <div className="w-full max-w-4xl mx-auto mb-6">
    <video
      ref={videoRef}
      controls
      className="w-full aspect-video rounded-lg shadow-lg bg-black"
      src={videoUrl}
    >
      Sorry, your browser does not support embedded videos.
    </video>
  </div>
);


}