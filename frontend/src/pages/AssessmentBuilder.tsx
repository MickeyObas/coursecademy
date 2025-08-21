import { useState } from "react";

type Question = {
  type: "MCQ" | "TF" | "FIB";
  text: string;
  options?: string[];
  answer: string;
};

export default function AssessmentBuilder() {
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () =>
    setQuestions([
      ...questions,
      { type: "MCQ", text: "", options: ["", "", "", ""], answer: "" },
    ]);

  const updateQuestion = (index: number, updated: Question) => {
    const newQ = [...questions];
    newQ[index] = updated;
    setQuestions(newQ);
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-6">
      <button
        onClick={addQuestion}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        + Add Question
      </button>

      {questions.map((q, i) => (
        <div key={i} className="border rounded-lg p-4 bg-gray-50 shadow">
          <h3 className="font-semibold mb-2">Question {i + 1}</h3>

          <select
            className="border rounded-lg p-2 mb-2 w-full"
            value={q.type}
            onChange={(e) =>
              updateQuestion(i, { ...q, type: e.target.value as any })
            }
          >
            <option value="MCQ">Multiple Choice</option>
            <option value="TF">True/False</option>
            <option value="FIB">Fill in the Blank</option>
          </select>

          <textarea
            placeholder="Question text"
            className="w-full border rounded-lg p-2 mb-2"
            value={q.text}
            onChange={(e) => updateQuestion(i, { ...q, text: e.target.value })}
          />

          {q.type === "MCQ" && (
            <div className="space-y-2">
              {q.options?.map((opt, j) => (
                <input
                  key={j}
                  type="text"
                  placeholder={`Option ${j + 1}`}
                  className="w-full border rounded-lg p-2"
                  value={opt}
                  onChange={(e) => {
                    const opts = [...(q.options || [])];
                    opts[j] = e.target.value;
                    updateQuestion(i, { ...q, options: opts });
                  }}
                />
              ))}
              <input
                type="text"
                placeholder="Correct Answer (type option exactly)"
                className="w-full border rounded-lg p-2"
                value={q.answer}
                onChange={(e) =>
                  updateQuestion(i, { ...q, answer: e.target.value })
                }
              />
            </div>
          )}

          {q.type === "TF" && (
            <select
              className="border rounded-lg p-2 w-full"
              value={q.answer}
              onChange={(e) =>
                updateQuestion(i, { ...q, answer: e.target.value })
              }
            >
              <option value="">Select Answer</option>
              <option value="True">True</option>
              <option value="False">False</option>
            </select>
          )}

          {q.type === "FIB" && (
            <input
              type="text"
              placeholder="Correct Answer"
              className="w-full border rounded-lg p-2"
              value={q.answer}
              onChange={(e) =>
                updateQuestion(i, { ...q, answer: e.target.value })
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}
