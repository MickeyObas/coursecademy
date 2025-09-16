import { useParams } from "react-router-dom";
import api from "../utils/axios";
import type { Current } from "../types/Question";

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

  const { assessmentType, sessionId, testSessionId } = useParams();

  const handleAnswerSave = async () => {
    if(!current) return;
    // Save to local storage?
    localStorage.setItem('answers', JSON.stringify(answers));
  
    try {
      // Check what the question belongs to
      let response;
      if(assessmentType){
        response = await api.post(`/api/sessions/lesson/${sessionId}/save-answer/`, {
          question_id: current?.id,
          session_id: sessionId,
          answer: answers[current?.id],
          assessment_type: assessmentType
        })
      }else{
        response = await api.post(`/api/sessions/${testSessionId}/save-answer/`, {
          question_id: current?.id,
          test_session_id: testSessionId,
          answer: answers[current?.id]
        });
      }
      const data = response.data;
      console.log(data);
    } catch (error: any){
      if(error.response.data){
        console.error(error.response.data);
      }else{
        console.error(error);
      }
    }
  }

  return (
  <div className="w-full bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-8 flex flex-col justify-between select-none">
    {/* Header */}
    <div>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        Question {currentIndex + 1} of {totalQuestions}
      </h2>

      {/* Question Renderer */}
      <div>
        {current?.type === "FIB" && (
          <FIBQuestion
            current={current}
            handleFIBInput={handleFIBInput}
            answers={answers}
          />
        )}

        {current?.type === "MCQ" && (
          <MCQQuestion
            current={current}
            handleMCQInput={handleMCQInput}
            answers={answers}
          />
        )}

        {current?.type === "TF" && (
          <TFQuestion
            current={current}
            handleTFInput={handleTFInput}
            answers={answers}
          />
        )}
      </div>
    </div>

    {/* Navigation */}
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-8">
      {/* Previous */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className={`cursor-pointer w-full sm:w-auto px-4 py-2 rounded-lg text-white transition ${
          currentIndex === 0
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-gray-600 hover:bg-gray-700"
        }`}
      >
        Previous
      </button>

      {/* Right-side actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {/* Save (only for test assessments) */}
        {assessmentType === "test" && (
          <button
            onClick={handleAnswerSave}
            className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            {`${current.id in answers ? "Saved" : "Save Answer"}`}
          </button>
        )}

        {/* Next / Finish */}
        {currentIndex === totalQuestions - 1 ? (
          <button
            onClick={onSubmit}
            className="cursor-pointer w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Finish
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="cursor-pointer w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
  const parts = current?.text.split("______");
  const value = 
    answers[current?.id] ??
    "";

  return (
    <p className="mt-2 text-gray-700">
      {parts[0]}
      <input
        type="text"
        value={value}
        onChange={(e) => handleFIBInput(current?.id, e.target.value)}
        className="max-w-[100px] sm:max-w-[150px] md:max-w-[200px] text-base border-b-2 border-blue-500 outline-none px-2 mx-1"
      />
      {parts[1]}
    </p>
  );
}

const TFQuestion = ({current, answers, handleTFInput}: TFQuestionProps) => {
  const value = 
    answers[current?.id] ??
    // localAnswers[current?.question.id] ??
    "";

  return (
    <>
      <p className="mt-2 text-gray-700">{current?.text}</p>
      <div className="space-y-3 flex flex-col mt-4">
        <label className="gap-3 p-3 cursor-pointer">
          <input 
            className="cursor-pointer mr-1.5"
            type="radio" 
            checked={value === "true"}
            onChange={() => handleTFInput(current?.id, "true")}
            />
          <span className="text-gray-800">True</span>
        </label>
        <label className="gap-3 p-3 cursor-pointer">
          <input 
            className="cursor-pointer mr-1.5"
            type="radio" 
            checked={value === "false"}
            onChange={() => handleTFInput(current?.id, "false")}
            />
          <span className="text-gray-800">False</span>
        </label>
      </div>
    </>
  );
}

const MCQQuestion = ({current, answers, handleMCQInput}: MCQQuestionProps) => {
  if(!current) return;
  const value = 
    answers[current?.id] ??
    "";

  return (
    <>
      <p className="mt-2 text-gray-700">{current?.text}</p>
      <div className="space-y-3 mt-4">
        {current?.details?.options?.map((opt) => (
          <label
            key={opt.id}
            className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <input
              type="radio"
              name={`question-${current.order}`}
              value={opt.id}
              checked={value == opt.id}
              onChange={() => handleMCQInput(current?.id, opt.id)}
              className="form-radio text-blue-600"
            />
            <span className="text-gray-800">{opt.text}</span>
          </label>
        ))}
      </div>
    </>
  )
}