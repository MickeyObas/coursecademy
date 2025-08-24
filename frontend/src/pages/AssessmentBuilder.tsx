import { useEffect, useState } from "react";
import api from "../utils/axios";

type Question = {
  type: "MCQ" | "TF" | "FIB";
  text: string;
  options?: string[];
  answer: string;
};

export default function AssessmentBuilder() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [assessmentType, setAssessmentType] = useState<null | string>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<null | string | number>(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [newAssessmentCourse, setNewAssessmentCourse] = useState(null);
  const [newAssessmentLesson, setNewAssessmentLesson] = useState([]);

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
    const fetchQuestions = async () => {
      const response = await api.get(`/api/lessons/${selectedLessonId}/questions/`);
      const data = response.data;
      setQuestions(data);
      console.log(data);
    };
    fetchQuestions();
  }, [selectedLessonId])

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseId(Number(e.target.value));
    // setSelectedModule(null);
    // setEditingLesson(null);
  };

  const handleSaveAssessment = async () => {
    console.log(questions);
    const response = await api.post(`/api/lessons/${selectedLessonId}/questions/update/`, {
      lesson_id: selectedLessonId,
      questions
    });
    const data = response.data;
    console.log(data);
  }


  const addQuestion = () =>
    setQuestions([
      ...questions,
      { 
        type: "MCQ", 
        text: "", 
        details: {
          options: [
            {text: "", is_correct: false},
            {text: "", is_correct: false},
            {text: "", is_correct: false},
            {text: "", is_correct: true}
          ]
        }, 
        answer: ""
      },
    ]);

  const updateQuestion = (index: number, updated: Question) => {
    console.log(updated);
    const newQ = [...questions];
    
    // Handle MCQ
    if(updated.type == "MCQ"){
      
    }

    newQ[index] = updated;
    setQuestions(newQ);
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-6">
      {/* Course Selector */}
      <div>
        <p className="mb-1">Select Course</p>
        <select
          onChange={handleCourseChange}
          className="border p-2 rounded"
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
              className="border p-2 rounded mt-3"
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
      {(selectedCourseId && assessmentType === 'lesson' && !selectedLessonId) && (
        <div className="space-y-2">
          <h3 className="font-semibold mt-4">Lessons</h3>
          {lessons.map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between border p-2 rounded">
              <span>{lesson.title}</span>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={() => setSelectedLessonId(lesson.id)}
              >
                {lesson.has_assessment ? "Edit Assessment" : "Add Assessment"}
              </button>
            </div>
          ))}
        </div>
      )}

      {assessmentType && (
        <button
          onClick={addQuestion}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Add Question
        </button>
      )}
      

      {(selectedLessonId && assessmentType) && questions.map((q, i) => (
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
              {q.details.options?.map((opt, j) => (
                <input
                  key={j}
                  type="text"
                  placeholder={`Option ${j + 1}`}
                  className="w-full border rounded-lg p-2"
                  value={opt.text}
                  onChange={(e) => {
                    const opts = [...(q.details.options || [])];
                    opts[j] = {text: e.target.value, is_correct: e.target.value === q.answer};
                    updateQuestion(i, { ...q, details: {...q.details, options: opts} });
                  }}
                />
              ))}
              <input
                type="text"
                placeholder="Correct Answer (type option exactly)"
                className="w-full border rounded-lg p-2 bg-green-400"
                defaultValue={q.details.options.find((opt) => opt.is_correct).text}
                onChange={(e) => {
                  let opts = [...(q.details.options || [])];
                  opts = opts.map((opt) => ({...opt, is_correct: opt.text === e.target.value}))
                  // const newCorrectOptIdx = opts.findIndex((opt) => opt.text === e.target.value)
                  // console.log("New correct OPT idx", newCorrectOptIdx)
                  // opts[newCorrectOptIdx] = {text: e.target.value, is_correct: e.target.value === e.target.value};
                  updateQuestion(i, { ...q, details: {...q.details, options: opts},answer: e.target.value })
                }
                }
              />
            </div>
          )}

          {q.type === "TF" && (
            <select
              className="border rounded-lg p-2 w-full"
              value={q.details.is_true ? "True" : "False"}
              onChange={(e) =>
                updateQuestion(i, { ...q, details: {...q.details, is_true: e.target.value == "True"} })
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
              className="w-full border rounded-lg p-2 bg-green-400"
              value={q.details.correct_answer}
              onChange={(e) =>
                updateQuestion(i, { ...q, details: {...q.details, correct_answer: e.target.value} })
              }
            />
          )}
        </div>
      ))}

      <button
        onClick={handleSaveAssessment}
        className="ms-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >Save Assessment</button>

    </div>
  );
}
