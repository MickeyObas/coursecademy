import { useEffect, useState } from "react";
import api from "../utils/axios";
import type { Lesson, ThinCourse } from "../types/Course";
import type { FIBDetails, MCQDetails, Question, QuestionType, TFDetails } from "../types/Question";



export default function AssessmentBuilder() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [courses, setCourses] = useState<ThinCourse[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assessmentType, setAssessmentType] = useState<null | string>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<null | number>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<null | number>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get(`/api/courses/instructed/`);
        setCourses(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    setSelectedLessonId(null);
  }, [assessmentType])

  useEffect(() => {
    if(!selectedCourseId) return;
    const fetchLessons = async () => {
      const response = await api.get(`/api/courses/${selectedCourseId}/lessons/`);
      const data = response.data;
      setLessons(data);
      console.log(data);
    };
    fetchLessons();
  }, [selectedCourseId, assessmentType])

  useEffect(() => {
    if(!selectedCourseId && !selectedLessonId) return;

    const fetchQuestions = async () => {
      if(assessmentType === "lesson"){
        const response = await api.get(`/api/lessons/${selectedLessonId}/questions/`);
        const data = response.data;
        setQuestions(data);
        console.log(data);
      }else if(assessmentType === "course"){
        const response = await api.get(`/api/courses/${selectedCourseId}/questions/`);
        const data = response.data;
        setQuestions(data);
        console.log(data);
      }
    };
    fetchQuestions();
  }, [selectedLessonId, selectedCourseId, assessmentType])

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseId(Number(e.target.value));
    setQuestions([]);
    // setSelectedModule(null);
    // setEditingLesson(null);
  };

  const handleSaveAssessment = async () => {
    console.log(questions);
    // Check assessment_type
    if(assessmentType === "lesson"){
      const response = await api.post(`/api/lessons/${selectedLessonId}/questions/update/`, {
        // lesson_id: selectedLessonId,
        assessment_type_input: assessmentType,
        questions
      });
    const data = response.data;
    console.log(data);
    }else if(assessmentType === "course"){
      const response = await api.post(`/api/courses/${selectedCourseId}/questions/update/`, {
        // course_id: selectedCourseId,
        assessment_type_input: assessmentType,
        questions
      });
    const data = response.data;
    console.log(data);
    }
  }

  const handleLessonAssessment = async (lessonId: number, hasAssessment: boolean) => {
    // If has assessment change lessonId immediately
    if(hasAssessment){
      setSelectedLessonId(lessonId);
    }else{
      // Create assessment in backend first
      try{
        const response = await api.post(`/api/lessons/${lessonId}/assessment/create/`);
        const data = response.data;
        console.log(data);
        setSelectedLessonId(lessonId);
      }catch (err: any){
        console.error(err);
      }
    }
  }

// --- Overloads ---
function getDefaultDetails(type: "MCQ"): MCQDetails;
function getDefaultDetails(type: "FIB"): FIBDetails;
function getDefaultDetails(type: "TF"): TFDetails;

// --- Implementation ---
function getDefaultDetails(type: QuestionType): MCQDetails | FIBDetails | TFDetails {
  switch (type) {
    case "MCQ":
      return {
        options: [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: true },
        ],
      };

    case "FIB":
      return { correct_answer: "" };

    case "TF":
      return { is_true: false };
  }
}

  const addQuestion = () =>
    setQuestions([
      ...questions,
      { 
        type: "MCQ", 
        text: "",
        category: 1, // TODO: Get Category from Parent 
        details: {
          options: [
            { text: "", is_correct: false },
            { text: "", is_correct: false },
            { text: "", is_correct: false },
            { text: "", is_correct: true }
          ]
        },
        answer: ""
      },
    ]);

  const updateQuestion = (index: number, updated: Question) => {
    console.log(updated);
    const newQ = [...questions];
    newQ[index] = updated;
    setQuestions(newQ);
  };



const handleTypeChange = (index: number, newType: QuestionType) => {
  setQuestions((prev) =>
    prev.map((q, i) => {
      if (i !== index) return q;

      switch (newType) {
        case "MCQ":
          return {
            ...q,
            type: "MCQ", // literal, not union
            details: getDefaultDetails("MCQ"),
          };

        case "FIB":
          return {
            ...q,
            type: "FIB",
            details: getDefaultDetails("FIB"),
          };

        case "TF":
          return {
            ...q,
            type: "TF",
            details: getDefaultDetails("TF"),
          };
      }
    })
  );
};


  return (
  <div className="max-w-3xl mx-auto mt-6 space-y-6 px-4 sm:px-6 lg:px-8">
    {/* Course Selector */}
    <div>
      <p className="mb-1 text-sm sm:text-base font-medium">Select Course</p>
      <select
        onChange={handleCourseChange}
        className="border p-2 rounded w-full sm:w-auto"
        value={selectedCourseId ?? ""}
      >
        <option value="">-- Select a course --</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      {selectedCourseId && (
        <div>
          <select
            className="border p-2 rounded mt-3 w-full sm:w-auto"
            onChange={(e) => setAssessmentType(e.target.value)}
          >
            <option value="">Pick an assessment type</option>
            <option value="lesson">Lesson</option>
            <option value="course">Course</option>
          </select>
        </div>
      )}
    </div>

    {/* Lessons List */}
    {selectedCourseId && assessmentType === "lesson" && !selectedLessonId && (
      <div className="space-y-2">
        <h3 className="font-semibold mt-4 text-base sm:text-lg">Lessons</h3>
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between border p-2 rounded gap-2"
          >
            <span className="text-sm sm:text-base">{lesson.title}</span>
            <button
              className="cursor-pointer px-3 py-1 bg-blue-600 text-white rounded text-sm sm:text-base hover:bg-blue-700"
              onClick={() =>
                handleLessonAssessment(lesson.id, lesson.has_assessment)
              }
            >
              {lesson.has_assessment ? "Edit Assessment" : "Add Assessment"}
            </button>
          </div>
        ))}
      </div>
    )}

    {((assessmentType === "lesson" && selectedLessonId) ||
      (assessmentType === "course" && selectedCourseId)) && (
      <button
        onClick={addQuestion}
        className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full sm:w-auto"
      >
        + Add Question
      </button>
    )}

    {((selectedLessonId || selectedCourseId) &&
      assessmentType) &&
      questions.map((q, i) => (
        <div
          key={i}
          className="border rounded-lg p-4 bg-gray-50 shadow space-y-2"
        >
          <h3 className="font-semibold mb-2 text-base sm:text-lg">
            Question {i + 1}
          </h3>

          <select
            disabled={!!q.id}
            className="border rounded-lg p-2 mb-2 w-full"
            value={q.type}
            onChange={(e) =>
              handleTypeChange(i, e.target.value as QuestionType)
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
            onChange={(e) =>
              updateQuestion(i, { ...q, text: e.target.value })
            }
          />

          {q.type === "MCQ" && (
            <div className="space-y-2">
              {q.details.options?.map((opt, j) => (
                <input
                  key={j}
                  type="text"
                  placeholder={`Option ${j + 1}`}
                  className="w-full border rounded-lg p-2 text-base"
                  value={opt.text}
                  onChange={(e) => {
                    const opts = [...(q.details.options || [])];
                    opts[j] = {
                      text: e.target.value,
                      is_correct: e.target.value === q.answer,
                    };
                    updateQuestion(i, {
                      ...q,
                      details: { ...q.details, options: opts },
                    });
                  }}
                />
              ))}
              <input
                type="text"
                placeholder="Correct Answer (type option exactly)"
                className="w-full border rounded-lg p-2 bg-green-400 text-base"
                defaultValue={
                  q.details.options.find((opt) => opt.is_correct)?.text || ""
                }
                onChange={(e) => {
                  let opts = [...(q.details.options || ["", "", "", ""])];
                  opts = opts.map((opt) => ({
                    ...opt,
                    is_correct: opt.text === e.target.value,
                  }));
                  updateQuestion(i, {
                    ...q,
                    details: { ...q.details, options: opts },
                    answer: e.target.value,
                  });
                }}
              />
            </div>
          )}

          {q.type === "TF" && (
            <select
              className="border rounded-lg p-2 w-full"
              value={q.details.is_true ? "True" : "False"}
              onChange={(e) =>
                updateQuestion(i, {
                  ...q,
                  details: {
                    ...q.details,
                    is_true: e.target.value == "True",
                  },
                })
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
              className="w-full border rounded-lg p-2 bg-green-400 text-base"
              value={q.details.correct_answer}
              onChange={(e) =>
                updateQuestion(i, {
                  ...q,
                  details: { ...q.details, correct_answer: e.target.value },
                })
              }
            />
          )}
        </div>
      ))}

    {assessmentType && questions.length > 0 && (
      <button
        onClick={handleSaveAssessment}
        className="cursor-pointer mt-4 w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Save Assessment
      </button>
    )}
  </div>
);

}
