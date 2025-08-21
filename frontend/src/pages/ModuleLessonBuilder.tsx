import { useState } from "react";

type Lesson = {
  title: string;
  type: "video" | "content";
  videoUrl?: string;
  content?: string;
};

type Module = {
  title: string;
  lessons: Lesson[];
};

export default function ModuleLessonBuilder() {
  const [modules, setModules] = useState<Module[]>([]);

  const addModule = () => {
    setModules([
      ...modules,
      { title: `Module ${modules.length + 1}`, lessons: [] },
    ]);
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.push({ title: "", type: "content" });
    setModules(newModules);
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-6">
      <button
        onClick={addModule}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        + Add Module
      </button>

      {modules.map((mod, i) => (
        <div key={i} className="border rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold mb-2">{mod.title}</h3>

          {mod.lessons.map((lesson, j) => (
            <div key={j} className="border rounded-lg p-3 mb-4 bg-gray-50">
              <label className="block font-medium">Lesson Title</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2 mb-2"
                value={lesson.title}
                onChange={(e) => {
                  const newModules = [...modules];
                  newModules[i].lessons[j].title = e.target.value;
                  setModules(newModules);
                }}
              />

              <div className="flex items-center gap-4 mb-2">
                <label>
                  <input
                    type="radio"
                    name={`lesson-${i}-${j}-type`}
                    value="content"
                    checked={lesson.type === "content"}
                    onChange={() => {
                      const newModules = [...modules];
                      newModules[i].lessons[j].type = "content";
                      setModules(newModules);
                    }}
                  />
                  <span className="ml-1">Content</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name={`lesson-${i}-${j}-type`}
                    value="video"
                    checked={lesson.type === "video"}
                    onChange={() => {
                      const newModules = [...modules];
                      newModules[i].lessons[j].type = "video";
                      setModules(newModules);
                    }}
                  />
                  <span className="ml-1">Video</span>
                </label>
              </div>

              {lesson.type === "content" ? (
                <textarea
                  placeholder="Markdown/HTML content..."
                  className="w-full border rounded-lg p-2"
                  value={lesson.content}
                  onChange={(e) => {
                    const newModules = [...modules];
                    newModules[i].lessons[j].content = e.target.value;
                    setModules(newModules);
                  }}
                />
              ) : (
                <input
                  type="text"
                  placeholder="Video URL"
                  className="w-full border rounded-lg p-2"
                  value={lesson.videoUrl}
                  onChange={(e) => {
                    const newModules = [...modules];
                    newModules[i].lessons[j].videoUrl = e.target.value;
                    setModules(newModules);
                  }}
                />
              )}
            </div>
          ))}

          <button
            onClick={() => addLesson(i)}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Lesson
          </button>
        </div>
      ))}
    </div>
  );
}
