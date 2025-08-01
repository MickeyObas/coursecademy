import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import QuestionCard from "./QuestionCard";
import api from "../utils/axios";


const TakeTest = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const location = useLocation();
  const questions = location.state?.questions;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(
    JSON.parse(localStorage.getItem("answers") || "{}")
  );
  const current = questions[currentQuestionIndex];

  const handleNext = () => {
    currentQuestionIndex < questions?.length - 1 && setCurrentQuestionIndex((curr) => curr + 1);
  }

  const handlePrev = () => {
    currentQuestionIndex > 0 && setCurrentQuestionIndex((curr) => curr - 1);
  }

  const handleMCQInput = (questionId: number, optionId: number) => {
    console.log("Clicked", questionId, optionId);
    if(current.question.type == "MCQ"){
      setAnswers((prev) => ({...prev, [questionId]: optionId}))
    }
    console.log(answers);
  }

  const handleFIBInput = (questionId: number, textInput: string) => {
    setAnswers((prev) => ({...prev, [questionId]: textInput}))
  }

  const handleTFInput = (questionId: number, tfInput: string) => {
    setAnswers((prev) => ({...prev, [questionId]: tfInput}))
  }

  const submitTest = async () => {
    console.log(answers);
    // Check for unsaved questions and notify user
    // Change status to submitted
    try{
      const response = await api.post(`/api/assessments/${sessionId}/test/submit/`, {
        test_session_id: sessionId
      })
      const data = await response.data;
      console.log(data);
      localStorage.removeItem('answers');
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