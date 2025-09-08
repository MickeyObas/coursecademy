import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuestionCard from "./QuestionCard";
import api from "../utils/axios";
import type { Answers, Current, Question, QuestionType } from "../types/Question";

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
    if(!assessment) return;

    const unsavedAnswers = questions.length - Object.keys(answers).length;
    console.log(`You have ${unsavedAnswers} unanswered or unsaved questions left.`);

    try{
      const response = await api.post(`/api/assessments/${assessmentType}/${assessment.id}/submit/${sessionId}/`, {
        test_session_id: assessment?.sessionId
      })
      const next = response.data;
      if(next.type === "retry_lesson"){
        alert("Whoops. You didn't quite hit the pass mark. Let's review the lesson and try again.");
        navigate(next.url);
      }else if(next.type === "lesson"){
        navigate(next.url);
      }else if(next.type === "end"){
        alert("Wohooo, you have completed this course!");
        navigate("/");
      }
    } catch (err){
      console.error(err);
    } finally {
      localStorage.removeItem('answers');
      localStorage.removeItem('questions');
    }
  }

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="">
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
    </div>
  );
}

export default TakeAssessment;