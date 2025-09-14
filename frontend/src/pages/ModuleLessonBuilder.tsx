import { useEffect, useState } from "react";
import api from "../utils/axios";
import RichTextEditor from "../components/ui/RichTextEditor";
import { debounce } from 'lodash';
import type { Lesson, Module } from "../types/Course";


export default function ModuleLessonBuilder() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<EditLesson | null>(null);
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDescription, setNewModuleDescription] = useState("");

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
    // Fetch Lesson anew
    console.log(lesson);
    const lessonDraftKey = `lesson_draft_${lesson.id}`;
    const draft = localStorage.getItem(lessonDraftKey);
    let contentToUse = lesson.content || lesson.draft_content;

    if(draft){
      console.log("DRAFT", draft);
      const parsedDraft = JSON.parse(draft);
      console.log("Updated at", lesson.updated_at);
      const backendTime = new Date(lesson.updated_at || "").getTime();
      const localTime = parsedDraft.lastEdited;

      console.log(localTime, backendTime);

      if (localTime > backendTime){
        const useLocal = window.confirm("You have unsaved local changes. Do you want to continue with your local draft instead of the server version?");
        if(useLocal){
          contentToUse = parsedDraft.body;
        }
      }
    }
    
    setEditingLesson((prev) => ({
      ...prev,
      "status": "DRAFT",
      "isNewLesson": false,
      "id": lesson.id,
      "title": lesson.title,
      "type": lesson.type,
      "draft_content": contentToUse,
      "updated_at": lesson.updated_at
    }));
  };

  const handleLessonChange = (field: keyof Lesson, value: string) => {
    if (!editingLesson) return;
    setEditingLesson({ ...editingLesson, [field]: value });
  };

  const handleSaveLesson = async () => {
    if (!selectedModule || !editingLesson) return;

    try {
      const response = await api.patch(`/api/lessons/${editingLesson.id}/update/`, {
        ...editingLesson
      });
      const data = response.data;
      console.log("Updated Lesson ---> ", data);

      const updatedModules = modules.map((m) =>
      m.id === selectedModule.id
        ? {
            ...m,
            lessons: editingLesson.id
              ? m.lessons.map((l) =>
                  l.id === editingLesson.id ? data : l
                )
              : [...m.lessons, { ...data, id: Date.now() }],
          }
        : m
    );

      setModules(updatedModules);

      const newSelectedModule = updatedModules.find((module) => module.id == selectedModule.id);
      setSelectedModule(newSelectedModule || selectedModule);
      setEditingLesson(null);
    } catch (err){
      console.error(err);
    }
  }

  const handleSaveModule = async () => {
    if (!newModuleTitle.trim()) return;
    const newModule: Module = {
      id: Date.now(), // temporary client-side id
      title: newModuleTitle,
      lessons: [],
    };
    try {
      const response = await api.post(`/api/modules/create/`, {
        course_id: selectedCourseId,
        title: newModuleTitle,
        description: newModuleDescription
      });
      const data = response.data;
      console.log(data);
    
      setModules([...modules, newModule]);
      setNewModuleTitle("");
      setAddingModule(false);

    } catch (err){
      console.error(err);
    }
  };

  type EditLesson = {
    id: number,
    title: string,
    type: "ARTICLE" | "VIDEO",
    status: "PUBLISHED" | "DRAFT" | "ARCHIVED",
    draft_content?: string,
    video_file?: string
  }

  const handleAddLesson = async () => {
    try {
      const newLesson = await addBlankLesson();
      // localStorage.setItem(`lesson_draft_${newLessonId}`, '');
      setEditingLesson({ 
        id: newLesson.id, 
        title: newLesson.title, 
        type: "ARTICLE" ,
        status: "DRAFT"
      })
    } catch (err) {
      console.log("Something went wrong: ", err);
    }
  }

  const addBlankLesson = async () => {
    if(!selectedModule) return;

    // Create a draft at the backend then return the ID
    try {
      const response = await api.post(`/api/lessons/create/`, {
        title: "New Draft Title",
        type: "ARTICLE",
        module_id: selectedModule.id,
        course_id: selectedCourseId,
        status: "DRAFT"
      });
    const data = response.data;
    console.log(data);
    return data;
    } catch (err){
      console.error(err);
      throw err;
    }
  }

  const storeLessonDraft = debounce((content: string) => {
    if(!editingLesson) return;

    const lessonDraftKey = `lesson_draft_${editingLesson.id}`;
    localStorage.setItem(lessonDraftKey, JSON.stringify({
      lastEdited: Date.now(),
      title: editingLesson.title,
      body: content
    }))
    
  }, 1000)

  return (
  <div className="max-w-3xl mx-auto mt-6 space-y-6">
    {/* Course Selector */}
    <div>
      <p className="mb-1">Select Course</p>
      <select
        onChange={handleCourseChange}
        className="cursor-pointer border p-2 rounded w-full sm:w-auto"
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
      </div>
    )}

    <button
      className="cursor-pointer mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      onClick={() => setAddingModule(true)}
    >
      + Add Module
    </button>

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

        <textarea
          className="border resize-none w-full outline-0 p-2"
          placeholder="Module description"
          value={newModuleDescription}
          onChange={(e) => setNewModuleDescription(e.target.value)}
        ></textarea>

        <div className="flex gap-2">
          <button
            className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={handleSaveModule}
          >
            Save
          </button>
          <button
            className="cursor-pointer px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
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

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={handleAddLesson}
          >
            + Add Lesson
          </button>
          <button
            className="cursor-pointer px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            onClick={() => setSelectedModule(null)}
          >
            Back to Modules
          </button>
        </div>
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

        {/* Lesson Type */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="cursor-pointer">
            <input
              type="radio"
              checked={editingLesson.type === "ARTICLE"}
              onChange={() => handleLessonChange("type", "ARTICLE")}
            />{" "}
            Article
          </label>
          <label className="cursor-pointer">
            <input
              type="radio"
              checked={editingLesson.type === "VIDEO"}
              onChange={() => handleLessonChange("type", "VIDEO")}
            />{" "}
            Video
          </label>
        </div>

        {editingLesson.type === "ARTICLE" ? (
          <RichTextEditor
            value={editingLesson.draft_content || ""}
            onChange={(content: string) => {
              handleLessonChange("draft_content", content);
              storeLessonDraft(content);
            }}
          />
        ) : (
          <input
            type="text"
            className="w-full border rounded-lg p-2"
            placeholder="Video URL"
            value={editingLesson.video_file || ""}
            onChange={(e) => handleLessonChange("video_file", e.target.value)}
          />
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={handleSaveLesson}
          >
            Save
          </button>
          <button
            className="cursor-pointer px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            onClick={() => setEditingLesson(null)}
          >
            Cancel
          </button>
          <button
            className="cursor-pointer px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500"
            onClick={() => setEditingLesson(null)}
          >
            See Preview
          </button>
        </div>
      </div>
    )}
  </div>
);

}
