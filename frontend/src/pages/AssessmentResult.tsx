import { CheckCircle, XCircle } from "lucide-react";
import type { ResultAnswer } from "../types/Question";

interface Result {
  score: number;
  answers: ResultAnswer[],
  correct: number;
}

export default function AssessmentResult({ result }: { result: Result }) {
  const total = result.answers.length;
  const passed = result.score >= 50;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Score Summary */}
      <div className="bg-white shadow rounded-2xl p-6 sm:p-8 text-center">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          Your Performance
        </h2>
        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          {result.correct} / {total}
        </p>
        <p
          className={`mt-2 text-sm sm:text-base font-medium ${
            passed ? "text-green-600" : "text-red-600"
          }`}
        >
          {passed ? "You passed!" : "You didn’t pass"}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mt-4">
          <div
            className={`h-2 sm:h-3 rounded-full ${
              passed ? "bg-green-500" : "bg-red-500"
            }`}
            style={{ width: `${result.score}%` }}
          />
        </div>
        <p className="mt-2 text-xs sm:text-sm text-gray-500">
          {result.score}% correct
        </p>
      </div>

      {/* Detailed answers */}
      <div className="mt-8 grid gap-4 sm:gap-6 md:grid-cols-2">
        {result.answers.map((answer, index) => {
          const questionText = answer.question_text;
          let hasBlank = false;
          let parts: string[] = [];
          if(/_{6}/.test(questionText)){
            hasBlank = true;
            parts = questionText.split("______");
          }
          
          return (
            <div
            key={index}
            className={`p-4 sm:p-5 rounded-xl shadow-sm border transition ${
              answer.is_correct
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {answer.is_correct ? (
                <CheckCircle
                  className="text-green-500 flex-shrink-0 mt-1"
                  size={20}
                />
              ) : (
                <XCircle
                  className="text-red-500 flex-shrink-0 mt-1"
                  size={20}
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base">
                  {hasBlank ? (
                    <>
                      {parts[0]}
                      <input
                        type="text"
                        disabled={true}
                        className="max-w-[75px] sm:max-w-[100px] text-base border-b-2 border-black outline-none px-2 mx-1 mb-1.5"
                      />
                      {parts[1]}
                      </>
                  ) : (
                    answer.question_text
                  )}
                </p>
                <p className="text-xs sm:text-sm mt-1">
                  <span className="font-semibold">Your Answer:</span>{" "}
                  <span
                    className={
                      answer.is_correct ? "text-green-600" : "text-red-600"
                    }
                  >
                    {answer.user_answer ?? "No answer provided"}
                  </span>
                </p>
                {!answer.is_correct && (
                  <p className="text-xs sm:text-sm mt-1">
                    <span className="font-semibold">Correct Answer:</span>{" "}
                    <span className="text-green-600">
                      {answer.correct_answer}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
          )
          
        })}
      </div>
    </div>
  );
}
