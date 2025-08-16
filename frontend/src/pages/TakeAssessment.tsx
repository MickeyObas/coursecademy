import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import QuestionCard from "./QuestionCard";
import api from "../utils/axios";

const TakeAssessment = () => {
  const navigate = useNavigate();
  const { lessonId, assessmentType, modelId } = useParams();
  const location = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(
    JSON.parse(localStorage.getItem("answers") || "{}")
  );
  const [assessment, setAssessment] = useState(null);
  const questions = location.state?.questions || assessment?.questions;
  const current = questions[currentQuestionIndex];


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
      setAssessment(location.state);
    } else{
      const saved = sessionStorage.getItem('assessment');
      if(saved){
        setAssessment(JSON.parse(saved));
      }else{
        console.log("Whoops, bad state management :(");
      }
    }
  }, [location.state, lessonId]);

  const handleNext = () => {
    currentQuestionIndex < questions?.length - 1 && setCurrentQuestionIndex((curr) => curr + 1);
  }

  const handlePrev = () => {
    currentQuestionIndex > 0 && setCurrentQuestionIndex((curr) => curr - 1);
  }

  const handleMCQInput = (questionId: number, optionId: number) => {
    if(current?.question.type == "MCQ"){
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
    const unsavedAnswers = questions.length - Object.keys(answers).length;
    console.log(`You have ${unsavedAnswers} unanswered or unsaved questions left.`);

    try{
      const response = await api.post(`/api/assessments/${assessmentType}/${assessment?.assessmentId}/submit/${assessment?.sessionId}/`, {
        test_session_id: assessment?.sessionId
      })
      const data = response.data;
      console.log(data);
      const score = data.score;
      if(score >= 50){
        navigate(`/course-player/${assessment?.courseSlug}/`, { state: {assessmentResult: 'pass', lessonId: data.lessonId}}); // To the next lesson setCurrentLessonIndex
      }else{
        alert("Whoops. You didn't get a pass mark. Try taking the assessment again");
        navigate(`/course-player/${assessment?.courseSlug}/`, { state: {assessmentResult: 'fail', lessonId: data.lessonId}});
      }
      localStorage.removeItem('answers');
      localStorage.removeItem('questions');
      sessionStorage.removeItem('assessment');
    }catch(error: any){
      if(error.response.data){
        console.error(error.response.data);
      }else{
        console.error(error);
      }
    }
  }

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="">
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
          onSubmit={submitAsssessment}
        />
      </div>
    </div>
  );
}

export default TakeAssessment;