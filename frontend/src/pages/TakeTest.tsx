import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import QuestionCard from "./QuestionCard";
import api from "../utils/axios";
import type { Answers } from "../types/Question";

const TakeTest = () => {
  const navigate = useNavigate();
  const { testSessionId } = useParams();
  const location = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(
    JSON.parse(localStorage.getItem("answers") || "{}")
  );
  const questions = location.state?.questions || JSON.parse(localStorage.getItem("questions") || "[]");
  const startedAt = location.state?.startedAt || localStorage.getItem("startedAt");
  const durationMinutes = location.state?.durationMinutes || parseInt(localStorage.getItem("durationMinutes") || "0");
  
  const current = questions[currentQuestionIndex];
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerReady, setTimeReady] = useState(false);


  useEffect(() => {
    const fetchTestSession = async () => {
      try{
        const response = await api.get(`/api/sessions/tests/${testSessionId}/`);
        if(response.status === 200){
          const data = response.data;
          console.log(data);
          localStorage.setItem("questions", JSON.stringify(data.questions));
          localStorage.setItem("startedAt", data.started_at);
          localStorage.setItem("durationMinutes", data.duration_minutes.toString());
        }
      }catch(err){
        console.log(err);
      }
    };
    fetchTestSession();
  }, [testSessionId])


  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Chrome shows default message
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const start = new Date(startedAt);
    const duration = durationMinutes * 60 * 1000;
    const end = new Date(start.getTime() + duration);

    const updateRemaining = () => {
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      setTimeLeft(diff > 0 ? diff : 0);
    };

    updateRemaining();
    setTimeReady(true);
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [testSessionId]);

  useEffect(() => {
    if(!timerReady) return;
    if (timeLeft === 0) {
      submitTest();
    }
    console.log(Math.floor(timeLeft / 1000));
  }, [timeLeft, timerReady]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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

  const submitTest = async () => {
    const unsavedAnswers = questions.length - Object.keys(answers).length;
    console.log(`You have ${unsavedAnswers} unanswered or unsaved questions left.`);

    try{
      const response = await api.post(`/api/assessments/${testSessionId}/test/submit/`, {
        test_session_id: testSessionId
      })
      const data = response.data;
      console.log(data);
      localStorage.removeItem('answers');
      localStorage.removeItem('questions');
      localStorage.removeItem('startedAt');
      localStorage.removeItem('durationMinutes');
      navigate('/dashboard/tests/');
    }catch(error: any){
      if(error.response?.data){
        console.error(error.response.data);
      }else{
        console.error(error);
      }
    }
  }

  return (
    <div className="p-5 h-full">
      <div className={`text-right font-bold ${Math.floor(timeLeft / 1000) > 60 ? 'text-blue-600' : 'text-red-600 animate-pulse'} text-xl mb-5`}>
        Time left: {formatTime(timeLeft)}
      </div>

      <div className="flex h-[80%] items-center">
        <QuestionCard 
          current={current}
          currentIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          answers={answers}
          handleMCQInput={handleMCQInput}
          handleFIBInput={handleFIBInput}
          handleTFInput={handleTFInput}
          handleNext={handleNext}
          handlePrev={handlePrev}
          onSubmit={submitTest}
        />
      </div>
      
    </div>
  );
}

export default TakeTest;