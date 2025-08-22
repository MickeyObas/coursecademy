import { useEffect, useState } from "react";
import api from "../utils/axios";

type Lesson = {
  id?: number;
  title: string;
  type: "VIDEO" | "ARTICLE";
  videoUrl?: string;
  content?: string;
};

type Module = {
  id?: number;
  title: string;
  lessons: Lesson[];
};

export default function ModuleLessonBuilder() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  // Load user’s courses
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

  // Load modules when course changes
  useEffect(() => {
    const fetchModules = async () => {
      if (!selectedCourseId) return;
      try {
        const selectedCourse = courses.find((c) => c.id == selectedCourseId);
        if (!selectedCourse) return;

        const res = await api.get(`/api/courses/${selectedCourse.slug}/`);
        setModules(res.data.modules);
      } catch (err) {
        console.error(err);
      }
    };
    fetchModules();
  }, [selectedCourseId]);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseId(Number(e.target.value));
    setSelectedModule(null);
    setEditingLesson(null);
  };

  const handleSelectModule = (module: Module) => {
    setSelectedModule(module);
    setEditingLesson(null);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson({ ...lesson });
  };

  const handleLessonChange = (field: keyof Lesson, value: string) => {
    if (!editingLesson) return;
    setEditingLesson({ ...editingLesson, [field]: value });
  };

  const handleSaveLesson = () => {
    if (!selectedModule || !editingLesson) return;

    const updatedModules = modules.map((m) =>
      m.id === selectedModule.id
        ? {
            ...m,
            lessons: editingLesson.id
              ? m.lessons.map((l) =>
                  l.id === editingLesson.id ? editingLesson : l
                )
              : [...m.lessons, { ...editingLesson, id: Date.now() }],
          }
        : m
    );

    setModules(updatedModules);
    setEditingLesson(null);
  };

  const handleSaveModule = () => {
    if (!newModuleTitle.trim()) return;
    const newModule: Module = {
      id: Date.now(), // temporary client-side id
      title: newModuleTitle,
      lessons: [],
    };
    setModules([...modules, newModule]);
    setNewModuleTitle("");
    setAddingModule(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-6">
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
      </div>

      {/* Modules List */}
      {modules.length > 0 && !selectedModule && !addingModule && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Modules</h2>
          {modules.map((m) => (
            <div
              key={m.id}
              className="p-4 border rounded-lg shadow cursor-pointer hover:bg-gray-50"
              onClick={() => handleSelectModule(m)}
            >
              <h3 className="font-medium">{m.title}</h3>
              <p className="text-sm text-gray-600">{m.lessons.length} lessons</p>
            </div>
          ))}
          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={() => setAddingModule(true)}
          >
            + Add Module
          </button>
        </div>
      )}

      {/* Add Module Form */}
      {addingModule && (
        <div className="p-4 border rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold">New Module</h3>
          <input
            type="text"
            className="w-full border rounded-lg p-2"
            placeholder="Module title"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={handleSaveModule}
            >
              Save
            </button>
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              onClick={() => {
                setAddingModule(false);
                setNewModuleTitle("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Module Details */}
      {selectedModule && !editingLesson && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{selectedModule.title}</h2>
          <ul className="space-y-2">
            {selectedModule.lessons.map((l) => (
              <li
                key={l.id}
                className="p-3 border rounded-lg flex justify-between items-center"
              >
                <span>{l.title || "(Untitled Lesson)"}</span>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => handleEditLesson(l)}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={() =>
              setEditingLesson({ title: "", type: "ARTICLE", content: "" })
            }
          >
            + Add Lesson
          </button>
          <button
            className="ml-2 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            onClick={() => setSelectedModule(null)}
          >
            Back to Modules
          </button>
        </div>
      )}

      {/* Lesson Editor */}
      {editingLesson && (
        <div className="p-4 border rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold">
            {editingLesson.id ? "Edit Lesson" : "New Lesson"}
          </h3>

          <input
            type="text"
            className="w-full border rounded-lg p-2"
            placeholder="Lesson title"
            value={editingLesson.title}
            onChange={(e) => handleLessonChange("title", e.target.value)}
          />

          <div className="flex items-center gap-4">
            <label>
              <input
                type="radio"
                checked={editingLesson.type === "ARTICLE"}
                onChange={() => handleLessonChange("type", "ARTICLE")}
              />{" "}
              Article
            </label>
            <label>
              <input
                type="radio"
                checked={editingLesson.type === "VIDEO"}
                onChange={() => handleLessonChange("type", "VIDEO")}
              />{" "}
              Video
            </label>
          </div>

          {editingLesson.type === "ARTICLE" ? (
            <textarea
              className="w-full border rounded-lg p-2"
              placeholder="Lesson content"
              value={editingLesson.content || ""}
              onChange={(e) => handleLessonChange("content", e.target.value)}
            />
          ) : (
            <input
              type="text"
              className="w-full border rounded-lg p-2"
              placeholder="Video URL"
              value={editingLesson.video_file || ""}
              onChange={(e) => handleLessonChange("videoUrl", e.target.value)}
            />
          )}

          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={handleSaveLesson}
            >
              Save
            </button>
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              onClick={() => setEditingLesson(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
