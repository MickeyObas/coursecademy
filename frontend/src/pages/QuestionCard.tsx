import { useLocation, useParams } from "react-router-dom";
import api from "../utils/axios";

type QuestionType = "MCQ" | "FIB" | "TF";

type Question = {
  id: number;
  text: string;
  type: QuestionType;
  details?: {
    options?: { id: number; text: string }[];
  };
};

type Current = {
  order: number,
  question: Question
}

type AnswersMap = {
  [key: number]: string | number
}

type QuestionCardProps = {
  current: Current,
  currentIndex: number,
  totalQuestions: number,
  answers: AnswersMap,
  handleMCQInput: (questionId: number, optionId: number) => void,
  handleFIBInput: (questionId: number, textInput: string) => void,
  handleTFInput: (questionId: number, tfInput: string) => void,
  handleNext: () => void,
  handlePrev: () => void,
  onSubmit: () => void,
}

type FIBQuestionProps = {
  current: Current,
  answers: AnswersMap,
  handleFIBInput: (questionId: number, textInput: string) => void
}

type TFQuestionProps = {
  current: Current,
  answers: AnswersMap,
  handleTFInput: (questionId: number, tfInput: string) => void
}

type MCQQuestionProps = {
  current: Current,
  answers: AnswersMap,
  handleMCQInput: (questionId: number, optionId: number) => void
}


export default function QuestionCard({
  current,
  currentIndex,
  totalQuestions,
  answers,
  handleMCQInput,
  handleFIBInput,
  handleTFInput,
  handleNext,
  handlePrev,
  onSubmit
}: QuestionCardProps) {

  const location = useLocation();
  const { modelId, assessmentType, testSessionId } = useParams();
  // assessmentType = enum(lesson, module, course);
  // moduleId is the lesson|module|course + id
  // If it's a lession assessment, an assessment key will be in the session storage
  const stored = sessionStorage.getItem('assessment');
  const assessment = stored ? JSON.parse(stored) : null;
  const sessionId = assessment?.sessionId || null;


  const handleAnswerSave = async () => {
    // Save to local storage?
    localStorage.setItem('answers', JSON.stringify(answers));
  
    try {
      // Check what the question belongs to
      let response;
      if(assessmentType){
        response = await api.post(`/api/assessments/lesson/${sessionId}/save-answer/`, {
          question_id: current.question.id,
          session_id: sessionId,
          answer: answers[current.question.id],
          assessment_type: assessmentType
        })
      }else{
        response = await api.post(`/api/assessments/${testSessionId}/save-answer/`, {
          question_id: current.question.id,
          test_session_id: testSessionId,
          answer: answers[current.question.id]
        });
      }
      const data = response.data;
    } catch (error: any){
      if(error.response.data){
        console.error(error.response.data);
      }else{
        console.error(error);
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-md select-none">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Question {currentIndex+1} of {totalQuestions}
        </h2>

        {current.question.type === 'FIB' && (
          <FIBQuestion 
            current={current}
            handleFIBInput={handleFIBInput}
            answers={answers}
          />
        )}
      </div>

      {current.question.type === 'MCQ' && (
        <MCQQuestion 
          current={current}
          handleMCQInput={handleMCQInput}
          answers={answers}
        />
      )}

      {current.question.type === 'TF' && (
        <TFQuestion 
          current={current}
          handleTFInput={handleTFInput}
          answers={answers}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`px-4 py-2 rounded-lg text-white ${
            currentIndex === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          Previous
        </button>
        <div className="flex gap-x-3">
          <button
            onClick={handleAnswerSave}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-blue-700"
          >
            Save Answer
          </button>
          {currentIndex === totalQuestions - 1 ? (
            <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Finish
          </button>
          ) : (
            <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next
          </button>
          )}
        </div>
        
      </div>
    </div>
  );
}

const FIBQuestion = ({current, handleFIBInput, answers}: FIBQuestionProps) => {
  const parts = current?.question.text.split("______");
  const value = 
    answers[current?.question.id] ??
    "";

  return (
    <p className="tmt-2 text-gray-700">
      {parts[0]}
      <input
        type="text"
        value={value}
        onChange={(e) => handleFIBInput(current.question.id, e.target.value)}
        className="border-b-2 border-blue-500 outline-none px-2 mx-1"
      />
      {parts[1]}
    </p>
  );
}

const TFQuestion = ({current, answers, handleTFInput}: TFQuestionProps) => {
  const value = 
    answers[current?.question.id] ??
    // localAnswers[current?.question.id] ??
    "";

  return (
    <>
      <p className="mt-2 text-gray-700">{current.question.text}</p>
      <div className="space-y-3 flex flex-col mt-4">
        <label className="gap-3 p-3 cursor-pointer">
          <input 
            type="radio" 
            checked={value === "true"}
            onChange={() => handleTFInput(current.question.id, "true")}
            />
          <span className="text-gray-800">True</span>
        </label>
        <label className="gap-3 p-3 cursor-pointer">
          <input 
            type="radio" 
            checked={value === "false"}
            onChange={() => handleTFInput(current.question.id, "false")}
            />
          <span className="text-gray-800">False</span>
        </label>
      </div>
    </>
  );
}

const MCQQuestion = ({current, answers, handleMCQInput}: MCQQuestionProps) => {
  const value = 
    answers[current?.question.id] ??
    "";

  return (
    <>
      <p className="mt-2 text-gray-700">{current.question.text}</p>
      <div className="space-y-3 mt-4">
        {current.question.details?.options?.map((opt) => (
          <label
            key={opt.id}
            className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <input
              type="radio"
              name={`question-${current.order}`}
              value={opt.id}
              checked={value == opt.id}
              onChange={() => handleMCQInput(current.question.id, opt.id)}
              className="form-radio text-blue-600"
            />
            <span className="text-gray-800">{opt.text}</span>
          </label>
        ))}
      </div>
    </>
  )
}