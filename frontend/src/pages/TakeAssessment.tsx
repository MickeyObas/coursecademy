import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuestionCard from "./QuestionCard";
import api from "../utils/axios";
import type { Answers, Current } from "../types/Question";
import { LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";

type Assessment = {
  id: number,
  courseSlug: string,
  sessionId?: number
}

const TakeAssessment = () => {
  const navigate = useNavigate();
  const { assessmentType, sessionId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(
    JSON.parse(localStorage.getItem("answers") || "{}")
  );
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState<Current | null>(null);
  const ready = assessment && current;

  useEffect(() => {
    const fetchAssessmentSessionData = async () => {
      const response = await api.get(`/api/sessions/${sessionId}/${assessmentType}/`);
      const data = response.data;
      console.log(data);
      setQuestions(data.questions);
      setAssessment({
        id: data.assessmentId,
        courseSlug: data.courseSlug,
      })
    } 
    fetchAssessmentSessionData();
  }, [sessionId])

  useEffect(() => {
    if(!questions.length) return;
    setCurrent(questions[currentQuestionIndex]);
  }, [questions, currentQuestionIndex])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Chrome shows default message
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleNext = () => {
    currentQuestionIndex < questions?.length - 1 && setCurrentQuestionIndex((curr) => curr + 1);
  }

  const handlePrev = () => {
    currentQuestionIndex > 0 && setCurrentQuestionIndex((curr) => curr - 1);
  }

  const handleMCQInput = (questionId: number, optionId: number) => {
    if(current?.type == "MCQ"){
      setAnswers((prev) => ({...prev, [questionId]: optionId}))
    }
  }

  const handleFIBInput = (questionId: number, textInput: string) => {
    setAnswers((prev) => ({...prev, [questionId]: textInput}))
  }

  const handleTFInput = (questionId: number, tfInput: string) => {
    setAnswers((prev) => ({...prev, [questionId]: tfInput}))
  }

  const submitAsssessment = async () => {
    if(Object.keys(answers).length === 0){
      toast.error("Uhm, this is awkward. You haven't answered any question 😳", { duration: 4000});
      return;
    }
    if(!assessment) return;

    const unsavedAnswers = questions.length - Object.keys(answers).length;
    console.log(`You have ${unsavedAnswers} unanswered or unsaved questions left.`);

    try{
      const response = await api.post(`/api/assessments/${assessmentType}/${assessment.id}/submit/${sessionId}/`, {
        test_session_id: assessment?.sessionId,
        answers: answers
      })
      const next = response.data;
      if(next.type === "retry_lesson"){
        toast.error("Whoops. You didn't quite hit the pass mark. Let's review the lesson and try again.", {duration: 4000});
        setTimeout(() => navigate(next.url), 2000);
        ;
      }else if(next.type === "lesson"){
        toast.success("Let's gooo. You passed the test. On to the next!", {duration: 4000});
        setTimeout(() => navigate(next.url), 2000);
      }else if(next.type === "end"){
        toast.success("Wohooo, you have completed this course! Go check out your new certificate!", {duration: 4000});
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err){
      console.error(err);
    } finally {
      localStorage.removeItem('answers');
      localStorage.removeItem('questions');
    }
  }


  return (
  <div className="flex h-dvh md:h-screen w-full justify-center items-center bg-slate-50 px-4">
    {ready ? (
      <div className="w-full max-w-3xl">
        <QuestionCard
          current={current}
          currentIndex={currentQuestionIndex}
          totalQuestions={questions?.length}
          answers={answers}
          handleMCQInput={handleMCQInput}
          handleFIBInput={handleFIBInput}
          handleTFInput={handleTFInput}
          handleNext={handleNext}
          handlePrev={handlePrev}
          onSubmit={submitAsssessment}
        />
      </div>
    ) : (
      <div className="flex flex-col items-center text-center space-y-6">
        <span className="block text-lg sm:text-2xl md:text-3xl font-medium text-gray-700">
          Just a sec. We're loading your questions...
        </span>
        <LoaderCircle className="animate-spin w-16 h-16 sm:w-24 sm:h-24 text-blue-600" />
      </div>
    )}
  </div>
);

}

export default TakeAssessment;