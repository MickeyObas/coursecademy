import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import QuestionCard from "./QuestionCard";
import api from "../utils/axios";

const TakeTest = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const location = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(
    JSON.parse(localStorage.getItem("answers") || "{}")
  );
  const questions = location.state?.questions || JSON.parse(localStorage.getItem("questions") || "[]");
  const startedAt = location.state?.startedAt || localStorage.getItem("startedAt");
  const durationMinutes = location.state?.durationMinutes || parseInt(localStorage.getItem("durationMinutes") || "0");
  const current = questions[currentQuestionIndex];
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerReady, setTimeReady] = useState(false);

  useEffect(() => {

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Chrome shows default message
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (location.state) {
      localStorage.setItem("questions", JSON.stringify(location.state.questions));
      localStorage.setItem("startedAt", location.state.startedAt);
      localStorage.setItem("durationMinutes", location.state.durationMinutes.toString());
    }
  }, [location.state]);

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
  }, [sessionId]);

  useEffect(() => {
    if(!timerReady) return;
    if (timeLeft === 0) {
      submitTest();
    }
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
    if(current.question.type == "MCQ"){
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
      const response = await api.post(`/api/assessments/${sessionId}/test/submit/`, {
        test_session_id: sessionId
      })
      const data = response.data;
      localStorage.removeItem('answers');
      localStorage.removeItem('questions');
      localStorage.removeItem('startedAt');
      localStorage.removeItem('durationMinutes');
      navigate('/');
    }catch(error: any){
      if(error.response.data){
        console.error(error.response.data);
      }else{
        console.error(error);
      }
    }
  }

  return (
    <>
      <div className="text-right font-bold text-red-600 text-xl">
        Time left: {formatTime(timeLeft)}
      </div>

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
        submitTest={submitTest}
      />
    </>
  );
}

export default TakeTest;